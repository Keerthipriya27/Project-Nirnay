import React, { useState } from 'react';
import { useCrisisStore } from '../../store/useCrisisStore';
import {
  Search,
  Mic,
  Shield,
  Bot,
  Plane,
  Droplets,
  Layers,
  Sparkles,
  Activity,
  Crosshair,
  TrendingUp,
} from 'lucide-react';

export const Tactical2DMap: React.FC = () => {
  const {
    roads,
    facilities,
    assets,
    selectedRoad,
    openRoadDetailModal,
    liveContextActive,
    toggleLiveContext,
    isSimulationActive,
    activeRouteId,
    layerFilters,
    searchQuery,
    setSearchQuery,
    openRoverModal,
  } = useCrisisStore();

  const [hoveredRoadId, setHoveredRoadId] = useState<string | null>(null);

  // Filter roads and facilities based on search query if present
  const filteredFacilities = facilities.filter(
    (f) =>
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-144px)] md:min-h-[calc(100vh-64px)] overflow-hidden geometric-radial-bg select-none">
      {/* Floating Search Bar */}
      <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[480px] z-20">
        <div className="bg-[#0a0a0c]/90 backdrop-blur-xl rounded-lg h-11 flex items-center px-4 shadow-2xl border border-white/10 group focus-within:border-white/30 transition-all text-slate-200">
          <Search className="w-4 h-4 text-white/40 mr-3 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search zones, routes, or facilities..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/40 text-xs md:text-sm outline-none h-full font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[10px] text-white/40 hover:text-white mr-2 px-1.5 py-0.5 rounded bg-white/10 font-mono"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setSearchQuery('Broadway St.')}
            className="h-7 w-7 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Voice Search Simulation"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Left Engine Confidence Card (Geometric HUD) */}
      <div className="absolute top-4 left-4 z-20 hidden lg:flex flex-col gap-2 max-w-[260px]">
        <div className="bg-[#0a0a0c]/90 backdrop-blur-xl p-3.5 rounded-lg border border-white/10 shadow-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#00ff99]" />
              Confidence Index
            </span>
            <span className="font-mono font-bold text-sm text-[#00ff99]">87%</span>
          </div>

          <div className="space-y-1.5 pt-1 text-[10px] font-mono text-white/60">
            <div className="flex justify-between items-center">
              <span>Citizen Telemetry:</span>
              <span className="text-[#00ff99] font-bold">14 Reports</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div className="bg-[#00ff99] h-full rounded-full" style={{ width: '85%' }} />
            </div>

            <div className="flex justify-between items-center pt-0.5">
              <span>Optical Flood Sensor:</span>
              <span className="text-yellow-400 font-bold">48cm (+0.5m/h)</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div className="bg-yellow-400 h-full rounded-full" style={{ width: '65%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* SVG Canvas for High-Precision Tactical Road Network */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 800"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Glowing filter for critical routes */}
          <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Water hazard gradient polygon */}
          <linearGradient id="flood-gradient-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Flood Hazard Polygon Layer (Zone C & River basin) */}
        {layerFilters.floods && (
          <path
            d="M 280,320 Q 380,340 480,480 T 360,680 Q 240,640 180,480 Z"
            fill="url(#flood-gradient-dark)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            className="animate-pulse-subtle"
          />
        )}

        {/* 1. Base Road Network */}
        {layerFilters.roads && (
          <>
            {/* North Crossing Way (Clear / Alternative) */}
            <path
              d="M 0,200 Q 300,250 600,100 T 1000,260"
              stroke="#00ff99"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.65"
              className="pointer-events-auto cursor-pointer hover:opacity-100 hover:stroke-[6px] transition-all"
              onClick={() => openRoadDetailModal('road-north-bridge')}
            />

            {/* East Causeway (Route B) (Neon Green - Clear / Designated Evacuation Ribbon) */}
            <path
              d="M 100,0 Q 150,300 400,400 T 800,700"
              stroke={activeRouteId === 'route-b-alternate' || isSimulationActive ? '#00ff99' : '#00ff99'}
              strokeWidth={activeRouteId === 'route-b-alternate' ? '6' : '4'}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow-green)"
              opacity="0.9"
              className="pointer-events-auto cursor-pointer hover:opacity-100 transition-all"
              onClick={() => openRoadDetailModal('road-route-b')}
            />

            {/* Animated Dashed Pulse for Recommended Route B */}
            {(activeRouteId === 'route-b-alternate' || isSimulationActive) && (
              <path
                d="M 100,0 Q 150,300 400,400 T 800,700"
                stroke="#ffffff"
                strokeWidth="2"
                fill="none"
                strokeDasharray="10 10"
                strokeLinecap="round"
                className="animate-dash-flow pointer-events-none"
              />
            )}

            {/* Riverside Pkwy (Amber Warning - Inundation Risk) */}
            <path
              d="M 0,600 Q 400,550 700,700 T 1000,650"
              stroke="#ffcc00"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
              filter="url(#glow-amber)"
              className="pointer-events-auto cursor-pointer hover:opacity-100 hover:stroke-[6px] transition-all"
              onClick={() => openRoadDetailModal('road-riverside')}
            />

            {/* Broadway St. (Red - Blocked Hazard Corridor) */}
            <path
              d="M 500,0 Q 450,400 300,600 T 100,850"
              stroke={isSimulationActive ? '#ff4444' : '#ffcc00'}
              strokeWidth={selectedRoad?.id === 'road-broadway' ? '7' : '5'}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={isSimulationActive ? 'url(#glow-red)' : 'url(#glow-amber)'}
              opacity="0.95"
              className="pointer-events-auto cursor-pointer hover:stroke-[8px] transition-all animate-pulse"
              onClick={() => openRoadDetailModal('road-broadway')}
            />

            {/* Blocked hatch pattern on Broadway */}
            {isSimulationActive && (
              <path
                d="M 500,0 Q 450,400 300,600 T 100,850"
                stroke="#ffffff"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="4 8"
                strokeLinecap="round"
              />
            )}
          </>
        )}
      </svg>

      {/* Floating Tactical Clickable Tag for Broadway St */}
      <div
        onClick={() => openRoadDetailModal('road-broadway')}
        className="absolute top-[48%] left-[34%] z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group pointer-events-auto"
      >
        <div className="bg-red-950/90 hover:bg-red-900 px-3 py-1.5 rounded border border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.35)] flex items-center gap-2 group-hover:scale-105 transition-all duration-150">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono font-bold text-xs text-red-200 uppercase">Broadway St.</span>
          <span className="bg-red-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
            Blocked
          </span>
        </div>
      </div>

      {/* Map POI Icons (Hospitals, Safe Zones, Shelters) */}
      {layerFilters.facilities &&
        filteredFacilities.map((fac) => {
          const isHospital = fac.type === 'HOSPITAL';
          const isShelter = fac.type === 'SHELTER';
          const isSafeZone = fac.type === 'SAFE_ZONE';

          return (
            <div
              key={fac.id}
              style={{ top: fac.mapPercent.top, left: fac.mapPercent.left }}
              className="absolute flex flex-col items-center z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group pointer-events-auto"
              onClick={() => {
                if (isHospital) {
                  openRoadDetailModal('road-broadway');
                }
              }}
            >
              <div
                className={`h-9 w-9 bg-[#0a0a0c]/95 rounded-lg shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-150 border ${
                  isHospital
                    ? 'border-red-500/60 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                    : isSafeZone || isShelter
                    ? 'border-[#00ff99]/60 text-[#00ff99] shadow-[0_0_12px_rgba(0,255,153,0.2)]'
                    : 'border-blue-500/60 text-blue-400'
                }`}
              >
                {isHospital && (
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_hospital
                  </span>
                )}
                {isShelter && (
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    house
                  </span>
                )}
                {isSafeZone && (
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    shield
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono font-bold text-white/80 mt-1 bg-[#0a0a0c]/90 px-2 py-0.5 rounded border border-white/10 shadow-sm whitespace-nowrap">
                {fac.name}
              </span>
            </div>
          );
        })}

      {/* Emergency Assets Layer: Autonomous Rover */}
      {layerFilters.rovers && (
        <div
          onClick={() => openRoverModal('asset-rover-07')}
          className="absolute top-[42%] left-[48%] z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group pointer-events-auto"
          title="ROVER-07: Teleoperation & Video Stream"
        >
          <div className="relative flex flex-col items-center">
            {/* Pulsing Radar Halo */}
            <div className="absolute -inset-2 rounded-full bg-[#00ff99]/20 animate-ping" />
            <div className="h-9 w-9 bg-[#0a0a0c] text-[#00ff99] rounded-lg shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-[#00ff99]">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 mt-1 bg-[#0a0a0c] text-[#00ff99] border border-[#00ff99]/40 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff99] animate-pulse" />
              ROVER-07
            </div>
          </div>
        </div>
      )}

      {/* Drone Recon Asset */}
      {layerFilters.drones && (
        <div
          className="absolute top-[28%] left-[28%] z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
          title="DRONE-02: Aerial Infrared Scan"
        >
          <div className="relative flex flex-col items-center group">
            <div className="h-8 w-8 bg-[#0a0a0c] text-blue-400 rounded-lg shadow-md flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-500/40">
              <Plane className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono font-bold text-white/70 mt-0.5 bg-[#0a0a0c]/80 px-1 py-0.5 rounded border border-white/10">
              DRONE-02
            </span>
          </div>
        </div>
      )}

      {/* Water Sensor Gauge Marker */}
      {layerFilters.floods && (
        <div className="absolute top-[54%] left-[26%] z-20 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-blue-950/90 text-cyan-300 text-[10px] font-mono font-bold px-2 py-1 rounded border border-cyan-500/40 shadow-lg flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" />
            <span>48cm (+0.5m/h)</span>
          </div>
        </div>
      )}

      {/* Floating Tactical Legend & Status Chips (Top Right) */}
      <div className="absolute top-20 right-4 z-20 hidden sm:flex flex-col gap-2">
        <div className="bg-[#0a0a0c]/90 backdrop-blur-xl p-3 rounded-lg shadow-2xl border border-white/10 text-xs flex flex-col gap-1.5 max-w-[210px]">
          <div className="font-mono font-bold text-white text-[10px] uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-white/10">
            <Shield className="w-3 h-3 text-blue-400" /> Corridor Hierarchy
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm bg-[#00ff99]" />
            <span className="text-white/70 text-[11px] font-mono">Route B (Safe Evac)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm bg-yellow-400" />
            <span className="text-white/70 text-[11px] font-mono">Rising Water Alert</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm bg-red-500" />
            <span className="text-white/70 text-[11px] font-mono">Broadway St. (Blocked)</span>
          </div>
        </div>
      </div>

      {/* Live Context Toggle Panel (Bottom Floating) */}
      <div className="absolute bottom-[80px] md:bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[400px] z-20">
        <div className="bg-[#0a0a0c]/95 backdrop-blur-xl rounded-lg p-3.5 shadow-2xl flex items-center justify-between border border-white/10 text-slate-200">
          <div>
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-white">Live Context Ingest</h3>
            <p className="text-[11px] text-white/40 font-mono">Dynamic route & risk telemetry</p>
          </div>

          {/* Geometric Switch */}
          <button
            onClick={toggleLiveContext}
            className={`w-12 h-6 rounded-full relative flex items-center px-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
              liveContextActive ? 'bg-[#00ff99]' : 'bg-white/20'
            }`}
            id="liveUpdateToggle"
            title="Toggle Live Updates"
          >
            <div
              className={`w-5 h-5 bg-black rounded-full shadow transform transition-transform duration-200 ${
                liveContextActive ? 'translate-x-6' : 'translate-x-0'
              }`}
              id="toggleKnob"
            />
          </button>
        </div>
      </div>
    </div>
  );
};
