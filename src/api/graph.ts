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
    const res = await fetch('/api/graph');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return {
    roads: INITIAL_ROADS,
    facilities: INITIAL_FACILITIES,
    zones: INITIAL_ZONES,
    assets: INITIAL_ASSETS,
    timestamp: new Date().toISOString(),
  };
}
