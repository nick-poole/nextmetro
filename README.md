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
