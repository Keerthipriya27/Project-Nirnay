import { RoadSegment, RoadStatus } from '../types';
import { INITIAL_ROADS } from '../data/mockCrisisData';

export interface ConfidenceData {
  roadId: string;
  roadName: string;
  status: RoadStatus;
  confidenceScore: number;
  uncertaintyDescription: string;
  sources: RoadSegment['sources'];
}

export async function fetchRoadConfidence(roadId: string): Promise<ConfidenceData | null> {
  try {
    const response = await fetch(`/api/confidence/${encodeURIComponent(roadId)}`);
    if (response.ok) return await response.json() as ConfidenceData;
  } catch {
    // Fall back to the bundled scenario.
  }
  const road = INITIAL_ROADS.find((r) => r.id === roadId) ?? INITIAL_ROADS[0];
  return {
    roadId: road.id,
    roadName: road.name,
    status: road.status,
    confidenceScore: road.confidenceScore,
    uncertaintyDescription: road.uncertaintyDescription,
    sources: road.sources,
  };
}
