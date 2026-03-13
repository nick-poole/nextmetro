// ==============================
// NextMetro — Brand v1.0 JS
// Typography: Rajdhani | Theme: Neutral Brutalist
// ==============================

const API_BASE_URL = '';

// ---- Fetch with retry (handles Render free-tier cold starts) ----
async function fetchWithRetry(url, retries = 2, delayMs = 3000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res;
    // Retry on 503 (Render waking up) but not other errors
    if (res.status !== 503 || attempt === retries) return res;
    await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
  }
}

// ---- Station Data ----
const stations = {
  A01: 'Metro Center',
  A02: 'Farragut North',
  A03: 'Dupont Circle',
  A04: 'Woodley Park-Zoo/Adams Morgan',
  A05: 'Cleveland Park',
  A06: 'Van Ness-UDC',
  A07: 'Tenleytown-AU',
  A08: 'Friendship Heights',
  A09: 'Bethesda',
  A10: 'Medical Center',
  A11: 'Grosvenor-Strathmore',
  A12: 'North Bethesda-White Flint',
  A13: 'Twinbrook',
  A14: 'Rockville',
  A15: 'Shady Grove',
  B01: 'Gallery Pl-Chinatown',
  B02: 'Judiciary Square',
  B03: 'Union Station',
  B04: 'Rhode Island Ave-Brentwood',
  B05: 'Brookland-CUA',
  B06: 'Fort Totten',
  B07: 'Takoma',
  B08: 'Silver Spring',
  B09: 'Forest Glen',
  B10: 'Wheaton',
  B11: 'Glenmont',
  B35: 'NoMa-Gallaudet U',
  C01: 'Metro Center',
  C02: 'McPherson Square',
  C03: 'Farragut West',
  C04: 'Foggy Bottom-GWU',
  C05: 'Rosslyn',
  C06: 'Arlington Cemetery',
  C07: 'Pentagon',
  C08: 'Pentagon City',
  C09: 'Crystal City',
  C10: 'Ronald Reagan Washington National Airport',
  C11: 'Potomac Yard',
  C12: 'Braddock Road',
  C13: 'King St-Old Town',
  C14: 'Eisenhower Avenue',
  C15: 'Huntington',
  D01: 'Federal Triangle',
  D02: 'Smithsonian',
  D03: "L'Enfant Plaza",
  D04: 'Federal Center SW',
  D05: 'Capitol South',
  D06: 'Eastern Market',
  D07: 'Potomac Ave',
  D08: 'Stadium-Armory',
  D09: 'Minnesota Ave',
  D10: 'Deanwood',
  D11: 'Cheverly',
  D12: 'Landover',
  D13: 'New Carrollton',
  E01: 'Mt Vernon Sq 7th St-Convention Center',
  E02: 'Shaw-Howard U',
  E03: 'U Street/African-Amer Civil War Memorial/Cardozo',
  E04: 'Columbia Heights',
  E05: 'Georgia Ave-Petworth',
  E06: 'Fort Totten',
  E07: 'West Hyattsville',
  E08: "Prince George's Plaza",
  E09: 'College Park-U of Md',
  E10: 'Greenbelt',
  F01: 'Gallery Pl-Chinatown',
  F02: 'Archives-Navy Memorial-Penn Quarter',
  F03: "L'Enfant Plaza",
  F04: 'Waterfront',
  F05: 'Navy Yard-Ballpark',
  F06: 'Anacostia',
  F07: 'Congress Heights',
  F08: 'Southern Ave',
  F09: 'Naylor Road',
  F10: 'Suitland',
  F11: 'Branch Ave',
  G01: 'Benning Road',
  G02: 'Capitol Heights',
  G03: 'Addison Road-Seat Pleasant',
  G04: 'Morgan Boulevard',
  G05: 'Largo Town Center',
  J02: 'Van Dorn Street',
  J03: 'Franconia-Springfield',
  K01: 'Court House',
  K02: 'Clarendon',
  K03: 'Virginia Square-GMU',
  K04: 'Ballston-MU',
  K05: 'East Falls Church',
  K06: 'West Falls Church',
  K07: 'Dunn Loring-Merrifield',
  K08: 'Vienna/Fairfax-GMU',
  N01: 'McLean',
  N02: 'Tysons Corner',
  N03: 'Greensboro',
  N04: 'Spring Hill',
  N06: 'Wiehle-Reston East',
  N07: 'Reston Town Center',
  N08: 'Herndon',
  N09: 'Innovation Center',
  N10: 'Dulles',
  N11: 'Loudon Gateway',
  N12: 'Ashburn',
  S04: 'King St-Old Town',
  S09: 'Braddock Road',
  S10: 'DCA-National Airport',
  S12: 'Crystal City',
  S13: 'Pentagon City',
  S14: 'Pentagon',
};

// ---- Multi-platform stations ----
// StationTogether mapping: if you select one code, also fetch predictions for the other
const multiPlatform = {
  A01: 'C01', // Metro Center
  C01: 'A01',
  B01: 'F01', // Gallery Place-Chinatown
  F01: 'B01',
  D03: 'F03', // L'Enfant Plaza
  F03: 'D03',
  B06: 'E06', // Fort Totten
  E06: 'B06',
};

// ---- Metro Line Colors ----
const lineColors = {
  RD: '#D41140',
  BL: '#00A8E8',
  YL: '#FFD400',
  OR: '#F09500',
  GR: '#00BD45',
  SV: '#9BA5A5',
};

const pidsLineColors = {
  RD: '#D41140',
  BL: '#00A8E8',
  YL: '#FFD400',
  OR: '#F09500',
  GR: '#00BD45',
  SV: '#9BA5A5',
};

const lineNames = {
  RD: 'Red',
  BL: 'Blue',
  YL: 'Yellow',
  OR: 'Orange',
  GR: 'Green',
  SV: 'Silver',
};

// Station code prefix -> line info
const prefixLines = {
  A: [{ code: 'RD', name: 'Red', color: '#D41140' }],
  B: [{ code: 'RD', name: 'Red', color: '#D41140' }],
  C: [
    { code: 'BL', name: 'Blue', color: '#00A8E8' },
    { code: 'OR', name: 'Orange', color: '#F09500' },
    { code: 'SV', name: 'Silver', color: '#9BA5A5' },
  ],
  D: [
    { code: 'BL', name: 'Blue', color: '#00A8E8' },
    { code: 'OR', name: 'Orange', color: '#F09500' },
    { code: 'SV', name: 'Silver', color: '#9BA5A5' },
  ],
  E: [
    { code: 'GR', name: 'Green', color: '#00BD45' },
    { code: 'YL', name: 'Yellow', color: '#FFD400' },
  ],
  F: [
    { code: 'GR', name: 'Green', color: '#00BD45' },
    { code: 'YL', name: 'Yellow', color: '#FFD400' },
  ],
  G: [
    { code: 'BL', name: 'Blue', color: '#00A8E8' },
    { code: 'SV', name: 'Silver', color: '#9BA5A5' },
  ],
  J: [
    { code: 'BL', name: 'Blue', color: '#00A8E8' },
    { code: 'YL', name: 'Yellow', color: '#FFD400' },
  ],
  K: [
    { code: 'OR', name: 'Orange', color: '#F09500' },
    { code: 'SV', name: 'Silver', color: '#9BA5A5' },
  ],
  N: [{ code: 'SV', name: 'Silver', color: '#9BA5A5' }],
  S: [
    { code: 'BL', name: 'Blue', color: '#00A8E8' },
    { code: 'YL', name: 'Yellow', color: '#FFD400' },
  ],
};

// ---- State ----
// Station pages can set STATION_CODE before loading app.js to override the default
let selectedStation = (typeof STATION_CODE !== 'undefined') ? STATION_CODE : 'B05';
let predictionsInterval = null;
let incidentsInterval = null;
let facilitiesInterval = null;
let lastUpdatedTime = null;
let highlightedIndex = -1;
let currentIncidents = []; // cached incidents for ticker + sidebar + alerts

// ---- DOM Elements ----
const heroStationName = document.getElementById('hero-station-name');
const heroStationAddress = document.getElementById('hero-station-address');
const stationAddressCache = {};
const linePillsEl = document.getElementById('line-pills');
const stationInput = document.getElementById('station-input');
const stationDropdown = document.getElementById('station-dropdown');
const pidsContent = document.getElementById('pids-content');
const pidsHeaderStation = document.getElementById('pids-header-station');
const lastUpdatedEl = document.getElementById('last-updated');
const updatedTimeEl = document.getElementById('updated-time');
const refreshBtn = document.getElementById('refresh-btn');
const tickerTrack = document.getElementById('ticker-track');
const systemStatusRows = document.getElementById('system-status-rows');
const alertCard = document.getElementById('alert-card');
const alertBody = document.getElementById('alert-body');
const alertTimestamp = document.getElementById('alert-timestamp');
const facilitiesBody = document.getElementById('facilities-body');
const facilitiesDetails = document.getElementById('facilities-details');
const elevatorStatus = document.getElementById('elevator-status');
const escalatorStatus = document.getElementById('escalator-status');
const fareFromName = document.getElementById('fare-from-name');
const fareDestination = document.getElementById('fare-destination');
const fareResults = document.getElementById('fare-results');
const farePeak = document.getElementById('fare-peak');
const fareOffpeak = document.getElementById('fare-offpeak');
const fareSenior = document.getElementById('fare-senior');
const fareTime = document.getElementById('fare-time');

// Build station options array (deduplicate multi-platform stations)
const stationOptions = Object.entries(stations).map(([code, name]) => ({
  code,
  name,
  lines: prefixLines[code.charAt(0)] || [],
}));

// Get all line codes that serve a station (including multi-platform partner)
function getStationLineCodes(stationCode) {
  const lines = new Set();
  const prefix = stationCode.charAt(0);
  (prefixLines[prefix] || []).forEach((l) => lines.add(l.code));

  const partner = multiPlatform[stationCode];
  if (partner) {
    const partnerPrefix = partner.charAt(0);
    (prefixLines[partnerPrefix] || []).forEach((l) => lines.add(l.code));
  }

  return Array.from(lines);
}

// Get the prediction station codes string (handles multi-platform)
function getPredictionCodes(stationCode) {
  const partner = multiPlatform[stationCode];
  if (partner) {
    return stationCode + ',' + partner;
  }
  return stationCode;
}

// ==============================
// Station Address
// ==============================
async function fetchStationAddress(stationCode) {
  if (stationAddressCache[stationCode]) {
    if (heroStationAddress) heroStationAddress.textContent = stationAddressCache[stationCode];
    return;
  }
  if (heroStationAddress) heroStationAddress.textContent = '';
  try {
    const res = await fetchWithRetry(API_BASE_URL + '/api/station/' + stationCode);
    const data = await res.json();
    if (data && data.Address) {
      const addr = data.Address;
      const formatted = addr.Street + ', ' + addr.City + ', ' + addr.State + ' ' + addr.Zip;
      stationAddressCache[stationCode] = formatted;
      // Only update if this station is still selected
      if (selectedStation === stationCode) {
        if (heroStationAddress) heroStationAddress.textContent = formatted;
      }
    }
  } catch (e) {
    // Address is supplementary — fail silently
  }
}

// ==============================
// Hero Station Display
// ==============================
function updateHeroDisplay(stationCode) {
  const name = stations[stationCode] || 'Unknown Station';
  const lines = prefixLines[stationCode.charAt(0)] || [];

  // For multi-platform stations, merge lines from both codes
  const allLines = [];
  const seenCodes = new Set();
  const addLines = (prefix) => {
    (prefixLines[prefix] || []).forEach((l) => {
      if (!seenCodes.has(l.code)) {
        seenCodes.add(l.code);
        allLines.push(l);
      }
    });
  };
  addLines(stationCode.charAt(0));
  const partner = multiPlatform[stationCode];
  if (partner) addLines(partner.charAt(0));

  heroStationName.textContent = name;
  fetchStationAddress(stationCode);

  // Update line pills
  linePillsEl.innerHTML = '';
  allLines.forEach((line) => {
    const pill = document.createElement('span');
    pill.className = 'line-pill';
    pill.style.background = 'linear-gradient(135deg, ' + line.color + '1a, transparent)';
    pill.style.color = line.color;
    pill.innerHTML =
      '<span class="line-pill-dot" style="background-color:' +
      line.color +
      '"></span>' +
      line.name;
    linePillsEl.appendChild(pill);
  });

  // Update PIDS header — keep static "Next Arrivals" text
  // pidsHeaderStation.textContent = name;

  // Update fare calculator "from" display
  fareFromName.textContent = name;
}

// ==============================
// System Ticker (driven by live incidents)
// ==============================
function renderTicker(incidents) {
  const lineData = [
    { code: 'RD', name: 'Red', color: '#D41140' },
    { code: 'OR', name: 'Orange', color: '#F09500' },
    { code: 'BL', name: 'Blue', color: '#00A8E8' },
    { code: 'GR', name: 'Green', color: '#00BD45' },
    { code: 'YL', name: 'Yellow', color: '#FFD400' },
    { code: 'SV', name: 'Silver', color: '#9BA5A5' },
  ];

  // Determine per-line status from incidents
  const lineStatuses = {};
  lineData.forEach((l) => { lineStatuses[l.code] = 'Normal'; });

  (incidents || []).forEach((incident) => {
    const affectedLines = parseAffectedLines(incident.LinesAffected);
    const status = incident.IncidentType === 'Delay' ? 'Alert' : 'Caution';
    affectedLines.forEach((lineCode) => {
      if (lineStatuses[lineCode]) {
        // Alert takes priority over Caution
        if (status === 'Alert' || lineStatuses[lineCode] === 'Normal') {
          lineStatuses[lineCode] = status;
        }
      }
    });
  });

  // Build static status bar content
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

  if (tickerTrack) tickerTrack.innerHTML = html;
}

// ==============================
// Parse LinesAffected string
// ==============================
function parseAffectedLines(linesStr) {
  if (!linesStr) return [];
  return linesStr
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && lineNames[s]);
}

// ==============================
// Incidents Fetching & Rendering
// ==============================
async function fetchIncidents() {
  try {
    const res = await fetchWithRetry(API_BASE_URL + '/api/incidents');
    if (!res.ok) throw new Error('Incidents API error');
    const data = await res.json();
    currentIncidents = data.Incidents || [];

    renderSystemStatus(currentIncidents);
    renderTicker(currentIncidents);
    renderAlerts(currentIncidents, selectedStation);
  } catch (err) {
    console.error('Failed to fetch incidents:', err.message);
    // Still render system status with empty incidents so lines show "Normal"
    renderSystemStatus([]);
  }
}

// ==============================
// System Status Sidebar (live from incidents)
// ==============================
function renderSystemStatus(incidents) {
  const lines = [
    { code: 'RD', name: 'Red', color: '#D41140' },
    { code: 'OR', name: 'Orange', color: '#F09500' },
    { code: 'BL', name: 'Blue', color: '#00A8E8' },
    { code: 'GR', name: 'Green', color: '#00BD45' },
    { code: 'YL', name: 'Yellow', color: '#FFD400' },
    { code: 'SV', name: 'Silver', color: '#9BA5A5' },
  ];

  // Determine per-line status
  const lineStatuses = {};
  lines.forEach((l) => { lineStatuses[l.code] = { status: 'Normal', description: '' }; });

  (incidents || []).forEach((incident) => {
    const affectedLines = parseAffectedLines(incident.LinesAffected);
    affectedLines.forEach((lineCode) => {
      if (lineStatuses[lineCode]) {
        if (incident.IncidentType === 'Delay') {
          lineStatuses[lineCode] = { status: 'Delays', description: incident.Description };
        } else if (lineStatuses[lineCode].status === 'Normal') {
          lineStatuses[lineCode] = { status: 'Advisory', description: incident.Description };
        }
      }
    });
  });

  systemStatusRows.innerHTML = '';
  lines.forEach((line) => {
    const info = lineStatuses[line.code];
    const statusClass =
      info.status === 'Normal'
        ? 'status-ok'
        : info.status === 'Delays'
          ? 'status-alert'
          : 'status-caution';

    const row = document.createElement('div');
    row.className = 'status-row';
    row.innerHTML =
      '<span class="status-line-bar" style="background:' + line.color + '"></span>' +
      '<span class="status-line-name">' + line.name + '</span>' +
      '<span class="status-value ' + statusClass + '">' + info.status + '</span>';

    systemStatusRows.appendChild(row);
  });
}

// ==============================
// Alert Card (station-relevant incidents)
// ==============================
function renderAlerts(incidents, stationCode) {
  const stationLines = getStationLineCodes(stationCode);

  // Filter incidents relevant to this station's lines
  const relevant = (incidents || []).filter((incident) => {
    const affected = parseAffectedLines(incident.LinesAffected);
    return affected.some((lineCode) => stationLines.includes(lineCode));
  });

  if (relevant.length === 0) {
    alertCard.style.display = 'none';
    return;
  }

  alertCard.style.display = '';

  // Show all relevant alerts
  let bodyHtml = '';
  relevant.forEach((incident) => {
    bodyHtml += '<p>' + escapeHtml(incident.Description || '') + '</p>';
  });
  alertBody.innerHTML = bodyHtml;

  // Use the most recent timestamp
  const latest = relevant.reduce((a, b) => {
    const dateA = new Date(a.DateUpdated || 0);
    const dateB = new Date(b.DateUpdated || 0);
    return dateA > dateB ? a : b;
  });

  if (latest.DateUpdated) {
    const date = new Date(latest.DateUpdated);
    alertTimestamp.textContent = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==============================
// Facilities / Elevator & Escalator Status
// ==============================
async function fetchFacilities(stationCode) {
  // For multi-platform stations, fetch both codes
  const codes = [stationCode];
  const partner = multiPlatform[stationCode];
  if (partner) codes.push(partner);

  try {
    const allIncidents = [];

    for (const code of codes) {
      const res = await fetchWithRetry(API_BASE_URL + '/api/elevators/' + code);
      if (!res.ok) throw new Error('Elevators API error');
      const data = await res.json();
      if (data.ElevatorIncidents) {
        allIncidents.push(...data.ElevatorIncidents);
      }
    }

    renderFacilities(allIncidents);
  } catch (err) {
    console.error('Failed to fetch facilities:', err.message);
  }
}

function renderFacilities(incidents) {
  const elevatorOutages = incidents.filter((i) => i.UnitType === 'ELEVATOR');
  const escalatorOutages = incidents.filter((i) => i.UnitType === 'ESCALATOR');

  // Update elevator status
  if (elevatorOutages.length === 0) {
    elevatorStatus.textContent = 'Operational';
    elevatorStatus.className = 'facilities-status facilities-status--ok';
  } else {
    elevatorStatus.textContent = elevatorOutages.length + ' Out';
    elevatorStatus.className = 'facilities-status facilities-status--alert';
  }

  // Update escalator status
  if (escalatorOutages.length === 0) {
    escalatorStatus.textContent = 'Operational';
    escalatorStatus.className = 'facilities-status facilities-status--ok';
  } else {
    escalatorStatus.textContent = escalatorOutages.length + ' Out';
    escalatorStatus.className = 'facilities-status facilities-status--alert';
  }

  // Render outage details
  if (incidents.length === 0) {
    facilitiesDetails.style.display = 'none';
    return;
  }

  facilitiesDetails.style.display = '';
  facilitiesDetails.innerHTML = '';

  incidents.forEach((outage) => {
    const div = document.createElement('div');
    div.className = 'facilities-outage';

    const unitEl = document.createElement('div');
    unitEl.className = 'facilities-outage-unit';
    unitEl.textContent = (outage.UnitType || '') + ' — ' + (outage.UnitName || '');

    const descEl = document.createElement('div');
    descEl.className = 'facilities-outage-desc';
    descEl.textContent =
      (outage.LocationDescription || '') +
      (outage.SymptomDescription ? ' (' + outage.SymptomDescription + ')' : '');

    div.appendChild(unitEl);
    div.appendChild(descEl);
    facilitiesDetails.appendChild(div);
  });
}

// ==============================
// Fare Calculator
// ==============================
function populateFareDestinations() {
  // Get unique station names (exclude duplicates from multi-platform)
  const seen = new Set();
  const opts = [];

  Object.entries(stations).forEach(([code, name]) => {
    // Skip multi-platform partner codes and duplicate S-prefix station codes
    if (['C01', 'F01', 'F03', 'E06', 'S04', 'S09', 'S10', 'S12', 'S13', 'S14'].includes(code)) return;
    if (seen.has(name)) return;
    seen.add(name);
    opts.push({ code, name });
  });

  opts.sort((a, b) => a.name.localeCompare(b.name));

  // Clear existing options (keep the default)
  fareDestination.innerHTML = '<option value="">Select destination...</option>';

  opts.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt.code;
    option.textContent = opt.name;
    fareDestination.appendChild(option);
  });
}

fareDestination.addEventListener('change', async () => {
  const toCode = fareDestination.value;
  if (!toCode) {
    fareResults.style.display = 'none';
    return;
  }

  try {
    const res = await fetchWithRetry(
      API_BASE_URL + '/api/fare/' + selectedStation + '/' + toCode
    );
    if (!res.ok) throw new Error('Fare API error');
    const data = await res.json();

    const info = data.StationToStationInfos && data.StationToStationInfos[0];
    if (!info) {
      fareResults.style.display = 'none';
      return;
    }

    const fare = info.RailFare || {};
    farePeak.textContent = fare.PeakTime != null ? '$' + fare.PeakTime.toFixed(2) : '--';
    fareOffpeak.textContent =
      fare.OffPeakTime != null ? '$' + fare.OffPeakTime.toFixed(2) : '--';
    fareSenior.textContent =
      fare.SeniorDisabled != null ? '$' + fare.SeniorDisabled.toFixed(2) : '--';
    fareTime.textContent =
      info.RailTime != null ? info.RailTime + ' min' : '--';

    fareResults.style.display = '';
  } catch (err) {
    console.error('Fare fetch error:', err.message);
    farePeak.textContent = '--';
    fareOffpeak.textContent = '--';
    fareSenior.textContent = '--';
    fareTime.textContent = 'Unavailable';
    fareResults.style.display = '';
  }
});

// ==============================
// Autocomplete Station Search
// ==============================
function renderDropdown(filteredOptions) {
  stationDropdown.innerHTML = '';
  highlightedIndex = -1;

  if (filteredOptions.length === 0) {
    stationDropdown.classList.remove('open');
    return;
  }

  filteredOptions.forEach((option, i) => {
    const li = document.createElement('li');
    if (option.code === selectedStation) {
      li.classList.add('selected');
    }

    // Line color dots
    const dotsWrapper = document.createElement('span');
    dotsWrapper.className = 'line-dots';
    option.lines.forEach((line) => {
      const dot = document.createElement('span');
      dot.className = 'line-dot';
      dot.style.backgroundColor = line.color;
      dotsWrapper.appendChild(dot);
    });

    li.appendChild(dotsWrapper);
    li.appendChild(document.createTextNode(option.name));
    li.dataset.code = option.code;
    li.dataset.name = option.name;
    li.dataset.index = i;

    li.addEventListener('click', () => selectStation(option));
    stationDropdown.appendChild(li);
  });

  stationDropdown.classList.add('open');
}

function filterStations(query) {
  const q = query.toLowerCase().trim();
  if (!q) return stationOptions;
  return stationOptions.filter((s) => s.name.toLowerCase().includes(q));
}

function selectStation(option) {
  selectedStation = option.code;
  stationInput.value = '';
  stationDropdown.classList.remove('open');
  highlightedIndex = -1;
  updateHeroDisplay(selectedStation);
  fetchTrains(selectedStation);
  fetchFacilities(selectedStation);
  renderAlerts(currentIncidents, selectedStation);
  startPolling();

  // Reset fare calculator
  fareDestination.value = '';
  fareResults.style.display = 'none';
  populateFareDestinations();
}

function updateHighlight(items) {
  items.forEach((item, i) => {
    item.classList.toggle('highlighted', i === highlightedIndex);
  });
  if (highlightedIndex >= 0 && items[highlightedIndex]) {
    items[highlightedIndex].scrollIntoView({ block: 'nearest' });
  }
}

stationInput.addEventListener('input', () => {
  const filtered = filterStations(stationInput.value);
  renderDropdown(filtered);
});

stationInput.addEventListener('focus', () => {
  stationInput.select();
  const filtered = filterStations(stationInput.value);
  renderDropdown(filtered);
});

stationInput.addEventListener('keydown', (e) => {
  const items = stationDropdown.querySelectorAll('li');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
    updateHighlight(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    highlightedIndex = Math.max(highlightedIndex - 1, 0);
    updateHighlight(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (highlightedIndex >= 0 && items[highlightedIndex]) {
      const code = items[highlightedIndex].dataset.code;
      const option = stationOptions.find((s) => s.code === code);
      if (option) selectStation(option);
    }
  } else if (e.key === 'Escape') {
    stationDropdown.classList.remove('open');
    stationInput.blur();
  }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('#station-search-wrapper')) {
    stationDropdown.classList.remove('open');
  }
});

// ==============================
// PIDS Skeleton Loading
// ==============================
function renderPidsSkeletons() {
  pidsContent.innerHTML = '';

  // Column headers
  const colHeaders = document.createElement('div');
  colHeaders.className = 'pids-col-headers';
  colHeaders.innerHTML =
    '<span>LN</span><span>CAR</span><span>DEST</span><span style="text-align:right">MIN</span>';
  pidsContent.appendChild(colHeaders);

  for (let i = 0; i < 4; i++) {
    const row = document.createElement('div');
    row.className = 'pids-skeleton-row';
    row.innerHTML =
      '<div class="pids-skeleton-block sk-line"></div>' +
      '<div class="pids-skeleton-block sk-cars"></div>' +
      '<div class="pids-skeleton-block sk-dest"></div>' +
      '<div class="pids-skeleton-block sk-min"></div>';
    pidsContent.appendChild(row);
  }
}

// ==============================
// PIDS Empty State
// ==============================
function renderPidsEmpty() {
  pidsContent.innerHTML =
    '<div class="pids-empty">' +
    '<span>No trains scheduled</span>' +
    '</div>';
}

// ==============================
// PIDS Train Row Rendering
// ==============================
function createPidsRow(train) {
  const { line, destination, arrival, cars } = train;
  const pidsColor = pidsLineColors[line] || '#bcc4c7';
  const arrivalStr = (arrival || '').toString().toUpperCase();
  const isStatus = ['ARR', 'BRD', 'DLY'].includes(arrivalStr);

  const row = document.createElement('div');
  row.className = 'pids-row';

  // Line code
  const lineEl = document.createElement('span');
  lineEl.className = 'pids-row-line';
  lineEl.style.color = pidsColor;
  lineEl.textContent = line;

  // Car count
  const carsEl = document.createElement('span');
  carsEl.className = 'pids-row-cars';
  carsEl.textContent = cars || '\u2014';

  // Destination
  const destEl = document.createElement('span');
  destEl.className = 'pids-row-dest';
  destEl.textContent = destination;

  // Minutes / Status
  const minEl = document.createElement('span');
  minEl.className = 'pids-row-min';

  if (isStatus) {
    minEl.textContent = arrivalStr;
    if (arrivalStr === 'BRD') minEl.classList.add('brd');
    if (arrivalStr === 'ARR') minEl.classList.add('arr');
  } else {
    minEl.textContent = arrival;
  }

  row.appendChild(lineEl);
  row.appendChild(carsEl);
  row.appendChild(destEl);
  row.appendChild(minEl);

  return row;
}

// ==============================
// Sort helper for Min field
// ==============================
function sortByMin(a, b) {
  const order = { BRD: 0, ARR: 1 };
  const aVal = order[a.arrival.toString().toUpperCase()] !== undefined
    ? order[a.arrival.toString().toUpperCase()]
    : (parseInt(a.arrival, 10) || 999) + 10;
  const bVal = order[b.arrival.toString().toUpperCase()] !== undefined
    ? order[b.arrival.toString().toUpperCase()]
    : (parseInt(b.arrival, 10) || 999) + 10;
  return aVal - bVal;
}

// ==============================
// Last Updated Timestamp
// ==============================
function updateTimestamp() {
  if (!lastUpdatedTime) return;
  const timeStr = lastUpdatedTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
  updatedTimeEl.textContent = 'Updated ' + timeStr;
  lastUpdatedEl.style.display = 'flex';
}

// ==============================
// Fetch Train Predictions (with directional grouping)
// ==============================
async function fetchTrains(stationCode) {
  if (!stationCode || !pidsContent) {
    if (pidsContent) pidsContent.innerHTML = '';
    lastUpdatedEl.style.display = 'none';
    return;
  }

  // Show skeletons only on first load
  if (!pidsContent.querySelector('.pids-row')) {
    renderPidsSkeletons();
  }

  try {
    const codes = getPredictionCodes(stationCode);
    const res = await fetchWithRetry(API_BASE_URL + '/api/predictions/' + codes);
    if (!res.ok) throw new Error('API error');

    const data = await res.json();
    lastUpdatedTime = new Date();

    // Filter out entries with no real data (Line = "No" or "--" or empty)
    const validTrains = data.filter(
      (t) => t.line && t.line !== 'No' && t.line !== '--' && t.destination
    );

    if (validTrains.length === 0) {
      renderPidsEmpty();
      updateTimestamp();
      return;
    }

    // Flat list sorted by arrival time (like real WMATA PIDS boards)
    const allTrains = validTrains.sort(sortByMin);

    pidsContent.innerHTML = '';

    // Column headers
    const colHeaders = document.createElement('div');
    colHeaders.className = 'pids-col-headers';
    colHeaders.innerHTML =
      '<span>LN</span><span>CAR</span><span>DEST</span><span style="text-align:right">MIN</span>';
    pidsContent.appendChild(colHeaders);

    // Train rows
    allTrains.forEach((train) => {
      pidsContent.appendChild(createPidsRow(train));
    });

    updateTimestamp();
  } catch (err) {
    pidsContent.innerHTML =
      '<div class="pids-empty">' +
      '<span>Error: ' +
      escapeHtml(err.message || 'Fetch failed') +
      '</span>' +
      '</div>';
  }
}

// ==============================
// Transfer Station: Dual PIDS Board Rendering
// ==============================
function renderPlatformSkeletons(contentEl) {
  contentEl.innerHTML = '';
  var colHeaders = document.createElement('div');
  colHeaders.className = 'pids-col-headers';
  colHeaders.innerHTML =
    '<span>LN</span><span>CAR</span><span>DEST</span><span style="text-align:right">MIN</span>';
  contentEl.appendChild(colHeaders);
  for (var i = 0; i < 3; i++) {
    var row = document.createElement('div');
    row.className = 'pids-skeleton-row';
    row.innerHTML =
      '<div class="pids-skeleton-block sk-line"></div>' +
      '<div class="pids-skeleton-block sk-cars"></div>' +
      '<div class="pids-skeleton-block sk-dest"></div>' +
      '<div class="pids-skeleton-block sk-min"></div>';
    contentEl.appendChild(row);
  }
}

function renderPlatformPids(contentEl, trains) {
  contentEl.innerHTML = '';

  // Column headers
  var colHeaders = document.createElement('div');
  colHeaders.className = 'pids-col-headers';
  colHeaders.innerHTML =
    '<span>LN</span><span>CAR</span><span>DEST</span><span style="text-align:right">MIN</span>';
  contentEl.appendChild(colHeaders);

  if (trains.length === 0) {
    var empty = document.createElement('div');
    empty.className = 'pids-empty';
    empty.innerHTML = '<span>No trains scheduled</span>';
    contentEl.appendChild(empty);
    return;
  }

  // Show max 3 rows per platform board
  trains.slice(0, 3).forEach(function (train) {
    contentEl.appendChild(createPidsRow(train));
  });
}

async function fetchTransferTrains() {
  if (typeof TRANSFER_PLATFORMS === 'undefined') return;

  var platforms = TRANSFER_PLATFORMS;

  // Show skeletons on first load for each platform
  platforms.forEach(function (platform) {
    var el = document.getElementById(platform.contentEl);
    if (el && !el.querySelector('.pids-row')) {
      renderPlatformSkeletons(el);
    }
  });

  try {
    // Make separate API calls for each platform (never merge)
    var fetches = platforms.map(function (platform) {
      var code = platform.wmataCodes[0];
      return fetchWithRetry(API_BASE_URL + '/api/predictions/' + code)
        .then(function (res) {
          if (!res.ok) throw new Error('API error');
          return res.json();
        });
    });

    var results = await Promise.all(fetches);
    lastUpdatedTime = new Date();

    results.forEach(function (data, i) {
      var platform = platforms[i];
      var el = document.getElementById(platform.contentEl);
      if (!el) return;

      var validTrains = data.filter(function (t) {
        return t.line && t.line !== 'No' && t.line !== '--' && t.destination;
      }).sort(sortByMin);

      renderPlatformPids(el, validTrains);
    });

    updateTimestamp();
  } catch (err) {
    platforms.forEach(function (platform) {
      var el = document.getElementById(platform.contentEl);
      if (el) {
        el.innerHTML =
          '<div class="pids-empty">' +
          '<span>Error: ' + escapeHtml(err.message || 'Fetch failed') + '</span>' +
          '</div>';
      }
    });
  }
}

// ==============================
// Polling Management
// ==============================
function startPolling() {
  stopPolling();

  // Predictions: every 25 seconds
  var isTransfer = (typeof IS_TRANSFER_STATION !== 'undefined') && IS_TRANSFER_STATION;
  predictionsInterval = setInterval(() => {
    if (isTransfer) {
      fetchTransferTrains();
    } else if (selectedStation) {
      fetchTrains(selectedStation);
    }
  }, 25000);

  // Incidents: every 60 seconds
  incidentsInterval = setInterval(() => {
    fetchIncidents();
  }, 60000);

  // Facilities: every 120 seconds
  facilitiesInterval = setInterval(() => {
    if (selectedStation) fetchFacilities(selectedStation);
  }, 120000);
}

function stopPolling() {
  if (predictionsInterval) clearInterval(predictionsInterval);
  if (incidentsInterval) clearInterval(incidentsInterval);
  if (facilitiesInterval) clearInterval(facilitiesInterval);
  predictionsInterval = null;
  incidentsInterval = null;
  facilitiesInterval = null;
}

// ==============================
// System Status Time
// ==============================
function updateSystemStatusTime() {
  const el = document.getElementById('system-status-time');
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}

// ==============================
// Event Listeners & Init
// ==============================
refreshBtn.addEventListener('click', () => {
  if (selectedStation) {
    var isTransfer = (typeof IS_TRANSFER_STATION !== 'undefined') && IS_TRANSFER_STATION;
    if (isTransfer) {
      fetchTransferTrains();
    } else {
      fetchTrains(selectedStation);
    }
    fetchIncidents();
    fetchFacilities(selectedStation);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  // Init hero display
  updateHeroDisplay(selectedStation);

  // Search input starts empty — placeholder shows "Search stations..."

  // Populate fare calculator destinations
  populateFareDestinations();

  // Update system status time
  updateSystemStatusTime();
  setInterval(updateSystemStatusTime, 60000);

  // Render system status immediately (all lines Normal) before API returns
  renderSystemStatus([]);

  // Wake up Render backend (free tier sleeps after 15 min of inactivity)
  try {
    await fetchWithRetry(API_BASE_URL + '/healthz', 3, 2000);
  } catch (e) {
    // Backend may be down — fetches below will handle gracefully
  }

  // Initial data fetches
  var isTransfer = (typeof IS_TRANSFER_STATION !== 'undefined') && IS_TRANSFER_STATION;
  if (isTransfer) {
    fetchTransferTrains();
  } else {
    fetchTrains(selectedStation);
  }
  fetchIncidents();
  fetchFacilities(selectedStation);

  // Start polling
  startPolling();
});
