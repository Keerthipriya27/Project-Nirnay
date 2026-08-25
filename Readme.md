<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e83a3932-6e7e-471b-9e08-cb93fdaabaee

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 📂 Scenario Data (`demo_data/scenario.json`)

This file contains **sample disaster reports** used for simulation and testing.  
It helps the AI/confidence module handle **conflicting inputs** (e.g., citizen vs. sensor reports).

### 🔹 Usage
Load the JSON file in your integration code:
```ts
const fs = require('fs');
const reports = JSON.parse(fs.readFileSync('./demo_data/scenario.json', 'utf8'));
```
## 📑 Database & Scenario Integration

### Reports Table
```sql
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  road_id INT REFERENCES roads(id),
  status TEXT NOT NULL,   -- e.g. flooded / open
  source TEXT NOT NULL,   -- e.g. citizen / sensor / satellite
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```
### Roads Table
```sql
CREATE TABLE roads (
  id SERIAL PRIMARY KEY,
  name TEXT,
  geom GEOMETRY(LINESTRING, 4326),
  risk_score NUMERIC DEFAULT 0
);
```
### Hospitals & Shelters
```sql
INSERT INTO hospitals (name, geom)
VALUES ('City Hospital', ST_SetSRID(ST_MakePoint(78.486671, 17.385044), 4326));
INSERT INTO shelters (name, geom)
VALUES ('Community Shelter', ST_SetSRID(ST_MakePoint(78.480000, 17.392000), 4326));
```
### Disaster Reports Source
Reports can be seeded directly into the reports table.

For demo/AI integration, we use demo_data/scenario.json.

### Sample Report JSON
```json
{
  "road_id": 1,
  "status": "flooded",
  "source": "citizen",
  "timestamp": "2026-08-25T11:00:00Z"
}
```
### Population Impact Query
```sql
SELECT h.name
FROM hospitals h
JOIN roads r ON ST_DWithin(h.geom, r.geom, 2000)
WHERE r.id IN (
  SELECT road_id FROM reports WHERE status = 'flooded'
);
```
