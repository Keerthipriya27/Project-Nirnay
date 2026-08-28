import { SimulationResult } from '../types';
import { BROADWAY_SIMULATION_RESULT } from '../data/mockCrisisData';

export async function simulateRoadClosure(roadId: string): Promise<SimulationResult> {
  try {
    const response = await fetch(`/api/simulate/close_road/${encodeURIComponent(roadId)}`, { method: 'POST' });
    if (response.ok) return await response.json() as SimulationResult;
  } catch {
    // Fall back to the bundled scenario.
  }
  return {
    ...BROADWAY_SIMULATION_RESULT,
    simulatedEntityId: roadId,
  };
}
