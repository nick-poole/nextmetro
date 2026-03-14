const WMATA_BASE = 'https://api.wmata.com';

const ALLOWED_ORIGINS = [
	'https://nextmetro.live',
	'https://www.nextmetro.live',
	'https://nextmetro.napoole.workers.dev',
	'http://localhost:3001',
];

const STATION_CODE_RE = /^[A-KNS][0-9]{2}$/;

function isValidStationCode(code) {
	return STATION_CODE_RE.test(code);
}

// ==============================
// CORS helpers
// ==============================
function corsHeaders(request) {
	const origin = request.headers.get('Origin') || '';
	const headers = { 'Access-Control-Allow-Methods': 'GET', 'Vary': 'Origin' };
	if (ALLOWED_ORIGINS.includes(origin)) {
		headers['Access-Control-Allow-Origin'] = origin;
	}
	return headers;
}

function jsonResponse(data, request, status = 200, extraHeaders = {}) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...corsHeaders(request),
			...extraHeaders,
		},
	});
}

// ==============================
// Cache API helpers
// ==============================
async function getCached(cacheKey) {
	const cache = caches.default;
	return cache.match(cacheKey);
}

async function setCache(cacheKey, data, ttlSeconds) {
	const cache = caches.default;
	const response = new Response(JSON.stringify(data), {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': `s-maxage=${ttlSeconds}`,
		},
	});
	await cache.put(cacheKey, response);
}

// ==============================
// WMATA fetch helper
// ==============================
async function wmataFetch(urlPath, apiKey) {
	const res = await fetch(`${WMATA_BASE}${urlPath}`, {
		headers: { api_key: apiKey },
	});
	if (!res.ok) {
		const err = new Error('Upstream API error');
		err.status = 502;
		throw err;
	}
	return res.json();
}

// ==============================
// Route handlers
// ==============================
async function handleStations(request, env) {
	const cacheKey = new Request('https://cache.nextmetro.live/api/stations');
	const cached = await getCached(cacheKey);
	if (cached) return addCors(cached, request);

	try {
		const data = await wmataFetch('/Rail.svc/json/jStations', env.WMATA_API_KEY);
		// Cache "forever" — 1 year
		await setCache(cacheKey, data, 31536000);
		return jsonResponse(data, request);
	} catch (err) {
		return jsonResponse({ error: 'Failed to fetch stations' }, request, err.status || 500);
	}
}

async function handleStation(request, env, code) {
	if (!isValidStationCode(code)) {
		return jsonResponse({ error: 'Invalid station code' }, request, 400);
	}
	const cacheKey = new Request(`https://cache.nextmetro.live/api/station/${code}`);
	const cached = await getCached(cacheKey);
	if (cached) return addCors(cached, request);

	try {
		const data = await wmataFetch(`/Rail.svc/json/jStationInfo?StationCode=${code}`, env.WMATA_API_KEY);
		await setCache(cacheKey, data, 31536000);
		return jsonResponse(data, request);
	} catch (err) {
		return jsonResponse({ error: 'Failed to fetch station info' }, request, err.status || 500);
	}
}

async function handlePredictions(request, env, stationCode) {
	const codes = stationCode.split(',');
	if (!codes.every(isValidStationCode)) {
		return jsonResponse({ error: 'Invalid station code' }, request, 400);
	}

	try {
		const data = await wmataFetch(
			`/StationPrediction.svc/json/GetPrediction/${stationCode}`,
			env.WMATA_API_KEY
		);
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
		// No cache — real-time data
		return jsonResponse(trains, request);
	} catch (err) {
		return jsonResponse({ error: 'Failed to fetch predictions' }, request, err.status || 500);
	}
}

async function handleIncidents(request, env) {
	const cacheKey = new Request('https://cache.nextmetro.live/api/incidents');
	const cached = await getCached(cacheKey);
	if (cached) return addCors(cached, request);

	try {
		const data = await wmataFetch('/Incidents.svc/json/Incidents', env.WMATA_API_KEY);
		await setCache(cacheKey, data, 60);
		return jsonResponse(data, request);
	} catch (err) {
		return jsonResponse({ error: 'Failed to fetch incidents' }, request, err.status || 500);
	}
}

async function handleElevators(request, env, code) {
	const urlPath = code
		? `/Incidents.svc/json/ElevatorIncidents?StationCode=${code}`
		: '/Incidents.svc/json/ElevatorIncidents';
	const cacheSlug = code ? `elevators/${code}` : 'elevators';
	const cacheKey = new Request(`https://cache.nextmetro.live/api/${cacheSlug}`);

	if (code && !isValidStationCode(code)) {
		return jsonResponse({ error: 'Invalid station code' }, request, 400);
	}

	const cached = await getCached(cacheKey);
	if (cached) return addCors(cached, request);

	try {
		const data = await wmataFetch(urlPath, env.WMATA_API_KEY);
		await setCache(cacheKey, data, 120);
		return jsonResponse(data, request);
	} catch (err) {
		return jsonResponse({ error: 'Failed to fetch elevator status' }, request, err.status || 500);
	}
}

async function handleFare(request, env, from, to) {
	if (!isValidStationCode(from) || !isValidStationCode(to)) {
		return jsonResponse({ error: 'Invalid station code' }, request, 400);
	}
	const cacheKey = new Request(`https://cache.nextmetro.live/api/fare/${from}/${to}`);
	const cached = await getCached(cacheKey);
	if (cached) return addCors(cached, request);

	try {
		const data = await wmataFetch(
			`/Rail.svc/json/jSrcStationToDstStationInfo?FromStationCode=${from}&ToStationCode=${to}`,
			env.WMATA_API_KEY
		);
		await setCache(cacheKey, data, 3600);
		return jsonResponse(data, request);
	} catch (err) {
		return jsonResponse({ error: 'Failed to fetch fare info' }, request, err.status || 500);
	}
}

function handleHealthz(request, env) {
	return jsonResponse(
		{
			status: 'ok',
		},
		request
	);
}

async function handleIndexNow(request, env) {
	const INDEXNOW_KEY = '3b4c9e7a2f1d8e5b';
	const HOST = 'nextmetro.live';
	const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

	// List of all public URLs to submit
	const urls = [
		`https://${HOST}/`,
		`https://${HOST}/alerts/`,
		`https://${HOST}/elevators/`,
		`https://${HOST}/fares/`,
		`https://${HOST}/hours/`,
		`https://${HOST}/about/`,
		`https://${HOST}/crisis/`,
		`https://${HOST}/lines/red/`,
		`https://${HOST}/lines/blue/`,
		`https://${HOST}/lines/orange/`,
		`https://${HOST}/lines/green/`,
		`https://${HOST}/lines/yellow/`,
		`https://${HOST}/lines/silver/`,
		`https://${HOST}/station/metro-center/`,
		`https://${HOST}/station/gallery-place/`,
		`https://${HOST}/station/union-station/`,
		`https://${HOST}/station/brookland-cua/`,
		`https://${HOST}/station/potomac-yard/`,
	];

	try {
		const payload = {
			host: HOST,
			key: INDEXNOW_KEY,
			keyLocation: KEY_LOCATION,
			urlList: urls,
		};

		const response = await fetch('https://api.indexnow.org/indexnow', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
			body: JSON.stringify(payload),
		});

		return jsonResponse({
			status: 'submitted',
			urlCount: urls.length,
			indexNowStatus: response.status,
		}, request);
	} catch (err) {
		return jsonResponse({ error: 'IndexNow submission failed' }, request, 500);
	}
}

// ==============================
// Add CORS headers to cached responses
// ==============================
function addCors(cachedResponse, request) {
	const response = new Response(cachedResponse.body, cachedResponse);
	const cors = corsHeaders(request);
	for (const [key, value] of Object.entries(cors)) {
		response.headers.set(key, value);
	}
	return response;
}

// ==============================
// Router
// ==============================
export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;

		// Redirect www to non-www
		if (url.hostname === 'www.nextmetro.live') {
			url.hostname = 'nextmetro.live';
			return Response.redirect(url.toString(), 301);
		}

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					...corsHeaders(request),
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		// Only allow GET
		if (request.method !== 'GET') {
			return jsonResponse({ error: 'Method not allowed' }, request, 405);
		}

		// Redirect old about.html to clean URL
		if (path === '/about.html') {
			return Response.redirect('https://nextmetro.live/about/', 301);
		}

		// API routing
		if (path === '/api/stations') return handleStations(request, env);
		if (path === '/api/incidents') return handleIncidents(request, env);
		if (path === '/api/elevators') return handleElevators(request, env);
		if (path === '/healthz') return handleHealthz(request, env);
		if (path === '/api/indexnow') return handleIndexNow(request, env);

		// Parameterized routes
		const stationMatch = path.match(/^\/api\/station\/([A-Za-z0-9]+)$/);
		if (stationMatch) return handleStation(request, env, stationMatch[1]);

		const predictionsMatch = path.match(/^\/api\/predictions\/([A-Za-z0-9,]+)$/);
		if (predictionsMatch) return handlePredictions(request, env, predictionsMatch[1]);

		const elevatorsMatch = path.match(/^\/api\/elevators\/([A-Za-z0-9]+)$/);
		if (elevatorsMatch) return handleElevators(request, env, elevatorsMatch[1]);

		const fareMatch = path.match(/^\/api\/fare\/([A-Za-z0-9]+)\/([A-Za-z0-9]+)$/);
		if (fareMatch) return handleFare(request, env, fareMatch[1], fareMatch[2]);

		// Let Cloudflare Assets handle static files (configured in wrangler.toml)
		const assetResponse = await env.ASSETS.fetch(request);

		// Add security headers to HTML responses
		const contentType = assetResponse.headers.get('Content-Type') || '';
		if (contentType.includes('text/html')) {
			const response = new Response(assetResponse.body, assetResponse);
			response.headers.set('X-Content-Type-Options', 'nosniff');
			response.headers.set('X-Frame-Options', 'DENY');
			response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
			response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
			response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
			response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'");
			return response;
		}

		return assetResponse;
	},
};
