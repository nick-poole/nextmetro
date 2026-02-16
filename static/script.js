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

// ---- DOM Elements ----
const heroBanner = document.getElementById('hero-banner');
const stationSelect = document.getElementById('station-select');
const trainFeed = document.getElementById('train-feed');

// ==============================
// Hero Banner Rotation
// ==============================
function updateHeroImage() {
  heroBanner.style.backgroundImage = `url('${heroImages[currentImageIndex]}')`;
}

function rotateHeroImage() {
  currentImageIndex = (currentImageIndex + 1) % heroImages.length;
  updateHeroImage();
}

// ==============================
// Station Dropdown
// ==============================
function populateStationSelect() {
  Object.entries(stations).forEach(([code, name]) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = name;
    if (code === selectedStation) {
      option.selected = true;
    }
    stationSelect.appendChild(option);
  });
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

  // Left line strip
  const leftStrip = document.createElement('div');
  leftStrip.className = 'line-strip';
  leftStrip.style.backgroundColor = lineColor;

  // Card content
  const content = document.createElement('div');
  content.className = 'card-content';

  // Top row: badge + destination on left, arrival on right
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

  // Arrival display
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

  // Car count
  const carCount = document.createElement('div');
  carCount.className = 'car-count';
  carCount.textContent = 'Cars: ' + (cars || '—');

  content.appendChild(topRow);
  content.appendChild(carCount);

  // Right line strip
  const rightStrip = document.createElement('div');
  rightStrip.className = 'line-strip';
  rightStrip.style.backgroundColor = lineColor;

  // Assemble card
  card.appendChild(leftStrip);
  card.appendChild(content);
  card.appendChild(rightStrip);

  return card;
}

// ==============================
// Fetch Train Predictions
// ==============================
async function fetchTrains(stationCode) {
  if (!stationCode) {
    trainFeed.innerHTML = '<p class="empty-text">Select a station to view trains.</p>';
    return;
  }

  try {
    trainFeed.innerHTML = '<p class="loading-text">Loading trains...</p>';

    const res = await fetch(`${API_BASE_URL}/api/predictions/${stationCode}`);
    if (!res.ok) throw new Error('API error');

    const data = await res.json();

    if (data.length === 0) {
      trainFeed.innerHTML = '<p class="empty-text">No trains at this time.</p>';
      return;
    }

    trainFeed.innerHTML = '';
    data.forEach((train) => {
      trainFeed.appendChild(createTrainCard(train));
    });
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
stationSelect.addEventListener('change', (e) => {
  selectedStation = e.target.value;
  fetchTrains(selectedStation);
  startAutoRefresh();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Hero banner
  updateHeroImage();
  setInterval(rotateHeroImage, 10000);

  // Station dropdown
  populateStationSelect();

  // Initial train fetch
  fetchTrains(selectedStation);
  startAutoRefresh();
});
