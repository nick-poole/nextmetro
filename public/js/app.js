// ==============================
// NextMetro — Brand v7 JS
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

// ---- Metro Line Colors ----
// Standard (on light/brown backgrounds)
const lineColors = {
  RD: '#bf0d3e',
  BL: '#009cde',
  YL: '#ffd100',
  OR: '#ed8b00',
  GR: '#00b140',
  SV: '#a2aaad',
};

// PIDS variants (brightened for black background)
const pidsLineColors = {
  RD: '#e33162',
  BL: '#39b4ea',
  YL: '#ffd100',
  OR: '#ed8b00',
  GR: '#40d870',
  SV: '#bcc4c7',
};

// Line full names
const lineNames = {
  RD: 'Red',
  BL: 'Blue',
  YL: 'Yellow',
  OR: 'Orange',
  GR: 'Green',
  SV: 'Silver',
};

// Station code prefix → line info
const prefixLines = {
  A: [{ code: 'RD', name: 'Red', color: '#bf0d3e' }],
  B: [{ code: 'RD', name: 'Red', color: '#bf0d3e' }],
  C: [
    { code: 'BL', name: 'Blue', color: '#009cde' },
    { code: 'OR', name: 'Orange', color: '#ed8b00' },
    { code: 'SV', name: 'Silver', color: '#a2aaad' },
  ],
  D: [
    { code: 'BL', name: 'Blue', color: '#009cde' },
    { code: 'OR', name: 'Orange', color: '#ed8b00' },
    { code: 'SV', name: 'Silver', color: '#a2aaad' },
  ],
  E: [
    { code: 'GR', name: 'Green', color: '#00b140' },
    { code: 'YL', name: 'Yellow', color: '#ffd100' },
  ],
  F: [
    { code: 'GR', name: 'Green', color: '#00b140' },
    { code: 'YL', name: 'Yellow', color: '#ffd100' },
  ],
  G: [
    { code: 'BL', name: 'Blue', color: '#009cde' },
    { code: 'SV', name: 'Silver', color: '#a2aaad' },
  ],
  J: [
    { code: 'BL', name: 'Blue', color: '#009cde' },
    { code: 'YL', name: 'Yellow', color: '#ffd100' },
  ],
  K: [
    { code: 'OR', name: 'Orange', color: '#ed8b00' },
    { code: 'SV', name: 'Silver', color: '#a2aaad' },
  ],
  N: [{ code: 'SV', name: 'Silver', color: '#a2aaad' }],
  S: [
    { code: 'BL', name: 'Blue', color: '#009cde' },
    { code: 'YL', name: 'Yellow', color: '#ffd100' },
  ],
};

// ---- State ----
let selectedStation = 'B05';
let refreshInterval = null;
let lastUpdatedTime = null;
let highlightedIndex = -1;

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

// Build station options array
const stationOptions = Object.entries(stations).map(([code, name]) => ({
  code,
  name,
  lines: prefixLines[code.charAt(0)] || [],
}));

// ==============================
// Hero Station Display
// ==============================
function updateHeroDisplay(stationCode) {
  const name = stations[stationCode] || 'Unknown Station';
  const lines = prefixLines[stationCode.charAt(0)] || [];

  heroStationName.textContent = name;
  heroLineSubtitle.textContent = lines.map((l) => l.name + ' Line').join(', ');

  // Update line pills
  linePillsEl.innerHTML = '';
  lines.forEach((line) => {
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
  const primaryColor = lines.length > 0 ? lines[0].color : '#555';
  pidsHeaderDot.style.backgroundColor = primaryColor;
}

// ==============================
// System Ticker
// ==============================
function initTicker() {
  const lineData = [
    { code: 'RD', name: 'Red', color: '#bf0d3e', status: 'Normal' },
    { code: 'OR', name: 'Orange', color: '#ed8b00', status: 'Normal' },
    { code: 'BL', name: 'Blue', color: '#009cde', status: 'Normal' },
    { code: 'GR', name: 'Green', color: '#00b140', status: 'Normal' },
    { code: 'YL', name: 'Yellow', color: '#ffd100', status: 'Normal' },
    { code: 'SV', name: 'Silver', color: '#a2aaad', status: 'Normal' },
  ];

  // Build ticker content (duplicated for seamless loop)
  let html = '';
  for (let i = 0; i < 2; i++) {
    lineData.forEach((line) => {
      const statusClass =
        line.status === 'Normal'
          ? 'ticker-status-ok'
          : line.status === 'Alert'
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
        line.status +
        '</span>' +
        '</span>';
    });
  }

  tickerTrack.innerHTML = html;
}

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
  startAutoRefresh();
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
  const isStatus = ['ARR', 'BRD', 'DLY'].includes(
    (arrival || '').toUpperCase()
  );

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
    const status = arrival.toUpperCase();
    minEl.textContent = status;
    if (status === 'BRD') minEl.classList.add('brd');
    if (status === 'ARR') minEl.classList.add('arr');
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
// Fetch Train Predictions
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
    const res = await fetch(`${API_BASE_URL}/api/predictions/${stationCode}`);
    if (!res.ok) throw new Error('API error');

    const data = await res.json();
    lastUpdatedTime = new Date();

    if (data.length === 0) {
      renderPidsEmpty();
      updateTimestamp();
      return;
    }

    // Group trains by direction (destination)
    // For simplicity, render as single direction group
    pidsContent.innerHTML = '';

    // Direction header
    const dirHeader = document.createElement('div');
    dirHeader.className = 'pids-direction';
    const dirLabel = document.createElement('span');
    dirLabel.className = 'pids-direction-label';
    dirLabel.textContent = 'Arrivals';
    dirHeader.appendChild(dirLabel);
    pidsContent.appendChild(dirHeader);

    // Column headers
    const colHeaders = document.createElement('div');
    colHeaders.className = 'pids-col-headers';
    colHeaders.innerHTML =
      '<span>LN</span><span>CAR</span><span>DEST</span><span style="text-align:right">MIN</span>';
    pidsContent.appendChild(colHeaders);

    // Train rows
    data.forEach((train) => {
      pidsContent.appendChild(createPidsRow(train));
    });

    updateTimestamp();
  } catch (err) {
    pidsContent.innerHTML =
      '<div class="pids-empty">' +
      '<span>Error: ' +
      (err.message || 'Fetch failed') +
      '</span>' +
      '</div>';
  }
}

// ==============================
// Auto-Refresh
// ==============================
function startAutoRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    if (selectedStation) {
      fetchTrains(selectedStation);
    }
  }, 30000);
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
  if (selectedStation) fetchTrains(selectedStation);
});

document.addEventListener('DOMContentLoaded', () => {
  // Init hero display
  updateHeroDisplay(selectedStation);

  // Set default station in input
  const defaultStation = stationOptions.find((s) => s.code === selectedStation);
  if (defaultStation) {
    stationInput.value = defaultStation.name;
  }

  // Init ticker
  initTicker();

  // Update system status time
  updateSystemStatusTime();
  setInterval(updateSystemStatusTime, 60000);

  // Initial train fetch
  fetchTrains(selectedStation);
  startAutoRefresh();
});
