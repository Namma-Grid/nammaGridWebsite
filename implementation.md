# NammaGrid — Implementation Document

> Spatio-Temporal Intelligence for Grid-Aware EV Infrastructure Planning

## Project Overview

**NammaGrid** is a decision-support dashboard built for BESCOM's EV charging optimization challenge at the AI for Bharat Hackathon 2026. It provides three core intelligence layers:

1. **Hex Grid Mapping** — Bengaluru city divided into H3 hexagonal cells classified by zone type
2. **EV Route Intelligence** — Shortest-path visualization with EV density per segment
3. **Grid Demand Prediction** — 24-hour demand forecasting with heatmap + time-series charts

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Map Engine | Leaflet + dynamic import | 1.9.x |
| Hex Grid | H3-js (Uber's H3 library) | via JSON data |
| Charts | Recharts | latest |
| Tile Provider | CartoDB Dark Matter | Free, no API key |
| Font | Geist Sans / Geist Mono | Google Fonts |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Next.js App Router                         │
│  layout.tsx (Server) → page.tsx (Client Dashboard)           │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  Section 1:     │  │  Section 2:     │  │  Section 3:     │ │
│  │  Hex Grid Map   │  │  EV Route Map   │  │  Demand Pred.   │ │
│  │  (Leaflet)      │  │  (Leaflet)      │  │  (Leaflet +     │ │
│  │                 │  │                 │  │   Recharts)     │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                  Data Layer                               ││
│  │  bangalore-hex-grid.json  │  ev-routes.ts  │  demand.ts   ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Client vs Server Components

- `layout.tsx` — **Server Component** (metadata, fonts, Leaflet CSS)
- `page.tsx` — **Client Component** (`'use client'`) — manages all interactive state
- All map components — **Client Components** loaded via `next/dynamic` with `ssr: false`
- `SectionWrapper`, `ZoneLegend`, `RouteStats` — **Server Components** (no state)

---

## File Structure

```
app/
├── layout.tsx                      Root layout (metadata, fonts, dark mode)
├── globals.css                     Design system (dark theme, glassmorphism)
├── page.tsx                        Main dashboard (client component)
│
├── components/
│   ├── Navbar.tsx                  Navigation with section scroll
│   ├── SectionWrapper.tsx          Reusable glass card section
│   ├── ZoneLegend.tsx              Zone color legend
│   ├── HexGridMap.tsx              H3 hex grid map (Leaflet, client)
│   ├── LocationPicker.tsx          Uber/Ola-style location search
│   ├── EVRouteMap.tsx              Route visualization (Leaflet, client)
│   ├── RouteStats.tsx              Route statistics display
│   ├── DateTimeSelector.tsx        Date/time picker for predictions
│   ├── DemandChart.tsx             24h demand curve (Recharts, client)
│   └── DemandHeatmap.tsx           Demand heatmap (Leaflet, client)
│
├── data/
│   ├── ev-routes.ts                Location data + route generation
│   └── demand-predictions.ts       Demand curve generators by zone
│
└── lib/
    ├── types.ts                    TypeScript interfaces
    └── map-config.ts               Map constants + zone colors

bangalore-hex-grid.json             H3 hex grid data (1,519 cells)
```

---

## Data Model

### Hex Grid Cell
Each cell in `bangalore-hex-grid.json` contains:
- `h3Index` — Uber H3 spatial index (resolution 8, ~461m diameter)
- `zone` — Land-use classification: `residential` | `workplace` | `marketplace`
- `nearestArea` — Human-readable area name (47 unique areas)
- `center` — Cell centroid `{lat, lng}`
- `boundary` — 6-vertex polygon in `{lat, lng}` format

At runtime, cells are enriched with synthetic demand data:
- `demanded` — Boolean (true if demand level > 55%)
- `demandLevel` — 0-100 normalized score
- `evCount` — Estimated EV count in the zone

### EV Routes
Generated dynamically between any two of 24 pre-defined Bangalore locations:
- Interpolated polyline path with slight curves for realism
- EV count per segment (seed-based for consistency)
- Haversine distance calculation
- Travel time estimate (25 km/h city average)

### Demand Predictions
Zone-specific demand curves:
- **Residential** — Peaks 5-9 PM (post-work home charging)
- **Workplace** — Peaks 9 AM-5 PM (office charging)
- **Marketplace** — Peaks 11 AM-8 PM (shopping area charging)

Each curve varies by area name (seeded) and date offset.

---

## Key Design Decisions

### 1. Why Leaflet (not Deck.gl)?
Leaflet is lightweight (~40KB), works well for ~1,500 polygons, and has simpler SSR handling. Deck.gl would be overkill for this cell count and adds ~200KB to the bundle.

### 2. Why Dynamic Import for Maps?
Leaflet uses `window` and `document` APIs. Next.js server-renders by default, so we use `next/dynamic` with `ssr: false` to load map components only on the client.

### 3. Why Fresh Div Creation?
React 18 Strict Mode double-mounts components in development. Leaflet tracks `_leaflet_id` on DOM elements, so reusing the same div causes "Map container is already initialized" errors. Creating a fresh `<div>` on each mount avoids this.

### 4. Why Synthetic Data?
The AI/ML models will be integrated later. The data layer uses clean TypeScript interfaces, so real model outputs can replace the mock generators with zero UI changes.

---

## Design System

- **Theme**: Dark mode only (forced via `color-scheme: dark`)
- **Background**: Navy gradient `#0a0f1e → #111827` with subtle grid pattern
- **Cards**: Glassmorphism (`backdrop-filter: blur(16px)`, 4% white)
- **Colors**: Electric Blue `#3B82F6`, Amber `#F59E0B`, Emerald `#10B981`
- **Map**: CartoDB Dark Matter tiles (free, no API key)
- **Typography**: Geist Sans (headings), Geist Mono (data)
- **Animations**: Scroll-triggered fade-in, staggered stats, hex hover glow

---

## Sections

### Section 1: Bengaluru Hex Grid
- 1,519 H3 cells at resolution 8
- Color-coded by zone type (blue=residential, amber=workplace, green=marketplace)
- High-demand cells highlighted with amber border + higher opacity
- Hover tooltip shows area name, zone, demand level, EV count
- Click to select → detail panel slides up

### Section 2: EV Route Intelligence
- Uber/Ola-style location picker with search-as-you-type
- 24 pre-defined Bangalore locations (MG Road, Koramangala, Whitefield, etc.)
- Route drawn as colored segments (green=few EVs → red=many EVs)
- Origin/destination markers with gradient icons
- EV count labels along the route
- Stats panel: total EVs, distance, travel time, charging stations

### Section 3: Grid Demand Prediction
- Date selector (7 days ahead)
- Time slider (0-23h) with gradient scale
- Quick presets: Morning Peak, Afternoon, Evening Peak, Off-Peak
- Area selector (20 areas from grid data)
- **Left panel**: 24-hour demand curve (Recharts area chart)
- **Right panel**: City-wide demand heatmap (blue→red gradient)
- Click heatmap cell → auto-selects area for chart

---

## How to Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

---

## Future Integration Points

| Component | Current | Future (ML Model) |
|-----------|---------|-------------------|
| Zone Classification | Static from JSON | Attentive Hypergraph Neural Network |
| Demand Prediction | Synthetic curves | Gated Temporal Attention + Variable Selection Network |
| Route EV Count | Seed-based random | Graph Attention Network (GAT) adjacency model |
| Charging Station Siting | Count-based | Grid-Constrained Siting algorithm |

### Integration API

The data layer in `app/data/` exposes these functions that can be replaced with API calls:

```typescript
// Replace with real model inference
generate24hPrediction(zone, areaName, dateOffset) → HourlyDemand[]
generateDemandSnapshot(cells, hour) → Map<h3Index, demand>
generateRoute(originId, destId) → EVRoute
```

---

## Team

Built for the **BESCOM × AI for Bharat Hackathon 2026**

Project: **CurrentState** — Spatio-Temporal Intelligence for Grid-Aware EV Infrastructure
