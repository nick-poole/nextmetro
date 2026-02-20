# NextMetro

**Real-time tracker for the Washington D.C. Metrorail system.**

NextMetro displays live train arrivals, system status, service alerts, station facility conditions, and fare information — styled after the Metro's own visual language of concrete vault ceilings, pylon signage, and PIDS boards.

**[Live Site](https://nextmetro.netlify.app)** · **[API Backend](https://nextmetro.onrender.com)**

---

## Features

- **PIDS Arrival Board** — Real-time train arrivals grouped by direction with line colors, car counts, and BRD/ARR status indicators. Auto-refreshes every 25 seconds.
- **Station Selector** — Searchable dropdown covering all 98 WMATA stations with line color indicators and keyboard navigation.
- **Multi-Platform Support** — Stations with multiple platforms (Metro Center, Gallery Place, L'Enfant Plaza, Fort Totten) fetch and merge predictions from both platform codes.
- **System Status Ticker** — Scrolling ticker bar showing real-time status for all six Metro lines (Red, Blue, Orange, Green, Yellow, Silver).
- **System Status Sidebar** — Per-line status with Normal, Delays, and Advisory states derived from live incident data.
- **Service Alerts** — Station-specific incident alerts that filter system-wide incidents to show only what's relevant to the selected station's lines.
- **Elevator & Escalator Status** — Facility outage tracking with operational/outage counts and detailed descriptions.
- **Fare Calculator** — Interactive fare lookup between any two stations showing peak, off-peak, and senior/disabled pricing with estimated travel time.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla HTML5, CSS, JavaScript |
| **Backend** | Express.js v5 (Node.js) |
| **API** | [WMATA Real-Time Rail API](https://developer.wmata.com/) |
| **Typography** | Barlow, Barlow Condensed, JetBrains Mono (Google Fonts) |
| **Frontend Hosting** | Netlify (static, no build step) |
| **Backend Hosting** | Render |

### Dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP server and static file serving |
| `node-fetch` | Server-side HTTP requests to WMATA API |
| `cors` | Cross-origin request handling |
| `dotenv` | Environment variable management |

---

## Architecture

```
nextmetro/
├── server.js              Express backend (API proxy + cache + static serving)
├── package.json
├── .gitignore
├── LICENSE                MIT
├── README.md
└── public/                Static frontend (served by Express and Netlify)
    ├── index.html         Main app page
    ├── about.html         About page
    ├── 404.html           Custom 404 page
    ├── robots.txt
    ├── sitemap.xml
    ├── netlify.toml       Netlify deploy config + API proxy redirects
    ├── css/
    │   └── styles.css     Full design system (~1,170 lines)
    ├── js/
    │   └── app.js         Application logic (~1,060 lines)
    └── images/            Photography assets
```

### API Routes (server.js)

| Route | Description | Cache |
|-------|-------------|-------|
| `GET /api/stations` | All WMATA stations | Infinite |
| `GET /api/station/:code` | Single station info | Infinite |
| `GET /api/predictions/:code` | Real-time train arrivals | None (live) |
| `GET /api/incidents` | System-wide rail incidents | 60s TTL |
| `GET /api/elevators/:code` | Elevator/escalator outages | 120s TTL |
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
- **Typography**: Barlow for UI text, JetBrains Mono for data and system displays
- **AA accessibility**: All text-on-background color combinations meet WCAG AA contrast ratios
- **Zero border-radius**: Sharp rectangular edges throughout (matching pylon sign language)

---

## Changelog

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
