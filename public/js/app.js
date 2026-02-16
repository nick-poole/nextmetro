// ==============================
// NextMetro — Static JS
// ==============================

const API_BASE_URL = 'https://nextmetro.onrender.com';

// ---- Station Data ----
const stations = {
  A01: 'Metro Center (RD)',
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
  C01: 'Metro Center (BL,OR,SV)',
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
  D03: "L'Enfant Plaza (OR,BL,SV)",
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
  F03: "L'Enfant Plaza (GR,YL)",
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
  K08: 'Vienna/Farfax-GMU',
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
const lineColors = {
  RD: '#d32f2f',
  BL: '#1976d2',
  YL: '#fbc02d',
  OR: '#ff9800',
  GR: '#388e3c',
  SV: '#9ca7a4',
};

// Station code prefix → line colors
const prefixLineColors = {
  A: ['#d32f2f'],
  B: ['#d32f2f'],
  C: ['#1976d2', '#ff9800', '#9ca7a4'],
  D: ['#1976d2', '#ff9800', '#9ca7a4'],
  E: ['#388e3c', '#fbc02d'],
  F: ['#388e3c', '#fbc02d'],
  G: ['#1976d2', '#9ca7a4'],
  J: ['#1976d2', '#fbc02d'],
  K: ['#ff9800', '#9ca7a4'],
  N: ['#9ca7a4'],
  S: ['#1976d2', '#fbc02d'],
};

// ---- Hero Banner Images ----
const heroImages = [
  'images/chris-grafton.jpg',
  'images/yuvraj-singh.jpg',
  'images/tatiana-rodriguez.jpg',
  'images/sara-cottle.jpg',
  'images/rosie-kerr-greenbelt.jpg',
  'images/julian-lozano.jpg',
  'images/matthew-bornhorst.jpg',
  'images/andrew-wagner.jpg',
  'images/sam-jotham-sutharson.jpg',
  'images/maria-oswalt.jpg',
  'images/maria-oswalt-2.jpg',
  'images/island-cinematics.jpg',
  'images/island-cinematics-2.jpg',
  'images/eleven-photographs.jpg',
  'images/eleven-photographs-2.jpg',
];

// ---- State ----
let currentImageIndex = Math.floor(Math.random() * heroImages.length);
let selectedStation = 'B05';
let refreshInterval = null;
let lastUpdatedTime = null;
let highlightedIndex = -1;

// ---- DOM Elements ----
const heroBanner = document.getElementById('hero-banner');
const stationInput = document.getElementById('station-input');
const stationDropdown = document.getElementById('station-dropdown');
const trainFeed = document.getElementById('train-feed');
const lastUpdatedEl = document.getElementById('last-updated');
const updatedTimeEl = document.getElementById('updated-time');
const refreshBtn = document.getElementById('refresh-btn');

// Build station options array
const stationOptions = Object.entries(stations).map(([code, name]) => ({
  code,
  name,
  colors: prefixLineColors[code.charAt(0)] || ['#555'],
}));

// ==============================
// Hero Banner with Crossfade
// ==============================
function updateHeroImage() {
  heroBanner.style.backgroundImage = `url('${heroImages[currentImageIndex]}')`;
}

function rotateHeroImage() {
  heroBanner.classList.add('fade-out');
  setTimeout(() => {
    currentImageIndex = (currentImageIndex + 1) % heroImages.length;
    updateHeroImage();
    heroBanner.classList.remove('fade-out');
  }, 600);
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
    option.colors.forEach((color) => {
      const dot = document.createElement('span');
      dot.className = 'line-dot';
      dot.style.backgroundColor = color;
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
      const name = items[highlightedIndex].dataset.name;
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
// Skeleton Loading Cards
// ==============================
function renderSkeletons() {
  trainFeed.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    card.innerHTML = `
      <div class="skeleton-strip"></div>
      <div class="skeleton-content">
        <div class="skeleton-top">
          <div class="skeleton-left">
            <div class="skeleton-block skeleton-badge"></div>
            <div class="skeleton-block skeleton-text-lg"></div>
          </div>
          <div class="skeleton-block skeleton-text-sm"></div>
        </div>
        <div class="skeleton-block skeleton-text-xs"></div>
      </div>
      <div class="skeleton-strip"></div>
    `;
    trainFeed.appendChild(card);
  }
}

// ==============================
// Empty State
// ==============================
function renderEmptyState() {
  trainFeed.innerHTML = `
    <div class="empty-state">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm2 0V6h5v5h-5zm3.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
      </svg>
      <div class="empty-state-title">No trains scheduled</div>
      <div class="empty-state-subtitle">There are no trains arriving at this station right now.</div>
    </div>
  `;
}

// ==============================
// Train Card Rendering
// ==============================
function createTrainCard(train) {
  const { line, destination, arrival, cars } = train;
  const lineColor = lineColors[line] || '#555';
  const isStatus = ['ARR', 'BRD', 'DLY'].includes((arrival || '').toUpperCase());

  const card = document.createElement('div');
  card.className = 'train-card';

  const leftStrip = document.createElement('div');
  leftStrip.className = 'line-strip';
  leftStrip.style.backgroundColor = lineColor;

  const content = document.createElement('div');
  content.className = 'card-content';

  const topRow = document.createElement('div');
  topRow.className = 'card-top';

  const leftSection = document.createElement('div');
  leftSection.className = 'card-left';

  const badge = document.createElement('span');
  badge.className = 'line-badge';
  badge.style.backgroundColor = lineColor;
  badge.textContent = line;

  const dest = document.createElement('span');
  dest.className = 'destination';
  dest.textContent = destination;

  leftSection.appendChild(badge);
  leftSection.appendChild(dest);

  let arrivalEl;
  if (isStatus) {
    arrivalEl = document.createElement('span');
    arrivalEl.className = 'arrival-status';
    if (arrival.toUpperCase() === 'ARR' || arrival.toUpperCase() === 'BRD') {
      arrivalEl.classList.add('flash');
    }
    arrivalEl.textContent = arrival.toUpperCase();
  } else {
    arrivalEl = document.createElement('span');
    arrivalEl.className = 'arrival-time';
    arrivalEl.textContent = arrival + ' min' + (arrival === '1' ? '' : 's');
  }

  topRow.appendChild(leftSection);
  topRow.appendChild(arrivalEl);

  const carCount = document.createElement('div');
  carCount.className = 'car-count';
  carCount.textContent = 'Cars: ' + (cars || '\u2014');

  content.appendChild(topRow);
  content.appendChild(carCount);

  const rightStrip = document.createElement('div');
  rightStrip.className = 'line-strip';
  rightStrip.style.backgroundColor = lineColor;

  card.appendChild(leftStrip);
  card.appendChild(content);
  card.appendChild(rightStrip);

  return card;
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
    trainFeed.innerHTML = '';
    lastUpdatedEl.style.display = 'none';
    return;
  }

  // Show skeletons only on first load (no existing cards)
  if (!trainFeed.querySelector('.train-card')) {
    renderSkeletons();
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/predictions/${stationCode}`);
    if (!res.ok) throw new Error('API error');

    const data = await res.json();
    lastUpdatedTime = new Date();

    if (data.length === 0) {
      renderEmptyState();
      updateTimestamp();
      return;
    }

    trainFeed.innerHTML = '';
    data.forEach((train) => {
      trainFeed.appendChild(createTrainCard(train));
    });
    updateTimestamp();
  } catch (err) {
    trainFeed.innerHTML = `<p class="error-text">Error: ${err.message || 'Fetch failed'}</p>`;
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
// Event Listeners & Init
// ==============================
refreshBtn.addEventListener('click', () => {
  if (selectedStation) fetchTrains(selectedStation);
});

document.addEventListener('DOMContentLoaded', () => {
  // Hero banner
  updateHeroImage();
  setInterval(rotateHeroImage, 10000);

  // Set default station in input
  const defaultStation = stationOptions.find((s) => s.code === selectedStation);
  if (defaultStation) {
    stationInput.value = defaultStation.name;
  }

  // Initial train fetch
  fetchTrains(selectedStation);
  startAutoRefresh();
});
