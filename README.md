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

---

## Dev Notes

### 6/11/25

- INIT COMMIT init: scaffold frontend with Vite, React, and Material UI dark theme
  - [x] Remoted original nextmetro to nextmetro-v1
