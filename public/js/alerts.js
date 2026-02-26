// ==============================
// NextMetro — Alerts Page
// Live service alerts with severity sorting & line filtering
// ==============================

const API_BASE_URL = '';

// ---- Fetch with retry (handles Render free-tier cold starts) ----
async function fetchWithRetry(url, retries = 2, delayMs = 3000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res;
    if (res.status !== 503 || attempt === retries) return res;
    await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
  }
}

// ---- Metro Line Data ----
const lineColors = {
  RD: '#BF0D3E',
  BL: '#009CDE',
  YL: '#FFD100',
  OR: '#ED8B00',
  GR: '#00B140',
  SV: '#A2AAAD',
};

const lineNames = {
  RD: 'Red',
  BL: 'Blue',
  YL: 'Yellow',
  OR: 'Orange',
  GR: 'Green',
  SV: 'Silver',
};

const lineOrder = ['RD', 'OR', 'BL', 'GR', 'YL', 'SV'];

// Severity ranking: lower = more severe (sorted first)
const SEVERITY = {
  Delay: 1,
  Alert: 2,
  Closure: 3,
  'Station Closure': 3,
  'Single Tracking': 4,
  Advisory: 5,
};

function getSeverity(incidentType) {
  return SEVERITY[incidentType] || 6;
}

function getSeverityLabel(incidentType) {
  if (!incidentType) return 'Advisory';
  const type = incidentType.trim();
  if (type === 'Delay') return 'Delay';
  if (type === 'Alert') return 'Alert';
  if (type === 'Closure' || type === 'Station Closure') return 'Closure';
  if (type === 'Single Tracking') return 'Single Tracking';
  return 'Advisory';
}

function getSeverityClass(label) {
  if (label === 'Delay') return 'severity-delay';
  if (label === 'Alert') return 'severity-alert';
  if (label === 'Closure') return 'severity-closure';
  if (label === 'Single Tracking') return 'severity-caution';
  return 'severity-advisory';
}

// ---- Parse affected lines from WMATA string ----
function parseAffectedLines(linesStr) {
  if (!linesStr) return [];
  return linesStr
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && lineNames[s]);
}

// ---- Deduplicate incidents ----
// WMATA often returns the same alert as multiple entries (one per line or
// a general entry + a line-specific entry). Merge by description text so
// each unique alert appears only once with all affected lines combined.
function deduplicateIncidents(incidents) {
  const map = new Map(); // description -> merged incident

  (incidents || []).forEach((incident) => {
    const key = (incident.Description || '').trim();
    if (!key) return;

    if (map.has(key)) {
      const existing = map.get(key);
      // Merge LinesAffected
      const existingLines = new Set(parseAffectedLines(existing.LinesAffected));
      parseAffectedLines(incident.LinesAffected).forEach((l) => existingLines.add(l));
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
      // Clone so we don't mutate the original
      map.set(key, Object.assign({}, incident));
    }
  });

  return Array.from(map.values());
}

// ---- State ----
let currentIncidents = [];
let activeFilters = new Set(); // empty = show all
let pollingInterval = null;

// ---- DOM ----
const tickerTrack = document.getElementById('ticker-track');
const alertsList = document.getElementById('alerts-list');
const alertsEmpty = document.getElementById('alerts-empty');
const alertsUpdated = document.getElementById('alerts-updated');
const alertsRefresh = document.getElementById('alerts-refresh');
const alertsFilters = document.getElementById('alerts-filters');
const alertsStatusBar = document.getElementById('alerts-status-bar');
const metaDescription = document.getElementById('meta-description');
const schemaAlerts = document.getElementById('schema-alerts');
const lastUpdatedTime = document.getElementById('alerts-last-updated-time');

// ==============================
// Ticker (same as homepage)
// ==============================
function renderTicker(incidents) {
  const lineData = [
    { code: 'RD', name: 'Red', color: '#BF0D3E' },
    { code: 'OR', name: 'Orange', color: '#ED8B00' },
    { code: 'BL', name: 'Blue', color: '#009CDE' },
    { code: 'GR', name: 'Green', color: '#00B140' },
    { code: 'YL', name: 'Yellow', color: '#FFD100' },
    { code: 'SV', name: 'Silver', color: '#A2AAAD' },
  ];

  const lineStatuses = {};
  lineData.forEach((l) => { lineStatuses[l.code] = 'Normal'; });

  (incidents || []).forEach((incident) => {
    const affectedLines = parseAffectedLines(incident.LinesAffected);
    const status = incident.IncidentType === 'Delay' ? 'Alert' : 'Caution';
    affectedLines.forEach((lineCode) => {
      if (lineStatuses[lineCode]) {
        if (status === 'Alert' || lineStatuses[lineCode] === 'Normal') {
          lineStatuses[lineCode] = status;
        }
      }
    });
  });

  let html = '';
  for (let i = 0; i < 2; i++) {
    lineData.forEach((line) => {
      const thisStatus = lineStatuses[line.code];
      const statusClass =
        thisStatus === 'Normal'
          ? 'ticker-status-ok'
          : thisStatus === 'Alert'
            ? 'ticker-status-alert'
            : 'ticker-status-caution';
      html +=
        '<span class="ticker-item">' +
        '<span class="ticker-dot" style="background-color:' + line.color + '"></span>' +
        '<span>' + line.name + '</span>' +
        '<span class="' + statusClass + '">' + thisStatus + '</span>' +
        '</span>';
    });
  }

  tickerTrack.innerHTML = html;
}

// ==============================
// Status Summary Bar
// ==============================
function renderStatusBar(incidents) {
  const lineStatuses = {};
  lineOrder.forEach((code) => {
    lineStatuses[code] = { status: 'Normal', count: 0 };
  });

  (incidents || []).forEach((incident) => {
    const affectedLines = parseAffectedLines(incident.LinesAffected);
    affectedLines.forEach((lineCode) => {
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

  let html = '';
  lineOrder.forEach((code) => {
    const info = lineStatuses[code];
    const statusClass =
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
// Alert Card Icons (SVG)
// ==============================
function getAlertIcon(severityLabel) {
  if (severityLabel === 'Delay') {
    // Clock icon
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>';
  }
  if (severityLabel === 'Closure' || severityLabel === 'Single Tracking') {
    // Block/no-entry icon
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.902 7.902 0 014 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.902 7.902 0 0120 12c0 4.42-3.58 8-8 8z"/></svg>';
  }
  if (severityLabel === 'Alert') {
    // Warning triangle
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';
  }
  // Advisory — info circle
  return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
}

// ==============================
// HTML Escaping
// ==============================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==============================
// Plain English Description Cleanup
// ==============================
function cleanDescription(desc) {
  if (!desc) return '';
  return desc
    .replace(/\s+/g, ' ')
    .trim();
}

// ==============================
// Auto-link URLs in text
// ==============================
function linkifyUrls(escapedHtml) {
  // Match http/https URLs in already-escaped HTML
  return escapedHtml.replace(
    /https?:\/\/[^\s<>&"]+/g,
    function (url) {
      return '<a href="' + url + '" target="_blank" rel="noopener" class="alerts-inline-link">' + url + '</a>';
    }
  );
}

// ==============================
// Time Formatting
// ==============================
function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return diffMin + 'm ago';
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr + 'h ago';
  return formatTime(dateStr);
}

// ==============================
// Render Alert Cards
// ==============================
function renderAlerts() {
  const filtered = getFilteredIncidents();

  if (filtered.length === 0) {
    alertsList.innerHTML = '';
    alertsEmpty.style.display = '';

    var emptyTitle = alertsEmpty.querySelector('.alerts-empty-title');
    var emptyText = alertsEmpty.querySelector('.alerts-empty-text');

    if (activeFilters.size > 0 && currentIncidents.length > 0) {
      // Filtered view has no matches, but alerts exist on other lines
      var names = Array.from(activeFilters).map(function (c) { return lineNames[c]; }).join(', ');
      emptyTitle.textContent = 'No Alerts';
      emptyText.textContent = 'No active alerts for the ' + names + ' line' +
        (activeFilters.size > 1 ? 's' : '') + ' right now.';
    } else {
      // Genuinely no alerts system-wide
      emptyTitle.textContent = 'All Clear';
      emptyText.textContent = 'No active service alerts. All lines operating normally.';
    }
    return;
  }

  alertsEmpty.style.display = 'none';

  // Sort by severity (worst first), then by date (newest first)
  filtered.sort((a, b) => {
    const sevA = getSeverity(a.IncidentType);
    const sevB = getSeverity(b.IncidentType);
    if (sevA !== sevB) return sevA - sevB;
    const dateA = new Date(a.DateUpdated || 0);
    const dateB = new Date(b.DateUpdated || 0);
    return dateB - dateA;
  });

  let html = '';
  filtered.forEach((incident, idx) => {
    const affectedLines = parseAffectedLines(incident.LinesAffected);
    const severityLabel = getSeverityLabel(incident.IncidentType);
    const severityClass = getSeverityClass(severityLabel);
    const icon = getAlertIcon(severityLabel);
    const description = cleanDescription(incident.Description);
    const timeStr = formatRelativeTime(incident.DateUpdated);
    const delay = idx * 0.06;

    // Line pills for this alert
    let linePillsHtml = '';
    affectedLines.forEach((lineCode) => {
      linePillsHtml +=
        '<span class="alert-line-pill" style="border-color:' + lineColors[lineCode] + '">' +
        '<span class="alert-line-pill-dot" style="background-color:' + lineColors[lineCode] + '"></span>' +
        lineNames[lineCode] +
        '</span>';
    });

    html +=
      '<article class="alerts-card animate-in" style="animation-delay:' + delay + 's" role="alert">' +
      '<div class="alerts-card-severity ' + severityClass + '">' +
      '<span class="alerts-card-icon">' + icon + '</span>' +
      '<span class="alerts-card-severity-label">' + severityLabel + '</span>' +
      '<span class="alerts-card-time">' + escapeHtml(timeStr) + '</span>' +
      '</div>' +
      '<div class="alerts-card-body">' +
      '<div class="alerts-card-lines">' + linePillsHtml + '</div>' +
      '<p class="alerts-card-desc">' + linkifyUrls(escapeHtml(description)) + '</p>' +
      '<a href="https://www.wmata.com/service/status/" target="_blank" rel="noopener" class="alerts-card-cta">' +
      'Details at WMATA' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>' +
      '</a>' +
      '</div>' +
      '</article>';
  });

  alertsList.innerHTML = html;
}

// ==============================
// Filter Logic
// ==============================
function getFilteredIncidents() {
  if (activeFilters.size === 0) return currentIncidents.slice();

  return currentIncidents.filter((incident) => {
    const affectedLines = parseAffectedLines(incident.LinesAffected);
    return affectedLines.some((code) => activeFilters.has(code));
  });
}

function setupFilters() {
  const chips = alertsFilters.querySelectorAll('.alerts-filter-chip');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const line = chip.dataset.line;

      if (line === 'ALL') {
        // Clear all filters
        activeFilters.clear();
        chips.forEach((c) => {
          c.classList.remove('alerts-filter-chip--active');
        });
        chip.classList.add('alerts-filter-chip--active');
      } else {
        // Toggle this line filter
        const allChip = alertsFilters.querySelector('[data-line="ALL"]');
        allChip.classList.remove('alerts-filter-chip--active');

        if (activeFilters.has(line)) {
          activeFilters.delete(line);
          chip.classList.remove('alerts-filter-chip--active');
        } else {
          activeFilters.add(line);
          chip.classList.add('alerts-filter-chip--active');
        }

        // If no filters active, reactivate "All"
        if (activeFilters.size === 0) {
          allChip.classList.add('alerts-filter-chip--active');
        }
      }

      renderAlerts();
    });
  });
}

// ==============================
// SEO: Update meta description & schema
// ==============================
function updateSEO(incidents) {
  // Dynamic meta description
  const alertCount = incidents.length;
  let desc;
  if (alertCount === 0) {
    desc = 'All DC Metro lines operating normally. No active service alerts. Live status updates at NextMetro.';
  } else {
    const lineSet = new Set();
    incidents.forEach((inc) => {
      parseAffectedLines(inc.LinesAffected).forEach((code) => lineSet.add(lineNames[code]));
    });
    const lineList = Array.from(lineSet).join(', ');
    desc = alertCount + ' active alert' + (alertCount !== 1 ? 's' : '') +
      ' affecting ' + lineList + '. Live DC Metro status updates at NextMetro.';
  }
  if (metaDescription) {
    metaDescription.setAttribute('content', desc);
  }

  // Crawlable last-updated timestamp
  const now = new Date();
  if (lastUpdatedTime) {
    lastUpdatedTime.setAttribute('datetime', now.toISOString());
    lastUpdatedTime.textContent = now.toISOString();
  }

  // SpecialAnnouncement schema for active alerts
  if (schemaAlerts && incidents.length > 0) {
    const announcements = incidents.map((incident) => ({
      '@context': 'https://schema.org',
      '@type': 'SpecialAnnouncement',
      'name': getSeverityLabel(incident.IncidentType) + ': ' +
        parseAffectedLines(incident.LinesAffected).map((c) => lineNames[c]).join(', ') + ' Line',
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
    }));
    schemaAlerts.textContent = JSON.stringify(announcements);
  } else if (schemaAlerts) {
    schemaAlerts.textContent = '[]';
  }
}

// ==============================
// Update Timestamp Display
// ==============================
function updateTimestamp() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
  alertsUpdated.textContent = 'Updated ' + timeStr;
}

// ==============================
// Fetch Incidents
// ==============================
async function fetchIncidents() {
  try {
    const res = await fetchWithRetry(API_BASE_URL + '/api/incidents');
    if (!res.ok) throw new Error('Incidents API error');
    const data = await res.json();
    currentIncidents = deduplicateIncidents(data.Incidents || []);

    renderAlerts();
    renderTicker(currentIncidents);
    renderStatusBar(currentIncidents);
    updateTimestamp();
    updateSEO(currentIncidents);
  } catch (err) {
    console.error('Failed to fetch incidents:', err.message);
    // Keep existing data displayed, just update time
    if (currentIncidents.length === 0) {
      renderStatusBar([]);
      renderTicker([]);
    }
  }
}

// ==============================
// Polling
// ==============================
function startPolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  // Refresh every 30 seconds
  pollingInterval = setInterval(fetchIncidents, 30000);
}

// ==============================
// Init
// ==============================
document.addEventListener('DOMContentLoaded', async () => {
  setupFilters();
  renderStatusBar([]);

  // Wake up backend
  try {
    await fetchWithRetry(API_BASE_URL + '/healthz', 3, 2000);
  } catch (e) {
    // Backend may be sleeping
  }

  // Initial fetch
  await fetchIncidents();

  // Start polling
  startPolling();
});

// Refresh button
alertsRefresh.addEventListener('click', () => {
  fetchIncidents();
});
