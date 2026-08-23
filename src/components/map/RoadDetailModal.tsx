import React from 'react';
import { useCrisisStore } from '../../store/useCrisisStore';
import {
  X,
  Ban,
  Users,
  Radio,
  CheckCircle2,
  GitFork,
  HelpCircle,
  Activity,
  Bot,
} from 'lucide-react';

export const RoadDetailModal: React.FC = () => {
  const {
    selectedRoad,
    isRoadDetailModalOpen,
    closeRoadDetailModal,
    triggerRoadClosureSimulation,
    openExplainWhyModal,
    openRoverModal,
  } = useCrisisStore();

  if (!isRoadDetailModalOpen || !selectedRoad) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-150 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
        onClick={closeRoadDetailModal}
      />

      {/* Road Detail Card */}
      <div className="bg-[#0a0a0c]/95 backdrop-blur-xl rounded-t-xl md:rounded-lg shadow-2xl w-full max-w-md p-6 flex flex-col gap-5 relative z-10 border border-white/10 pointer-events-auto text-slate-200">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline text-xl md:text-2xl text-white font-bold tracking-tight">
              {selectedRoad.name}
            </h2>
            <span className="text-[11px] text-white/40 font-mono">
              Segment ID: #{selectedRoad.id} • Length: {selectedRoad.lengthKm} km
            </span>
          </div>
          <button
            onClick={closeRoadDetailModal}
            className="w-8 h-8 rounded flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors active:scale-95 duration-100 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="self-start">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold tracking-wider uppercase border ${
              selectedRoad.status === 'BLOCKED'
                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                : selectedRoad.status === 'CRITICAL'
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                : 'bg-[#00ff99]/20 border-[#00ff99]/50 text-[#00ff99]'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{selectedRoad.status}</span>
          </div>
        </div>

        {/* Plain Language Explanation & Confidence Score */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex flex-col gap-3">
          <p className="font-sans text-xs md:text-sm text-slate-200 leading-relaxed">
            {selectedRoad.uncertaintyDescription.includes('Reports disagree') ? (
              <>
                Reports disagree about this road. We're{' '}
                <strong className="font-bold text-[#00ff99] font-mono">
                  {selectedRoad.confidenceScore}% sure
                </strong>{' '}
                it's blocked.
              </>
            ) : (
              selectedRoad.uncertaintyDescription
            )}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono text-white/50">
            <span>System Confidence:</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00ff99] rounded-full"
                  style={{ width: `${selectedRoad.confidenceScore}%` }}
                />
              </div>
              <span className="font-bold text-[#00ff99]">{selectedRoad.confidenceScore}%</span>
            </div>
          </div>
        </div>

        {/* Data Sources List */}
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">
              Telemetry Sources
            </h3>
            <button
              onClick={() => openRoverModal('asset-rover-07')}
              className="text-[10px] text-blue-400 font-mono font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Bot className="w-3 h-3 text-[#00ff99]" /> Dispatch Rover Recon
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {/* Citizen Source */}
            <div className="flex items-center justify-between p-2.5 rounded bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-semibold text-white">
                    Citizen Alert ({selectedRoad.sources.citizenReports.count} reports)
                  </span>
                  <span className="text-[10px] text-white/40 line-clamp-1">
                    {selectedRoad.sources.citizenReports.summary}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#00ff99] bg-[#00ff99]/10 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 border border-[#00ff99]/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </div>

            {/* Sensor Source */}
            <div className="flex items-center justify-between p-2.5 rounded bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-emerald-500/20 text-[#00ff99] flex items-center justify-center shrink-0 border border-[#00ff99]/30">
                  <Radio className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-semibold text-white">Traffic Sensor</span>
                  <span className="text-[10px] text-white/40 line-clamp-1">
                    {selectedRoad.sources.sensors.summary}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#00ff99] bg-[#00ff99]/10 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 border border-[#00ff99]/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action: "What if this road closes?" */}
        <button
          onClick={() => triggerRoadClosureSimulation(selectedRoad.id)}
          className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-500 text-white rounded font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 duration-100 shadow-[0_0_20px_rgba(59,130,246,0.4)] cursor-pointer"
        >
          <GitFork className="w-4 h-4 rotate-90" />
          <span>What if this road closes?</span>
        </button>
      </div>
    </div>
  );
};
