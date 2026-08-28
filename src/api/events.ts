import { DisasterTimelineEvent, IntelligenceReport } from '../types';
import { DISASTER_TIMELINE_EVENTS, INITIAL_INTELLIGENCE_FEED } from '../data/mockCrisisData';

export async function fetchTimelineEvents(): Promise<DisasterTimelineEvent[]> {
  try {
    const response = await fetch('/api/events');
    if (response.ok) return await response.json() as DisasterTimelineEvent[];
  } catch {
    // Fall back to the bundled scenario.
  }
  return DISASTER_TIMELINE_EVENTS;
}

export async function fetchIntelligenceFeed(): Promise<IntelligenceReport[]> {
  try {
    const response = await fetch('/api/intelligence');
    if (response.ok) return await response.json() as IntelligenceReport[];
  } catch {
    // Fall back to the bundled scenario.
  }
  return INITIAL_INTELLIGENCE_FEED;
}
