import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  INITIAL_ASSETS,
  INITIAL_FACILITIES,
  INITIAL_INTELLIGENCE_FEED,
  INITIAL_ROADS,
  INITIAL_ROUTES,
  INITIAL_ZONES,
  DISASTER_TIMELINE_EVENTS,
} from '../data/mockCrisisData';
import {
  EmergencyAsset,
  EmergencyRoute,
  Facility,
  IntelligenceReport,
  OperationalZone,
  RoadSegment,
  DisasterTimelineEvent,
} from '../types';

export type CrisisCollection =
  | 'roads'
  | 'facilities'
  | 'zones'
  | 'assets'
  | 'routes'
  | 'timeline_events'
  | 'intelligence_reports';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

const fallbackData: Record<CrisisCollection, unknown[]> = {
  roads: INITIAL_ROADS,
  facilities: INITIAL_FACILITIES,
  zones: INITIAL_ZONES,
  assets: INITIAL_ASSETS,
  routes: INITIAL_ROUTES,
  timeline_events: DISASTER_TIMELINE_EVENTS,
  intelligence_reports: INITIAL_INTELLIGENCE_FEED,
};

export function hasSupabaseConfig(): boolean {
  return supabase !== null;
}

export async function getCollection<T>(collection: CrisisCollection): Promise<T[]> {
  if (!supabase) return fallbackData[collection] as T[];

  const { data, error } = await supabase
    .from('crisis_records')
    .select('payload')
    .eq('collection', collection)
    .order('record_id');

  if (error || !data || data.length === 0) {
    if (error) console.error(`Supabase ${collection} query failed:`, error.message);
    return fallbackData[collection] as T[];
  }

  return data.map((row) => row.payload as T);
}

export async function getRecord<T>(collection: CrisisCollection, recordId: string): Promise<T | null> {
  if (!supabase) {
    return (fallbackData[collection].find((item) => (item as { id?: string }).id === recordId) as T) ?? null;
  }

  const { data, error } = await supabase
    .from('crisis_records')
    .select('payload')
    .eq('collection', collection)
    .eq('record_id', recordId)
    .maybeSingle();

  if (error) {
    console.error(`Supabase ${collection}/${recordId} query failed:`, error.message);
    return null;
  }

  return (data?.payload as T) ?? null;
}

export async function getRoadConfidence(roadId: string): Promise<{
  confidenceScore: number;
  uncertaintyDescription: string;
  sources: RoadSegment['sources'];
} | null> {
  if (!supabase) {
    const road = INITIAL_ROADS.find((item) => item.id === roadId);
    return road
      ? { confidenceScore: road.confidenceScore, uncertaintyDescription: road.uncertaintyDescription, sources: road.sources }
      : null;
  }

  const { data, error } = await supabase
    .from('road_confidence')
    .select('confidence_score, uncertainty_description, sources')
    .eq('road_id', roadId)
    .maybeSingle();

  if (error) {
    console.error(`Supabase confidence/${roadId} query failed:`, error.message);
    return null;
  }
  if (!data) return null;
  return {
    confidenceScore: data.confidence_score,
    uncertaintyDescription: data.uncertainty_description,
    sources: data.sources as RoadSegment['sources'],
  };
}

export async function saveSimulation(roadId: string, result: unknown): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('road_simulations').insert({ road_id: roadId, result });
  if (error) console.error('Supabase simulation insert failed:', error.message);
}

export function collectionId(item: { id: string }): string {
  return item.id;
}

export const typedCollections = {
  roads: 'roads' as const,
  facilities: 'facilities' as const,
  zones: 'zones' as const,
  assets: 'assets' as const,
  routes: 'routes' as const,
  timelineEvents: 'timeline_events' as const,
  intelligenceReports: 'intelligence_reports' as const,
};

export type CrisisPayload =
  | RoadSegment
  | Facility
  | OperationalZone
  | EmergencyAsset
  | EmergencyRoute
  | DisasterTimelineEvent
  | IntelligenceReport;
