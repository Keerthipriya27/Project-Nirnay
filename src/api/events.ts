import { DisasterTimelineEvent, IntelligenceReport } from '../types';
import { DISASTER_TIMELINE_EVENTS, INITIAL_INTELLIGENCE_FEED } from '../data/mockCrisisData';

export async function fetchTimelineEvents(): Promise<DisasterTimelineEvent[]> {
  return DISASTER_TIMELINE_EVENTS;
}

export async function fetchIntelligenceFeed(): Promise<IntelligenceReport[]> {
  return INITIAL_INTELLIGENCE_FEED;
}
