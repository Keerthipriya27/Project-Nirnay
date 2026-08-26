import { SimulationResult } from '../types';
import { BROADWAY_SIMULATION_RESULT } from '../data/mockCrisisData';

export async function simulateRoadClosure(roadId: string): Promise<SimulationResult> {
  return {
    ...BROADWAY_SIMULATION_RESULT,
    simulatedEntityId: roadId,
  };
}
