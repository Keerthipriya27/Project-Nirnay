import { EmergencyRoute } from '../types';
import { INITIAL_ROUTES } from '../data/mockCrisisData';

export async function fetchRoutes(): Promise<EmergencyRoute[]> {
  try {
    const res = await fetch('/api/routes');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return INITIAL_ROUTES;
}
