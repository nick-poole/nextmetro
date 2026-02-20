// ==============================
// NextMetro — Brand v1.0 JS
// Typography: Rajdhani | Theme: Neutral Brutalist
// ==============================

const API_BASE_URL = 'https://nextmetro.onrender.com';

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
  RD: '#BF0D3E',
  BL: '#009CDE',
  YL: '#FFD100',
  OR: '#ED8B00',
  GR: '#00B140',
  SV: '#A2AAAD',
};

const pidsLineColors = {
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

// Station code prefix -> line info
const prefixLines = {
  A: [{ code: 'RD', name: 'Red', color: '#BF0D3E' }],
  B: [{ code: 'RD', name: 'Red', color: '#BF0D3E' }],
  C: [
    { code: 'BL', name: 'Blue', color: '#009CDE' },
    { code: 'OR', name: 'Orange', color: '#ED8B00' },
    { code: 'SV', name: 'Silver', color: '#A2AAAD' },
  ],
  D: [
    { code: 'BL', name: 'Blue', color: '#009CDE' },
    { code: 'OR', name: 'Orange', color: '#ED8B00' },
    { code: 'SV', name: 'Silver', color: '#A2AAAD' },
  ],
  E: [
    { code: 'GR', name: 'Green', color: '#00B140' },
    { code: 'YL', name: 'Yellow', color: '#FFD100' },
  ],
  F: [
    { code: 'GR', name: 'Green', color: '#00B140' },
    { code: 'YL', name: 'Yellow', color: '#FFD100' },
  ],
  G: [
    { code: 'BL', name: 'Blue', color: '#009CDE' },
    { code: 'SV', name: 'Silver', color: '#A2AAAD' },
  ],
  J: [
    { code: 'BL', name: 'Blue', color: '#009CDE' },
    { code: 'YL', name: 'Yellow', color: '#FFD100' },
  ],
  K: [
    { code: 'OR', name: 'Orange', color: '#ED8B00' },
    { code: 'SV', name: 'Silver', color: '#A2AAAD' },
  ],
  N: [{ code: 'SV', name: 'Silver', color: '#A2AAAD' }],
  S: [
    { code: 'BL', name: 'Blue', color: '#009CDE' },
    { code: 'YL', name: 'Yellow', color: '#FFD100' },
  ],
};

// ---- State ----
let selectedStation = 'B05';
let predictionsInterval = null;
let incidentsInterval = null;
let facilitiesInterval = null;
let lastUpdatedTime = null;
let highlightedIndex = -1;
let currentIncidents = []; // cached incidents for ticker + sidebar + alerts

// ---- DOM Elements ----
const heroStationName = document.getElementById('hero-station-name');
const heroLineSubtitle = document.getElementById('hero-line-subtitle');
const linePillsEl = document.getElementById('line-pills');
const stationInput = document.getElementById('station-input');
const stationDropdown = document.getElementById('station-dropdown');
const pidsContent = document.getElementById('pids-content');
const pidsHeaderStation = document.getElementById('pids-header-station');
const pidsHeaderDot = document.getElementById('pids-header-dot');
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
  heroLineSubtitle.textContent = allLines.map((l) => l.name + ' Line').join(', ');

  // Update line pills
  linePillsEl.innerHTML = '';
  allLines.forEach((line) => {
    const pill = document.createElement('span');
    pill.className = 'line-pill';
    pill.innerHTML =
      '<span class="line-pill-dot" style="background-color:' +
      line.color +
      '"></span>' +
      line.name;
    linePillsEl.appendChild(pill);
  });

  // Update PIDS header
  pidsHeaderStation.textContent = name;
  const primaryColor = allLines.length > 0 ? allLines[0].color : '#555';
  pidsHeaderDot.style.backgroundColor = primaryColor;

  // Update fare calculator "from" display
  fareFromName.textContent = name;
}

// ==============================
// System Ticker (driven by live incidents)
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

  // Build ticker content (duplicated for seamless loop)
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
        '<span class="ticker-dot" style="background-color:' +
        line.color +
        '"></span>' +
        '<span>' +
        line.name +
        '</span>' +
        '<span class="' +
        statusClass +
        '">' +
        thisStatus +
        '</span>' +
        '</span>';
    });
  }

  tickerTrack.innerHTML = html;
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
    const res = await fetch(API_BASE_URL + '/api/incidents');
    if (!res.ok) throw new Error('Incidents API error');
    const data = await res.json();
    currentIncidents = data.Incidents || [];

    renderSystemStatus(currentIncidents);
    renderTicker(currentIncidents);
    renderAlerts(currentIncidents, selectedStation);
  } catch (err) {
    console.error('Failed to fetch incidents:', err.message);
  }
}

// ==============================
// System Status Sidebar (live from incidents)
// ==============================
function renderSystemStatus(incidents) {
  const lines = [
    { code: 'RD', name: 'Red', color: '#BF0D3E' },
    { code: 'OR', name: 'Orange', color: '#ED8B00' },
    { code: 'BL', name: 'Blue', color: '#009CDE' },
    { code: 'GR', name: 'Green', color: '#00B140' },
    { code: 'YL', name: 'Yellow', color: '#FFD100' },
    { code: 'SV', name: 'Silver', color: '#A2AAAD' },
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
      const res = await fetch(API_BASE_URL + '/api/elevators/' + code);
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
    // Skip the partner codes (C01, F01, F03, E06) to avoid duplicates
    if (['C01', 'F01', 'F03', 'E06'].includes(code)) return;
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
    const res = await fetch(
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
    fareResults.style.display = 'none';
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
  stationInput.value = option.name;
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

  // Direction header skeleton
  const dirHeader = document.createElement('div');
  dirHeader.className = 'pids-direction';
  dirHeader.innerHTML =
    '<span class="pids-direction-label" style="opacity:0.3">Loading...</span>';
  pidsContent.appendChild(dirHeader);

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
  if (!stationCode) {
    pidsContent.innerHTML = '';
    lastUpdatedEl.style.display = 'none';
    return;
  }

  // Show skeletons only on first load
  if (!pidsContent.querySelector('.pids-row')) {
    renderPidsSkeletons();
  }

  try {
    const codes = getPredictionCodes(stationCode);
    const res = await fetch(API_BASE_URL + '/api/predictions/' + codes);
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

    // Group by direction (Group field: "1" or "2")
    let group1 = validTrains.filter((t) => t.group === '1').sort(sortByMin);
    let group2 = validTrains.filter((t) => t.group === '2').sort(sortByMin);
    const ungrouped = validTrains
      .filter((t) => t.group !== '1' && t.group !== '2')
      .sort(sortByMin);

    // If all trains are ungrouped, split by destination terminal
    if (group1.length === 0 && group2.length === 0 && ungrouped.length > 0) {
      const destinations = [...new Set(ungrouped.map((t) => t.destination))];
      if (destinations.length >= 2) {
        const firstDest = destinations[0];
        group1 = ungrouped.filter((t) => t.destination === firstDest).sort(sortByMin);
        group2 = ungrouped.filter((t) => t.destination !== firstDest).sort(sortByMin);
      } else {
        // All same destination, put in group1
        group1 = ungrouped.slice().sort(sortByMin);
      }
    } else if (ungrouped.length > 0) {
      // Merge any ungrouped trains into the closest matching group
      ungrouped.forEach((t) => {
        group1.push(t);
      });
      group1.sort(sortByMin);
    }

    pidsContent.innerHTML = '';

    // Render a direction group
    const renderGroup = (trains, labelFallback) => {
      if (trains.length === 0) return;

      // Find the terminal destination (the one farthest out / most common)
      const destCounts = {};
      trains.forEach((t) => {
        destCounts[t.destination] = (destCounts[t.destination] || 0) + 1;
      });
      const primaryDest = Object.keys(destCounts).sort(
        (a, b) => destCounts[b] - destCounts[a]
      )[0];
      const label = primaryDest ? primaryDest : labelFallback;

      // Direction header
      const dirHeader = document.createElement('div');
      dirHeader.className = 'pids-direction';
      const dirLabel = document.createElement('span');
      dirLabel.className = 'pids-direction-label';
      dirLabel.textContent = label;
      dirHeader.appendChild(dirLabel);
      pidsContent.appendChild(dirHeader);

      // Column headers
      const colHeaders = document.createElement('div');
      colHeaders.className = 'pids-col-headers';
      colHeaders.innerHTML =
        '<span>LN</span><span>CAR</span><span>DEST</span><span style="text-align:right">MIN</span>';
      pidsContent.appendChild(colHeaders);

      // Train rows
      trains.forEach((train) => {
        pidsContent.appendChild(createPidsRow(train));
      });
    };

    // Render group 1, divider, group 2
    if (group1.length > 0) {
      renderGroup(group1, 'Direction 1');
    }

    if (group1.length > 0 && group2.length > 0) {
      const divider = document.createElement('div');
      divider.className = 'pids-group-divider';
      pidsContent.appendChild(divider);
    }

    if (group2.length > 0) {
      renderGroup(group2, 'Direction 2');
    }

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
// Polling Management
// ==============================
function startPolling() {
  stopPolling();

  // Predictions: every 25 seconds
  predictionsInterval = setInterval(() => {
    if (selectedStation) fetchTrains(selectedStation);
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
    fetchTrains(selectedStation);
    fetchIncidents();
    fetchFacilities(selectedStation);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Init hero display
  updateHeroDisplay(selectedStation);

  // Set default station in input
  const defaultStation = stationOptions.find((s) => s.code === selectedStation);
  if (defaultStation) {
    stationInput.value = defaultStation.name;
  }

  // Populate fare calculator destinations
  populateFareDestinations();

  // Update system status time
  updateSystemStatusTime();
  setInterval(updateSystemStatusTime, 60000);

  // Initial data fetches
  fetchTrains(selectedStation);
  fetchIncidents();
  fetchFacilities(selectedStation);

  // Start polling
  startPolling();
});
