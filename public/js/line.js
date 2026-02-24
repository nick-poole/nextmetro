// ==============================
// NextMetro — Line Page JS
// ==============================

const API_BASE_URL = '';

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

// ---- Red Line Station Data (ordered Shady Grove → Glenmont) ----
const LINE_CODE = 'RD';

const redLineStations = [
  { code: 'A15', name: 'Shady Grove', parking: true },
  { code: 'A14', name: 'Rockville', parking: true },
  { code: 'A13', name: 'Twinbrook', parking: true },
  { code: 'A12', name: 'North Bethesda', parking: true },
  { code: 'A11', name: 'Grosvenor-Strathmore', parking: true },
  { code: 'A10', name: 'Medical Center', parking: true },
  { code: 'A09', name: 'Bethesda', parking: false },
  { code: 'A08', name: 'Friendship Heights', parking: false },
  { code: 'A07', name: 'Tenleytown-AU', parking: false },
  { code: 'A06', name: 'Van Ness-UDC', parking: false },
  { code: 'A05', name: 'Cleveland Park', parking: false },
  { code: 'A04', name: 'Woodley Park-Zoo/Adams Morgan', parking: false },
  { code: 'A03', name: 'Dupont Circle', parking: false },
  { code: 'A02', name: 'Farragut North', parking: false },
  { code: 'A01', name: 'Metro Center', parking: false, transfer: ['OR', 'BL', 'SV'] },
  { code: 'B01', name: 'Gallery Pl-Chinatown', parking: false, transfer: ['GR', 'YL'] },
  { code: 'B02', name: 'Judiciary Square', parking: false },
  { code: 'B03', name: 'Union Station', parking: false },
  { code: 'B35', name: 'NoMa-Gallaudet U', parking: false },
  { code: 'B04', name: 'Rhode Island Ave-Brentwood', parking: true },
  { code: 'B05', name: 'Brookland-CUA', parking: false },
  { code: 'B06', name: 'Fort Totten', parking: true, transfer: ['GR', 'YL'] },
  { code: 'B07', name: 'Takoma', parking: false },
  { code: 'B08', name: 'Silver Spring', parking: false },
  { code: 'B09', name: 'Forest Glen', parking: true },
  { code: 'B10', name: 'Wheaton', parking: true },
  { code: 'B11', name: 'Glenmont', parking: true },
];

// ---- DOM Elements ----
const tickerTrack = document.getElementById('ticker-track');
const lineStatusDot = document.getElementById('line-status-dot');
const lineStatusText = document.getElementById('line-status-text');
const lineAlertsSection = document.getElementById('line-alerts');
const lineAlertsBody = document.getElementById('line-alerts-body');
const lineStationsList = document.getElementById('line-stations-list');
const lineMap = document.getElementById('line-map');

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

function stationSlug(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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
// Line Status Hero
// ==============================
function renderLineStatus(incidents) {
  const relevant = (incidents || []).filter((incident) => {
    const affected = parseAffectedLines(incident.LinesAffected);
    return affected.includes(LINE_CODE);
  });

  // Determine most severe status
  let status = 'normal';
  let statusMessage = 'Red Line is running normally';

  const delays = relevant.filter((i) => i.IncidentType === 'Delay');
  const advisories = relevant.filter((i) => i.IncidentType !== 'Delay');

  if (delays.length > 0) {
    status = 'alert';
    statusMessage = delays[0].Description || 'Red Line experiencing delays';
  } else if (advisories.length > 0) {
    status = 'caution';
    statusMessage = advisories[0].Description || 'Red Line service advisory in effect';
  }

  // Update status dot
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

  // Show up to 3 inline, link to full if more
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
// Station List
// ==============================
function renderStations() {
  let html = '';

  redLineStations.forEach((station, index) => {
    const isFirst = index === 0;
    const isLast = index === redLineStations.length - 1;
    const isTransfer = station.transfer && station.transfer.length > 0;

    let badges = '';

    // Transfer indicator
    if (isTransfer) {
      let transferDots = '';
      station.transfer.forEach((lineCode) => {
        transferDots +=
          '<span class="station-transfer-dot" style="background-color:' +
          lineColors[lineCode] + '" title="' + lineNames[lineCode] + ' Line"></span>';
      });
      badges +=
        '<span class="station-transfer">' +
        transferDots +
        '<span class="station-transfer-label">Transfer</span>' +
        '</span>';
    }

    // Parking indicator
    if (station.parking) {
      badges +=
        '<span class="station-badge station-badge--parking" title="Parking available">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z"/></svg>' +
        '</span>';
    }

    // Terminus label
    let terminus = '';
    if (isFirst) {
      terminus = '<span class="station-terminus">Terminus</span>';
    } else if (isLast) {
      terminus = '<span class="station-terminus">Terminus</span>';
    }

    html +=
      '<a href="/" class="line-station-row" data-code="' + station.code + '">' +
      '<span class="line-station-dot-col">' +
      '<span class="line-station-dot' + (isTransfer ? ' line-station-dot--transfer' : '') + '" style="--line-color: var(--nm-line-red);"></span>' +
      ((!isLast) ? '<span class="line-station-connector" style="--line-color: var(--nm-line-red);"></span>' : '') +
      '</span>' +
      '<span class="line-station-info">' +
      '<span class="line-station-name">' + escapeHtml(station.name) + '</span>' +
      (badges ? '<span class="line-station-badges">' + badges + '</span>' : '') +
      terminus +
      '</span>' +
      '<span class="line-station-arrow">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>' +
      '</span>' +
      '</a>';
  });

  lineStationsList.innerHTML = html;
}

// ==============================
// Mini Line Map
// ==============================
function renderLineMap() {
  const track = lineMap.querySelector('.line-map-track');
  let html = '';

  redLineStations.forEach((station, index) => {
    const isTransfer = station.transfer && station.transfer.length > 0;
    const isFirst = index === 0;
    const isLast = index === redLineStations.length - 1;
    const pct = (index / (redLineStations.length - 1)) * 100;

    // Only label termini and transfer stations
    const showLabel = isFirst || isLast || isTransfer;

    html +=
      '<div class="map-station" style="left:' + pct + '%;" title="' + escapeHtml(station.name) + '">' +
      '<span class="map-dot' + (isTransfer ? ' map-dot--transfer' : '') + '"></span>' +
      (showLabel
        ? '<span class="map-label' +
          (isFirst ? ' map-label--first' : '') +
          (isLast ? ' map-label--last' : '') +
          '">' + escapeHtml(station.name) + '</span>'
        : '') +
      '</div>';
  });

  track.innerHTML = html;
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
    lineStatusText.textContent = 'Red Line is running normally';
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
  // Render static content immediately
  renderStations();
  renderLineMap();

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
