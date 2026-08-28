# Nirnay

Nirnay (निर्णय) means "decision" in Sanskrit and Hindi.

Nirnay is an AI-assisted emergency decision command dashboard. It combines map data, simulated crisis intelligence, road risk, route planning, what-if simulations, timeline playback, and explainable recommendations in one operator workspace.

> Nirnay is a decision-support prototype. It does not replace official emergency management systems or professional emergency commanders.

## Current Capabilities

- Direct dashboard startup with no login or credential requirement.
- Home command dashboard with crisis metrics, priority zones, intelligence summaries, and navigation.
- Leaflet tactical map with OpenStreetMap tiles and road geometry loaded from the Overpass API.
- Road classification as open, at risk, or blocked based on proximity to the simulated affected zone.
- Hospitals, police stations, and emergency helpline markers with district-aware fallback locations.
- Nearby services that remain visible immediately while external map data loads.
- Hospital selection with OSRM emergency route calculation and alternate-route comparison.
- Road confidence details with simulated citizen, sensor, satellite, and rover evidence.
- Road-closure what-if simulation with impact estimates and alternate-route recommendations.
- Transparent multi-factor risk scores using flood depth, traffic, evidence volume, connected zones, and current status.
- Deterministic disaster timeline playback that can move forward, backward, or jump between events.
- AI explanations and crisis chat through Google Gemini when configured, with deterministic fallback responses.
- Simulated rover, drone, ambulance, and helicopter status views.
- 2D tactical map and procedural Three.js 3D crisis map.
- District switching for the configured Andhra Pradesh and Telangana demonstration areas.
- Local profile editing with optional profile-picture upload and removal.
- Startup splash screen with rotating disaster imagery and Nirnay branding.

## Technology Stack

| Layer | Current implementation |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 and project CSS |
| State | Zustand |
| 2D map | React Leaflet and Leaflet |
| 3D map | Three.js |
| Map data | OpenStreetMap tiles and Overpass API |
| Routing | OSRM public routing API |
| Server | Express and TypeScript in `server.ts` |
| Database | Supabase PostgreSQL through `@supabase/supabase-js` |
| AI | Google Gemini through `@google/genai` |
| Deployment | Vite static build or the bundled Express server |

## Architecture

```text
React / Vite frontend
        |
        | fetch('/api/...')
        v
Express server (server.ts)
        |
        +-- Supabase data when configured
        +-- bundled mock crisis data fallback
        +-- Google Gemini when GEMINI_API_KEY exists
        |
        +-- browser-side Overpass and OSRM map services
```

The application is intentionally fallback-driven for demonstrations. If the root API or Supabase is unavailable, the frontend can use the bundled scenario data in `src/data/mockCrisisData.ts`. Map services such as Overpass, OSRM, and OpenStreetMap tiles still require network access.

## Project Structure

```text
Project-Nirnay/
├── api/                       # Minimal Vercel functions currently checked in
├── backend/                   # Separate legacy health-only Express package
├── demo_data/                 # Scenario input data
├── src/
│   ├── api/                   # Frontend API clients and fallbacks
│   ├── assets/                # Local image assets
│   ├── components/
│   │   ├── ai/                # Chat and decision explanations
│   │   ├── map/               # Leaflet, tactical, 3D, and simulation views
│   │   ├── navigation/        # Header, sidebar, and mobile navigation
│   │   ├── pages/             # Home and profile pages
│   │   ├── risk/              # Resource priority view
│   │   ├── status/            # Timeline, asset, and rover views
│   │   └── SplashScreen.tsx   # Startup presentation
│   ├── data/                  # District definitions and mock scenario
│   ├── server/                # Supabase access helpers
│   ├── store/                 # Zustand crisis state and actions
│   ├── App.tsx                # Main application shell
│   ├── index.css              # Global styles and animations
│   └── main.tsx               # React entry point
├── supabase/
│   ├── schema.sql             # Supabase tables and row-level policies
│   └── seed.ts                # Seeds the demonstration collections
├── server.ts                  # Main Express + Vite server
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

## API Endpoints

The root Express server exposes these endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Reports server, database, and AI availability |
| `GET` | `/api/graph` | Returns roads, facilities, zones, assets, and a timestamp |
| `GET` | `/api/events` | Returns disaster timeline events |
| `GET` | `/api/intelligence` | Returns intelligence reports |
| `GET` | `/api/routes` | Returns configured emergency routes |
| `GET` | `/api/confidence/:roadId` | Returns road confidence and evidence data |
| `POST` | `/api/simulate/close_road/:id` | Calculates a road-closure impact estimate |
| `POST` | `/api/gemini/explain` | Returns an AI or deterministic decision explanation |
| `POST` | `/api/gemini/chat` | Returns an AI or deterministic crisis response |

The browser also calls external services directly:

- OpenStreetMap tile servers for map tiles
- Overpass API for hospitals, police, villages, and road geometry
- OSRM for emergency route geometry and travel estimates

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- Internet access for OpenStreetMap, Overpass, and OSRM data
- Optional: Supabase project
- Optional: Google Gemini API key

### Install

```bash
npm install
```

### Configure environment

Copy `.env.example` to `.env` and set the optional services you want to use:

```env
GEMINI_API_KEY=your_google_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Without Supabase or Gemini credentials, the application uses its bundled data and deterministic AI responses.

### Run in development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The dashboard opens directly. No account or login is required.

### Validate and build

```bash
npm run lint
npm run build
```

The build creates the Vite client in `dist/` and bundles the Express server as `dist/server.cjs`.

### Run the production bundle

```bash
npm start
```

### Seed Supabase

Run the SQL in `supabase/schema.sql` in the target Supabase project, configure the service-role credentials in `.env`, then run:

```bash
npm run seed:supabase
```

The seed script creates demonstration records for roads, facilities, zones, assets, routes, timeline events, intelligence reports, and road confidence.

## Core Workflow

```text
Scenario data
      |
      v
Map and intelligence ingestion
      |
      v
Road classification and confidence evidence
      |
      v
Priority zones and resource assessment
      |
      v
Route calculation or road-closure simulation
      |
      v
AI explanation and operator decision
```

The bundled scenario is simulated. OSM road and facility geometry is real-world map data, while disaster conditions, sensor reports, population impact, asset telemetry, and many operational values are demonstration data.

## Current Limitations

- Disaster feeds are simulated; there are no live IoT, satellite, citizen-report, or rover integrations.
- Road classification and risk scoring are application-level calculations, not a full geospatial risk engine.
- Road-closure impacts are estimates based on configured road, zone, facility, and route data; they are not a full graph simulation.
- Routing uses the public OSRM API rather than a local Dijkstra or A* graph engine.
- Timeline playback is local state, not a WebSocket stream.
- Supabase stores JSON payloads in application collections; the project does not currently use PostGIS spatial queries.
- The separate `backend/` directory is a legacy health-only Express package and is not the main runtime.
- Vercel configuration currently builds the frontend, while the complete Express API needs a separately configured server or additional serverless functions for production deployment.
- The frontend bundle is large and the production build reports a chunk-size warning.

## Future Enhancements

The following capabilities are intentionally future work and are not represented as complete production features today:

- FastAPI/Python backend with dedicated graph-builder, risk, confidence, routing, and simulation services.
- PostgreSQL/PostGIS spatial storage and geographic queries.
- OSMnx and NetworkX graph construction with local Dijkstra or A* routing.
- WebSocket or server-sent-event realtime feeds for sensors, citizen reports, satellites, hospitals, and field assets.
- Production-grade authentication, authorization, audit logs, and role-based clearance.
- Verified confidence resolution using source reliability, freshness, geographic relevance, and agreement weighting.
- Full graph-based closure simulation with real isolation, population, shelter, hospital, and travel-time calculations.
- Live weather, rainfall, flood, satellite, hospital-capacity, and shelter-occupancy integrations.
- Persistent operator profiles and server-side profile-image storage.
- Automated integration tests, browser tests, and backend contract tests.
- Complete Vercel-compatible API deployment or a dedicated backend deployment on Render, Railway, or Cloud Run.
- Code splitting, image optimization, caching, and offline map/data support.
- Additional hazards including cyclones, wildfires, structural collapse, and multi-region coordination.

## Safety Note

Nirnay is a prototype for emergency decision support. Its simulated recommendations, map overlays, risk scores, routes, and impact estimates must be verified against official sources before operational use.
