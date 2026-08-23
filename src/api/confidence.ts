import { RoadSegment } from '../types';
import { INITIAL_ROADS } from '../data/mockCrisisData';

export interface ConfidenceData {
  roadId: string;
  roadName: string;
  status: string;
  confidenceScore: number;
  uncertaintyDescription: string;
  sources: RoadSegment['sources'];
}

export async function fetchRoadConfidence(roadId: string): Promise<ConfidenceData | null> {
  try {
    const res = await fetch(`/api/confidence/${roadId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  const road = INITIAL_ROADS.find((r) => r.id === roadId) || INITIAL_ROADS[0];
  return {
    roadId: road.id,
    roadName: road.name,
    status: road.status,
    confidenceScore: road.confidenceScore,
    uncertaintyDescription: road.uncertaintyDescription,
    sources: road.sources,
  };
}
