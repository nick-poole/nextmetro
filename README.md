# NextMetro

**Real-time tracker for the Washington D.C. Metrorail system.**

NextMetro displays live train arrivals, system status, service alerts, station facility conditions, and fare information — styled after the Metro's own visual language of concrete vault ceilings, pylon signage, and PIDS boards.

**[Live Site](https://nextmetro.live)** · **[API Backend](https://nextmetro.onrender.com)**

---

## Features

- **PIDS Arrival Board** — Real-time train arrivals grouped by direction with line colors, car counts, and BRD/ARR status indicators. Auto-refreshes every 25 seconds.
- **Station Selector** — Searchable dropdown covering all 98 WMATA stations with line color indicators and keyboard navigation.
- **Multi-Platform Support** — Stations with multiple platforms (Metro Center, Gallery Place, L'Enfant Plaza, Fort Totten) fetch and merge predictions from both platform codes.
- **System Status Ticker** — Scrolling ticker bar showing real-time status for all six Metro lines (Red, Blue, Orange, Green, Yellow, Silver).
- **System Status Sidebar** — Per-line status with Normal, Delays, and Advisory states derived from live incident data.
- **Service Alerts Page** — Dedicated [alerts page](https://nextmetro.live/alerts/) showing all WMATA rail incidents (delays, closures, single tracking, advisories) and elevator/escalator outages system-wide. Severity-sorted, auto-refreshing every 30 seconds, with an 8-question FAQ section covering single tracking, delay causes, station closures, and Metro station depths. Schema.org FAQPage structured data for SEO.
- **Elevator & Escalator Status** — Facility outage tracking with operational/outage counts and detailed descriptions.
- **Fare Calculator** — Interactive fare lookup between any two stations showing peak, off-peak, and senior/disabled pricing with estimated travel time.
- **Line Pages** — Dedicated pages for each Metro line with real-time arrivals, station lists with transfer/parking badges, service hours, frequency info, and an FAQ section with structured data for SEO. Currently live: [Red Line](https://nextmetro.live/lines/red/).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla HTML5, CSS, JavaScript |
| **Backend** | Express.js v5 (Node.js) |
| **API** | [WMATA Real-Time Rail API](https://developer.wmata.com/) |
| **Typography** | Rajdhani (Google Fonts) |
| **Frontend Hosting** | Netlify (static, no build step) |
| **Backend Hosting** | Render |

### Dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP server and static file serving |
| `node-fetch` | Server-side HTTP requests to WMATA API |
| `cors` | Cross-origin request handling |
| `dotenv` | Environment variable management |
| `helmet` | HTTP security headers |
| `express-rate-limit` | API rate limiting (60 req/min per IP) |

---

## Architecture

```
nextmetro/
├── server.js              Express backend (API proxy + cache + static serving)
├── package.json
├── .env.example           Environment variable template
├── .gitignore
├── LICENSE                MIT
├── README.md
├── SECURITY.md            Security policy and measures
├── render.yaml            Render deployment config
└── public/                Static frontend (served by Express and Netlify)
    ├── index.html         Main arrivals app
    ├── about.html         About page
    ├── 404.html           Custom 404 page
    ├── robots.txt
    ├── sitemap.xml
    ├── netlify.toml       Netlify deploy config + API proxy redirects
    ├── alerts/
    │   └── index.html     Service alerts page (rail + elevator/escalator, FAQ)
    ├── fares/
    │   └── index.html     Fare calculator page
    ├── lines/
    │   └── red/
    │       └── index.html Red Line page (stations, service info, FAQ)
    ├── css/
    │   └── styles.css     Full design system (~3,135 lines)
    ├── js/
    │   ├── app.js         Application logic (~1,070 lines)
    │   ├── alerts.js      Alerts page — fetches rail + elevator incidents (~360 lines)
    │   ├── nav.js         Shared navigation bar component (~30 lines)
    │   ├── line.js        Line page logic — arrivals, alerts, FAQ toggle (~355 lines)
    │   └── fares.js       Fare calculator logic (~410 lines)
    └── images/            Photography assets (16 images)
```

### API Routes (server.js)

| Route | Description | Cache |
|-------|-------------|-------|
| `GET /healthz` | Health check (uptime, API key status) | None |
| `GET /api/stations` | All WMATA stations | Infinite |
| `GET /api/station/:code` | Single station info | Infinite |
| `GET /api/predictions/:code` | Real-time train arrivals | None (live) |
| `GET /api/incidents` | System-wide rail incidents | 60s TTL |
| `GET /api/elevators` | All elevator/escalator outages | 120s TTL |
| `GET /api/elevators/:code` | Elevator/escalator outages per station | 120s TTL |
| `GET /api/fare/:from/:to` | Fare info between stations | 1hr TTL |

### Deployment Model

- **Netlify** serves the `public/` directory as a static site with no build step. API requests (`/api/*`) are proxied to the Render backend via `netlify.toml` redirects.
- **Render** hosts the Express server which proxies WMATA API requests with the API key stored as an environment variable.

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- A [WMATA Developer API key](https://developer.wmata.com/)

### Setup

```bash
git clone https://github.com/nick-poole/nextmetro.git
cd nextmetro
npm install
```

Create a `.env` file in the project root:

```
WMATA_API_KEY=your_api_key_here
```

### Run Locally

```bash
npm start
```

The server starts on `http://localhost:3001` and serves the frontend from `public/`.

---

## Design System

The visual design — **Concrete Vault** — is based on the architectural identity of the D.C. Metro:

- **Surface palette**: Warm concrete tones (`#cfc6b9` base) for backgrounds and cards
- **Pylon signage**: Dark brown (`#3b2415`) for headers and navigation
- **PIDS display**: Black screen (`#0a0a0a`) with brightened line colors and amber accents
- **Fare machine**: WMATA blue (`#0077b6`) with orange stripe accents
- **Metro line colors**: Accurate WMATA standard colors for all six lines
- **Typography**: Rajdhani for all UI text and data displays
- **AA accessibility**: All text-on-background color combinations meet WCAG AA contrast ratios
- **Zero border-radius**: Sharp rectangular edges throughout (matching pylon sign language)

---

## Changelog

### v2.2.0 — Service Alerts Page

- Add dedicated alerts page with all WMATA rail incidents and elevator/escalator outages
- System-wide elevator/escalator API endpoint (`GET /api/elevators`)
- Severity-sorted unified alert list: delays, closures, single tracking, advisories, elevator/escalator outages
- Station location pills with map-pin icons for facility outages
- Per-line status summary bar and scrolling system ticker
- 8-question FAQ section covering single tracking, delay causes, station closures, Metro depths, and more
- Schema.org FAQPage + SpecialAnnouncement structured data for SEO
- SEO-optimized title, meta descriptions, and Open Graph tags
- Alerts link added to site-wide footer under Tools
- Fix ticker animation for seamless continuous scroll (removed padding-left reset)

### v2.1.0 — Line Pages

- Add dedicated Red Line page with all 27 stations, transfer badges, parking indicators, and external rail connections (Amtrak, MARC, VRE, DC Streetcar)
- Real-time arrival boards and service alerts on the line page via WMATA API
- Service hours table, train frequency info, and end-to-end travel time
- 10-question FAQ section with schema.org FAQPage structured data for SEO
- Shared nav component (`nav.js`) and line page logic (`line.js`)
- Concrete Vault design extended with line page styles (~3,135 total CSS lines)

### v2.0.0 — Full WMATA API Integration & Brand Overhaul

- Implement full WMATA API integration with 6 backend routes and tiered caching strategy
- Concrete Vault design system (v7) with PIDS-style arrival display
- Searchable station selector with line color indicators and keyboard navigation
- Multi-platform station support (Metro Center, Gallery Place, L'Enfant Plaza, Fort Totten)
- Real-time system status ticker and sidebar driven by live incident data
- Station-specific service alerts
- Elevator and escalator outage tracking
- Fare calculator with peak/off-peak/senior pricing
- Restructured from React/Vite to vanilla HTML/CSS/JS for zero-build deployment
- Express backend proxy to secure WMATA API key server-side
- Netlify static hosting with Render backend deployment
- Mobile-responsive layout with 768px and 900px breakpoints

### v1.0.0 — Initial Build

- Frontend-only scaffold with React, Vite, and Material UI
- Station select dropdown, NavBar, HeroBanner, and Footer components
- Mock train card layouts for design exploration

---

## License

[MIT](LICENSE) — Nick Poole

---

## Disclaimer

NextMetro is an independent project. It is not affiliated with, endorsed by, or connected to the Washington Metropolitan Area Transit Authority (WMATA). All transit data is sourced from the [WMATA Developer API](https://developer.wmata.com/).
