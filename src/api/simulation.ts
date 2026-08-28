import { RoadSegment, SimulationResult } from '../types';
import { BROADWAY_SIMULATION_RESULT } from '../data/mockCrisisData';

export async function simulateRoadClosure(roadId: string, road?: RoadSegment): Promise<SimulationResult> {
  try {
    const response = await fetch(`/api/simulate/close_road/${encodeURIComponent(roadId)}`, { method: 'POST' });
    if (response.ok) return await response.json() as SimulationResult;
  } catch {
    // Fall back to the bundled scenario.
  }
  return {
    ...BROADWAY_SIMULATION_RESULT,
    simulatedEntityId: roadId,
    simulatedEntityName: road?.name ?? BROADWAY_SIMULATION_RESULT.simulatedEntityName,
    peopleAffected: road ? Math.max(100, road.connectedZones.length * 2100) : BROADWAY_SIMULATION_RESULT.peopleAffected,
    hospitalsIsolated: road ? Math.max(1, Math.min(3, road.connectedZones.length)) : BROADWAY_SIMULATION_RESULT.hospitalsIsolated,
    emergencyRoutesChanged: road ? Math.max(1, road.connectedZones.length + 1) : BROADWAY_SIMULATION_RESULT.emergencyRoutesChanged,
    delayAddedMinutes: road ? Math.max(5, Math.round(road.lengthKm * (1 + road.riskScore / 100))) : BROADWAY_SIMULATION_RESULT.delayAddedMinutes,
  };
}
