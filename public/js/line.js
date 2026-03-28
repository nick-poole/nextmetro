// ==============================
// NextMetro — Line Page JS (Generic)
// Depends on shared.js (loaded first)
// ==============================
// Each page sets window.LINE_CODE and window.LINE_NAME before loading this script.

// ---- Line config (set by each page's inline script) ----
const LINE_CODE = window.LINE_CODE || 'RD';
const LINE_NAME = window.LINE_NAME || 'Red';

// ---- DOM Elements ----
const lineStatusDot = document.getElementById('line-status-dot');
const lineStatusText = document.getElementById('line-status-text');
const lineAlertsSection = document.getElementById('line-alerts');
const lineAlertsBody = document.getElementById('line-alerts-body');

// ---- State ----
let incidentsInterval = null;

// escapeHtml, parseAffectedLines — from shared.js

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
    statusMessage = normalizeText(delays[0].Description) || LINE_NAME + ' Line experiencing delays';
  } else if (advisories.length > 0) {
    status = 'caution';
    statusMessage = normalizeText(advisories[0].Description) || LINE_NAME + ' Line service advisory in effect';
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
      '<p class="line-alert-text">' + escapeHtml(normalizeText(incident.Description || '')) + '</p>' +
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
    const data = await safeJson(res);
    const incidents = data.Incidents || [];

    renderLineStatus(incidents);
    renderAlerts(incidents);
  } catch (err) {
    console.error('Failed to fetch incidents:', err.message);
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
