const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
app.set('trust proxy', true);

// ==============================
// Security Middleware
// ==============================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://nextmetro.onrender.com', 'https://nextmetro.live'],
    },
  },
}));

const ALLOWED_ORIGINS = [
  'https://nextmetro.live',
  'https://www.nextmetro.live',
  'https://nextmetro.netlify.app',
  'http://localhost:3001',
];
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET'],
}));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', apiLimiter);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

const WMATA_API_KEY = process.env.WMATA_API_KEY;
const WMATA_BASE = 'https://api.wmata.com';

// ==============================
// Input Validation
// ==============================
const STATION_CODE_RE = /^[A-KNS][0-9]{2}$/;

function isValidStationCode(code) {
  return STATION_CODE_RE.test(code);
}

// ==============================
// In-Memory Cache
// ==============================
const cache = {};
const CACHE_MAX_SIZE = 500;

function getCached(key, ttlMs) {
  const entry = cache[key];
  if (!entry) return null;
  if (ttlMs === Infinity) return entry.data;
  if (Date.now() - entry.timestamp < ttlMs) return entry.data;
  return null;
}

function setCache(key, data) {
  cache[key] = { data, timestamp: Date.now() };
}

// Periodically prune expired cache entries
setInterval(() => {
  const now = Date.now();
  const ttls = { incidents: 60000, elevators: 120000, fare: 3600000 };
  for (const key of Object.keys(cache)) {
    const prefix = key.split('-')[0];
    const ttl = ttls[prefix];
    if (ttl && now - cache[key].timestamp > ttl) {
      delete cache[key];
    }
  }
  // Hard cap: if cache still exceeds max size, drop oldest entries
  const keys = Object.keys(cache);
  if (keys.length > CACHE_MAX_SIZE) {
    keys
      .sort((a, b) => cache[a].timestamp - cache[b].timestamp)
      .slice(0, keys.length - CACHE_MAX_SIZE)
      .forEach((k) => delete cache[k]);
  }
}, 5 * 60 * 1000);

// Helper to fetch from WMATA with error handling
async function wmataFetch(urlPath) {
  const res = await fetch(`${WMATA_BASE}${urlPath}`, {
    headers: { api_key: WMATA_API_KEY },
  });
  if (!res.ok) {
    console.error(`WMATA upstream error: ${res.status} for ${urlPath}`);
    const err = new Error('Upstream API error');
    err.status = 502;
    throw err;
  }
  return res.json();
}

// ==============================
// 1. GET /api/stations — All stations (static, cache forever)
// ==============================
app.get('/api/stations', async (req, res) => {
  const cacheKey = 'stations';
  const cached = getCached(cacheKey, Infinity);
  if (cached) return res.json(cached);

  try {
    const data = await wmataFetch('/Rail.svc/json/jStations');
    setCache(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('Stations API error:', err.message);
    // Return stale cache if available
    const stale = cache[cacheKey];
    if (stale) return res.json(stale.data);
    res.status(err.status || 500).json({ error: 'Failed to fetch stations' });
  }
});

// ==============================
// 2. GET /api/station/:code — Single station info (static, cache forever)
// ==============================
app.get('/api/station/:code', async (req, res) => {
  const { code } = req.params;
  if (!isValidStationCode(code)) {
    return res.status(400).json({ error: 'Invalid station code' });
  }
  const cacheKey = `station-${code}`;
  const cached = getCached(cacheKey, Infinity);
  if (cached) return res.json(cached);

  try {
    const data = await wmataFetch(`/Rail.svc/json/jStationInfo?StationCode=${code}`);
    setCache(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('Station info API error:', err.message);
    const stale = cache[cacheKey];
    if (stale) return res.json(stale.data);
    res.status(err.status || 500).json({ error: 'Failed to fetch station info' });
  }
});

// ==============================
// 3. GET /api/predictions/:code — Real-time predictions (pass-through, no cache)
// ==============================
app.get('/api/predictions/:stationCode', async (req, res) => {
  const { stationCode } = req.params;
  // Support comma-separated codes for multi-platform stations (e.g. "B06,E06")
  const codes = stationCode.split(',');
  if (!codes.every(isValidStationCode)) {
    return res.status(400).json({ error: 'Invalid station code' });
  }

  try {
    const data = await wmataFetch(
      `/StationPrediction.svc/json/GetPrediction/${stationCode}`
    );

    // Return the full WMATA response shape with Group field for directional splitting
    const trains = (data.Trains || []).map((train) => ({
      line: train.Line || '',
      destination: train.DestinationName || train.Destination || '',
      destinationCode: train.DestinationCode || '',
      arrival: train.Min || '',
      cars: train.Car || '',
      group: train.Group || '',
      locationCode: train.LocationCode || '',
      locationName: train.LocationName || '',
    }));

    res.json(trains);
  } catch (err) {
    console.error('Predictions API error:', err.message);
    res.status(err.status || 500).json({ error: 'Failed to fetch predictions' });
  }
});

// ==============================
// 4. GET /api/incidents — System-wide rail incidents (60s TTL cache)
// ==============================
app.get('/api/incidents', async (req, res) => {
  const cacheKey = 'incidents';
  const cached = getCached(cacheKey, 60 * 1000);
  if (cached) return res.json(cached);

  try {
    const data = await wmataFetch('/Incidents.svc/json/Incidents');
    setCache(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('Incidents API error:', err.message);
    const stale = cache[cacheKey];
    if (stale) return res.json(stale.data);
    res.status(err.status || 500).json({ error: 'Failed to fetch incidents' });
  }
});

// ==============================
// 5. GET /api/elevators/:code — Elevator/Escalator outages (120s TTL cache)
// ==============================
app.get('/api/elevators/:code', async (req, res) => {
  const { code } = req.params;
  if (!isValidStationCode(code)) {
    return res.status(400).json({ error: 'Invalid station code' });
  }
  const cacheKey = `elevators-${code}`;
  const cached = getCached(cacheKey, 120 * 1000);
  if (cached) return res.json(cached);

  try {
    const data = await wmataFetch(
      `/Incidents.svc/json/ElevatorIncidents?StationCode=${code}`
    );
    setCache(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('Elevators API error:', err.message);
    const stale = cache[cacheKey];
    if (stale) return res.json(stale.data);
    res.status(err.status || 500).json({ error: 'Failed to fetch elevator status' });
  }
});

// ==============================
// 6. GET /api/fare/:from/:to — Fare info (on demand, 1hr cache)
// ==============================
app.get('/api/fare/:from/:to', async (req, res) => {
  const { from, to } = req.params;
  if (!isValidStationCode(from) || !isValidStationCode(to)) {
    return res.status(400).json({ error: 'Invalid station code' });
  }
  const cacheKey = `fare-${from}-${to}`;
  const cached = getCached(cacheKey, 60 * 60 * 1000);
  if (cached) return res.json(cached);

  try {
    const data = await wmataFetch(
      `/Rail.svc/json/jSrcStationToDstStationInfo?FromStationCode=${from}&ToStationCode=${to}`
    );
    setCache(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('Fare API error:', err.message);
    const stale = cache[cacheKey];
    if (stale) return res.json(stale.data);
    res.status(err.status || 500).json({ error: 'Failed to fetch fare info' });
  }
});

// ==============================
// 404 Catch-All (must be after all other routes)
// ==============================
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ==============================
// Start Server
// ==============================
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
