import { create } from 'zustand';
import {
  RoadSegment,
  Facility,
  OperationalZone,
  EmergencyAsset,
  EmergencyRoute,
  SimulationResult,
  AIRecommendation,
  IntelligenceReport,
  DisasterTimelineEvent,
  ChatMessage,
  RoadStatus,
} from '../types';
import {
  INITIAL_ROADS,
  INITIAL_FACILITIES,
  INITIAL_ZONES,
  INITIAL_ASSETS,
  INITIAL_ROUTES,
  INITIAL_AI_RECOMMENDATION,
  DISASTER_TIMELINE_EVENTS,
  INITIAL_INTELLIGENCE_FEED,
  INITIAL_CHAT_MESSAGES,
} from '../data/mockCrisisData';
import { sendAIChatQuery, requestAIExplanation, ExplainResponse } from '../api/explanation';
import { fetchRoadConfidence } from '../api/confidence';
import { fetchTimelineEvents, fetchIntelligenceFeed } from '../api/events';
import { fetchGraphData } from '../api/graph';
import { fetchRoutes } from '../api/routes';
import { simulateRoadClosure } from '../api/simulation';
import { DEFAULT_DISTRICT, DistrictId, getDistrict } from '../data/districts';

export type TabType = 'home' | 'map' | 'risk' | 'ai' | 'status' | 'profile';

export interface LayerFilters {
  floods: boolean;
  roads: boolean;
  facilities: boolean;
  assets: boolean;
  rovers: boolean;
  drones: boolean;
  weather: boolean;
}

interface CrisisState {
  activeTab: TabType;
  activeDistrict: DistrictId;
  viewMode3D: boolean;
  liveContextActive: boolean;
  selectedRoad: RoadSegment | null;
  isRoadDetailModalOpen: boolean;
  isClosureImpactViewOpen: boolean;
  isExplainWhyModalOpen: boolean;
  currentExplanation: ExplainResponse | null;
  isRoverModalOpen: boolean;
  activeRover: EmergencyAsset | null;
  selectedZone: OperationalZone | null;
  searchQuery: string;

  // Simulation & Route states
  isSimulationActive: boolean;
  simulationResult: SimulationResult | null;
  activeRouteId: string;

  // Data collections
  roads: RoadSegment[];
  facilities: Facility[];
  zones: OperationalZone[];
  assets: EmergencyAsset[];
  routes: EmergencyRoute[];
  intelligenceFeed: IntelligenceReport[];
  timelineEvents: DisasterTimelineEvent[];
  currentTimelineIndex: number;
  isTimelinePlaying: boolean;
  aiRecommendation: AIRecommendation;
  chatMessages: ChatMessage[];
  isAIThinking: boolean;

  // Layer filters
  layerFilters: LayerFilters;

  // Actions
  setActiveTab: (tab: TabType) => void;
  setActiveDistrict: (district: DistrictId) => void;
  setViewMode3D: (is3D: boolean) => void;
  toggleViewMode3D: () => void;
  setLiveContextActive: (active: boolean) => void;
  toggleLiveContext: () => void;
  selectRoad: (roadId: string | null) => void;
  openRoadDetailModal: (roadId: string) => void;
  closeRoadDetailModal: () => void;
  triggerRoadClosureSimulation: (roadId: string) => Promise<void>;
  closeClosureImpactView: () => void;
  applySafestRoute: () => void;
  openExplainWhyModal: (actionContext?: string) => Promise<void>;
  closeExplainWhyModal: () => void;
  openRoverModal: (roverId?: string) => void;
  closeRoverModal: () => void;
  dispatchRoverMission: (roverId: string, missionTarget: string) => void;
  selectZone: (zone: OperationalZone | null) => void;
  setSearchQuery: (query: string) => void;
  toggleLayer: (layer: keyof LayerFilters) => void;
  updateRoadStatus: (roadId: string, status: RoadStatus) => void;
  sendChatMessage: (text: string) => Promise<void>;
  setTimelineIndex: (index: number) => void;
  toggleTimelinePlayback: () => void;
  nextTimelineStep: () => void;
  previousTimelineStep: () => void;
  resetAllSimulation: () => void;
  hydrate: () => Promise<void>;
}

let hydrationPromise: Promise<void> | null = null;

export const useCrisisStore = create<CrisisState>((set, get) => ({
  activeTab: 'home',
  activeDistrict: (localStorage.getItem('nirnay_district') as DistrictId | null) || DEFAULT_DISTRICT.id,
  viewMode3D: false, // Default to clean, pixel-perfect 2D map matching uploaded screens with seamless 1-click 3D Digital Twin toggle
  liveContextActive: true,
  selectedRoad: null,
  isRoadDetailModalOpen: false,
  isClosureImpactViewOpen: false,
  isExplainWhyModalOpen: false,
  currentExplanation: null,
  isRoverModalOpen: false,
  activeRover: INITIAL_ASSETS.find((a) => a.type === 'ROVER') || null,
  selectedZone: null,
  searchQuery: '',

  isSimulationActive: false,
  simulationResult: null,
  activeRouteId: 'route-b-alternate',

  roads: INITIAL_ROADS,
  facilities: INITIAL_FACILITIES,
  zones: INITIAL_ZONES,
  assets: INITIAL_ASSETS,
  routes: INITIAL_ROUTES,
  intelligenceFeed: INITIAL_INTELLIGENCE_FEED,
  timelineEvents: DISASTER_TIMELINE_EVENTS,
  currentTimelineIndex: 4, // 14:09 Broadway Blocked point
  isTimelinePlaying: false,
  aiRecommendation: INITIAL_AI_RECOMMENDATION,
  chatMessages: INITIAL_CHAT_MESSAGES,
  isAIThinking: false,

  layerFilters: {
    floods: true,
    roads: true,
    facilities: true,
    assets: true,
    rovers: true,
    drones: true,
    weather: true,
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveDistrict: (district) => {
    localStorage.setItem('nirnay_district', district);
    set({ activeDistrict: district, selectedRoad: null, selectedZone: null });
  },


  setViewMode3D: (is3D) => set({ viewMode3D: is3D }),
  toggleViewMode3D: () => set((state) => ({ viewMode3D: !state.viewMode3D })),

  setLiveContextActive: (active) => set({ liveContextActive: active }),
  toggleLiveContext: () => set((state) => ({ liveContextActive: !state.liveContextActive })),

  selectRoad: (roadId) => {
    if (!roadId) {
      set({ selectedRoad: null });
      return;
    }
    const road = get().roads.find((r) => r.id === roadId) || null;
    set({ selectedRoad: road });
  },

  openRoadDetailModal: (roadId) => {
    const road = get().roads.find((r) => r.id === roadId) || get().roads[0];
    set({
      selectedRoad: road,
      isRoadDetailModalOpen: true,
      isClosureImpactViewOpen: false,
    });

    void fetchRoadConfidence(road.id).then((confidence) => {
      if (!confidence) return;

      set((state) => {
        const updatedRoad = state.roads.find((item) => item.id === road.id);
        if (!updatedRoad) return state;

        const mergedRoad: RoadSegment = {
          ...updatedRoad,
          name: confidence.roadName,
          status: confidence.status,
          confidenceScore: confidence.confidenceScore,
          uncertaintyDescription: confidence.uncertaintyDescription,
          sources: confidence.sources,
        };

        return {
          roads: state.roads.map((item) => (item.id === road.id ? mergedRoad : item)),
          selectedRoad: state.selectedRoad?.id === road.id ? mergedRoad : state.selectedRoad,
        };
      });
    });
  },

  closeRoadDetailModal: () => set({ isRoadDetailModalOpen: false }),

  triggerRoadClosureSimulation: async (roadId) => {
    const road = get().roads.find((r) => r.id === roadId) || get().roads[0];
    set({
      isRoadDetailModalOpen: false,
      isClosureImpactViewOpen: true,
      isSimulationActive: true,
      selectedRoad: road,
    });

    const simulationResult = await simulateRoadClosure(road.id);
    set({ simulationResult });
  },

  closeClosureImpactView: () => set({ isClosureImpactViewOpen: false }),

  applySafestRoute: () => {
    set({
      isClosureImpactViewOpen: false,
      activeTab: 'map',
      activeRouteId: 'route-b-alternate',
      isSimulationActive: true,
    });
  },

  openExplainWhyModal: async (actionContext) => {
    set({ isExplainWhyModalOpen: true, isAIThinking: true });
    try {
      const explanation = await requestAIExplanation({
        action: actionContext || 'Divert emergency transit to Route B (East Causeway)',
        context: 'Zone C flood inundation rate 0.5m/hr with Broadway St. compromised',
      });
      set({ currentExplanation: explanation, isAIThinking: false });
    } catch {
      set({ isAIThinking: false });
    }
  },

  closeExplainWhyModal: () => set({ isExplainWhyModalOpen: false }),

  openRoverModal: (roverId) => {
    const rover = roverId ? get().assets.find((a) => a.id === roverId) || null : get().assets.find((a) => a.type === 'ROVER') || null;
    set({ isRoverModalOpen: true, activeRover: rover });
  },

  closeRoverModal: () => set({ isRoverModalOpen: false }),

  dispatchRoverMission: (roverId, missionTarget) => {
    set((state) => ({
      assets: state.assets.map((a) =>
        a.id === roverId
          ? {
              ...a,
              status: 'EN_ROUTE',
              mission: `INSPECT & VERIFY ${missionTarget.toUpperCase()}`,
              targetDestination: missionTarget,
            }
          : a
      ),
      intelligenceFeed: [
        {
          id: `rep-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          timeAgo: 'Just now',
          sourceType: 'ROVER',
          title: `ROVER Dispatch Mission: ${missionTarget}`,
          description: `Telemetry ping initiated. Optical obstacle detection active. En route to ${missionTarget}.`,
          locationName: missionTarget,
          reliability: 'HIGH',
          status: 'INVESTIGATING',
          severity: 'HIGH',
        },
        ...state.intelligenceFeed,
      ],
    }));
  },

  selectZone: (zone) => set({ selectedZone: zone }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleLayer: (layer) =>
    set((state) => ({
      layerFilters: {
        ...state.layerFilters,
        [layer]: !state.layerFilters[layer],
      },
    })),

  updateRoadStatus: (roadId, status) => {
    set((state) => ({
      roads: state.roads.map((r) => (r.id === roadId ? { ...r, status } : r)),
    }));
  },

  sendChatMessage: async (text) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
      isAIThinking: true,
    }));

    try {
      const reply = await sendAIChatQuery(text);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'NIRNAY_AI',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: reply.text,
        insightCard: reply.insightCard,
        suggestedFollowUps: ['Safest routes?', 'Hospital status?', 'Simulate Broadway closure', 'Rover video telemetry'],
      };
      set((state) => ({
        chatMessages: [...state.chatMessages, aiMsg],
        isAIThinking: false,
      }));
    } catch {
      set({ isAIThinking: false });
    }
  },

  setTimelineIndex: (index) => {
    const events = get().timelineEvents;
    const clamped = Math.max(0, Math.min(events.length - 1, index));
    const currentEvt = events[clamped];

    if (currentEvt.roadStateChanges) {
      currentEvt.roadStateChanges.forEach((change) => {
        get().updateRoadStatus(change.roadId, change.newStatus);
      });
    }

    set({ currentTimelineIndex: clamped });
  },

  toggleTimelinePlayback: () => {
    const isPlaying = !get().isTimelinePlaying;
    set({ isTimelinePlaying: isPlaying });
  },

  nextTimelineStep: () => {
    const { currentTimelineIndex, timelineEvents, setTimelineIndex } = get();
    if (currentTimelineIndex < timelineEvents.length - 1) {
      setTimelineIndex(currentTimelineIndex + 1);
    }
  },

  previousTimelineStep: () => {
    const { currentTimelineIndex, setTimelineIndex } = get();
    if (currentTimelineIndex > 0) {
      setTimelineIndex(currentTimelineIndex - 1);
    }
  },

  resetAllSimulation: () => {
    set({
      isSimulationActive: false,
      simulationResult: null,
      isClosureImpactViewOpen: false,
      isRoadDetailModalOpen: false,
      activeRouteId: 'route-b-alternate',
      roads: INITIAL_ROADS,
    });
  },

  hydrate: () => {
    if (!hydrationPromise) {
      hydrationPromise = Promise.all([
        fetchGraphData(),
        fetchRoutes(),
        fetchTimelineEvents(),
        fetchIntelligenceFeed(),
      ]).then(([graph, routes, timelineEvents, intelligenceFeed]) => {
        set({
          roads: graph.roads,
          facilities: graph.facilities,
          zones: graph.zones,
          assets: graph.assets,
          routes,
          timelineEvents,
          intelligenceFeed,
        });
      });
    }

    return hydrationPromise;
  },
}));
