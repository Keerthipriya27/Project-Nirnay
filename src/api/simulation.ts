import { SimulationResult } from '../types';
import { BROADWAY_SIMULATION_RESULT } from '../data/mockCrisisData';

export async function simulateRoadClosure(roadId: string): Promise<SimulationResult> {
  try {
    const res = await fetch(`/api/simulate/close_road/${roadId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return {
    ...BROADWAY_SIMULATION_RESULT,
    simulatedEntityId: roadId,
  };
}
