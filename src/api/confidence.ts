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

interface ConfidenceSource {
  type: 'HYDRO_SENSOR' | 'CITIZEN_REPORT' | 'SATELLITE';
  description: string;
  reliability: number;
}

interface ConfidenceApiResponse extends Omit<ConfidenceData, 'sources'> {
  sources: ConfidenceSource[];
}

function adaptSources(sources: ConfidenceSource[], fallback: RoadSegment['sources']): RoadSegment['sources'] {
  const adaptedSources = { ...fallback };

  for (const source of sources) {
    const verified = source.reliability >= 0.8;
    if (source.type === 'CITIZEN_REPORT') {
      adaptedSources.citizenReports = {
        ...adaptedSources.citizenReports,
        count: Math.max(adaptedSources.citizenReports.count, 1),
        verified,
        summary: source.description,
      };
    } else if (source.type === 'HYDRO_SENSOR') {
      adaptedSources.sensors = {
        ...adaptedSources.sensors,
        count: Math.max(adaptedSources.sensors.count, 1),
        verified,
        summary: source.description,
      };
    } else if (source.type === 'SATELLITE') {
      adaptedSources.satellite = {
        ...adaptedSources.satellite,
        count: Math.max(adaptedSources.satellite.count, 1),
        verified,
        summary: source.description,
      };
    }
  }

  return adaptedSources;
}

export async function fetchRoadConfidence(roadId: string): Promise<ConfidenceData | null> {
  const road = INITIAL_ROADS.find((item) => item.id === roadId) || INITIAL_ROADS[0];
  try {
    const res = await fetch(`/api/confidence/${roadId}`);
    if (res.ok) {
      const data: ConfidenceApiResponse = await res.json();
      return {
        ...data,
        sources: adaptSources(data.sources, road.sources),
      };
    }
  } catch {
    // fallback
  }
  return {
    roadId: road.id,
    roadName: road.name,
    status: road.status,
    confidenceScore: road.confidenceScore,
    uncertaintyDescription: road.uncertaintyDescription,
    sources: road.sources,
  };
}
