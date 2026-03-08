// ==============================
// NextMetro — Fare Calculator Page JS
// ==============================

const API_BASE_URL = 'https://nextmetro.onrender.com';

// ---- Fetch with retry (handles Render free-tier cold starts) ----
async function fetchWithRetry(url, retries = 2, delayMs = 3000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res;
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

// Codes to skip (multi-platform duplicates / S-prefix duplicates)
const skipCodes = ['C01', 'F01', 'F03', 'E06', 'S04', 'S09', 'S10', 'S12', 'S13', 'S14'];

// ---- State ----
let currentFareData = null;
let fareType = 'regular'; // 'regular' or 'senior'

// ---- DOM Elements ----
const calcFrom = document.getElementById('calc-from');
const calcTo = document.getElementById('calc-to');
const calcSwap = document.getElementById('calc-swap');
const calcResults = document.getElementById('calc-results');
const resultPeak = document.getElementById('result-peak');
const resultOffpeak = document.getElementById('result-offpeak');
const resultTime = document.getElementById('result-time');
const resultRoundtrip = document.getElementById('result-roundtrip');
const resultRoundtripNote = document.getElementById('result-roundtrip-note');
const tripsPerWeek = document.getElementById('trips-per-week');
const estWeekly = document.getElementById('est-weekly');
const estMonthly = document.getElementById('est-monthly');
const estYearly = document.getElementById('est-yearly');
const peakDot = document.getElementById('peak-dot');
const peakText = document.getElementById('peak-text');
const peakTimeEl = document.getElementById('peak-time');

// ==============================
// Peak Time Detection
// ==============================
function isPeakTime(date) {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  if (day === 0 || day === 6) return false; // weekends

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Morning peak: opening (~5:00 AM) to 9:30 AM
  const morningStart = 5 * 60;   // 5:00 AM
  const morningEnd = 9 * 60 + 30; // 9:30 AM

  // Evening peak: 3:00 PM to 7:00 PM
  const eveningStart = 15 * 60;   // 3:00 PM
  const eveningEnd = 19 * 60;     // 7:00 PM

  return (timeInMinutes >= morningStart && timeInMinutes < morningEnd) ||
         (timeInMinutes >= eveningStart && timeInMinutes < eveningEnd);
}

function updatePeakIndicator() {
  const now = new Date();
  const peak = isPeakTime(now);

  if (peak) {
    peakDot.className = 'peak-indicator-dot peak-indicator-dot--peak';
    peakText.textContent = 'Peak Fares Active';
  } else {
    peakDot.className = 'peak-indicator-dot peak-indicator-dot--offpeak';
    peakText.textContent = 'Off-Peak Fares Active';
  }

  peakTimeEl.textContent = now.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    weekday: 'short',
  });
}

// ==============================
// Populate Station Selectors
// ==============================
function populateStations() {
  const seen = new Set();
  const opts = [];

  Object.entries(stations).forEach(([code, name]) => {
    if (skipCodes.includes(code)) return;
    if (seen.has(name)) return;
    seen.add(name);
    opts.push({ code, name });
  });

  opts.sort((a, b) => a.name.localeCompare(b.name));

  [calcFrom, calcTo].forEach((select) => {
    const defaultOpt = select.querySelector('option');
    select.innerHTML = '';
    select.appendChild(defaultOpt);

    opts.forEach((opt) => {
      const option = document.createElement('option');
      option.value = opt.code;
      option.textContent = opt.name;
      select.appendChild(option);
    });
  });
}

// ==============================
// Fetch & Display Fare
// ==============================
async function fetchFare() {
  const fromCode = calcFrom.value;
  const toCode = calcTo.value;

  if (!fromCode || !toCode) {
    calcResults.style.display = 'none';
    currentFareData = null;
    return;
  }

  if (fromCode === toCode) {
    resultPeak.textContent = '$0.00';
    resultOffpeak.textContent = '$0.00';
    resultTime.textContent = '0 min';
    resultRoundtrip.textContent = '$0.00';
    resultRoundtripNote.textContent = '';
    currentFareData = { peak: 0, offpeak: 0, senior: 0, time: 0 };
    calcResults.style.display = '';
    updateEstimator();
    return;
  }

  try {
    const res = await fetchWithRetry(
      API_BASE_URL + '/api/fare/' + fromCode + '/' + toCode
    );
    if (!res.ok) throw new Error('Fare API error');
    const data = await res.json();

    const info = data.StationToStationInfos && data.StationToStationInfos[0];
    if (!info) {
      calcResults.style.display = 'none';
      currentFareData = null;
      return;
    }

    const fare = info.RailFare || {};
    currentFareData = {
      peak: fare.PeakTime || 0,
      offpeak: fare.OffPeakTime || 0,
      senior: fare.SeniorDisabled || 0,
      time: info.RailTime || 0,
    };

    displayResults();
    calcResults.style.display = '';
  } catch (err) {
    console.error('Fare fetch error:', err.message);
    resultPeak.textContent = '--';
    resultOffpeak.textContent = '--';
    resultTime.textContent = 'Unavailable';
    resultRoundtrip.textContent = '--';
    resultRoundtripNote.textContent = '';
    currentFareData = null;
    calcResults.style.display = '';
  }
}

function displayResults() {
  if (!currentFareData) return;

  const d = currentFareData;
  const peak = isPeakTime(new Date());

  if (fareType === 'senior') {
    resultPeak.textContent = '$' + d.senior.toFixed(2);
    resultOffpeak.textContent = '$' + d.senior.toFixed(2);
    const rt = d.senior * 2;
    resultRoundtrip.textContent = '$' + rt.toFixed(2);
    resultRoundtripNote.textContent = 'Senior/Disabled flat rate';
  } else {
    resultPeak.textContent = '$' + d.peak.toFixed(2);
    resultOffpeak.textContent = '$' + d.offpeak.toFixed(2);
    // Round trip: assume one peak, one off-peak leg for weekday commute
    if (peak) {
      const rt = d.peak + d.offpeak;
      resultRoundtrip.textContent = '$' + rt.toFixed(2);
      resultRoundtripNote.textContent = 'Peak + off-peak estimate';
    } else {
      const rt = d.offpeak * 2;
      resultRoundtrip.textContent = '$' + rt.toFixed(2);
      resultRoundtripNote.textContent = 'Off-peak both ways';
    }
  }

  resultTime.textContent = d.time ? d.time + ' min' : '--';
  updateEstimator();
}

// ==============================
// Cost Estimator
// ==============================
function updateEstimator() {
  if (!currentFareData) {
    estWeekly.textContent = '--';
    estMonthly.textContent = '--';
    estYearly.textContent = '--';
    return;
  }

  const trips = parseInt(tripsPerWeek.value, 10) || 0;
  if (trips <= 0) {
    estWeekly.textContent = '--';
    estMonthly.textContent = '--';
    estYearly.textContent = '--';
    return;
  }

  const d = currentFareData;
  let costPerTrip;

  if (fareType === 'senior') {
    costPerTrip = d.senior;
  } else {
    // Assume a mix: roughly 60% peak, 40% off-peak for commuters
    costPerTrip = d.peak * 0.6 + d.offpeak * 0.4;
  }

  // Each "round trip" is 2 one-way trips
  const weekly = costPerTrip * trips * 2;
  const monthly = weekly * 4.33; // average weeks per month
  const yearly = weekly * 52;

  estWeekly.textContent = '$' + weekly.toFixed(2);
  estMonthly.textContent = '$' + monthly.toFixed(2);
  estYearly.textContent = '$' + yearly.toFixed(2);
}

// ==============================
// Fare Type Toggle
// ==============================
function initFareToggle() {
  const toggleBtns = document.querySelectorAll('.calc-toggle-btn');
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach((b) => {
        b.classList.remove('calc-toggle-btn--active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('calc-toggle-btn--active');
      btn.setAttribute('aria-checked', 'true');
      fareType = btn.dataset.fareType;
      displayResults();
    });
  });
}

// ==============================
// Swap Stations
// ==============================
calcSwap.addEventListener('click', () => {
  const fromVal = calcFrom.value;
  const toVal = calcTo.value;
  calcFrom.value = toVal;
  calcTo.value = fromVal;
  fetchFare();
});

// ==============================
// Event Listeners
// ==============================
calcFrom.addEventListener('change', fetchFare);
calcTo.addEventListener('change', fetchFare);
tripsPerWeek.addEventListener('input', updateEstimator);

// ==============================
// Init
// ==============================
document.addEventListener('DOMContentLoaded', async () => {
  populateStations();
  initFareToggle();
  updatePeakIndicator();

  // Update peak indicator every minute
  setInterval(updatePeakIndicator, 60000);

  // Wake up Render backend
  try {
    await fetchWithRetry(API_BASE_URL + '/healthz', 3, 2000);
  } catch (e) {
    // Backend may be down — fare fetches will handle gracefully
  }
});
