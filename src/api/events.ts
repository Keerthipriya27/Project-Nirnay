import { DisasterTimelineEvent, IntelligenceReport } from '../types';
import { DISASTER_TIMELINE_EVENTS, INITIAL_INTELLIGENCE_FEED } from '../data/mockCrisisData';

export async function fetchTimelineEvents(): Promise<DisasterTimelineEvent[]> {
  try {
    const res = await fetch('/api/events');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return DISASTER_TIMELINE_EVENTS;
}

export async function fetchIntelligenceFeed(): Promise<IntelligenceReport[]> {
  try {
    const res = await fetch('/api/intelligence');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return INITIAL_INTELLIGENCE_FEED;
}
