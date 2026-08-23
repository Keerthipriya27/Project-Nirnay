export type RoadStatus = 'SAFE' | 'RISKY' | 'CRITICAL' | 'BLOCKED';

export type DisasterType = 'FLASH_FLOOD' | 'EARTHQUAKE' | 'WILDFIRE' | 'CYCLONE' | 'STRUCTURAL_COLLAPSE';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Coordinates {
  x: number; // 3D world coord X / relative map X
  y: number; // 3D world coord Y / elevation
  z: number; // 3D world coord Z / relative map Y
  lat?: number;
  lng?: number;
}

export interface RoadSegment {
  id: string;
  name: string;
  status: RoadStatus;
  riskScore: number; // 0 to 100
  confidenceScore: number; // 0 to 100
  uncertaintyDescription: string;
  path: Coordinates[];
  svgPath?: string; // 2D SVG path for tactical map
  lengthKm: number;
  currentTraffic: 'LIGHT' | 'MODERATE' | 'HEAVY' | 'STANDSTILL';
  waterLevelCm?: number;
  connectedZones: string[];
  sources: {
    citizenReports: { count: number; verified: boolean; summary: string };
    sensors: { count: number; verified: boolean; summary: string; reading?: string };
    satellite: { count: number; verified: boolean; summary: string };
    roverInspection?: { count: number; verified: boolean; summary: string; status: 'PENDING' | 'VERIFIED' | 'DISPATCHED' };
  };
}

export interface Facility {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'SHELTER' | 'SAFE_ZONE' | 'COMMAND_POST' | 'WATER_SENSOR';
  coordinates: Coordinates;
  mapPercent: { top: string; left: string }; // for 2D tactical map positioning
  status: 'OPERATIONAL' | 'DEGRADED' | 'ISOLATED' | 'FULL';
  capacity?: number;
  currentOccupancy?: number;
  availableBeds?: number;
  medicalSupplies?: 'ADEQUATE' | 'LOW' | 'CRITICAL';
  floodRisk: 'LOW' | 'ELEVATED' | 'HIGH' | 'SEVERE';
}

export interface OperationalZone {
  id: string;
  name: string;
  priority: PriorityLevel;
  priorityLabel: string;
  description: string;
  population: number;
  waterRiseRate: string; // e.g. "0.5m/hr"
  evacuationProgress: number; // 0 - 100%
  status: 'MONITORING' | 'HIGH_RISK' | 'CRITICAL_INTERVENTION';
  borderColor: string;
  coordinates: Coordinates;
}

export interface EmergencyAsset {
  id: string;
  name: string;
  type: 'AMBULANCE' | 'ROVER' | 'DRONE' | 'RESCUE_BOAT' | 'HELICOPTER';
  status: 'IDLE' | 'EN_ROUTE' | 'ON_SITE' | 'RETURNING' | 'MAINTENANCE';
  mission?: string;
  targetDestination?: string;
  coordinates: Coordinates;
  batteryPercent: number;
  speedKmh: number;
  connectivity?: string;
  telemetry?: {
    cameraFeedUrl?: string;
    lidarStatus?: 'ACTIVE' | 'CALIBRATING';
    lastPing: string;
  };
}

export interface EmergencyRoute {
  id: string;
  name: string;
  type: 'PRIMARY' | 'ALTERNATE' | 'BLOCKED_ORIGINAL';
  color: string;
  waypoints: Coordinates[];
  svgD: string;
  etaMinutes: number;
  distanceKm: number;
  delayAddedMinutes?: number;
  safetyRating: number; // 0 - 100
  isRecommended?: boolean;
}

export interface SimulationResult {
  simulatedEntityId: string;
  simulatedEntityName: string;
  simulationType: 'ROAD_CLOSURE' | 'HOSPITAL_OVERFLOW' | 'DAM_BREACH';
  peopleAffected: number;
  hospitalsIsolated: number;
  sheltersImpacted: number;
  emergencyRoutesChanged: number;
  delayAddedMinutes: number;
  recommendedAlternative: {
    routeId: string;
    routeName: string;
    explanation: string;
  };
  aiExplanation: string;
  counterfactualAnalysis: string;
}

export interface AIRecommendation {
  id: string;
  situation: string;
  recommendedAction: string;
  priority: PriorityLevel;
  confidence: number; // 0 - 100
  whyExplanation: string;
  impactMetrics: {
    peopleProtected: number;
    responseTimeSavedMin: number;
    criticalNodesSaved: number;
  };
  evidencePoints: string[];
}

export interface IntelligenceReport {
  id: string;
  timestamp: string;
  timeAgo: string;
  sourceType: 'CITIZEN' | 'IOT_SENSOR' | 'SATELLITE' | 'ROVER' | 'DRONE' | 'FIRST_RESPONDER';
  title: string;
  description: string;
  locationName: string;
  coordinates?: Coordinates;
  reliability: 'HIGH' | 'MODERATE' | 'UNCONFIRMED';
  status: 'VERIFIED' | 'INVESTIGATING' | 'CONFLICTING';
  severity: PriorityLevel;
}

export interface DisasterTimelineEvent {
  id: string;
  time?: string;
  timeString: string;
  title: string;
  description: string;
  roadStateChanges?: { roadId: string; newStatus: RoadStatus }[];
  impactNotes?: string;
  affectedZoneId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'NIRNAY_AI';
  timestamp: string;
  text: string;
  insightCard?: {
    title: string;
    priorityBadge: string;
    estPopulation: number;
    waterRiseRate: string;
    recommendedZone: string;
    secondaryMetricLabel?: string;
    secondaryMetricValue?: string;
  };
  suggestedFollowUps?: string[];
}
