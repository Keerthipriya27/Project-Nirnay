import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_ASSETS,
  INITIAL_FACILITIES,
  INITIAL_INTELLIGENCE_FEED,
  INITIAL_ROADS,
  INITIAL_ROUTES,
  INITIAL_ZONES,
  DISASTER_TIMELINE_EVENTS,
} from '../src/data/mockCrisisData';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || url.includes('your-project-ref') || !key || key.includes('your-supabase-service-role-key')) {
  throw new Error('Set real SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY values in .env before seeding.');
}

const client = createClient(url, key, { auth: { persistSession: false } });
const collections = [
  ['roads', INITIAL_ROADS],
  ['facilities', INITIAL_FACILITIES],
  ['zones', INITIAL_ZONES],
  ['assets', INITIAL_ASSETS],
  ['routes', INITIAL_ROUTES],
  ['timeline_events', DISASTER_TIMELINE_EVENTS],
  ['intelligence_reports', INITIAL_INTELLIGENCE_FEED],
] as const;

for (const [collection, records] of collections) {
  const rows = records.map((payload) => ({ collection, record_id: payload.id, payload }));
  const { error } = await client.from('crisis_records').upsert(rows, { onConflict: 'collection,record_id' });
  if (error) throw error;
  console.log(`Seeded ${rows.length} ${collection}.`);
}

const confidenceRows = INITIAL_ROADS.map((road) => ({
  road_id: road.id,
  confidence_score: road.confidenceScore,
  uncertainty_description: road.uncertaintyDescription,
  sources: road.sources,
}));
const { error: confidenceError } = await client
  .from('road_confidence')
  .upsert(confidenceRows, { onConflict: 'road_id' });
if (confidenceError) throw confidenceError;
console.log(`Seeded ${confidenceRows.length} road confidence records.`);
