// ==============================
// NextMetro — Elevator & Escalator Status Page
// Station-grouped, filterable, real-time outage tracker
// Depends on shared.js (loaded first)
// ==============================

// ---- Station code prefix to line mapping ----
var stationLines = {
  A: ['RD'],
  B: ['RD'],
  C: ['BL', 'OR', 'SV'],
  D: ['BL', 'OR', 'SV'],
  E: ['GR', 'YL'],
  F: ['GR', 'YL'],
  G: ['BL', 'SV'],
  J: ['BL', 'YL'],
  K: ['OR', 'SV'],
  N: ['SV'],
  S: ['BL', 'YL'],
};

// ---- State ----
var currentOutages = [];
var activeTypeFilter = 'all'; // 'all' | 'ELEVATOR' | 'ESCALATOR'
var activeLineFilter = 'all'; // 'all' | line code
var pollingInterval = null;

// ---- DOM ----
var elevStations = document.getElementById('elev-stations');
var elevEmpty = document.getElementById('elev-empty');
var elevUpdated = document.getElementById('elev-updated');
var elevRefresh = document.getElementById('elev-refresh');
var elevSummary = document.getElementById('elev-summary');
var elevFilters = document.getElementById('elev-filters');
var elevLineFilters = document.getElementById('elev-line-filters');
var metaDescription = document.getElementById('meta-description');
var lastUpdatedTime = document.getElementById('elev-last-updated-time');
var seoStations = document.getElementById('elev-seo-stations');

// ==============================
// Get lines for a station code
// ==============================
function getLinesForStation(stationCode) {
  if (!stationCode) return [];
  var prefix = stationCode.charAt(0);
  return stationLines[prefix] || [];
}

// formatOutageTime — alias for formatRelativeTime (from shared.js)
var formatOutageTime = formatRelativeTime;

// ==============================
// Group outages by station
// ==============================
function groupByStation(outages) {
  var groups = {};
  var order = [];

  outages.forEach(function (outage) {
    var station = outage.StationName || 'Unknown Station';
    var code = outage.StationCode || '';

    if (!groups[station]) {
      groups[station] = {
        station: station,
        stationCode: code,
        lines: getLinesForStation(code),
        outages: [],
        elevatorOut: 0,
        escalatorOut: 0,
      };
      order.push(station);
    }

    groups[station].outages.push(outage);
    if ((outage.UnitType || '').toUpperCase() === 'ELEVATOR') {
      groups[station].elevatorOut++;
    } else {
      groups[station].escalatorOut++;
    }
  });

  // Sort: elevator outages first (accessibility critical), then by outage count
  order.sort(function (a, b) {
    var aElev = groups[a].elevatorOut;
    var bElev = groups[b].elevatorOut;
    if (aElev !== bElev) return bElev - aElev;
    return groups[b].outages.length - groups[a].outages.length;
  });

  return order.map(function (name) { return groups[name]; });
}

// ==============================
// Apply filters
// ==============================
function getFilteredOutages() {
  var filtered = currentOutages;

  // Type filter
  if (activeTypeFilter !== 'all') {
    filtered = filtered.filter(function (o) {
      return (o.UnitType || '').toUpperCase() === activeTypeFilter;
    });
  }

  // Line filter
  if (activeLineFilter !== 'all') {
    filtered = filtered.filter(function (o) {
      var lines = getLinesForStation(o.StationCode || '');
      return lines.indexOf(activeLineFilter) !== -1;
    });
  }

  return filtered;
}

// ==============================
// Render Summary Bar
// ==============================
function renderSummary() {
  var total = currentOutages.length;
  var elevCount = 0;
  var escalCount = 0;
  var stationSet = new Set();

  currentOutages.forEach(function (o) {
    if ((o.UnitType || '').toUpperCase() === 'ELEVATOR') elevCount++;
    else escalCount++;
    if (o.StationName) stationSet.add(o.StationName);
  });

  if (total === 0) {
    elevSummary.innerHTML =
      '<div class="elev-summary-item elev-summary-item--ok">' +
      '<span class="elev-summary-value">0</span>' +
      '<span class="elev-summary-label">Outages</span>' +
      '</div>' +
      '<div class="elev-summary-item">' +
      '<span class="elev-summary-value elev-summary-value--ok">All Working</span>' +
      '<span class="elev-summary-label">System Status</span>' +
      '</div>';
    return;
  }

  elevSummary.innerHTML =
    '<div class="elev-summary-item">' +
    '<span class="elev-summary-value">' + total + '</span>' +
    '<span class="elev-summary-label">Total Outage' + (total !== 1 ? 's' : '') + '</span>' +
    '</div>' +
    '<div class="elev-summary-item">' +
    '<span class="elev-summary-value">' + elevCount + '</span>' +
    '<span class="elev-summary-label">Elevator' + (elevCount !== 1 ? 's' : '') + '</span>' +
    '</div>' +
    '<div class="elev-summary-item">' +
    '<span class="elev-summary-value">' + escalCount + '</span>' +
    '<span class="elev-summary-label">Escalator' + (escalCount !== 1 ? 's' : '') + '</span>' +
    '</div>' +
    '<div class="elev-summary-item">' +
    '<span class="elev-summary-value">' + stationSet.size + '</span>' +
    '<span class="elev-summary-label">Station' + (stationSet.size !== 1 ? 's' : '') + ' Affected</span>' +
    '</div>';
}

// ==============================
// Render Station Cards
// ==============================
function renderStations() {
  var filtered = getFilteredOutages();

  if (filtered.length === 0) {
    elevStations.innerHTML = '';
    elevEmpty.style.display = '';
    // Update empty state text based on filters
    var emptyTitle = elevEmpty.querySelector('.alerts-empty-title');
    var emptyText = elevEmpty.querySelector('.alerts-empty-text');
    if (activeTypeFilter !== 'all' || activeLineFilter !== 'all') {
      emptyTitle.textContent = 'No Matching Outages';
      emptyText.textContent = 'No outages match your current filters. Try adjusting or clearing filters.';
    } else {
      emptyTitle.textContent = 'All Clear';
      emptyText.textContent = 'No elevator or escalator outages system-wide. All stations fully accessible.';
    }
    return;
  }

  elevEmpty.style.display = 'none';
  var groups = groupByStation(filtered);
  var html = '';

  groups.forEach(function (group, idx) {
    var delay = Math.min(idx * 0.04, 0.5);
    var hasElevOut = group.elevatorOut > 0;
    var statusClass = hasElevOut ? 'elev-station--elevator-out' : 'elev-station--escalator-out';
    var statusLabel = hasElevOut ? 'Elevator Out' : 'Escalator Out';
    var statusIcon = hasElevOut
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';

    // Line dots for this station
    var lineDots = '';
    group.lines.forEach(function (lineCode) {
      lineDots += '<span class="elev-station-line-dot" style="background-color:' + (lineColors[lineCode] || '#888') + '" title="' + (lineNames[lineCode] || '') + ' Line"></span>';
    });

    html += '<article class="elev-station-card ' + statusClass + ' animate-in" style="animation-delay:' + delay + 's" role="listitem">';

    // Station header
    html +=
      '<div class="elev-station-header">' +
      '<div class="elev-station-name-row">' +
      '<div class="elev-station-lines">' + lineDots + '</div>' +
      '<h2 class="elev-station-name">' + escapeHtml(group.station) + '</h2>' +
      '</div>' +
      '<div class="elev-station-status ' + (hasElevOut ? 'elev-station-status--red' : 'elev-station-status--yellow') + '">' +
      statusIcon +
      '<span>' + statusLabel + '</span>' +
      '</div>' +
      '</div>';

    // Outage count summary
    html += '<div class="elev-station-counts">';
    if (group.elevatorOut > 0) {
      html += '<span class="elev-station-count elev-station-count--elev">' + group.elevatorOut + ' elevator' + (group.elevatorOut !== 1 ? 's' : '') + ' out</span>';
    }
    if (group.escalatorOut > 0) {
      html += '<span class="elev-station-count elev-station-count--esc">' + group.escalatorOut + ' escalator' + (group.escalatorOut !== 1 ? 's' : '') + ' out</span>';
    }
    html += '</div>';

    // Individual outages
    html += '<div class="elev-station-outages">';
    group.outages.forEach(function (outage) {
      var unitType = (outage.UnitType || '').toUpperCase();
      var typeLabel = unitType === 'ELEVATOR' ? 'Elevator' : 'Escalator';
      var typeClass = unitType === 'ELEVATOR' ? 'elev-outage--elevator' : 'elev-outage--escalator';
      var location = outage.LocationDescription || '';
      var symptom = outage.SymptomDescription || '';
      var unit = outage.UnitName || '';
      var timeStr = formatOutageTime(outage.DateOutOfServ || outage.DateUpdated || '');

      html +=
        '<div class="elev-outage ' + typeClass + '">' +
        '<div class="elev-outage-header">' +
        '<span class="elev-outage-type">' + typeLabel + '</span>' +
        (unit ? '<span class="elev-outage-unit">' + escapeHtml(unit) + '</span>' : '') +
        (timeStr ? '<span class="elev-outage-time">' + escapeHtml(timeStr) + '</span>' : '') +
        '</div>' +
        (location ? '<div class="elev-outage-location">' + escapeHtml(location) + '</div>' : '') +
        (symptom ? '<div class="elev-outage-symptom">' + escapeHtml(symptom) + '</div>' : '') +
        '</div>';
    });
    html += '</div>';

    html += '</article>';
  });

  elevStations.innerHTML = html;
}

// ==============================
// SEO: Update meta description & crawlable station text
// ==============================
function updateSEO() {
  var total = currentOutages.length;
  var desc;
  if (total === 0) {
    desc = 'All DC Metro elevators and escalators operating normally. No outages reported. Live status updates at NextMetro.';
  } else {
    var stationSet = new Set();
    var elevCount = 0;
    var escalCount = 0;
    currentOutages.forEach(function (o) {
      if (o.StationName) stationSet.add(o.StationName);
      if ((o.UnitType || '').toUpperCase() === 'ELEVATOR') elevCount++;
      else escalCount++;
    });
    var parts = [];
    if (elevCount > 0) parts.push(elevCount + ' elevator' + (elevCount !== 1 ? 's' : ''));
    if (escalCount > 0) parts.push(escalCount + ' escalator' + (escalCount !== 1 ? 's' : ''));
    desc = total + ' outage' + (total !== 1 ? 's' : '') + ' (' + parts.join(', ') +
      ') at ' + stationSet.size + ' station' + (stationSet.size !== 1 ? 's' : '') +
      '. Live DC Metro elevator & escalator status at NextMetro.';
  }

  if (metaDescription) {
    metaDescription.setAttribute('content', desc);
  }

  // Crawlable timestamp
  var now = new Date();
  if (lastUpdatedTime) {
    lastUpdatedTime.setAttribute('datetime', now.toISOString());
    lastUpdatedTime.textContent = now.toISOString();
  }

  // Crawlable station names for SEO (long-tail "[station] elevator" queries)
  if (seoStations && currentOutages.length > 0) {
    var stationNames = [];
    var seen = new Set();
    currentOutages.forEach(function (o) {
      var name = o.StationName || '';
      if (name && !seen.has(name)) {
        seen.add(name);
        stationNames.push(name);
      }
    });
    seoStations.textContent = 'Current elevator and escalator outages at: ' + stationNames.join(', ') + '.';
  } else if (seoStations) {
    seoStations.textContent = '';
  }
}

// ==============================
// Update Timestamp
// ==============================
function updateTimestamp() {
  var now = new Date();
  var timeStr = now.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
  elevUpdated.textContent = 'Updated ' + timeStr;
}

// ==============================
// Fetch All Outages
// ==============================
async function fetchOutages() {
  try {
    var res = await fetchWithRetry(API_BASE_URL + '/api/elevators');
    if (!res || !res.ok) throw new Error('API error');
    var data = await safeJson(res);
    currentOutages = data.ElevatorIncidents || [];
  } catch (e) {
    console.error('Failed to fetch elevator incidents:', e.message);
    // Keep existing data on error
  }

  renderSummary();
  renderStations();
  updateTimestamp();
  updateSEO();
}

// ==============================
// Filter Event Handlers
// ==============================
elevFilters.addEventListener('click', function (e) {
  var chip = e.target.closest('.elev-filter-chip');
  if (!chip) return;
  var filter = chip.dataset.filter;
  if (!filter) return;

  activeTypeFilter = filter;

  // Update active states
  var chips = elevFilters.querySelectorAll('.elev-filter-chip');
  chips.forEach(function (c) {
    var isActive = c.dataset.filter === filter;
    c.classList.toggle('elev-filter-chip--active', isActive);
    c.setAttribute('aria-pressed', String(isActive));
  });

  renderStations();
});

elevLineFilters.addEventListener('click', function (e) {
  var chip = e.target.closest('.elev-line-chip');
  if (!chip) return;
  var line = chip.dataset.line;
  if (!line) return;

  activeLineFilter = line;

  // Update active states
  var chips = elevLineFilters.querySelectorAll('.elev-line-chip');
  chips.forEach(function (c) {
    var isActive = c.dataset.line === line;
    c.classList.toggle('elev-line-chip--active', isActive);
    c.setAttribute('aria-pressed', String(isActive));
  });

  renderStations();
});

elevRefresh.addEventListener('click', function () {
  fetchOutages();
});

// ==============================
// Polling
// ==============================
function startPolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(function () {
    fetchOutages();
  }, 30000);
}

// ==============================
// Init
// ==============================
document.addEventListener('DOMContentLoaded', async function () {
  // Wake up backend
  try {
    await fetchWithRetry(API_BASE_URL + '/healthz', 3, 2000);
  } catch (e) {
    // Backend may be sleeping
  }

  await fetchOutages();
  startPolling();
});
