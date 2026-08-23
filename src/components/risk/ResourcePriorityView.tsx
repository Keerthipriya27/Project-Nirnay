import React, { useState } from 'react';
import { useCrisisStore } from '../../store/useCrisisStore';
import { OperationalZone } from '../../types';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Users,
  Droplets,
  Shield,
  ArrowRight,
  Bot,
  Send,
  CheckCircle2,
  X,
} from 'lucide-react';

export const ResourcePriorityView: React.FC = () => {
  const { zones, selectZone, selectedZone, dispatchRoverMission, openRoverModal, setActiveTab } =
    useCrisisStore();

  const [activeDetailZone, setActiveDetailZone] = useState<OperationalZone | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const handleZoneClick = (zone: OperationalZone) => {
    setActiveDetailZone(zone);
    selectZone(zone);
  };

  const handleDispatch = (zoneName: string) => {
    dispatchRoverMission('asset-rover-07', zoneName);
    setDispatchSuccess(`ROVER-07 Dispatched to ${zoneName} with priority optical scan.`);
    setTimeout(() => setDispatchSuccess(null), 4000);
  };

  return (
    <div className="w-full flex-1 max-w-4xl mx-auto px-4 md:px-6 py-6 pb-28 md:pb-12 font-sans select-none text-slate-200">
      {/* Title & Subtitle */}
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl text-white font-bold mb-1 tracking-tight">
          Resource Priority
        </h2>
        <p className="text-sm text-white/50 font-sans">
          Current tactical assessment of operational sectors requiring intervention.
        </p>
      </div>

      {/* Priority Cards List */}
      <div className="flex flex-col gap-3.5">
        {zones.map((zone) => {
          const isCritical = zone.priority === 'CRITICAL';
          const isHigh = zone.priority === 'HIGH';

          return (
            <div
              key={zone.id}
              onClick={() => handleZoneClick(zone)}
              className={`bg-[#0a0a0c]/90 rounded-lg p-5 border transition-all cursor-pointer min-h-[96px] flex flex-col justify-center active:scale-[0.99] group shadow-xl ${
                isCritical
                  ? 'border-red-500/40 hover:border-red-500/70 bg-gradient-to-r from-red-950/20 to-transparent'
                  : isHigh
                  ? 'border-yellow-500/40 hover:border-yellow-500/70 bg-gradient-to-r from-yellow-950/20 to-transparent'
                  : 'border-blue-500/30 hover:border-blue-500/60 bg-gradient-to-r from-blue-950/20 to-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center border shrink-0 ${
                      isCritical
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : isHigh
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    }`}
                  >
                    {isCritical && (
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        warning
                      </span>
                    )}
                    {isHigh && (
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        report
                      </span>
                    )}
                    {!isCritical && !isHigh && (
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        info
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                        {zone.name}
                      </h3>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                          isCritical
                            ? 'bg-red-500/20 border-red-500/40 text-red-400'
                            : isHigh
                            ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                            : 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                        }`}
                      >
                        {zone.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono text-white/40 flex items-center gap-1 group-hover:text-blue-400 transition-colors">
                  INTEL <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>

              <p className="font-sans text-xs md:text-sm text-slate-300 ml-11 leading-relaxed">
                {zone.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Dispatch feedback toast */}
      {dispatchSuccess && (
        <div className="mt-4 p-3.5 rounded-lg bg-[#00ff99]/10 border border-[#00ff99]/40 text-[#00ff99] text-xs font-mono flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00ff99]" />
            <span>{dispatchSuccess}</span>
          </div>
          <button
            onClick={() => setActiveTab('map')}
            className="underline font-bold text-[#00ff99] hover:text-white cursor-pointer uppercase tracking-wider text-[11px]"
          >
            Track Asset
          </button>
        </div>
      )}

      {/* Zone Tactical Detail Modal */}
      {activeDetailZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0a0a0c]/95 rounded-lg max-w-lg w-full shadow-2xl border border-white/10 overflow-hidden text-slate-200">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded border ${
                    activeDetailZone.priority === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : activeDetailZone.priority === 'HIGH'
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-white">
                    {activeDetailZone.name}
                  </h3>
                  <span className="text-[11px] font-mono text-white/40">Sector Status: {activeDetailZone.status}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveDetailZone(null)}
                className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-xs font-sans">
              <p className="text-slate-300 text-sm leading-relaxed">{activeDetailZone.description}</p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex flex-col">
                  <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider">
                    Total Population
                  </span>
                  <span className="font-mono text-xl font-bold text-white mt-1">
                    {activeDetailZone.population.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex flex-col">
                  <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider">
                    Water Inundation Rate
                  </span>
                  <span className="font-mono text-xl font-bold text-yellow-400 mt-1">
                    {activeDetailZone.waterRiseRate}
                  </span>
                </div>
              </div>

              {/* Evacuation Progress Bar */}
              <div className="bg-white/5 p-3.5 rounded-lg border border-white/10">
                <div className="flex justify-between text-xs font-mono font-semibold text-white mb-2">
                  <span className="text-white/60">Evacuation Clearance</span>
                  <span className="text-[#00ff99]">{activeDetailZone.evacuationProgress}% Complete</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00ff99] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,255,153,0.5)]"
                    style={{ width: `${activeDetailZone.evacuationProgress}%` }}
                  />
                </div>
              </div>

              {/* Tactical Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={() => {
                    handleDispatch(activeDetailZone.name);
                    setActiveDetailZone(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white min-h-[44px] rounded font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.35)]"
                >
                  <Bot className="w-4 h-4 text-[#00ff99]" />
                  <span>Dispatch Rover Unit</span>
                </button>

                <button
                  onClick={() => {
                    setActiveDetailZone(null);
                    setActiveTab('map');
                  }}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 min-h-[44px] px-4 rounded font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View Sector Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
