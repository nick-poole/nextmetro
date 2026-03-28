// ==============================
// NextMetro — Station Page JS
// Depends on shared.js (loaded first)
// ==============================

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

// ---- Station Pages ----
// Stations that have dedicated pages — maps station code to URL slug
const stationPages = {
  // Red Line
  A01: 'metro-center',
  A02: 'farragut-north',
  A03: 'dupont-circle',
  A04: 'woodley-park',
  A05: 'cleveland-park',
  A06: 'van-ness-udc',
  A07: 'tenleytown-au',
  A08: 'friendship-heights',
  A09: 'bethesda',
  A10: 'medical-center',
  A11: 'grosvenor-strathmore',
  A12: 'north-bethesda',
  A13: 'twinbrook',
  A14: 'rockville',
  A15: 'shady-grove',
  B01: 'gallery-place',
  B02: 'judiciary-square',
  B03: 'union-station',
  B04: 'rhode-island-ave',
  B05: 'brookland-cua',
  B06: 'fort-totten',
  B07: 'takoma',
  B08: 'silver-spring',
  B09: 'forest-glen',
  B10: 'wheaton',
  B11: 'glenmont',
  B35: 'noma',
  // Orange / Blue / Silver (C/D lines)
  C01: 'metro-center',
  C02: 'mcpherson-square',
  C03: 'farragut-west',
  C04: 'foggy-bottom',
  C05: 'rosslyn',
  C06: 'arlington-cemetery',
  C07: 'pentagon',
  C08: 'pentagon-city',
  C09: 'crystal-city',
  C10: 'dca-national-airport',
  C11: 'potomac-yard',
  C12: 'braddock-road',
  C13: 'king-street',
  C14: 'eisenhower-ave',
  C15: 'huntington',
  D01: 'federal-triangle',
  D02: 'smithsonian',
  D03: 'lenfant-plaza',
  D04: 'federal-center-sw',
  D05: 'capitol-south',
  D06: 'eastern-market',
  D07: 'potomac-ave',
  D08: 'stadium-armory',
  D09: 'minnesota-ave',
  D10: 'deanwood',
  D11: 'cheverly',
  D12: 'landover',
  D13: 'new-carrollton',
  // Green / Yellow (E/F lines)
  E01: 'mt-vernon-sq',
  E02: 'shaw-howard-u',
  E03: 'u-street',
  E04: 'columbia-heights',
  E05: 'georgia-ave-petworth',
  E06: 'fort-totten',
  E07: 'west-hyattsville',
  E08: 'hyattsville-crossing',
  E09: 'college-park',
  E10: 'greenbelt',
  F01: 'gallery-place',
  F02: 'archives',
  F03: 'lenfant-plaza',
  F04: 'waterfront',
  F05: 'navy-yard-ballpark',
  F06: 'anacostia',
  F07: 'congress-heights',
  F08: 'southern-ave',
  F09: 'naylor-road',
  F10: 'suitland',
  F11: 'branch-ave',
  // Blue / Silver (G line)
  G01: 'benning-road',
  G02: 'capitol-heights',
  G03: 'addison-road',
  G04: 'morgan-boulevard',
  G05: 'downtown-largo',
  // Blue / Yellow (J line)
  J02: 'van-dorn-street',
  J03: 'franconia-springfield',
  // Orange / Silver (K line)
  K01: 'court-house',
  K02: 'clarendon',
  K03: 'virginia-square',
  K04: 'ballston',
  K05: 'east-falls-church',
  K06: 'west-falls-church',
  K07: 'dunn-loring',
  K08: 'vienna',
  // Silver Line extension (N line)
  N01: 'mclean',
  N02: 'tysons',
  N03: 'greensboro',
  N04: 'spring-hill',
  N06: 'wiehle-reston-east',
  N07: 'reston-town-center',
  N08: 'herndon',
  N09: 'innovation-center',
  N10: 'washington-dulles',
  N11: 'loudoun-gateway',
  N12: 'ashburn',
  // Yellow / Blue rush+ (S line — duplicates for partner platforms)
  S04: 'king-street',
  S09: 'braddock-road',
  S10: 'dca-national-airport',
  S12: 'crystal-city',
  S13: 'pentagon-city',
  S14: 'pentagon',
};

// pidsLineColors — alias for lineColors (from shared.js)
var pidsLineColors = lineColors;

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

// Station-specific line overrides (where prefix mapping is inaccurate)
const stationLineOverrides = {
  C06: [{ code: 'BL', name: 'Blue', color: '#00A8E8' }],   // Arlington Cemetery — Blue only
  C07: [{ code: 'BL', name: 'Blue', color: '#00A8E8' }, { code: 'YL', name: 'Yellow', color: '#FFD400' }], // Pentagon — Blue, Yellow
  C08: [{ code: 'BL', name: 'Blue', color: '#00A8E8' }, { code: 'YL', name: 'Yellow', color: '#FFD400' }], // Pentagon City — Blue, Yellow
  C09: [{ code: 'BL', name: 'Blue', color: '#00A8E8' }, { code: 'YL', name: 'Yellow', color: '#FFD400' }], // Crystal City — Blue, Yellow
  C10: [{ code: 'BL', name: 'Blue', color: '#00A8E8' }, { code: 'YL', name: 'Yellow', color: '#FFD400' }], // DCA–National Airport — Blue, Yellow
  C11: [{ code: 'BL', name: 'Blue', color: '#00A8E8' }, { code: 'YL', name: 'Yellow', color: '#FFD400' }], // Potomac Yard — Blue, Yellow
  C12: [{ code: 'BL', name: 'Blue', color: '#00A8E8' }, { code: 'YL', name: 'Yellow', color: '#FFD400' }], // Braddock Road — Blue, Yellow
  C13: [{ code: 'BL', name: 'Blue', color: '#00A8E8' }, { code: 'YL', name: 'Yellow', color: '#FFD400' }], // King St-Old Town — Blue, Yellow
  C14: [{ code: 'YL', name: 'Yellow', color: '#FFD400' }], // Eisenhower Ave — Yellow only
  C15: [{ code: 'YL', name: 'Yellow', color: '#FFD400' }], // Huntington — Yellow only
  D09: [{ code: 'OR', name: 'Orange', color: '#F09500' }, { code: 'SV', name: 'Silver', color: '#9BA5A5' }], // Minnesota Ave — Orange, Silver
  D10: [{ code: 'OR', name: 'Orange', color: '#F09500' }, { code: 'SV', name: 'Silver', color: '#9BA5A5' }], // Deanwood — Orange, Silver
  D11: [{ code: 'OR', name: 'Orange', color: '#F09500' }, { code: 'SV', name: 'Silver', color: '#9BA5A5' }], // Cheverly — Orange, Silver
  D12: [{ code: 'OR', name: 'Orange', color: '#F09500' }, { code: 'SV', name: 'Silver', color: '#9BA5A5' }], // Landover — Orange, Silver
  D13: [{ code: 'OR', name: 'Orange', color: '#F09500' }, { code: 'SV', name: 'Silver', color: '#9BA5A5' }], // New Carrollton — Orange, Silver
  F04: [{ code: 'GR', name: 'Green', color: '#00BD45' }],   // Waterfront — Green only
  F05: [{ code: 'GR', name: 'Green', color: '#00BD45' }],   // Navy Yard-Ballpark — Green only
  F06: [{ code: 'GR', name: 'Green', color: '#00BD45' }],   // Anacostia — Green only
  F07: [{ code: 'GR', name: 'Green', color: '#00BD45' }],   // Congress Heights — Green only
  F08: [{ code: 'GR', name: 'Green', color: '#00BD45' }],   // Southern Ave — Green only
  F09: [{ code: 'GR', name: 'Green', color: '#00BD45' }],   // Naylor Road — Green only
  F10: [{ code: 'GR', name: 'Green', color: '#00BD45' }],   // Suitland — Green only
  F11: [{ code: 'GR', name: 'Green', color: '#00BD45' }],   // Branch Ave — Green only
  J02: [{ code: 'BL', name: 'Blue', color: '#00A8E8' }],   // Van Dorn Street — Blue only
  J03: [{ code: 'BL', name: 'Blue', color: '#00A8E8' }],   // Franconia-Springfield — Blue only
  K06: [{ code: 'OR', name: 'Orange', color: '#F09500' }],  // West Falls Church — Orange only
  K07: [{ code: 'OR', name: 'Orange', color: '#F09500' }],  // Dunn Loring-Merrifield — Orange only
  K08: [{ code: 'OR', name: 'Orange', color: '#F09500' }],  // Vienna/Fairfax-GMU — Orange only
};

function getLinesForCode(code) {
  return stationLineOverrides[code] || prefixLines[code.charAt(0)] || [];
}

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
const stationOptions = (() => {
  const seen = {};
  const result = [];
  Object.entries(stations).forEach(([code, name]) => {
    const lines = getLinesForCode(code);
    if (seen[name]) {
      // Merge lines from the partner platform code
      const existing = seen[name];
      lines.forEach((line) => {
        if (!existing.lines.some((l) => l.code === line.code)) {
          existing.lines.push(line);
        }
      });
    } else {
      const entry = { code, name, lines: lines.slice() };
      seen[name] = entry;
      result.push(entry);
    }
  });
  return result;
})();

// Get all line codes that serve a station (including multi-platform partner)
function getStationLineCodes(stationCode) {
  const lines = new Set();
  getLinesForCode(stationCode).forEach((l) => lines.add(l.code));

  const partner = multiPlatform[stationCode];
  if (partner) {
    getLinesForCode(partner).forEach((l) => lines.add(l.code));
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
    const data = await safeJson(res);
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

  // For multi-platform stations, merge lines from both codes
  const allLines = [];
  const seenCodes = new Set();
  const addLines = (code) => {
    getLinesForCode(code).forEach((l) => {
      if (!seenCodes.has(l.code)) {
        seenCodes.add(l.code);
        allLines.push(l);
      }
    });
  };
  addLines(stationCode);
  const partner = multiPlatform[stationCode];
  if (partner) addLines(partner);

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

  // Apply random hero image if no station-specific hero exists
  applyRandomHeroImage(stationCode);

  // Update fare calculator "from" display
  fareFromName.textContent = name;
}

// ==============================
// Random Hero Image (fallback for stations without station-specific heroes)
// ==============================
function applyRandomHeroImage(stationCode) {
  var heroSection = document.getElementById('hero');
  if (!heroSection) return;

  // Skip if the page already has a station-specific hero image
  var existingImage = heroSection.querySelector('.hero__image');
  if (existingImage && !existingImage.dataset.randomHero) return;

  // Remove any previously injected random hero
  if (existingImage && existingImage.dataset.randomHero) {
    existingImage.remove();
  }

  // Create and inject the hero image
  var imageSrc = getRandomHeroImage(stationCode);
  var imageDiv = document.createElement('div');
  imageDiv.className = 'hero__image';
  imageDiv.setAttribute('aria-hidden', 'true');
  imageDiv.dataset.randomHero = '1';
  imageDiv.innerHTML = '<img src="' + imageSrc + '" alt="" width="1200" height="400" loading="eager" onerror="this.dataset.error=\'1\'" />';

  heroSection.classList.add('hero--has-image');
  heroSection.insertBefore(imageDiv, heroSection.firstChild);
}

// parseAffectedLines, escapeHtml — from shared.js

// ==============================
// Incidents Fetching & Rendering
// ==============================
async function fetchIncidents() {
  try {
    const res = await fetchWithRetry(API_BASE_URL + '/api/incidents');
    if (!res.ok) throw new Error('Incidents API error');
    const data = await safeJson(res);
    currentIncidents = data.Incidents || [];

    renderSystemStatus(currentIncidents);
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
    { code: 'RD', name: 'Red', slug: 'red', color: '#D41140' },
    { code: 'OR', name: 'Orange', slug: 'orange', color: '#F09500' },
    { code: 'BL', name: 'Blue', slug: 'blue', color: '#00A8E8' },
    { code: 'GR', name: 'Green', slug: 'green', color: '#00BD45' },
    { code: 'YL', name: 'Yellow', slug: 'yellow', color: '#FFD400' },
    { code: 'SV', name: 'Silver', slug: 'silver', color: '#9BA5A5' },
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

    const row = document.createElement('a');
    row.className = 'status-row';
    row.href = '/lines/' + line.slug + '/';
    row.setAttribute('aria-label', line.name + ' Line — ' + info.status);
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
    bodyHtml += '<p>' + linkifyUrls(escapeHtml(incident.Description || '')) + '</p>';
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
      const data = await safeJson(res);
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
    const data = await safeJson(res);

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
    li.setAttribute('role', 'option');
    li.id = 'station-option-' + i;
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

function normalizeSearch(str) {
  return str.toLowerCase().replace(/['\u2019]/g, '');
}

function filterStations(query) {
  const q = normalizeSearch(query.trim());
  if (!q) return stationOptions;
  return stationOptions.filter((s) => normalizeSearch(s.name).includes(q));
}

function selectStation(option) {
  // Navigate to dedicated station page if one exists
  var slug = stationPages[option.code];
  if (slug) {
    window.location.href = '/station/' + slug + '/';
    return;
  }

  // No dedicated page for this station — clear search and stay on current page.
  // In-place updates would only change the hero/PIDS while leaving stale static
  // HTML content (entrances, parking, about sections) from the current station.
  stationInput.value = '';
  stationDropdown.classList.remove('open');
  highlightedIndex = -1;
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

  var table = createPidsTable();
  for (let i = 0; i < 4; i++) {
    const row = document.createElement('tr');
    row.className = 'pids-skeleton-row';
    row.innerHTML =
      '<td><div class="pids-skeleton-block sk-line"></div></td>' +
      '<td><div class="pids-skeleton-block sk-cars"></div></td>' +
      '<td><div class="pids-skeleton-block sk-dest"></div></td>' +
      '<td><div class="pids-skeleton-block sk-min"></div></td>';
    table.tbody.appendChild(row);
  }
  pidsContent.appendChild(table.el);
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
// PIDS Table Builder
// ==============================
function createPidsTable() {
  var table = document.createElement('table');
  table.className = 'pids-table';

  var thead = document.createElement('thead');
  var headerRow = document.createElement('tr');
  headerRow.className = 'pids-col-headers';
  var headers = [
    { abbr: 'LN', full: 'Line' },
    { abbr: 'CAR', full: 'Cars' },
    { abbr: 'DEST', full: 'Destination' },
    { abbr: 'MIN', full: 'Minutes' },
  ];
  headers.forEach(function (h, i) {
    var th = document.createElement('th');
    th.setAttribute('scope', 'col');
    th.setAttribute('aria-label', h.full);
    th.textContent = h.abbr;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  var tbody = document.createElement('tbody');
  table.appendChild(tbody);

  return { el: table, tbody: tbody };
}

// ==============================
// PIDS Line Code → Full Name
// ==============================
var pidsLineNames = { RD: 'Red', OR: 'Orange', BL: 'Blue', GR: 'Green', YL: 'Yellow', SV: 'Silver' };
var pidsStatusLabels = { ARR: 'Arriving', BRD: 'Boarding', DLY: 'Delayed' };

// ==============================
// PIDS Train Row Rendering
// ==============================
function createPidsRow(train) {
  const { line, destination, arrival, cars } = train;
  const pidsColor = pidsLineColors[line] || '#bcc4c7';
  const arrivalStr = (arrival || '').toString().toUpperCase();
  const isStatus = ['ARR', 'BRD', 'DLY'].includes(arrivalStr);

  const row = document.createElement('tr');
  row.className = 'pids-row';

  // Line code
  const lineEl = document.createElement('td');
  lineEl.className = 'pids-row-line';
  lineEl.style.color = pidsColor;
  lineEl.textContent = line;
  lineEl.setAttribute('aria-label', (pidsLineNames[line] || line) + ' Line');

  // Car count
  const carsEl = document.createElement('td');
  carsEl.className = 'pids-row-cars';
  carsEl.textContent = cars || '\u2014';
  if (cars) {
    carsEl.setAttribute('aria-label', cars + ' cars');
  }

  // Destination
  const destEl = document.createElement('td');
  destEl.className = 'pids-row-dest';
  destEl.textContent = destination;

  // Minutes / Status
  const minEl = document.createElement('td');
  minEl.className = 'pids-row-min';

  if (isStatus) {
    minEl.textContent = arrivalStr;
    minEl.setAttribute('aria-label', pidsStatusLabels[arrivalStr] || arrivalStr);
    if (arrivalStr === 'BRD') minEl.classList.add('brd');
    if (arrivalStr === 'ARR') minEl.classList.add('arr');
  } else {
    minEl.textContent = arrival;
    minEl.setAttribute('aria-label', arrival + (arrival === '1' ? ' minute' : ' minutes'));
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
  lastUpdatedEl.style.display = 'inline-flex';
}

// ==============================
// WMATA Data Disclaimer (required by API agreement)
// ==============================
function injectWmataDisclaimer() {
  // Avoid duplicate injection
  if (document.querySelector('.wmata-data-disclaimer')) return;

  var disclaimer = document.createElement('div');
  disclaimer.className = 'wmata-data-disclaimer';
  disclaimer.innerHTML =
    '<strong>WMATA Transit information provided on this site is subject to change without notice.</strong> ' +
    'NextMetro is not affiliated with, endorsed by, or connected to WMATA. ' +
    'Arrival times are estimates and may not reflect actual conditions.';

  // Append inside the PIDS element so it doesn't occupy its own grid area
  var anchor = document.querySelector('.pids-wrapper') || document.querySelector('.pids-card');
  if (anchor) {
    anchor.appendChild(disclaimer);
  }
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

    const data = await safeJson(res);
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

    // Build table
    const table = createPidsTable();
    allTrains.forEach((train) => {
      table.tbody.appendChild(createPidsRow(train));
    });
    pidsContent.appendChild(table.el);

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
  var table = createPidsTable();
  for (var i = 0; i < 3; i++) {
    var row = document.createElement('tr');
    row.className = 'pids-skeleton-row';
    row.innerHTML =
      '<td><div class="pids-skeleton-block sk-line"></div></td>' +
      '<td><div class="pids-skeleton-block sk-cars"></div></td>' +
      '<td><div class="pids-skeleton-block sk-dest"></div></td>' +
      '<td><div class="pids-skeleton-block sk-min"></div></td>';
    table.tbody.appendChild(row);
  }
  contentEl.appendChild(table.el);
}

function renderPlatformPids(contentEl, trains) {
  contentEl.innerHTML = '';

  var table = createPidsTable();
  contentEl.appendChild(table.el);

  if (trains.length === 0) {
    var empty = document.createElement('div');
    empty.className = 'pids-empty';
    empty.innerHTML = '<span>No trains scheduled</span>';
    contentEl.appendChild(empty);
    return;
  }

  // Show max 3 rows per platform board
  trains.slice(0, 3).forEach(function (train) {
    table.tbody.appendChild(createPidsRow(train));
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
          return safeJson(res);
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

  // Inject WMATA data disclaimer near PIDS boards
  injectWmataDisclaimer();

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
