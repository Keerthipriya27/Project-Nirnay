import React from 'react';
import { useCrisisStore } from '../../store/useCrisisStore';
import {
  ArrowLeft,
  AlertTriangle,
  Users,
  Building2,
  Timer,
  BrainCircuit,
  Navigation,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const ClosureImpactView: React.FC = () => {
  const {
    isClosureImpactViewOpen,
    closeClosureImpactView,
    applySafestRoute,
    openExplainWhyModal,
    simulationResult,
    selectedRoad,
  } = useCrisisStore();

  if (!isClosureImpactViewOpen) return null;

  const roadName = selectedRoad?.name || 'Broadway St.';
  const peopleCount = simulationResult ? `${(simulationResult.peopleAffected / 1000).toFixed(0)}k` : '12k';
  const hospitalsCount = simulationResult?.hospitalsIsolated ?? 3;
  const delayCount = simulationResult ? `${simulationResult.delayAddedMinutes}m` : '12m';

  return (
    <div className="fixed inset-0 z-50 bg-[#050506] text-slate-200 min-h-screen flex flex-col font-sans overflow-y-auto animate-in fade-in duration-150 select-none custom-scrollbar">
      {/* Top Bar */}
      <header className="w-full top-0 sticky bg-[#0a0a0c] border-b border-white/10 z-50">
        <div className="flex justify-between items-center px-4 md:px-6 h-14 md:h-16 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={closeClosureImpactView}
              aria-label="Go back"
              className="h-9 w-9 flex items-center justify-center hover:bg-white/10 text-slate-300 hover:text-white transition-colors rounded-lg active:scale-95 duration-100 cursor-pointer bg-white/5 border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="text-lg md:text-xl font-black tracking-widest text-white flex items-center gap-2">
              <div className="w-5 h-5 bg-red-600 rounded-sm rotate-45 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              NIRNAY
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Impact Engine</span>
            <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-bold uppercase">
              ACTIVE SIMULATION
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 pb-28 max-w-4xl mx-auto w-full geometric-radial-bg">
        <div className="w-full flex flex-col items-center gap-6 md:gap-8 text-center">
          {/* Header Title & Disruption Badge */}
          <div className="space-y-2">
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl text-white font-bold tracking-tight">
              Closure Impact: {roadName}
            </h2>
            <div className="flex items-center justify-center gap-2 text-yellow-400 bg-yellow-500/10 px-3.5 py-1 rounded border border-yellow-500/30 inline-flex mx-auto">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
              <span className="font-mono font-bold text-xs uppercase tracking-wider">Simulated Disruption</span>
            </div>
          </div>

          {/* Bento Grid of Impact Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {/* Stat 1: People Affected */}
            <div className="bg-[#0a0a0c]/90 p-6 rounded-lg border border-white/10 shadow-2xl flex flex-col items-center justify-center gap-2 hover:border-white/20 transition-all">
              <span
                className="material-symbols-outlined text-[36px] text-blue-400"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                group
              </span>
              <div className="flex flex-col items-center">
                <span className="font-mono text-3xl md:text-4xl font-bold text-white leading-none">
                  {peopleCount}
                </span>
                <span className="text-xs font-mono font-semibold text-white/50 uppercase tracking-wider mt-1.5">
                  People Affected
                </span>
              </div>
            </div>

            {/* Stat 2: Hospitals Isolated */}
            <div className="bg-[#0a0a0c]/90 p-6 rounded-lg border border-white/10 shadow-2xl flex flex-col items-center justify-center gap-2 hover:border-white/20 transition-all">
              <span
                className="material-symbols-outlined text-[36px] text-red-500"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_hospital
              </span>
              <div className="flex flex-col items-center">
                <span className="font-mono text-3xl md:text-4xl font-bold text-red-500 leading-none">
                  {hospitalsCount}
                </span>
                <span className="text-xs font-mono font-semibold text-white/50 uppercase tracking-wider mt-1.5">
                  Hospitals Isolated
                </span>
              </div>
            </div>

            {/* Stat 3: Delay Added */}
            <div className="bg-[#0a0a0c]/90 p-6 rounded-lg border border-white/10 shadow-2xl flex flex-col items-center justify-center gap-2 hover:border-white/20 transition-all">
              <span
                className="material-symbols-outlined text-[36px] text-yellow-400"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                timer
              </span>
              <div className="flex flex-col items-center">
                <span className="font-mono text-3xl md:text-4xl font-bold text-yellow-400 leading-none">
                  {delayCount}
                </span>
                <span className="text-xs font-mono font-semibold text-white/50 uppercase tracking-wider mt-1.5">
                  Delay Added
                </span>
              </div>
            </div>
          </div>

          {/* AI Recommendation Box */}
          <div className="bg-blue-600/10 border border-blue-500/30 p-5 rounded-lg w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left shadow-2xl">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="bg-blue-600 rounded p-2 flex-shrink-0 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <p className="font-sans text-sm md:text-base text-slate-200 leading-relaxed">
                We recommend alternate <strong className="font-bold text-[#00ff99] font-mono">Route B</strong> to maintain hospital emergency access.
              </p>
            </div>

            <button
              onClick={() => openExplainWhyModal('Why recommend Route B over Broadway St.?')}
              className="text-xs font-mono font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 whitespace-nowrap self-end sm:self-auto cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded border border-white/10 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Why this decision?
            </button>
          </div>

          {/* Primary Call to Action Button */}
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-2">
            <button
              onClick={applySafestRoute}
              className="bg-blue-600 hover:bg-blue-500 text-white min-h-[48px] px-8 rounded-lg font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 duration-150 w-full sm:w-auto cursor-pointer"
            >
              <Navigation className="w-4 h-4 rotate-45" />
              <span>Show Safest Route</span>
            </button>

            <button
              onClick={closeClosureImpactView}
              className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white min-h-[48px] px-6 rounded-lg font-mono font-bold text-xs uppercase tracking-wider border border-white/10 transition-colors cursor-pointer"
            >
              Return to Map
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
