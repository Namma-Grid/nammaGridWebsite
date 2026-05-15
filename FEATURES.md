# NammaGrid — Implemented Features

**Project:** NammaGrid — EV Charging Intelligence for Bengaluru  
**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Leaflet, H3-JS, Three.js, Recharts  
**Backend:** BESCOM EV AI (ML forecasting, LP optimization) + BESCOM EV Agent (LLM insights)

---

## Pages & Routes

| Route             | Page                            | Description                                 |
| ----------------- | ------------------------------- | ------------------------------------------- |
| `/`               | Home Dashboard                  | Hero, feature cards, stat grid, navigation  |
| `/hexgrid`        | Hex Grid Explorer               | H3 spatial index, zone map                  |
| `/demand`         | Grid Demand Prediction          | ML forecast, heatmap, AI insights           |
| `/routes`         | EV Route Intelligence           | Origin/dest picker, shortest path, stations |
| `/schedule`       | Charging Schedule Optimizer     | LP optimization, load profiles, AI panels   |
| `/infrastructure` | Infrastructure Location Planner | ML-scored site recommendations, AI panels   |
| `/explore`        | 3D City Explorer                | Three.js cityscape, vehicle nav, HUD        |

---

## Feature 1 — Home Dashboard (`/`)

- Hero section with tagline and CTA
- 6 feature cards linking to all feature pages
- Stats grid: 1,519 hex cells, zone breakdowns (residential/workplace/marketplace)
- Technology badge strip (H3, Leaflet, Three.js, BESCOM AI, OSRM, Recharts)
- Responsive layout, glass morphism styling

---

## Feature 2 — Bengaluru Hex Grid Explorer (`/hexgrid`)

- H3 hexagonal spatial index at resolution 8 — 1,519 cells covering Bengaluru
- Zone classification:
  - Residential: 471 cells
  - Workplace: 391 cells
  - Marketplace: 657 cells
- Interactive Leaflet map with color-coded demand levels
- Real-time EV count per hex cell
- Click-to-zoom with cell info popups
- Zone legend with counts and percentages
- Data source: `bangalore-hex-grid.json` (1.5 MB static H3 dataset)

---

## Feature 3 — Grid Demand Prediction (`/demand`)

### Controls

- Date offset selector
- Hour selector (0–23)
- Area/zone dropdown (10 BESCOM zones: Koramangala, Whitefield, Indiranagar, etc.)
- Manual refresh + cache bust

### Forecast Panel

- 24-hour ML demand forecast (GradientBoosting model via BESCOM AI)
- EV load + base grid load decomposition
- Recharts area chart visualization
- Peak hour detection with alerts

### Heatmap

- City-wide demand heatmap by zone
- Leaflet-based with intensity = demand level
- Synced to selected hour

### AI Insights

- Context-aware LLM agent analysis per zone/hour
- Markdown-rendered response panel
- 10-min response cache

---

## Feature 4 — EV Route Intelligence (`/routes`)

### Location Selection

- Origin + destination pickers (Uber/Ola-style searchable dropdown)
- 24 major Bengaluru locations: MG Road, Koramangala, Whitefield, Indiranagar, Electronic City, HSR Layout, Jayanagar, JP Nagar, Banashankari, Yelahanka, Hebbal, Marathahalli, Bellandur, Sarjapur, Tumkur Road, Mysore Road, Kanakapura Road, Hosur Road, Old Madras Road, Bellary Road, ITPL, Bommanahalli, BTM Layout, Rajajinagar

### Routing Engine

- Dijkstra shortest-path on 58-edge road network graph (client-side)
- OSRM distance & duration calculation (real road geometry)
- Route polyline rendered on Leaflet map

### EV Intelligence

- EV density per route segment (color-coded: green/yellow/orange/red)
- Charging station discovery within 1.5 km of route
- Station markers with name, capacity (kW), operator

### Route Stats Panel

- Total EVs along route
- Distance (km)
- Estimated travel time
- Number of stations on path
- Segment count

---

## Feature 5 — Charging Schedule Optimizer (`/schedule`)

### Load Profile Visualization

- 24-hour load grid heatmap (per-hour cells: optimal/low/moderate/high/peak)
- Zone-type selector: residential / workplace / marketplace
- Area selector synced to BESCOM zones
- Color key for load levels

### LP Optimization Results (BESCOM AI)

- LP peak-shaving optimization output
- Peak load reduction percentage
- Managed vs unmanaged EV load comparison (MW)
- Optimal charging window identification
- Recharts bar chart for managed vs unmanaged

### AI Insight Panels (5 panels, lazy-loaded)

1. **AI Schedule Recommendations** — Zone-specific optimal schedule
2. **Load Shift Impact** — 60% EV adoption scenario analysis
3. **Off-Peak Tariff Benefits** — Cost savings for shifting to off-peak
4. **Smart Charging Tips** — EV owner guidance
5. **Grid Alignment Score** — Overall grid-schedule fit evaluation

---

## Feature 6 — Infrastructure Location Planner (`/infrastructure`)

### Stats Overview

- 1,519 total H3 cells analyzed
- Zone distribution with progress bars (residential/workplace/marketplace)
- Summary metrics: total EV count, station count, coverage ratio

### Station Recommendations (BESCOM AI)

- ML-scored site recommendations (composite score 0–100)
- Priority ranking: URGENT / HIGH / MEDIUM
- 23 recommended locations
- Columns: location, zone type, demand pressure, EV growth rate, composite score, priority
- Sortable table

### Underserved Zones

- Zones with < 2 ports per 1,000 EVs
- Coverage gap quantification
- Demand pressure normalization

### AI Insight Panels (8 panels, lazy-loaded)

1. **Priority Zones** — Urgency ranking with rationale
2. **High-Growth EV Corridors** — Trend analysis for emerging demand corridors
3. **AI vs Baseline Placement** — Comparison: ML-scored vs naive placement
4. **Grid Capacity & Load Constraints** — Transformer and feeder limits
5. **Demand Growth Projection** — Quarterly forecast 2025–2027
6. **Infrastructure Plan Evaluation** — Scoring of current plan
7. **Top 5 Risks & Mitigations** — Coverage, grid stress, funding, land acquisition, adoption
8. **3-Phase Implementation Roadmap** — Phased deployment plan

---

## Feature 7 — 3D City Explorer (`/explore`)

### Scene (Three.js)

- Procedurally generated Bengaluru cityscape
- Realistic building density and layout variation
- Ground plane with road grid

### Player Vehicle

- WASD / arrow key navigation
- Adjustable FOV (cycle with key)
- Collision detection on road/building geometry
- Speed visualization

### Live Intelligence Overlay

- Nearest charging station: name, capacity (kW), real-time distance
- Nearest priority zone: name, distance
- Grid load bar visualization

### HUD (2D overlay on 3D scene)

- Vehicle position (x, z coordinates)
- Vehicle heading angle
- Speed indicator
- Time-of-day simulation (hourly cycle)
- Station and zone proximity readouts

---

## Feature 8 — Global Chat Agent (all pages)

- Floating chat widget (bottom-right, persistent across all pages)
- BESCOM EV Agent integration (LLM backend)
- Full message history in session
- 6 quick-suggestion query buttons
- Markdown rendering (bold, code, lists, links)
- 10-min per-query response cache
- Live status indicator
- Context-aware: understands demand zones, grid load, infrastructure

---

## Feature 9 — Navigation & Layout

### Navbar

- Fixed top bar with glass morphism scroll effect
- Desktop menu: Home, Hex Grid, Demand, Routes, Planner (dropdown)
- Planner dropdown: Schedule Optimizer + Infrastructure Planner
- Mobile hamburger menu
- Active route highlight
- Live status dot

### Footer

- Project credits
- Tech stack attribution

### Layout Shell

- `layout.tsx` wraps all pages
- Navbar + footer on every page
- ChatBot injected globally
- Dynamic imports for heavy components (Leaflet, Three.js)

---

## Data & APIs

### Static Data

| File                      | Contents                                                  |
| ------------------------- | --------------------------------------------------------- |
| `bangalore-hex-grid.json` | 1,519 H3 cells, zone types, coordinates, area names       |
| `ev-routes.ts`            | 24 Bengaluru locations, 58-edge road graph, Dijkstra impl |
| `charging-stations.ts`    | Pre-defined station list with coordinates, kW, operator   |
| `explore-stations.ts`     | Stations + priority zones for 3D explorer                 |

### External APIs

| Service         | Endpoints Used                                                                                                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BESCOM EV AI    | `/forecast/{zone}`, `/schedule/{zone}`, `/locations/recommend`, `/locations/underserved`, `/grid/status`, `/grid/risk`, `/grid/stress`, `/zones`, `/data/summary`, `/data/profile/{zone}`, `/report/{zone}` |
| BESCOM EV Agent | `/agent/chat` (POST — LLM insights)                                                                                                                                                                         |
| OSRM            | `/route/v1/driving/{coords}` (real road distance/duration)                                                                                                                                                  |

### Client-Side Caching

- BESCOM AI responses: 5-min cache per endpoint+params
- Agent LLM responses: 10-min cache per query string
- In-flight request deduplication on agent calls

---

## Component Inventory

| Component          | Used In                                  |
| ------------------ | ---------------------------------------- |
| `Navbar`           | All pages (layout)                       |
| `ChatBot`          | All pages (layout)                       |
| `SectionWrapper`   | All feature pages                        |
| `HexGridMap`       | `/hexgrid`                               |
| `ZoneLegend`       | `/hexgrid`                               |
| `DemandHeatmap`    | `/demand`                                |
| `DateTimeSelector` | `/demand`                                |
| `AgentInsights`    | `/demand`                                |
| `AgentPanel`       | `/schedule`, `/infrastructure`           |
| `EVRouteMap`       | `/routes`                                |
| `LocationPicker`   | `/routes`                                |
| `RouteStats`       | `/routes`                                |
| `CityScene`        | `/explore`                               |
| `CityHUD`          | `/explore`                               |
| `MarkdownView`     | `ChatBot`, `AgentInsights`, `AgentPanel` |

---

## Architecture Notes

- All pages use `'use client'` (client-side rendering)
- Heavy components (Leaflet maps, Three.js) loaded via `dynamic(() => import(...), { ssr: false })`
- Path alias `@/*` maps to `src/`
- `resolveJsonModule: true` for direct H3 JSON import
- No internal API routes — all data fetched from external BESCOM services

---

_Last updated: 2026-05-15_
