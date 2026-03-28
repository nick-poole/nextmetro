// ==============================
// NextMetro — Alerts Page
// All WMATA service alerts: rail incidents + elevator/escalator outages
// Depends on shared.js (loaded first)
// ==============================

const lineOrder = ['RD', 'OR', 'BL', 'GR', 'YL', 'SV'];

// Severity ranking: lower = more severe (sorted first)
const SEVERITY = {
  Delay: 1,
  Alert: 2,
  Closure: 3,
  'Station Closure': 3,
  'Single Tracking': 4,
  Advisory: 5,
  Elevator: 7,
  Escalator: 7,
};

function getSeverity(incidentType) {
  return SEVERITY[incidentType] || 6;
}

function getSeverityLabel(incidentType) {
  if (!incidentType) return 'Advisory';
  var type = incidentType.trim();
  if (type === 'Delay') return 'Delay';
  if (type === 'Alert') return 'Alert';
  if (type === 'Closure' || type === 'Station Closure') return 'Closure';
  if (type === 'Single Tracking') return 'Single Tracking';
  if (type === 'Elevator') return 'Elevator';
  if (type === 'Escalator') return 'Escalator';
  return 'Advisory';
}

function getSeverityClass(label) {
  if (label === 'Delay') return 'severity-delay';
  if (label === 'Alert') return 'severity-alert';
  if (label === 'Closure') return 'severity-closure';
  if (label === 'Single Tracking') return 'severity-caution';
  if (label === 'Elevator' || label === 'Escalator') return 'severity-facility';
  return 'severity-advisory';
}

// parseAffectedLines — from shared.js

// ---- Deduplicate incidents ----
// WMATA often returns the same alert as multiple entries (one per line or
// a general entry + a line-specific entry). Merge by description text so
// each unique alert appears only once with all affected lines combined.
function deduplicateIncidents(incidents) {
  var map = new Map();

  (incidents || []).forEach(function (incident) {
    var key = (incident.Description || '').trim();
    if (!key) return;

    if (map.has(key)) {
      var existing = map.get(key);
      // Merge LinesAffected
      var existingLines = new Set(parseAffectedLines(existing.LinesAffected));
      parseAffectedLines(incident.LinesAffected).forEach(function (l) { existingLines.add(l); });
      existing.LinesAffected = Array.from(existingLines).join('; ') + (existingLines.size ? ';' : '');
      // Keep the more severe IncidentType
      if (getSeverity(incident.IncidentType) < getSeverity(existing.IncidentType)) {
        existing.IncidentType = incident.IncidentType;
      }
      // Keep the more recent DateUpdated
      if (new Date(incident.DateUpdated || 0) > new Date(existing.DateUpdated || 0)) {
        existing.DateUpdated = incident.DateUpdated;
      }
    } else {
      map.set(key, Object.assign({}, incident));
    }
  });

  return Array.from(map.values());
}

// ---- Normalize elevator/escalator incidents into the same shape ----
function normalizeElevatorIncidents(elevatorIncidents) {
  return (elevatorIncidents || []).map(function (outage) {
    var unitType = (outage.UnitType || '').toUpperCase();
    var label = unitType === 'ELEVATOR' ? 'Elevator' : 'Escalator';
    var station = outage.StationName || '';
    var location = outage.LocationDescription || '';
    var symptom = outage.SymptomDescription || '';
    var unit = outage.UnitName || '';

    var desc = label + ' outage at ' + station;
    if (location) desc += ' — ' + location;
    if (symptom) desc += ' (' + symptom + ')';
    if (unit) desc += ' [Unit: ' + unit + ']';

    return {
      IncidentType: label,
      Description: desc,
      LinesAffected: '',
      DateUpdated: outage.DateUpdated || outage.DateOutOfServ || '',
      _station: station,
      _unitType: unitType,
    };
  });
}

// ---- State ----
var currentAlerts = []; // unified list: rail incidents + elevator/escalator
var currentRailIncidents = []; // rail-only for ticker + status bar
var activeLineFilter = 'all'; // 'all' | line code
var pollingInterval = null;

// ---- DOM ----
var alertsList = document.getElementById('alerts-list');
var alertsEmpty = document.getElementById('alerts-empty');
var alertsUpdated = document.getElementById('alerts-updated');
var alertsRefresh = document.getElementById('alerts-refresh');
var alertsStatusBar = document.getElementById('alerts-status-bar');
var metaDescription = document.getElementById('meta-description');
var schemaAlerts = document.getElementById('schema-alerts');
var lastUpdatedTime = document.getElementById('alerts-last-updated-time');
var alertsFilters = document.getElementById('alerts-filters');

// ==============================
// Status Summary Bar (rail incidents only)
// ==============================
function renderStatusBar(incidents) {
  var lineStatuses = {};
  lineOrder.forEach(function (code) {
    lineStatuses[code] = { status: 'Normal', count: 0 };
  });

  (incidents || []).forEach(function (incident) {
    var affectedLines = parseAffectedLines(incident.LinesAffected);
    affectedLines.forEach(function (lineCode) {
      if (lineStatuses[lineCode]) {
        lineStatuses[lineCode].count++;
        if (incident.IncidentType === 'Delay') {
          lineStatuses[lineCode].status = 'Delays';
        } else if (lineStatuses[lineCode].status === 'Normal') {
          lineStatuses[lineCode].status = 'Advisory';
        }
      }
    });
  });

  var html = '';
  lineOrder.forEach(function (code) {
    var info = lineStatuses[code];
    var statusClass =
      info.status === 'Normal'
        ? 'status-ok'
        : info.status === 'Delays'
          ? 'status-alert'
          : 'status-caution';

    html +=
      '<div class="alerts-status-item">' +
      '<span class="alerts-status-dot" style="background-color:' + lineColors[code] + '"></span>' +
      '<span class="alerts-status-name">' + lineNames[code] + '</span>' +
      '<span class="alerts-status-value ' + statusClass + '">' + info.status + '</span>' +
      '</div>';
  });

  alertsStatusBar.innerHTML = html;
}

// ==============================
// Apply Line Filter
// ==============================
function getFilteredAlerts() {
  if (activeLineFilter === 'all') return currentAlerts;
  return currentAlerts.filter(function (incident) {
    // Rail incidents — check LinesAffected
    var lines = parseAffectedLines(incident.LinesAffected);
    if (lines.length > 0) return lines.indexOf(activeLineFilter) !== -1;
    // Elevator/escalator — check station code prefix
    if (incident._station) return true; // Show facility alerts for all line filters
    return true;
  });
}

// ==============================
// Alert Card Icons (SVG)
// ==============================
function getAlertIcon(severityLabel) {
  if (severityLabel === 'Delay') {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>';
  }
  if (severityLabel === 'Closure' || severityLabel === 'Single Tracking') {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.902 7.902 0 014 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.902 7.902 0 0120 12c0 4.42-3.58 8-8 8z"/></svg>';
  }
  if (severityLabel === 'Alert') {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';
  }
  if (severityLabel === 'Elevator') {
    // Elevator icon
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>';
  }
  if (severityLabel === 'Escalator') {
    // Escalator/stairs icon
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-4-4 1.41-1.41L12 14.17l6.59-6.59L20 9l-8 8z"/></svg>';
  }
  // Advisory — info circle
  return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
}

// escapeHtml — from shared.js

// ==============================
// Plain English Description Cleanup
// ==============================
function cleanDescription(desc) {
  if (!desc) return '';
  return normalizeText(desc).replace(/\s+/g, ' ').trim();
}

// ==============================
// Auto-link URLs in text
// ==============================
function linkifyUrls(escapedHtml) {
  return escapedHtml.replace(
    /https?:\/\/[^\s<>&"]+/g,
    function (url) {
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="alerts-inline-link">' + url + '</a>';
    }
  );
}

// ==============================
// Time Formatting
// ==============================
function formatTime(dateStr) {
  if (!dateStr) return '';
  var date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// Alerts page uses formatTime fallback for 24h+ instead of "Xd ago"
function formatAlertTime(dateStr) {
  if (!dateStr) return '';
  var date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  var now = new Date();
  var diffMs = now - date;
  var diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return diffMin + 'm ago';
  var diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr + 'h ago';
  return formatTime(dateStr);
}

// ==============================
// Render Alert Cards
// ==============================
function renderAlerts() {
  var filteredAlerts = getFilteredAlerts();
  if (filteredAlerts.length === 0) {
    alertsList.innerHTML = '';
    alertsEmpty.style.display = '';
    var emptyTitle = alertsEmpty.querySelector('.alerts-empty-title');
    var emptyText = alertsEmpty.querySelector('.alerts-empty-text');
    if (activeLineFilter !== 'all') {
      emptyTitle.textContent = 'No Matching Alerts';
      emptyText.textContent = 'No active alerts for this line. Try selecting a different line or viewing all alerts.';
    } else {
      emptyTitle.textContent = 'All Clear';
      emptyText.textContent = 'No active service alerts. All lines and stations operating normally.';
    }
    return;
  }

  alertsEmpty.style.display = 'none';

  // Sort by severity (worst first), then by date (newest first)
  var sorted = filteredAlerts.slice().sort(function (a, b) {
    var sevA = getSeverity(a.IncidentType);
    var sevB = getSeverity(b.IncidentType);
    if (sevA !== sevB) return sevA - sevB;
    var dateA = new Date(a.DateUpdated || 0);
    var dateB = new Date(b.DateUpdated || 0);
    return dateB - dateA;
  });

  var html = '';
  sorted.forEach(function (incident, idx) {
    var affectedLines = parseAffectedLines(incident.LinesAffected);
    var severityLabel = getSeverityLabel(incident.IncidentType);
    var severityClass = getSeverityClass(severityLabel);
    var icon = getAlertIcon(severityLabel);
    var description = cleanDescription(incident.Description);
    var timeStr = formatAlertTime(incident.DateUpdated);
    var delay = Math.min(idx * 0.06, 0.6);

    // Location tag for station-level alerts
    var locationHtml = '';
    if (incident._station) {
      locationHtml =
        '<span class="alert-station-pill">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>' +
        escapeHtml(incident._station) +
        '</span>';
    }

    // Line pills for this alert
    var linePillsHtml = '';
    affectedLines.forEach(function (lineCode) {
      linePillsHtml +=
        '<span class="alert-line-pill" style="border-color:' + lineColors[lineCode] + '">' +
        '<span class="alert-line-pill-dot" style="background-color:' + lineColors[lineCode] + '"></span>' +
        lineNames[lineCode] +
        '</span>';
    });

    var tagsHtml = '';
    if (linePillsHtml || locationHtml) {
      tagsHtml = '<div class="alerts-card-tags">' + linePillsHtml + locationHtml + '</div>';
    }

    html +=
      '<article class="alerts-card animate-in" style="animation-delay:' + delay + 's" role="alert">' +
      '<div class="alerts-card-severity ' + severityClass + '">' +
      '<span class="alerts-card-icon">' + icon + '</span>' +
      '<span class="alerts-card-severity-label">' + severityLabel + '</span>' +
      '<span class="alerts-card-time">' + escapeHtml(timeStr) + '</span>' +
      '</div>' +
      '<div class="alerts-card-body">' +
      tagsHtml +
      '<p class="alerts-card-desc">' + linkifyUrls(escapeHtml(description)) + '</p>' +
      '<a href="https://www.wmata.com/service/status/" target="_blank" rel="noopener noreferrer" class="alerts-card-cta">' +
      'Details at WMATA' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>' +
      '</a>' +
      '</div>' +
      '</article>';
  });

  alertsList.innerHTML = html;
}

// ==============================
// SEO: Update meta description & schema
// ==============================
function updateSEO(allAlerts) {
  var alertCount = allAlerts.length;
  var desc;
  if (alertCount === 0) {
    desc = 'All DC Metro lines operating normally. No active service alerts. Live status updates at NextMetro.';
  } else {
    var lineSet = new Set();
    var hasElevator = false;
    allAlerts.forEach(function (inc) {
      parseAffectedLines(inc.LinesAffected).forEach(function (code) { lineSet.add(lineNames[code]); });
      if (inc.IncidentType === 'Elevator' || inc.IncidentType === 'Escalator') hasElevator = true;
    });
    var parts = [];
    if (lineSet.size > 0) parts.push(Array.from(lineSet).join(', '));
    if (hasElevator) parts.push('elevator/escalator outages');
    desc = alertCount + ' active alert' + (alertCount !== 1 ? 's' : '') +
      (parts.length > 0 ? ' — ' + parts.join(', ') : '') +
      '. Live DC Metro status at NextMetro.';
  }
  if (metaDescription) {
    metaDescription.setAttribute('content', desc);
  }

  // Crawlable last-updated timestamp
  var now = new Date();
  if (lastUpdatedTime) {
    lastUpdatedTime.setAttribute('datetime', now.toISOString());
    lastUpdatedTime.textContent = now.toISOString();
  }

  // SpecialAnnouncement schema for active alerts (rail incidents only)
  var railAlerts = allAlerts.filter(function (a) {
    return a.IncidentType !== 'Elevator' && a.IncidentType !== 'Escalator';
  });
  if (schemaAlerts && railAlerts.length > 0) {
    var announcements = railAlerts.map(function (incident) {
      return {
        '@context': 'https://schema.org',
        '@type': 'SpecialAnnouncement',
        'name': getSeverityLabel(incident.IncidentType) + ': ' +
          parseAffectedLines(incident.LinesAffected).map(function (c) { return lineNames[c]; }).join(', ') + ' Line',
        'text': incident.Description || '',
        'datePosted': incident.DateUpdated || now.toISOString(),
        'category': 'https://www.wikidata.org/wiki/Q81068910',
        'spatialCoverage': {
          '@type': 'Place',
          'name': 'Washington D.C. Metrorail System',
        },
        'announcementLocation': {
          '@type': 'CivicStructure',
          'name': 'Washington Metro',
        },
      };
    });
    schemaAlerts.textContent = JSON.stringify(announcements);
  } else if (schemaAlerts) {
    schemaAlerts.textContent = '[]';
  }
}

// ==============================
// Update Timestamp Display
// ==============================
function updateTimestamp() {
  var now = new Date();
  var timeStr = now.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
  alertsUpdated.textContent = 'Updated ' + timeStr;
}

// ==============================
// Fetch All Alerts (rail incidents + elevator/escalator)
// ==============================
async function fetchAllAlerts() {
  var railIncidents = [];
  var elevatorIncidents = [];

  // Fetch both endpoints in parallel
  var results = await Promise.allSettled([
    fetchWithRetry(API_BASE_URL + '/api/incidents'),
    fetchWithRetry(API_BASE_URL + '/api/elevators'),
  ]);

  // Rail incidents
  if (results[0].status === 'fulfilled' && results[0].value && results[0].value.ok) {
    try {
      var railData = await safeJson(results[0].value);
      railIncidents = deduplicateIncidents(railData.Incidents || []);
    } catch (e) {
      console.error('Failed to parse rail incidents:', e.message);
    }
  }

  // Elevator/escalator outages
  if (results[1].status === 'fulfilled' && results[1].value && results[1].value.ok) {
    try {
      var elevData = await safeJson(results[1].value);
      elevatorIncidents = normalizeElevatorIncidents(elevData.ElevatorIncidents || []);
    } catch (e) {
      console.error('Failed to parse elevator incidents:', e.message);
    }
  }

  currentRailIncidents = railIncidents;
  currentAlerts = railIncidents.concat(elevatorIncidents);

  renderAlerts();
  renderStatusBar(currentRailIncidents);
  updateTimestamp();
  updateSEO(currentAlerts);
}

// ==============================
// Polling
// ==============================
function startPolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(fetchAllAlerts, 30000);
}

// ==============================
// Init
// ==============================
document.addEventListener('DOMContentLoaded', async function () {
  renderStatusBar([]);

  // Wake up backend
  try {
    await fetchWithRetry(API_BASE_URL + '/healthz', 3, 2000);
  } catch (e) {
    // Backend may be sleeping
  }

  await fetchAllAlerts();
  startPolling();
});

alertsFilters.addEventListener('click', function (e) {
  var chip = e.target.closest('.alerts-filter-chip');
  if (!chip) return;
  var line = chip.dataset.line;
  if (!line) return;

  activeLineFilter = line;

  var chips = alertsFilters.querySelectorAll('.alerts-filter-chip');
  chips.forEach(function (c) {
    var isActive = c.dataset.line === line;
    c.classList.toggle('alerts-filter-chip--active', isActive);
    c.setAttribute('aria-pressed', String(isActive));
  });

  renderAlerts();
});

alertsRefresh.addEventListener('click', function () {
  fetchAllAlerts();
});
