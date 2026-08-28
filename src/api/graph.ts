import { RoadSegment, Facility, OperationalZone, EmergencyAsset } from '../types';
import { INITIAL_ROADS, INITIAL_FACILITIES, INITIAL_ZONES, INITIAL_ASSETS } from '../data/mockCrisisData';

export interface GraphData {
  roads: RoadSegment[];
  facilities: Facility[];
  zones: OperationalZone[];
  assets: EmergencyAsset[];
  timestamp: string;
}

export async function fetchGraphData(): Promise<GraphData> {
  try {
    const response = await fetch('/api/graph');
    if (response.ok) return await response.json() as GraphData;
  } catch {
    // Keep the dashboard usable when the API is unavailable.
  }
  return { roads: INITIAL_ROADS, facilities: INITIAL_FACILITIES, zones: INITIAL_ZONES, assets: INITIAL_ASSETS, timestamp: new Date().toISOString() };
}
