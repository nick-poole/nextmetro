# NextMetro

**A full-stack real-time tracker for the Washington D.C. Metrorail system.**

NextMetro is a backend-powered rebuild of a previous frontend-only project. This version uses an Express server to proxy and cache data from the WMATA API, with a React + Material UI frontend for a clean, mobile-first UI. Designed to simulate a production-grade architecture with API handling, environment separation, and deployment-ready structure.

---

## Tech Stack

- Frontend: React, Vite, Material UI
- Backend: Express.js (Node)
- API Source: WMATA Real-Time Rail API
- Deployment: Netlify (frontend), Railway or Render (backend)

---

## Key Features

- Real-time train arrival data by station
- Express backend proxy to handle API key securely
- Custom Material UI components styled by Metro line
- Modular structure for future expansions (favorites, auth, DB support)
- Designed for dark mode and mobile-first layouts

### Station Selector

Includes a fully loaded `<Select>` dropdown of all WMATA station codes and names, ordered by official station code (e.g. A01, A02, etc).

This select will later be wired to trigger real-time train data queries for the selected station using the WMATA API.

Future roadmap may include:

- Grouping by Metro line
- Dual dropdowns (Line → Station)
- Favorite station support
- Typeahead or search input

---

## Dev Notes

### 6/14/25

- fix(cors): enable cross-origin requests for frontend on Netlify

### 6/13/25

- chore: configure dynamic API_BASE_URL for dev/prod environments

  - Added src/config.js to detect production mode via Vite’s import.meta.env.PROD
  - Updated StationFeed to fetch from API_BASE_URL + /api/predictions/:stationCode
  - Ensures seamless switching between local proxy and live Render backend

- chore: prepare backend for Render deployment

- feat: integrate Express backend, real-time WMATA API, station feed, and live TrainCard UI

  - Installed and configured Express server with WMATA API key via .env
  - Created /api/predictions/:stationCode route to fetch real-time train data
  - Set up proxy in Vite for dev requests to backend
  - Created StationFeed component to fetch + render train data from backend
  - Hooked StationSelect dropdown to dynamically update selected station feed
  - Default station set to Brookland-CUA (B05) as homage
  - Built final TrainCard UI (renamed from TrainCard3) with MUI design system
  - Status chips (ARR, BRD) now flash with animated text for live effect
  - Card layout, colors, and fonts refined for metro-style realism

- refactor: clean up TrainCard3 layout and remove unused props

  - Removed trainId and direction props (not needed in current UI)
  - Simplified status chip with square corners and neon orange text
  - Reorganized card layout for better alignment and spacing
  - Removed serviceType block for now (separate API)
  - Finalized font choices and color styling to match WMATA aesthetic

### 6/12/25

- chore: imports fonts, updates TrainCard3 with flex layout for ETA

- feat: scaffold multiple train card layouts and seed mock data for design exploration

- feat: add footer with © 2025, system links, and v2 beta label

### 6/11/25

- feat: add station select dropdown with full station code list

- feat: add NavBar and HeroBanner components
  - Implement a sticky NavBar and rotating HeroBanner with local image support, overlay text, and Material UI theming.

- INIT COMMIT init: scaffold frontend with Vite, React, and Material UI dark theme
  - [x] Remoted original nextmetro to nextmetro-v1
