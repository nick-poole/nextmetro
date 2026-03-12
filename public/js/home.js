// ==============================
// NextMetro — Homepage JS
// Station search autocomplete, alerts preview, live data
// ==============================

const API_BASE_URL = '';

// ---- Station Data (all 98 stations, deduplicated) ----
const stations = [
  { name: 'Metro Center', slug: 'metro-center', lines: ['red', 'orange', 'blue', 'silver'] },
  { name: 'Farragut North', slug: 'farragut-north', lines: ['red'] },
  { name: 'Dupont Circle', slug: 'dupont-circle', lines: ['red'] },
  { name: 'Woodley Park-Zoo/Adams Morgan', slug: 'woodley-park', lines: ['red'] },
  { name: 'Cleveland Park', slug: 'cleveland-park', lines: ['red'] },
  { name: 'Van Ness-UDC', slug: 'van-ness-udc', lines: ['red'] },
  { name: 'Tenleytown-AU', slug: 'tenleytown-au', lines: ['red'] },
  { name: 'Friendship Heights', slug: 'friendship-heights', lines: ['red'] },
  { name: 'Bethesda', slug: 'bethesda', lines: ['red'] },
  { name: 'Medical Center', slug: 'medical-center', lines: ['red'] },
  { name: 'Grosvenor-Strathmore', slug: 'grosvenor-strathmore', lines: ['red'] },
  { name: 'North Bethesda-White Flint', slug: 'north-bethesda', lines: ['red'] },
  { name: 'Twinbrook', slug: 'twinbrook', lines: ['red'] },
  { name: 'Rockville', slug: 'rockville', lines: ['red'] },
  { name: 'Shady Grove', slug: 'shady-grove', lines: ['red'] },
  { name: 'Gallery Pl-Chinatown', slug: 'gallery-place', lines: ['red', 'yellow', 'green'] },
  { name: 'Judiciary Square', slug: 'judiciary-square', lines: ['red'] },
  { name: 'Union Station', slug: 'union-station', lines: ['red'] },
  { name: 'Rhode Island Ave-Brentwood', slug: 'rhode-island-ave', lines: ['red'] },
  { name: 'Brookland-CUA', slug: 'brookland-cua', lines: ['red'] },
  { name: 'Fort Totten', slug: 'fort-totten', lines: ['red', 'yellow', 'green'] },
  { name: 'Takoma', slug: 'takoma', lines: ['red'] },
  { name: 'Silver Spring', slug: 'silver-spring', lines: ['red'] },
  { name: 'Forest Glen', slug: 'forest-glen', lines: ['red'] },
  { name: 'Wheaton', slug: 'wheaton', lines: ['red'] },
  { name: 'Glenmont', slug: 'glenmont', lines: ['red'] },
  { name: 'NoMa-Gallaudet U', slug: 'noma', lines: ['red'] },
  { name: 'McPherson Square', slug: 'mcpherson-square', lines: ['orange', 'blue', 'silver'] },
  { name: 'Farragut West', slug: 'farragut-west', lines: ['orange', 'blue', 'silver'] },
  { name: 'Foggy Bottom-GWU', slug: 'foggy-bottom', lines: ['orange', 'blue', 'silver'] },
  { name: 'Rosslyn', slug: 'rosslyn', lines: ['orange', 'blue', 'silver'] },
  { name: 'Arlington Cemetery', slug: 'arlington-cemetery', lines: ['blue'] },
  { name: 'Pentagon', slug: 'pentagon', lines: ['blue', 'yellow'] },
  { name: 'Pentagon City', slug: 'pentagon-city', lines: ['blue', 'yellow'] },
  { name: 'Crystal City', slug: 'crystal-city', lines: ['blue', 'yellow'] },
  { name: 'Ronald Reagan Washington National Airport', slug: 'reagan-airport', lines: ['blue', 'yellow'] },
  { name: 'Potomac Yard', slug: 'potomac-yard', lines: ['blue', 'yellow'] },
  { name: 'Braddock Road', slug: 'braddock-road', lines: ['blue', 'yellow'] },
  { name: 'King St-Old Town', slug: 'king-street', lines: ['blue', 'yellow'] },
  { name: 'Eisenhower Avenue', slug: 'eisenhower-ave', lines: ['blue'] },
  { name: 'Huntington', slug: 'huntington', lines: ['blue'] },
  { name: 'Federal Triangle', slug: 'federal-triangle', lines: ['orange', 'blue', 'silver'] },
  { name: 'Smithsonian', slug: 'smithsonian', lines: ['orange', 'blue', 'silver'] },
  { name: "L'Enfant Plaza", slug: 'lenfant-plaza', lines: ['orange', 'blue', 'yellow', 'green', 'silver'] },
  { name: 'Federal Center SW', slug: 'federal-center-sw', lines: ['orange', 'blue', 'silver'] },
  { name: 'Capitol South', slug: 'capitol-south', lines: ['orange', 'blue', 'silver'] },
  { name: 'Eastern Market', slug: 'eastern-market', lines: ['orange', 'blue', 'silver'] },
  { name: 'Potomac Ave', slug: 'potomac-ave', lines: ['orange', 'blue', 'silver'] },
  { name: 'Stadium-Armory', slug: 'stadium-armory', lines: ['orange', 'blue', 'silver'] },
  { name: 'Minnesota Ave', slug: 'minnesota-ave', lines: ['orange'] },
  { name: 'Deanwood', slug: 'deanwood', lines: ['orange'] },
  { name: 'Cheverly', slug: 'cheverly', lines: ['orange'] },
  { name: 'Landover', slug: 'landover', lines: ['orange'] },
  { name: 'New Carrollton', slug: 'new-carrollton', lines: ['orange'] },
  { name: 'Mt Vernon Sq 7th St-Convention Center', slug: 'mt-vernon-square', lines: ['yellow', 'green'] },
  { name: 'Shaw-Howard U', slug: 'shaw-howard', lines: ['yellow', 'green'] },
  { name: 'U Street/African-Amer Civil War Memorial/Cardozo', slug: 'u-street', lines: ['yellow', 'green'] },
  { name: 'Columbia Heights', slug: 'columbia-heights', lines: ['yellow', 'green'] },
  { name: 'Georgia Ave-Petworth', slug: 'georgia-ave-petworth', lines: ['yellow', 'green'] },
  { name: 'West Hyattsville', slug: 'west-hyattsville', lines: ['yellow', 'green'] },
  { name: "Prince George's Plaza", slug: 'prince-georges-plaza', lines: ['yellow', 'green'] },
  { name: 'College Park-U of Md', slug: 'college-park', lines: ['yellow', 'green'] },
  { name: 'Greenbelt', slug: 'greenbelt', lines: ['yellow', 'green'] },
  { name: 'Archives-Navy Memorial-Penn Quarter', slug: 'archives', lines: ['yellow', 'green'] },
  { name: 'Waterfront', slug: 'waterfront', lines: ['green'] },
  { name: 'Navy Yard-Ballpark', slug: 'navy-yard', lines: ['green'] },
  { name: 'Anacostia', slug: 'anacostia', lines: ['green'] },
  { name: 'Congress Heights', slug: 'congress-heights', lines: ['green'] },
  { name: 'Southern Ave', slug: 'southern-ave', lines: ['green'] },
  { name: 'Naylor Road', slug: 'naylor-road', lines: ['green'] },
  { name: 'Suitland', slug: 'suitland', lines: ['green'] },
  { name: 'Branch Ave', slug: 'branch-ave', lines: ['green'] },
  { name: 'Benning Road', slug: 'benning-road', lines: ['blue', 'silver'] },
  { name: 'Capitol Heights', slug: 'capitol-heights', lines: ['blue', 'silver'] },
  { name: 'Addison Road-Seat Pleasant', slug: 'addison-road', lines: ['blue', 'silver'] },
  { name: 'Morgan Boulevard', slug: 'morgan-boulevard', lines: ['blue', 'silver'] },
  { name: 'Largo Town Center', slug: 'largo-town-center', lines: ['blue', 'silver'] },
  { name: 'Van Dorn Street', slug: 'van-dorn-street', lines: ['blue'] },
  { name: 'Franconia-Springfield', slug: 'franconia-springfield', lines: ['blue'] },
  { name: 'Court House', slug: 'court-house', lines: ['orange', 'silver'] },
  { name: 'Clarendon', slug: 'clarendon', lines: ['orange', 'silver'] },
  { name: 'Virginia Square-GMU', slug: 'virginia-square', lines: ['orange', 'silver'] },
  { name: 'Ballston-MU', slug: 'ballston', lines: ['orange', 'silver'] },
  { name: 'East Falls Church', slug: 'east-falls-church', lines: ['orange', 'silver'] },
  { name: 'West Falls Church', slug: 'west-falls-church', lines: ['orange'] },
  { name: 'Dunn Loring-Merrifield', slug: 'dunn-loring', lines: ['orange'] },
  { name: 'Vienna/Fairfax-GMU', slug: 'vienna', lines: ['orange'] },
  { name: 'McLean', slug: 'mclean', lines: ['silver'] },
  { name: 'Tysons Corner', slug: 'tysons-corner', lines: ['silver'] },
  { name: 'Greensboro', slug: 'greensboro', lines: ['silver'] },
  { name: 'Spring Hill', slug: 'spring-hill', lines: ['silver'] },
  { name: 'Wiehle-Reston East', slug: 'wiehle-reston-east', lines: ['silver'] },
  { name: 'Reston Town Center', slug: 'reston-town-center', lines: ['silver'] },
  { name: 'Herndon', slug: 'herndon', lines: ['silver'] },
  { name: 'Innovation Center', slug: 'innovation-center', lines: ['silver'] },
  { name: 'Dulles', slug: 'dulles', lines: ['silver'] },
  { name: 'Loudon Gateway', slug: 'loudon-gateway', lines: ['silver'] },
  { name: 'Ashburn', slug: 'ashburn', lines: ['silver'] },
];

// ---- Line Colors ----
const lineColorMap = {
  red: '#D41140',
  orange: '#F09500',
  blue: '#00A8E8',
  yellow: '#FFD400',
  green: '#00BD45',
  silver: '#9BA5A5',
};

const lineNames = {
  RD: 'Red',
  BL: 'Blue',
  YL: 'Yellow',
  OR: 'Orange',
  GR: 'Green',
  SV: 'Silver',
};

// ==============================
// Station Search Autocomplete
// ==============================
const searchInput = document.getElementById('home-station-input');
const searchResults = document.getElementById('home-station-listbox');
let highlightedIndex = -1;

function filterStations(query) {
  const q = query.toLowerCase().trim();
  if (!q) return stations.slice(0, 6);
  return stations.filter(s => s.name.toLowerCase().includes(q)).slice(0, 6);
}

function renderResults(filtered) {
  searchResults.innerHTML = '';
  highlightedIndex = -1;

  if (filtered.length === 0) {
    searchResults.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    return;
  }

  filtered.forEach((station, i) => {
    const li = document.createElement('li');
    li.role = 'option';
    li.id = 'station-option-' + i;
    li.className = 'home-search-result-item';
    li.dataset.slug = station.slug;

    // Line dots
    const dotsSpan = document.createElement('span');
    dotsSpan.className = 'home-search-result-dots';
    station.lines.forEach(line => {
      const dot = document.createElement('span');
      dot.className = 'home-search-result-dot';
      dot.style.backgroundColor = lineColorMap[line] || '#9BA5A5';
      dotsSpan.appendChild(dot);
    });

    const nameSpan = document.createElement('span');
    nameSpan.className = 'home-search-result-name';
    nameSpan.textContent = station.name;

    li.appendChild(dotsSpan);
    li.appendChild(nameSpan);

    li.addEventListener('click', () => navigateToStation(station));
    searchResults.appendChild(li);
  });

  searchResults.hidden = false;
  searchInput.setAttribute('aria-expanded', 'true');
}

function navigateToStation(station) {
  window.location.href = '/station/' + station.slug + '/';
}

function updateHighlight() {
  const items = searchResults.querySelectorAll('li');
  items.forEach((item, i) => {
    item.classList.toggle('highlighted', i === highlightedIndex);
  });
  if (highlightedIndex >= 0 && items[highlightedIndex]) {
    items[highlightedIndex].scrollIntoView({ block: 'nearest' });
    searchInput.setAttribute('aria-activedescendant', 'station-option-' + highlightedIndex);
  } else {
    searchInput.removeAttribute('aria-activedescendant');
  }
}

searchInput.addEventListener('input', () => {
  const filtered = filterStations(searchInput.value);
  renderResults(filtered);
});

searchInput.addEventListener('focus', () => {
  searchInput.select();
  const filtered = filterStations(searchInput.value);
  renderResults(filtered);
});

searchInput.addEventListener('keydown', (e) => {
  const items = searchResults.querySelectorAll('li');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
    updateHighlight();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    highlightedIndex = Math.max(highlightedIndex - 1, 0);
    updateHighlight();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (highlightedIndex >= 0 && items[highlightedIndex]) {
      const slug = items[highlightedIndex].dataset.slug;
      const station = stations.find(s => s.slug === slug);
      if (station) navigateToStation(station);
    }
  } else if (e.key === 'Escape') {
    searchResults.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.blur();
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.home-search')) {
    searchResults.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
  }
});

// ==============================
// Alert Preview
// ==============================
function parseAffectedLines(linesStr) {
  if (!linesStr) return [];
  return linesStr.split(';').map(s => s.trim()).filter(s => s.length > 0 && lineNames[s]);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function fetchAlertPreview() {
  try {
    const res = await fetch(API_BASE_URL + '/api/incidents');
    if (!res.ok) return;
    const data = await res.json();
    const incidents = data.Incidents || [];

    // Filter to train alerts only (exclude elevator/escalator type)
    const trainAlerts = incidents.filter(a =>
      a.IncidentType && ['Delay', 'Alert', 'Closure', 'Single Tracking'].includes(a.IncidentType)
    );

    const previewSection = document.getElementById('home-alert-preview');
    const alertList = document.getElementById('home-alert-list');

    if (trainAlerts.length === 0) {
      previewSection.hidden = true;
      return;
    }

    previewSection.hidden = false;
    alertList.innerHTML = '';

    // Show max 2 alerts
    const displayAlerts = trainAlerts.slice(0, 2);

    displayAlerts.forEach(alert => {
      const affectedLines = parseAffectedLines(alert.LinesAffected);
      const severity = alert.IncidentType === 'Delay' ? 'delay' : 'advisory';

      const article = document.createElement('article');
      article.className = 'home-alert-card home-alert-card--' + severity;

      const indicator = document.createElement('div');
      indicator.className = 'home-alert-card-indicator';

      const content = document.createElement('div');
      content.className = 'home-alert-card-content';

      // Build title with affected line names
      const lineNamesList = affectedLines.map(code => lineNames[code] || code).join(', ');
      const titleText = lineNamesList
        ? lineNamesList + ' Line — ' + (alert.IncidentType || 'Alert')
        : alert.IncidentType || 'Service Alert';

      const title = document.createElement('p');
      title.className = 'home-alert-card-title';
      title.textContent = titleText;

      const desc = document.createElement('p');
      desc.className = 'home-alert-card-description';
      desc.textContent = alert.Description || '';

      content.appendChild(title);
      content.appendChild(desc);

      article.appendChild(indicator);
      article.appendChild(content);
      alertList.appendChild(article);
    });
  } catch (err) {
    // Alerts are supplementary — fail silently
  }
}

// ==============================
// Live Data: Hours
// ==============================
function updateHoursStatus() {
  const el = document.getElementById('home-hours-status');
  if (!el) return;

  const day = new Date().getDay();
  const closingTimes = {
    0: '11:30p', // Sunday
    1: '11:30p',
    2: '11:30p',
    3: '11:30p',
    4: '11:30p',
    5: '1:00a',  // Friday (next day)
    6: '1:00a',  // Saturday (next day)
  };

  el.textContent = 'Open til ' + closingTimes[day];
}

// ==============================
// Init
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  // Fetch alert preview
  fetchAlertPreview();

  // Update hours status
  updateHoursStatus();
});
