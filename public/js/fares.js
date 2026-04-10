// ==============================
// NextMetro — Fare Calculator Page JS
// Depends on shared.js (loaded first)
// ==============================

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
// Weekday / Late-Night-Weekend Fare Detection
// WMATA eliminated peak/off-peak within weekdays in June 2023.
// The fare distinction is now: weekday (opening–9:30 PM) vs.
// late night (after 9:30 PM) / weekends / federal holidays.
// ==============================
function isWeekdayFare(date) {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  if (day === 0 || day === 6) return false; // weekends

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Weekday fares apply from opening (~5:00 AM) until 9:30 PM
  const openingTime = 5 * 60;       // 5:00 AM
  const lateNightStart = 21 * 60 + 30; // 9:30 PM

  return timeInMinutes >= openingTime && timeInMinutes < lateNightStart;
}

// Keep isPeakTime as an alias — the WMATA API still returns
// PeakTime / OffPeakTime fields used by the calculator.
const isPeakTime = isWeekdayFare;

function updatePeakIndicator() {
  const now = new Date();
  const weekday = isWeekdayFare(now);
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;

  if (weekday) {
    peakDot.className = 'peak-indicator-dot peak-indicator-dot--peak';
    peakText.textContent = 'Weekday Fares Active';
  } else if (isWeekend) {
    peakDot.className = 'peak-indicator-dot peak-indicator-dot--offpeak';
    peakText.textContent = 'Weekend Fares Active';
  } else {
    peakDot.className = 'peak-indicator-dot peak-indicator-dot--offpeak';
    peakText.textContent = 'Late Night Fares Active';
  }

  peakTimeEl.textContent = now.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    weekday: 'short',
  });
}

// ==============================
// Reduced Fare Calculation
// WMATA API SeniorDisabled field is stale for routes over ~4.5 miles.
// Compute client-side as 50% of regular fare, rounded to nearest $0.05,
// with a $1.10 floor — matches WMATA's published reduced fare policy.
// ==============================
function reducedFare(amount) {
  var cents = Math.round(amount * 100);
  var halfCents = Math.floor(cents / 2);
  var rounded = Math.floor(halfCents / 5) * 5; // floor to nearest 5¢
  return Math.max(1.10, rounded / 100);
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
    currentFareData = { peak: 0, offpeak: 0, seniorPeak: 0, seniorOffpeak: 0, time: 0 };
    calcResults.style.display = '';
    updateEstimator();
    return;
  }

  try {
    const res = await fetchWithRetry(
      API_BASE_URL + '/api/fare/' + fromCode + '/' + toCode
    );
    if (!res.ok) throw new Error('Fare API error');
    const data = await safeJson(res);

    const info = data.StationToStationInfos && data.StationToStationInfos[0];
    if (!info) {
      calcResults.style.display = 'none';
      currentFareData = null;
      return;
    }

    const fare = info.RailFare || {};
    const peakAmt = fare.PeakTime || 0;
    const offpeakAmt = fare.OffPeakTime || 0;
    currentFareData = {
      peak: peakAmt,
      offpeak: offpeakAmt,
      seniorPeak: reducedFare(peakAmt),
      seniorOffpeak: reducedFare(offpeakAmt),
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
    resultPeak.textContent = '$' + d.seniorPeak.toFixed(2);
    resultOffpeak.textContent = '$' + d.seniorOffpeak.toFixed(2);
    if (peak) {
      const rt = d.seniorPeak * 2;
      resultRoundtrip.textContent = '$' + rt.toFixed(2);
      resultRoundtripNote.textContent = 'Reduced weekday round trip';
    } else {
      const rt = d.seniorOffpeak * 2;
      resultRoundtrip.textContent = '$' + rt.toFixed(2);
      resultRoundtripNote.textContent = 'Reduced late night / weekend';
    }
  } else {
    resultPeak.textContent = '$' + d.peak.toFixed(2);
    resultOffpeak.textContent = '$' + d.offpeak.toFixed(2);
    // Round trip estimate based on current fare window
    if (peak) {
      const rt = d.peak * 2;
      resultRoundtrip.textContent = '$' + rt.toFixed(2);
      resultRoundtripNote.textContent = 'Weekday round trip';
    } else {
      const rt = d.offpeak * 2;
      resultRoundtrip.textContent = '$' + rt.toFixed(2);
      resultRoundtripNote.textContent = 'Late night / weekend round trip';
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
    costPerTrip = d.seniorPeak * 0.6 + d.seniorOffpeak * 0.4;
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
