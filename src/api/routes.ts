import { EmergencyRoute } from '../types';
import { INITIAL_ROUTES } from '../data/mockCrisisData';

export async function fetchRoutes(): Promise<EmergencyRoute[]> {
  return INITIAL_ROUTES;
}
