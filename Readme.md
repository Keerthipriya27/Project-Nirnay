# Nirnay — AI Emergency Command System

*Nirnay (निर्णय) means "decision" in Sanskrit and Hindi.*

> Existing tools tell you what is happening. Nirnay tells you what to do next and explains why, even when the information disagrees.

Nirnay is an AI-powered emergency decision-support system that transforms fragmented, uncertain, and rapidly changing disaster information into clear, explainable, and coordinated response decisions while keeping human commanders in control.

---

## Problem

During disasters such as floods, cyclones, earthquakes, and wildfires, emergency response teams must make critical decisions with incomplete, conflicting, and rapidly changing information.

The information may be:

- **Incomplete** — important events may not yet be reported.
- **Conflicting** — a citizen may report that a road is flooded while a sensor indicates that it is accessible.
- **Rapidly changing** — a road that is open now may become inaccessible minutes later.

The core challenge is not simply collecting information. It is turning uncertain and fragmented information into timely, coordinated decisions.

---

## Solution

Nirnay creates a live digital representation of an affected area, including roads, hospitals, shelters, resources, and incoming field reports.

The system continuously:

1. Assesses uncertainty in incoming reports instead of blindly trusting a single source.
2. Identifies high-priority situations involving roads, zones, hospitals, and other critical infrastructure.
3. Recommends emergency routes and resource allocation based on the current situation.
4. Explains the reasoning behind recommendations in clear, human-readable language.
5. Simulates "what-if" scenarios, such as road closures or hospitals reaching capacity, before or during an emergency.

---

## Target Users

Nirnay is designed for:

- Disaster management agencies
- Emergency operations centers
- Search-and-rescue teams
- Humanitarian organizations
- Healthcare networks
- Emergency coordination teams

The system is designed to be adaptable across different countries, disaster types, infrastructure environments, and emergency-response structures.

---

## Key Features

| Feature | Description |
|---|---|
| **Live Risk Map** | Displays a real road network from OpenStreetMap with roads categorized by risk level using green, yellow, and red states. |
| **Confidence Scoring** | Estimates confidence when multiple sources provide conflicting information about a road or situation. |
| **What-If Simulation** | Allows an operator to close a road and immediately evaluate affected population, isolated hospitals, and alternative routes. |
| **AI Explanations** | Generates plain-language explanations for system recommendations using structured decision data. |
| **Live Disaster Playback** | Replays a scripted sequence of disaster events and shows how the system adapts as new information arrives. |

---

## Architecture

```text
        ┌──────────────────────────┐
        │ OpenStreetMap / OSMnx     │
        │ Real Road Network         │
        └────────────┬─────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │ Simulated Live Feed      │
        │ Citizen Reports          │
        │ Sensors / Satellite      │
        └────────────┬─────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │ Database — PostgreSQL + PostGIS     │
        │                                    │
        │ Roads | Nodes | Hospitals          │
        │ Shelters | Reports | Resources     │
        │ Risk Scores | Events               │
        └──────────────────┬─────────────────┘
                           │
                           ▼
        ┌────────────────────────────────────┐
        │ Backend — FastAPI                  │
        │                                    │
        │ Graph Builder                      │
        │ Risk Scoring Engine                │
        │ Confidence Resolver                │
        │ Route Optimizer                    │
        │ Simulation Engine                  │
        └──────────────────┬─────────────────┘
                           │
                           ▼
        ┌────────────────────────────────────┐
        │ AI Explanation Layer               │
        │ Anthropic Claude API               │
        └──────────────────┬─────────────────┘
                           │
                           ▼
        ┌────────────────────────────────────┐
        │ Frontend — React + Leaflet         │
        │                                    │
        │ Live Map | Confidence Panel        │
        │ Simulation | Impact Dashboard      │
        │ AI Explanation                     │
        └────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Road Data | OpenStreetMap, OSMnx, NetworkX |
| Database | PostgreSQL, PostGIS |
| Backend | FastAPI, Python |
| Realtime Communication | WebSockets |
| Routing | Dijkstra / A* using NetworkX |
| Frontend | React, Leaflet |
| AI Explanations | Anthropic Claude API |
| Demo Hosting | Localhost / ngrok, or Vercel + Render/Railway |

---

## Project Structure

```text
nirnay/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── graph_builder.py
│   │   ├── risk_scoring.py
│   │   ├── simulation.py
│   │   ├── confidence.py
│   │   └── explain.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   ├── Sidebar/
│   │   │   ├── SimulatePanel/
│   │   │   └── ExplainBox/
│   │   └── App.jsx
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed_data.sql
│
├── data/
│   └── scenario_events.json
│
├── docs/
│   └── Nirnay_Roadmap.md
│
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/graph` | Returns the road network and associated risk scores as GeoJSON. |
| `GET` | `/route` | Calculates an optimal route between two points. |
| `POST` | `/simulate/close_road/{id}` | Simulates the closure of a road and returns its estimated impact. |
| `GET` | `/confidence/{road_id}` | Returns the confidence score for the current status of a road. |
| `POST` | `/explain` | Generates a plain-language explanation for a system decision. |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- PostGIS extension

### Backend

Clone the repository and navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment.

#### Windows

```bash
venv\Scripts\activate
```

#### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

API documentation will be available at:

```text
http://127.0.0.1:8000/docs
```

---

### Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

### Database

Create the database:

```bash
createdb nirnay
```

Enable the PostGIS extension:

```bash
psql nirnay -c "CREATE EXTENSION postgis;"
```

Initialize the database schema:

```bash
psql nirnay -f database/schema.sql
```

Seed the database:

```bash
psql nirnay -f database/seed_data.sql
```

---

## Core Workflow

```text
Disaster Event
      |
      v
Incoming Reports
      |
      v
Source Validation
      |
      v
Confidence Assessment
      |
      v
Road Risk Analysis
      |
      v
Priority Detection
      |
      v
Route / Resource Optimization
      |
      v
What-If Simulation
      |
      v
AI Explanation
      |
      v
Emergency Decision
```

Nirnay is designed around a continuous decision loop rather than a static disaster map.

---

## Risk Assessment

Each road is assigned a risk score based on multiple factors.

A simplified MVP scoring model can consider:

```text
Risk Score =
    Flood Probability
    + Elevation Risk
    + Road Importance
    + Current Reports
```

The resulting score is mapped into three operational states:

```text
0% – 30%   → Low Risk
31% – 70%  → Moderate Risk
71% – 100% → High Risk
```

The exact scoring weights can be adjusted according to the disaster scenario.

---

## Confidence Scoring

When different sources provide conflicting information, Nirnay does not automatically trust one source.

For example:

```text
Citizen Report:
Road appears flooded

Sensor:
Water level appears normal

Satellite:
Possible flooding detected
```

Instead, the system evaluates factors such as:

- Source reliability
- Report freshness
- Geographic relevance
- Agreement between sources
- Number of supporting reports

The system produces an estimated confidence score.

Example:

```text
Road Status:
Potentially Blocked

Confidence:
78%

Supporting Evidence:
- Satellite observation
- Recent citizen reports
- Elevated water-level reading
```

This allows emergency operators to understand not only the decision but also the level of uncertainty behind it.

---

## What-If Simulation

Nirnay allows emergency teams to simulate possible situations before acting.

For example:

```text
What if Road A becomes inaccessible?
```

The system can calculate:

- Alternative emergency routes
- Potentially affected population
- Isolated hospitals
- Changes in travel time
- Affected shelters
- Priority areas

Example output:

```text
Road A Closure

Population potentially affected: 8,240
Hospitals isolated: 2
Alternative routes available: 3
Estimated response-time increase: 7 minutes

Recommended Action:
Prioritize Road B as the alternative emergency route.
```

The purpose is not to replace human decision-making, but to provide rapid analysis before a decision is made.

---

## AI Explanation Layer

Nirnay uses an AI explanation layer to convert structured system decisions into clear human-readable reasoning.

Instead of showing only:

```text
Priority Score: 0.87
```

the system can provide:

```text
Road A is prioritized because its closure could isolate
two hospitals and affect a high-density residential zone.
The system recommends clearing this road before lower-impact
routes.
```

The AI receives structured decision data from the backend rather than raw unverified information.

This keeps the explanation grounded in the system's actual calculations.

---

## Demo Flow

The MVP demonstration follows a simple emergency decision-making scenario.

### Step 1 — Normal State

Start with a normal city map showing:

- Roads
- Hospitals
- Shelters
- Current risk levels

### Step 2 — Start Disaster

Start the disaster simulation.

New simulated reports begin entering the system.

Road risk levels change as the situation evolves.

### Step 3 — Conflicting Information

Select a road where two or more sources disagree.

Display:

```text
Road Status: Potentially Blocked
Confidence: 78%
```

Show the supporting evidence.

### Step 4 — Simulate Road Closure

Select a critical road and choose:

```text
Simulate Road Closure
```

The system recalculates:

- Affected population
- Hospital accessibility
- Emergency routes
- Response-time changes

### Step 5 — Ask Why

Select:

```text
Ask Why
```

The AI provides a short explanation of why the road or zone has been prioritized.

### Step 6 — Final Decision

Show how the recommended response changes based on the simulated situation.

The final message of the demonstration is:

> **Explainable decisions under uncertainty, not just routing.**

---

## Three-Day MVP Roadmap

### Day 1 — Foundation

#### Backend / Graph

- Set up FastAPI.
- Load a small real-world road network using OpenStreetMap and OSMnx.
- Convert the road network into a NetworkX graph.
- Expose the road network through `/graph`.
- Implement basic route calculation.

#### Database / Geospatial

- Set up PostgreSQL and PostGIS.
- Create the required database tables.
- Seed hospitals and shelters from OpenStreetMap data.
- Prepare sample spatial queries.

#### Frontend

- Set up React and Leaflet.
- Connect to the backend.
- Render the road network.
- Add hospital and shelter markers.

#### AI / Integration

- Create the scenario event file.
- Define citizen, sensor, and satellite reports.
- Include at least one deliberate conflict between sources.
- Define the API contract between backend and frontend.

### End-of-Day 1 Target

The team should be able to:

- Render real roads on the map.
- Display hospitals and shelters.
- Return a real route using `/route`.
- Access seeded database data.
- Run the initial scenario file.

---

### Day 2 — Intelligence and Simulation

#### Backend / Graph

- Add road risk scoring.
- Include risk scores in `/graph`.
- Implement road-closure simulation.
- Calculate affected routes.
- Identify isolated hospitals.
- Calculate approximate population impact.

#### Database / Geospatial

- Add risk score data.
- Add event data.
- Create spatial queries for population impact.
- Optimize slow queries.
- Validate all seeded data.

#### Frontend

- Color roads based on risk.
- Add road selection.
- Display road statistics.
- Display confidence information.
- Add the "Simulate Road Closure" action.
- Display simulation results.
- Add the "Ask Why" action.

#### AI / Integration

- Implement confidence scoring.
- Resolve conflicting reports.
- Create `/confidence/{road_id}`.
- Integrate the AI explanation layer.
- Create `/explain`.

### End-of-Day 2 Target

A user should be able to:

1. Select a road.
2. See its risk.
3. See its confidence score.
4. Simulate a road closure.
5. See the resulting impact.
6. Request an AI explanation.

---

### Day 3 — Integration and Demo

#### Backend

- Fix API issues.
- Handle invalid or missing IDs gracefully.
- Improve performance.
- Support frontend integration testing.

#### Database

- Clean and validate seed data.
- Ensure no missing critical fields.
- Prepare a reset-demo-data script.
- Support integration testing.

#### Frontend

- Implement "Start Disaster" playback.
- Add loading states.
- Add map legend.
- Add impact counters.
- Add smooth transitions.
- Improve overall visual clarity.

#### AI / Integration

- Connect the scenario stream to the frontend.
- Implement realtime playback using WebSockets or polling.
- Verify all API contracts.
- Own the final demo narrative.
- Support backend and frontend integration.

### End-of-Day 3 Target

The complete demonstration should work from beginning to end without developer intervention.

---

## Team Responsibilities

| Role | Responsibilities |
|---|---|
| **Backend / Graph Engineer** | FastAPI, OSMnx, NetworkX, routing, risk scoring, and simulation engine. |
| **Database / Geospatial Engineer** | PostgreSQL, PostGIS, schema design, seed data, spatial queries, and data consistency. |
| **Frontend / UX Engineer** | React, Leaflet, map visualization, risk states, simulation UI, dashboards, and visual polish. |
| **AI / Integration Lead** | Scenario events, confidence scoring, AI explanations, API integration, realtime playback, and demo narrative. |

---

## MVP Scope

The initial MVP is intentionally limited to one small geographic area and focuses on five capabilities:

1. A real road network from OpenStreetMap.
2. Road risk visualization using green, yellow, and red states.
3. Road-closure simulation with measurable impact.
4. One conflicting-report scenario with a confidence score.
5. One AI-generated explanation of why a situation matters.

No additional features should be prioritized until these five capabilities work together reliably.

---

## Development Principles

- Keep the demonstration area small.
- Prefer working integrations over additional features.
- Use approximate population and response-time calculations where necessary.
- Keep human decision-makers in control of emergency decisions.
- Clearly distinguish simulated data from real-world data.
- Make system decisions explainable and auditable.
- Test the complete workflow at the end of every development day.
- Avoid adding new features until the core MVP is stable.
- Prioritize reliability over feature count.

---

## Data Sources

### OpenStreetMap

OpenStreetMap provides the real-world road network used by Nirnay.

OSMnx is used to retrieve and process the road network.

### Simulated Emergency Data

For the MVP demonstration, the following live feeds are simulated:

- Citizen reports
- Sensor readings
- Satellite observations
- Disaster events
- Road condition updates

The simulated data allows the team to demonstrate uncertainty, conflicting information, and changing disaster conditions without depending on live emergency feeds.

---

## Data Note

Live sensor, satellite, and citizen-report feeds are simulated through a scripted event timeline for the MVP demonstration.

The core reasoning pipeline uses real logic, including:

- Risk scoring
- Confidence estimation
- Route optimization
- Road-closure simulation
- AI-generated explanations

The road network is based on real OpenStreetMap data.

Nirnay is a decision-support prototype and is not intended to replace official emergency management systems or professional emergency command decisions.

---

## Future Scope

The MVP focuses on a small geographic area and a limited set of scenarios.

Future versions could integrate:

- Real-time weather feeds
- Live flood and rainfall data
- Satellite imagery
- IoT sensors
- Emergency vehicle tracking
- Real-time hospital capacity
- Shelter occupancy
- Multi-disaster simulation
- Resource allocation optimization
- Drone verification requests
- Historical disaster analysis
- Predictive risk models
- Multi-region disaster coordination

These capabilities are intentionally outside the initial MVP scope.

---

## Category

**Social Impact / Artificial Intelligence / Emergency Response**

Nirnay is designed as an AI reasoning and decision-support system for humanitarian disaster response.

It does not replace emergency commanders.

Instead, it provides:

- Evidence
- Confidence estimates
- Simulations
- Route recommendations
- Impact analysis
- AI-generated explanations

The final objective is simple:

> **Turn uncertain disaster information into clear, explainable decisions.**

---

## License

This project is developed as a prototype for educational, research, and hackathon purposes.

