import React, { useState } from 'react';
import { useCrisisStore } from '../../store/useCrisisStore';
import {
  ShieldAlert,
  Settings,
  Layers,
  Box,
  Map as MapIcon,
  Volume2,
  VolumeX,
  Radio,
  X,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { DISTRICTS } from '../../data/districts';

export const CommandHeader: React.FC = () => {
  const {
    viewMode3D,
    toggleViewMode3D,
    liveContextActive,
    toggleLiveContext,
    isSimulationActive,
    resetAllSimulation,
    layerFilters,
    toggleLayer,
    activeDistrict,
    setActiveDistrict,
  } = useCrisisStore();
  const selectedDistrict = DISTRICTS.find((district) => district.id === activeDistrict) ?? DISTRICTS[0];

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <>
      <header className="w-full top-0 sticky z-40 h-14 md:h-16 border-b border-white/10 bg-[#0a0a0c] flex items-center justify-between px-4 md:px-6 shrink-0 text-slate-200">
        {/* Left Branding & Crisis Telemetry Identifiers */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="text-xl md:text-2xl font-black tracking-widest text-white flex items-center gap-2.5">
            {/* Geometric Rotated Diamond Symbol */}
            <div className="w-5 h-5 md:w-6 md:h-6 bg-red-600 rounded-sm rotate-45 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.5)]">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full"></div>
            </div>
            <span>NIRNAY</span>
          </div>

          <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>

          <div className="hidden sm:flex flex-col">
            <span className="text-[9px] text-white/40 uppercase tracking-tighter font-mono">Crisis ID</span>
            <span className="text-xs font-mono text-white/80 tracking-tight">{selectedDistrict.crisisLabel}</span>
          </div>
        </div>

        {/* Center: Live Operation Status & Metrics (Desktop) */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          <label className="flex items-center gap-2 text-left">
            <span className="text-[9px] text-white/40 uppercase font-mono tracking-wider">District</span>
            <select value={activeDistrict} onChange={(event) => setActiveDistrict(event.target.value as typeof activeDistrict)} className="bg-[#14151b] border border-white/10 rounded px-2 py-1 text-xs font-mono text-white outline-none">
              {DISTRICTS.map((district) => <option key={district.id} value={district.id}>{district.shortName}</option>)}
            </select>
          </label>
          <div className="text-center">
            <p className="text-[9px] text-white/40 uppercase font-mono tracking-wider">Severity</p>
            <p className="text-xs xl:text-sm font-bold text-red-500 font-mono">CRITICAL (CAT 4)</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-white/40 uppercase font-mono tracking-wider">Affected Pop.</p>
            <p className="text-xs xl:text-sm font-bold text-white font-mono">124,302</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-white/40 uppercase font-mono tracking-wider">Response Unit</p>
            <p className="text-xs xl:text-sm font-bold text-[#00ff99] font-mono">NDRF-WEST-01</p>
          </div>

          {/* Active Simulation Alert if running */}
          {isSimulationActive ? (
            <div className="px-3 py-1.5 bg-red-600/20 border border-red-500/50 rounded flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs font-bold text-red-500 uppercase tracking-tight">Simulated: Broadway Closed</span>
              <button
                onClick={resetAllSimulation}
                className="underline hover:text-white text-[10px] font-bold text-red-400 cursor-pointer ml-1"
              >
                Reset
              </button>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-red-600/10 border border-red-500/40 rounded flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider font-mono">
                Live Operation Active
              </span>
            </div>
          )}
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* 2D / 3D Digital Twin Switch */}
          <button
            onClick={toggleViewMode3D}
            className={`h-9 px-3 rounded flex items-center gap-1.5 text-xs font-bold font-mono transition-all active:scale-95 duration-100 cursor-pointer ${
              viewMode3D
                ? 'bg-blue-600 text-white border border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                : 'bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
            title="Toggle 3D Digital Twin / 2D Tactical View"
          >
            {viewMode3D ? <Box className="w-3.5 h-3.5 text-cyan-300" /> : <MapIcon className="w-3.5 h-3.5 text-[#00ff99]" />}
            <span className="hidden sm:inline">{viewMode3D ? '3D TWIN' : '2D TACTICAL'}</span>
          </button>

          {/* Layers button */}
          <button
            onClick={() => setIsLayersOpen(!isLayersOpen)}
            className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors rounded active:scale-95 duration-100 cursor-pointer bg-white/5 border border-white/10"
            title="Spatial Data Layers"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-9 w-9 hidden sm:flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors rounded active:scale-95 duration-100 cursor-pointer bg-white/5 border border-white/10"
            title={soundEnabled ? 'Emergency Audio Alerts: Active' : 'Emergency Audio Alerts: Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00ff99]" /> : <VolumeX className="w-4 h-4 text-white/40" />}
          </button>

          {/* Settings button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors rounded active:scale-95 duration-100 cursor-pointer bg-white/5 border border-white/10"
            title="Command Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Layers Popover Menu */}
      {isLayersOpen && (
        <div className="fixed top-[62px] right-4 md:right-16 z-50 w-72 bg-[#0a0a0c]/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 p-4 animate-in fade-in slide-in-from-top-2 text-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 font-mono">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Active Map Layers
            </h3>
            <button
              onClick={() => setIsLayersOpen(false)}
              className="text-white/40 hover:text-white p-1 rounded hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="py-2 flex flex-col gap-1.5">
            {[
              { id: 'floods', label: 'Flood Inundation Polygons', color: 'bg-blue-500' },
              { id: 'roads', label: 'Dynamic Road Risk States', color: 'bg-amber-500' },
              { id: 'facilities', label: 'Hospitals & Safe Shelters', color: 'bg-emerald-500' },
              { id: 'assets', label: 'Emergency Fleet & Ambulances', color: 'bg-red-500' },
              { id: 'rovers', label: 'Autonomous Field Rovers', color: 'bg-[#00ff99]' },
              { id: 'drones', label: 'Aerial Recon Drones', color: 'bg-purple-500' },
              { id: 'weather', label: 'Precipitation & Wind Particles', color: 'bg-slate-400' },
            ].map((layer) => (
              <label
                key={layer.id}
                className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer text-xs font-medium text-slate-200 border border-white/5"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-sm ${layer.color}`} />
                  <span className="font-mono text-[11px]">{layer.label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={layerFilters[layer.id as keyof typeof layerFilters]}
                  onChange={() => toggleLayer(layer.id as keyof typeof layerFilters)}
                  className="rounded bg-black/50 border-white/20 text-blue-500 focus:ring-0 w-3.5 h-3.5"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#0a0a0c] text-slate-200 rounded-lg max-w-md w-full shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono">Command System Config</h3>
                <p className="text-[10px] text-white/40 font-mono mt-0.5">NIRNAY Node: #FL-MUM-ALPHA-09</p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5">
                <div>
                  <div className="font-bold text-white font-mono uppercase text-xs">Live Context Ingest</div>
                  <div className="text-[11px] text-white/40">Real-time route & risk sensor streaming</div>
                </div>
                <button
                  onClick={toggleLiveContext}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                    liveContextActive ? 'bg-[#00ff99]' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${
                      liveContextActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5">
                <div>
                  <div className="font-bold text-white font-mono uppercase text-xs">3D Digital Twin Engine</div>
                  <div className="text-[11px] text-white/40">High fidelity elevation & depth shaders</div>
                </div>
                <button
                  onClick={toggleViewMode3D}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                    viewMode3D ? 'bg-blue-600' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      viewMode3D ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded border border-white/10 bg-white/5 space-y-2 text-[11px] font-mono">
                <div className="font-bold text-[#00ff99] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#00ff99]" />
                  Telemetry Health & Ingest Feeds
                </div>
                <div className="flex justify-between text-white/60">
                  <span>IoT Water Gauges:</span>
                  <span className="font-semibold text-[#00ff99] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 16 / 16 CONNECTED
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>SAR Sentinel Radar:</span>
                  <span className="font-semibold text-[#00ff99]">OPTIMAL (14:00 UTC)</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Autonomous Rovers:</span>
                  <span className="font-semibold text-blue-400">ROVER-07 ONLINE (4K FEED)</span>
                </div>
              </div>

              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors mt-2 font-mono"
              >
                Apply & Return to Command Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
