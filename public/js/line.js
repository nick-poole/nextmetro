// ==============================
// NextMetro — Line Page JS (Generic)
// ==============================
// Each page sets window.LINE_CODE and window.LINE_NAME before loading this script.

const API_BASE_URL = '';

// ---- Line config (set by each page's inline script) ----
const LINE_CODE = window.LINE_CODE || 'RD';
const LINE_NAME = window.LINE_NAME || 'Red';

// ---- Fetch with retry (handles Render cold starts) ----
async function fetchWithRetry(url, retries = 2, delayMs = 3000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res;
    if (res.status !== 503 || attempt === retries) return res;
    await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
  }
}

// ---- Line Colors ----
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

// ---- DOM Elements ----
const tickerTrack = document.getElementById('ticker-track');
const lineStatusDot = document.getElementById('line-status-dot');
const lineStatusText = document.getElementById('line-status-text');
const lineAlertsSection = document.getElementById('line-alerts');
const lineAlertsBody = document.getElementById('line-alerts-body');

// ---- State ----
let incidentsInterval = null;

// ---- Helpers ----
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function parseAffectedLines(linesStr) {
  if (!linesStr) return [];
  return linesStr
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && lineNames[s]);
}

// ==============================
// System Ticker (same as main app)
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
  lineData.forEach((line) => {
    const thisStatus = lineStatuses[line.code];
    const statusClass =
      thisStatus === 'Normal'
        ? 'ticker-status-ok'
        : thisStatus === 'Alert'
          ? 'ticker-status-alert'
          : 'ticker-status-caution';
    const alertClass = thisStatus !== 'Normal' ? ' ticker-item--alert' : '';
    html +=
      '<span class="ticker-item' + alertClass + '">' +
      '<span class="ticker-dot" style="background-color:' + line.color + '"></span>' +
      '<span class="ticker-line-name">' + line.name + '</span>' +
      '<span class="ticker-status-text ' + statusClass + '">' + thisStatus + '</span>' +
      '</span>';
  });

  tickerTrack.innerHTML = html;
}

// ==============================
// Line Status Hero
// ==============================
function renderLineStatus(incidents) {
  const relevant = (incidents || []).filter((incident) => {
    const affected = parseAffectedLines(incident.LinesAffected);
    return affected.includes(LINE_CODE);
  });

  let status = 'normal';
  let statusMessage = LINE_NAME + ' Line is running normally';

  const delays = relevant.filter((i) => i.IncidentType === 'Delay');
  const advisories = relevant.filter((i) => i.IncidentType !== 'Delay');

  if (delays.length > 0) {
    status = 'alert';
    statusMessage = delays[0].Description || LINE_NAME + ' Line experiencing delays';
  } else if (advisories.length > 0) {
    status = 'caution';
    statusMessage = advisories[0].Description || LINE_NAME + ' Line service advisory in effect';
  }

  lineStatusDot.className = 'line-status-dot';
  if (status === 'normal') {
    lineStatusDot.classList.add('line-status-dot--ok');
  } else if (status === 'alert') {
    lineStatusDot.classList.add('line-status-dot--alert');
  } else {
    lineStatusDot.classList.add('line-status-dot--caution');
  }

  lineStatusText.textContent = statusMessage;
}

// ==============================
// Alerts Section
// ==============================
function renderAlerts(incidents) {
  const relevant = (incidents || []).filter((incident) => {
    const affected = parseAffectedLines(incident.LinesAffected);
    return affected.includes(LINE_CODE);
  });

  if (relevant.length === 0) {
    lineAlertsSection.style.display = 'none';
    return;
  }

  lineAlertsSection.style.display = '';

  const show = relevant.slice(0, 3);
  let html = '';
  show.forEach((incident) => {
    const time = incident.DateUpdated
      ? new Date(incident.DateUpdated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : '';
    html +=
      '<div class="line-alert-item">' +
      '<p class="line-alert-text">' + escapeHtml(incident.Description || '') + '</p>' +
      (time ? '<span class="line-alert-time">' + time + '</span>' : '') +
      '</div>';
  });

  if (relevant.length > 3) {
    html += '<p class="line-alerts-more">' + (relevant.length - 3) + ' more alert' + (relevant.length - 3 > 1 ? 's' : '') + '</p>';
  }

  lineAlertsBody.innerHTML = html;
}

// ==============================
// Incidents Fetching
// ==============================
async function fetchIncidents() {
  try {
    const res = await fetchWithRetry(API_BASE_URL + '/api/incidents');
    if (!res.ok) throw new Error('Incidents API error');
    const data = await res.json();
    const incidents = data.Incidents || [];

    renderTicker(incidents);
    renderLineStatus(incidents);
    renderAlerts(incidents);
  } catch (err) {
    console.error('Failed to fetch incidents:', err.message);
    renderTicker([]);
    lineStatusDot.className = 'line-status-dot line-status-dot--ok';
    lineStatusText.textContent = LINE_NAME + ' Line is running normally';
  }
}

// ==============================
// Polling
// ==============================
function startPolling() {
  incidentsInterval = setInterval(fetchIncidents, 60000);
}

// ==============================
// Init
// ==============================
document.addEventListener('DOMContentLoaded', async () => {
  // Show ticker with all-normal state before API response
  renderTicker([]);

  // Wake up backend
  try {
    await fetchWithRetry(API_BASE_URL + '/healthz', 3, 2000);
  } catch (e) {
    // Backend may be down
  }

  // Fetch live data
  fetchIncidents();

  // Start polling
  startPolling();
});
