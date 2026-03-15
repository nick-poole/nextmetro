// ==============================
// NextMetro — Shared Utilities
// Common data, helpers, and ticker renderer used across all pages.
// Loaded via <script> before page-specific JS files.
// ==============================

var API_BASE_URL = '';

// ---- Fetch with retry (handles Render free-tier cold starts) ----
function fetchWithRetry(url, retries, delayMs) {
  retries = retries != null ? retries : 2;
  delayMs = delayMs != null ? delayMs : 3000;
  return (async function () {
    for (var attempt = 0; attempt <= retries; attempt++) {
      var res = await fetch(url);
      if (res.ok) return res;
      if (res.status !== 503 || attempt === retries) return res;
      await new Promise(function (r) { setTimeout(r, delayMs * (attempt + 1)); });
    }
  })();
}

// ---- Metro Line Colors (WMATA line codes) ----
var lineColors = {
  RD: '#D41140',
  BL: '#00A8E8',
  YL: '#FFD400',
  OR: '#F09500',
  GR: '#00BD45',
  SV: '#9BA5A5',
};

// ---- Metro Line Names ----
var lineNames = {
  RD: 'Red',
  BL: 'Blue',
  YL: 'Yellow',
  OR: 'Orange',
  GR: 'Green',
  SV: 'Silver',
};

// ---- Station Code to Name Mapping ----
var stations = {
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
  E08: 'Hyattsville Crossing',
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
  G05: 'Downtown Largo',
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
  N02: 'Tysons',
  N03: 'Greensboro',
  N04: 'Spring Hill',
  N06: 'Wiehle-Reston East',
  N07: 'Reston Town Center',
  N08: 'Herndon',
  N09: 'Innovation Center',
  N10: 'Washington Dulles International Airport',
  N11: 'Loudoun Gateway',
  N12: 'Ashburn',
  S04: 'King St-Old Town',
  S09: 'Braddock Road',
  S10: 'DCA-National Airport',
  S12: 'Crystal City',
  S13: 'Pentagon City',
  S14: 'Pentagon',
};

// ---- HTML Escaping ----
function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- Parse LinesAffected string from WMATA API ----
function parseAffectedLines(linesStr) {
  if (!linesStr) return [];
  return linesStr
    .split(';')
    .map(function (s) { return s.trim(); })
    .filter(function (s) { return s.length > 0 && lineNames[s]; });
}

// ---- Relative Time Formatting ----
function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  var date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  var now = new Date();
  var diffMs = now - date;
  var diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return diffMin + 'm ago';
  var diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr + 'h ago';
  var diffDay = Math.floor(diffHr / 24);
  if (diffDay > 0) return diffDay + 'd ago';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// ---- System Status Ticker (renders into #ticker-track) ----
function renderTicker(incidents) {
  var tickerTrack = document.getElementById('ticker-track');
  if (!tickerTrack) return;

  var lineData = [
    { code: 'RD', name: 'Red', color: '#D41140' },
    { code: 'OR', name: 'Orange', color: '#F09500' },
    { code: 'BL', name: 'Blue', color: '#00A8E8' },
    { code: 'GR', name: 'Green', color: '#00BD45' },
    { code: 'YL', name: 'Yellow', color: '#FFD400' },
    { code: 'SV', name: 'Silver', color: '#9BA5A5' },
  ];

  var lineStatuses = {};
  lineData.forEach(function (l) { lineStatuses[l.code] = 'Normal'; });

  (incidents || []).forEach(function (incident) {
    var affectedLines = parseAffectedLines(incident.LinesAffected);
    var status = incident.IncidentType === 'Delay' ? 'Alert' : 'Caution';
    affectedLines.forEach(function (lineCode) {
      if (lineStatuses[lineCode]) {
        if (status === 'Alert' || lineStatuses[lineCode] === 'Normal') {
          lineStatuses[lineCode] = status;
        }
      }
    });
  });

  var html = '';
  lineData.forEach(function (line) {
    var thisStatus = lineStatuses[line.code];
    var statusClass =
      thisStatus === 'Normal'
        ? 'ticker-status-ok'
        : thisStatus === 'Alert'
          ? 'ticker-status-alert'
          : 'ticker-status-caution';
    var alertClass = thisStatus !== 'Normal' ? ' ticker-item--alert' : '';
    html +=
      '<span class="ticker-item' + alertClass + '">' +
      '<span class="ticker-dot" style="background-color:' + line.color + '"></span>' +
      '<span class="ticker-line-name">' + line.name + '</span>' +
      '<span class="ticker-status-text ' + statusClass + '">' + thisStatus + '</span>' +
      '</span>';
  });

  tickerTrack.innerHTML = html;
}
