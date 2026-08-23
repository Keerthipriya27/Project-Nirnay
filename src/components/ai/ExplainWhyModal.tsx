import React from 'react';
import { useCrisisStore } from '../../store/useCrisisStore';
import {
  X,
  BrainCircuit,
  ShieldAlert,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export const ExplainWhyModal: React.FC = () => {
  const { isExplainWhyModalOpen, closeExplainWhyModal, currentExplanation, isAIThinking } =
    useCrisisStore();

  if (!isExplainWhyModalOpen) return null;

  const expl = currentExplanation || {
    title: 'Rationale: Prioritizing Alternate Route B over Broadway St.',
    explanation:
      'Road B (East Causeway) maintains 100% elevation clearance and avoids low-lying culverts currently back-flooding near Broadway St. Closing Broadway St. now prevents transit blockades from stranding emergency ambulances, preserving trauma hospital access.',
    confidence: 87,
    priority: 'CRITICAL',
    counterfactual:
      'If Broadway St. remains designated as active, ambulance travel time will suffer catastrophic delays exceeding 45+ minutes as rising waters trap vehicles at 4th Ave.',
    evidence: [
      'Sensor W-19 reads 48cm depth rising at 0.5m/hr.',
      '14 citizen reports corroborate severe impassability.',
      'East Causeway structural strain telemetry reports 100% nominal.',
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in select-none text-slate-200">
      <div className="bg-[#0a0a0c]/95 rounded-lg max-w-2xl w-full shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-xs">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline text-base md:text-lg font-bold text-white">
                  NIRNAY Decision Rationale
                </h3>
                <span className="bg-[#00ff99]/20 text-[#00ff99] border border-[#00ff99]/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                  {expl.confidence}% Confidence
                </span>
              </div>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                Causal & Counterfactual AI Verification Engine
              </p>
            </div>
          </div>
          <button
            onClick={closeExplainWhyModal}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans custom-scrollbar">
          {/* Main Statement */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h4 className="font-headline font-bold text-sm text-white mb-1.5 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-400" />
              {expl.title}
            </h4>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">{expl.explanation}</p>
          </div>

          {/* Counterfactual Analysis Box */}
          <div className="bg-red-950/30 p-4 rounded-lg border border-red-500/40">
            <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-[11px] uppercase tracking-wider mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              Counterfactual Risk (What if command does NOT act?)
            </div>
            <p className="text-red-200 text-xs leading-relaxed">{expl.counterfactual}</p>
          </div>

          {/* Evidence Chain */}
          <div>
            <h5 className="font-mono font-bold text-[10px] text-white/40 uppercase tracking-widest mb-2">
              Corroborating Telemetry & Evidence Chain
            </h5>
            <div className="space-y-1.5">
              {expl.evidence.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded bg-white/5 border border-white/10"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff99] shrink-0 mt-0.5" />
                  <span className="font-mono text-xs text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-white/10 bg-white/5 flex justify-end">
          <button
            onClick={closeExplainWhyModal}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.4)]"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
