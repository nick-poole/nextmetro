<div align="center">

<img src="public/images/og/homepage-utility/og-homepage.png" alt="NextMetro — Real-time DC Metro arrival times and system info" width="720" />

# NextMetro

**Real-time arrival tracker for the Washington D.C. Metrorail system.**

Live train predictions, service alerts, elevator/escalator status, fare calculator, and station info for all 98 WMATA stations — built as a fast, zero-framework static site on Cloudflare Workers.

[![Live Site](https://img.shields.io/badge/Live_Site-nextmetro.live-D4A03C?style=for-the-badge)](https://nextmetro.live)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-Source_Available-333333?style=for-the-badge)](#license)

</div>

---

## What It Does

NextMetro is an independent, real-time dashboard for the D.C. Metro system. It pulls live data from the [WMATA API](https://developer.wmata.com/) and presents it through a design language inspired by the Metro's own architecture — concrete vaults, PIDS boards, pylon signage.

### Pages & Features

| Page | What It Shows |
|------|--------------|
| **[Station Pages](https://nextmetro.live/station/metro-center/)** | PIDS arrival board, system status, service alerts, elevator/escalator status, fare calculator, adjacent stations with the full line context, and a location card with a build-time line map (Google Maps loads only on click). Transfer stations (Metro Center, Gallery Place) show dual side-by-side boards — one per physical platform. |
| **[Line Pages](https://nextmetro.live/lines/red/)** | All stations on the line with transfer/parking badges, real-time status, service hours, frequency info, and FAQ. All 6 lines covered. |
| **[Service Alerts](https://nextmetro.live/alerts/)** | Active WMATA rail incidents — delays, closures, single tracking, advisories — severity-sorted and auto-refreshing. |
| **[Elevator & Escalator Status](https://nextmetro.live/elevators/)** | System-wide outage tracker grouped by station, filterable by type and line. |
| **[Fare Calculator](https://nextmetro.live/fares/)** | Peak/off-peak/senior pricing between any two stations with travel time estimates, commute cost projections, and result links into the trip's station and line pages. |
| **[Fare Guides](https://nextmetro.live/fares/dulles-airport/)** | Six pages under `/fares/` answering the high-intent fare questions: both airports, the cheapest time to ride, how to pay, whether a monthly pass pays off, and reduced fares. Fares and ride times come from the same WMATA proxy as the calculator. |
| **[Hours & Schedules](https://nextmetro.live/hours/)** | Operating hours, frequency tables, holiday schedules. |
| **[Homepage](https://nextmetro.live/)** | Station search, live alert preview, quick links. |

### Technical Highlights

- **Zero build step** — Vanilla HTML, CSS, and JavaScript. No framework, no bundler, no node_modules on the frontend.
- **Cloudflare Workers** — API proxy with tiered caching. Static assets served at the edge.
- **WCAG AA accessible** — Skip links, ARIA labels, keyboard navigation, contrast-compliant color system.
- **SEO-optimized** — Schema.org structured data (TrainStation, FAQPage, BreadcrumbList, SpecialAnnouncement), OG images for every page and all 98 stations, canonical URLs, sitemap.
- **25-second polling** — Arrival predictions auto-refresh. Incidents refresh every 30–60 seconds.
- **GDPR/CCPA compliant** — Cookie consent banner, GPC signal detection, conditional analytics loading, self-hosted fonts. Zero third-party requests without user consent.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla HTML5, CSS, JavaScript |
| **Backend** | Cloudflare Workers (API proxy + caching) |
| **Data Source** | [WMATA Real-Time Rail API](https://developer.wmata.com/) |
| **Analytics** | [Umami](https://umami.is/) (cookie-free) + [PostHog](https://posthog.com/) (consent-only) |
| **Typography** | [Rajdhani](https://fonts.google.com/specimen/Rajdhani) (self-hosted) |
| **Hosting** | Cloudflare (Workers + static assets at the edge) |

---

## Design System

The visual identity — **Neutral Brutalist** — draws from the architectural language of the D.C. Metro:

- **Dark surface palette** — `#0A0A0A` background, `#141414` cards, `#1E1E1E` elevated surfaces
- **Amber accent** — `#D4A03C` for interactive elements, inspired by WMATA signage
- **PIDS display** — Black screen with brightened WMATA line colors and monospace-style data
- **Zero border-radius** — Sharp rectangular edges throughout, matching pylon sign geometry
- **WCAG AA contrast** — Every text/background combination meets accessibility standards
- **Typography** — Rajdhani across all UI, uppercase station names, tabular arrival data

### WMATA Line Colors

```
Red    #D41140  ████  |  Orange  #F09500  ████
Blue   #00A8E8  ████  |  Green   #00BD45  ████
Yellow #FFD400  ████  |  Silver  #9BA5A5  ████
```

---

## Project Timeline

This project has been built iteratively from a React prototype to a production-grade Cloudflare Workers site over ~9 months.

| Date | Milestone | Details |
|------|-----------|---------|
| **Jun 2025** | **v1.0 — Initial prototype** | React + Vite + Material UI scaffold. Station dropdown, mock train cards, design exploration. |
| **Jun 2025** | **v2.0 — Full WMATA integration** | Rewrote from React to vanilla HTML/CSS/JS. Express backend proxy, real-time arrivals, fare calculator, system status. Deployed on Netlify + Render. |
| **Feb 2026** | **Cloudflare migration** | Moved entire stack to Cloudflare Workers. Single deployment for API proxy + static assets. Eliminated cold starts. |
| **Feb 2026** | **v2.1 — Line pages** | 6 dedicated line pages with station lists, transfer badges, parking indicators, service info, and FAQ sections. |
| **Feb 2026** | **v2.2 — Alerts page** | Rail service alerts with severity sorting and SpecialAnnouncement schema. Elevator/escalator outages split to dedicated page. |
| **Feb 2026** | **v2.3 — Elevator status** | Station-grouped outage view with dual filter system. Accessibility-first sorting (elevator outages surface first). |
| **Mar 2026** | **v2.5 — Site-wide audit** | WCAG compliance pass, skip navigation on all pages, Schema.org structured data everywhere, meta/OG tags audit, static status bar. |
| **Mar 2026** | **v2.6 — Station pages** | 5 dedicated station pages including dual-PIDS transfer stations (Metro Center, Gallery Place). Search navigation. |
| **Mar 2026** | **v2.7 — Performance** | CSS code splitting (5,700-line monolith → 433 core + 11 page-specific files). JS DRY refactor (shared.js eliminates ~680 lines of duplication across 6 files). Comprehensive site audit + IndexNow integration. |
| **Aug 2026** | **v2.8 — Internal linking + location** | Data-driven internal link graph across all 98 station pages, 6 line pages, /fares/ and /hours/ (generators in `tools/`, route order lifted into the data model). /fares/ dead-click fix. Station Location card with a build-time SVG line map and click-to-load Google Maps. |

| **Aug 2026** | **v2.9 — Fare guide cluster** | Six fare-intent pages under `/fares/`, hub-and-spoke linked, with per-page hero photography and social cards. WMATA station links moved into the data model and 19 dead URLs corrected after WMATA's May 2026 site rebuild. New external link audit; HTML validity errors across `public/` down from 217 to 2. |

---

## Contributing

Contributions are welcome. If you're interested in helping improve NextMetro:

1. **Open an issue first** — Describe what you want to change and why. This prevents duplicate work and ensures alignment.
2. **Fork and branch** — Create a feature branch from `main`.
3. **Keep it focused** — One feature or fix per PR. Small PRs are easier to review.
4. **Test locally** — Make sure the site works before submitting. See [Local Development](#local-development) below.
5. **Submit a PR** — Reference the issue number in your PR description.

### What Would Be Helpful

- Additional station pages (only 5 of 98 stations have dedicated pages so far)
- Mobile UX improvements
- Performance optimizations
- Accessibility improvements
- Bug reports from real Metro riders

### Local Development

**Prerequisites:** Node.js v18+, a [WMATA Developer API key](https://developer.wmata.com/)

```bash
git clone https://github.com/nick-poole/nextmetro.git
cd nextmetro
npm install
```

Set your WMATA API key as a Cloudflare Workers secret:

```bash
npx wrangler secret put WMATA_API_KEY
```

Start the local dev server:

```bash
npm start
```

### Internal link modules

The station, line, fares, and hours pages carry generated blocks: hero line
pills, the Adjacent Stations extension, route-order station indexes, and the
station Location card with its build-time map, and the two outbound links to
WMATA's own page for the station. They are derived from
`public/data/stations.json` and `public/data/lines.json` — never edited by hand
across the 98 station files. WMATA's URL is not derivable from ours (they
abbreviate unpredictably, and the Silver Line Phase 2 stations sit under a
different path entirely), so each station carries a `wmataUrl`; correcting one
there updates all three references on that page.

```bash
npm run build:links      # regenerate every marked block, then audit the link graph
npm run audit:links      # link graph only: inbound counts, broken internal links
npm run audit:external   # outbound links: status codes, redirects, soft 404s
```

`audit:external` is the companion to `audit:links`, which only ever sees URLs
inside `public/`. It requests each distinct external URL once, follows
redirects, and reports the chain. A rebuilt site often serves its own
"page not found" screen with a 200, so any HTML 200 is fetched and scanned for
not-found wording and reported as a soft 404; hosts that bot-block are listed
separately and do not fail the run. `--dry-run` prints the inventory grouped by
host without touching the network.

Each generated region is delimited by `nm:links:*` markers and is safe to
re-run; the scripts replace the block in place. `npm run audit:links --
--page /fares/` prints the inbound links for a single URL.

---

## Security

Security details are documented in [SECURITY.md](SECURITY.md).

If you discover a vulnerability, **do not** open a public issue. Please email [contact@nextmetro.live](mailto:contact@nextmetro.live) directly.

---

## License

**Source Available — Not Open Source**

Copyright (c) 2025–2026 Nick Poole. All rights reserved.

The source code of this project is made available for **viewing and educational purposes only**. You may:

- Read, study, and learn from the code
- Submit contributions (pull requests) to this repository
- Reference the code in blog posts or educational materials with attribution

You may **not**:

- Deploy, host, or run any copy of this project (in whole or in part)
- Use the code, design, or assets in your own projects
- Redistribute, sublicense, or sell the code or any derivative work
- Remove or alter copyright notices

Contributions submitted via pull request are licensed to the project under the same terms.

For questions about usage or licensing, contact [contact@nextmetro.live](mailto:contact@nextmetro.live).

---

## Disclaimer

NextMetro is an independent project. It is not affiliated with, endorsed by, or connected to the Washington Metropolitan Area Transit Authority (WMATA). All transit data is sourced from the [WMATA Developer API](https://developer.wmata.com/).
