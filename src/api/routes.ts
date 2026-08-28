import { EmergencyRoute } from '../types';
import { INITIAL_ROUTES } from '../data/mockCrisisData';

export async function fetchRoutes(): Promise<EmergencyRoute[]> {
  try {
    const response = await fetch('/api/routes');
    if (response.ok) return await response.json() as EmergencyRoute[];
  } catch {
    // Fall back to the bundled scenario.
  }
  return INITIAL_ROUTES;
}
