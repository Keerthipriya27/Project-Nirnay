import React, { useEffect, useState } from 'react';
import { useCrisisStore } from '../../store/useCrisisStore';
import {
  Map,
  AlertTriangle,
  BrainCircuit,
  BarChart3,
  Zap,
  Shield,
  Radio,
  Activity,
  ArrowRight,
  Users,
  Droplets,
  Bot,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { getDistrict } from '../../data/districts';

/* ── animated counter hook ── */
function useCounter(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

export const HomePage: React.FC = () => {
  const { setActiveTab, zones, assets, intelligenceFeed, isSimulationActive, activeDistrict } = useCrisisStore();
  const district = getDistrict(activeDistrict);

  const pop    = useCounter(124302);
  const evac   = useCounter(18200);
  const beds   = useCounter(182);

  const criticalZone = zones.find(z => z.priority === 'CRITICAL');
  const activeAssets = assets.filter(a => a.status === 'EN_ROUTE' || a.status === 'ON_SITE');

  return (
    <div className="w-full min-h-full bg-[#050506] text-slate-200 overflow-y-auto custom-scrollbar pb-28 md:pb-0">

      {/* ════════════════════════════════════════
          HERO — Logo + Identity
      ════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#060810] via-[#08101a] to-[#050506] border-b border-white/5">

        {/* Animated grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,217,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,90,140,0.35),transparent)]" />

        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center gap-6">

          {/* Logo mark */}
          <div className="relative mb-2">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl rotate-45 flex items-center justify-center shadow-[0_0_60px_rgba(220,38,38,0.5)]">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full -rotate-45 flex items-center justify-center">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-red-700" />
              </div>
            </div>
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-2xl rotate-45 border-2 border-red-500/30 animate-ping" style={{ animationDuration: '2.5s' }} />
            <div className="absolute -inset-3 rounded-3xl rotate-45 border border-red-500/10 animate-ping" style={{ animationDuration: '3.5s' }} />
          </div>

          {/* Wordmark */}
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-[0.18em] text-white font-mono">
              NI<span className="text-[#00d9ff]">R</span>NAY
            </h1>
            <p className="text-[11px] md:text-xs font-mono tracking-[0.35em] text-white/40 mt-2 uppercase">
              Emergency Decision Command System
            </p>
          </div>

          {/* Live status pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 border border-red-500/30 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-red-400 tracking-widest uppercase">
              Live Crisis Active · {district.crisisLabel}
            </span>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={() => setActiveTab('map')}
              className="group flex items-center gap-2.5 px-6 py-3 bg-[#00d9ff] hover:bg-[#00c8ed] text-[#061014] font-mono font-bold text-sm rounded-lg transition-all active:scale-95 shadow-[0_0_25px_rgba(0,217,255,0.35)] hover:shadow-[0_0_35px_rgba(0,217,255,0.55)]"
            >
              <Map className="w-4 h-4" />
              Open Tactical Map
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className="flex items-center gap-2.5 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-sm rounded-lg border border-white/10 transition-all active:scale-95"
            >
              <BrainCircuit className="w-4 h-4 text-[#00ff99]" />
              Ask NIRNAY AI
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          LIVE METRICS ROW
      ════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Affected Population', value: pop.toLocaleString(), sub: `${district.shortName} district`, color: 'text-red-400', icon: <Users className="w-5 h-5" />, bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Evacuated', value: evac.toLocaleString(), sub: 'Confirmed safe', color: 'text-[#00ff99]', icon: <CheckCircle2 className="w-5 h-5" />, bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Hospital Beds Open', value: beds.toString(), sub: 'City Gen + Highland', color: 'text-blue-400', icon: <Activity className="w-5 h-5" />, bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Active Assets', value: `${activeAssets.length} / ${assets.length}`, sub: 'Field deployed', color: 'text-[#00d9ff]', icon: <Bot className="w-5 h-5" />, bg: 'bg-cyan-500/10 border-cyan-500/20' },
        ].map((m) => (
          <div key={m.label} className={`rounded-xl p-5 border ${m.bg} flex flex-col gap-2 bg-[#0a0a0c]/80`}>
            <div className={`${m.color} opacity-70`}>{m.icon}</div>
            <div className={`font-mono text-2xl md:text-3xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{m.label}</div>
            <div className="text-[10px] text-white/30">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════
          QUICK NAVIGATION CARDS
      ════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-8">
        <h2 className="text-xs font-mono font-bold text-white/30 uppercase tracking-widest mb-4">Command Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              id: 'map' as const,
              label: 'Tactical Map',
              desc: 'Real-time OSM roads, flood zones, hospitals & routing',
              icon: <Map className="w-6 h-6" />,
              accent: '#00d9ff',
              glow: 'shadow-[0_0_20px_rgba(0,217,255,0.15)]',
              border: 'border-cyan-500/25 hover:border-cyan-500/60',
            },
            {
              id: 'risk' as const,
              label: 'Risk Priority',
              desc: 'Zone-level threat assessment and evacuation status',
              icon: <AlertTriangle className="w-6 h-6" />,
              accent: '#f59e0b',
              glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
              border: 'border-yellow-500/25 hover:border-yellow-500/60',
            },
            {
              id: 'ai' as const,
              label: 'AI Assistant',
              desc: 'Gemini-powered crisis decision intelligence',
              icon: <BrainCircuit className="w-6 h-6" />,
              accent: '#00ff99',
              glow: 'shadow-[0_0_20px_rgba(0,255,153,0.15)]',
              border: 'border-emerald-500/25 hover:border-emerald-500/60',
            },
            {
              id: 'status' as const,
              label: 'Ops Status',
              desc: 'Asset telemetry, timeline playback & intel feed',
              icon: <BarChart3 className="w-6 h-6" />,
              accent: '#a78bfa',
              glow: 'shadow-[0_0_20px_rgba(167,139,250,0.15)]',
              border: 'border-purple-500/25 hover:border-purple-500/60',
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group text-left bg-[#0a0a0c]/80 rounded-xl p-5 border ${item.border} ${item.glow} transition-all active:scale-95 cursor-pointer flex flex-col gap-3`}
            >
              <div style={{ color: item.accent }}>{item.icon}</div>
              <div>
                <div className="font-mono font-bold text-sm text-white group-hover:text-white/90">{item.label}</div>
                <div className="text-[10px] text-white/40 mt-1 leading-relaxed font-sans">{item.desc}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all mt-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          CRITICAL ZONE ALERT + LATEST INTEL
      ════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-8 grid md:grid-cols-2 gap-4">

        {/* Critical zone */}
        {criticalZone && (
          <div className="bg-[#0a0a0c]/80 rounded-xl border border-red-500/25 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs font-bold text-white/40 uppercase tracking-widest">⚠ Critical Sector</h3>
              <span className="text-[9px] font-mono font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded animate-pulse">
                INTERVENTION REQUIRED
              </span>
            </div>
            <div>
              <div className="font-mono text-lg font-bold text-white">{criticalZone.name}</div>
              <div className="text-xs text-white/50 mt-1">{criticalZone.description}</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Population', value: criticalZone.population.toLocaleString(), color: 'text-red-400' },
                { label: 'Rise Rate', value: criticalZone.waterRiseRate, color: 'text-yellow-400' },
                { label: 'Evacuated', value: `${criticalZone.evacuationProgress}%`, color: 'text-[#00ff99]' },
              ].map(m => (
                <div key={m.label} className="bg-white/5 rounded-lg p-2 text-center">
                  <div className={`font-mono font-bold text-base ${m.color}`}>{m.value}</div>
                  <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full">
              <div
                className="h-full bg-[#00ff99] rounded-full shadow-[0_0_8px_rgba(0,255,153,0.5)]"
                style={{ width: `${criticalZone.evacuationProgress}%` }}
              />
            </div>
            <button
              onClick={() => setActiveTab('map')}
              className="w-full py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Map className="w-3.5 h-3.5" /> View on Map
            </button>
          </div>
        )}

        {/* Latest intel */}
        <div className="bg-[#0a0a0c]/80 rounded-xl border border-white/10 p-5 flex flex-col gap-3">
          <h3 className="font-mono text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#00d9ff]" /> Latest Intelligence
          </h3>
          {intelligenceFeed.slice(0, 3).map((rep) => (
            <div key={rep.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                rep.severity === 'CRITICAL' ? 'bg-red-500' :
                rep.severity === 'HIGH' ? 'bg-yellow-500' : 'bg-emerald-500'
              }`} />
              <div>
                <div className="text-xs font-mono font-bold text-white">{rep.title}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{rep.locationName} · {rep.timeAgo}</div>
              </div>
            </div>
          ))}
          <button
            onClick={() => setActiveTab('status')}
            className="mt-auto text-[11px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            Full intel feed <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════
          SIMULATION BANNER (if active)
      ════════════════════════════════════════ */}
      {isSimulationActive && (
        <div className="max-w-5xl mx-auto px-4 md:px-6 pb-8">
          <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400 shrink-0 animate-pulse" />
            <div className="text-sm font-mono font-bold text-yellow-300">
              Simulation Active — Broadway St. Closure Scenario Running
            </div>
            <button
              onClick={() => setActiveTab('map')}
              className="ml-auto text-[11px] font-mono text-yellow-400 hover:text-yellow-300 underline cursor-pointer whitespace-nowrap"
            >
              View Simulation →
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          BOTTOM BRANDING
      ════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-8 flex items-center justify-between border-t border-white/5 pt-6">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 bg-red-600 rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.4)]">
            <div className="w-2.5 h-2.5 bg-white rounded-full" />
          </div>
          <span className="text-xs font-mono font-bold text-white/30 tracking-widest uppercase">Nirnay v1.0</span>
        </div>
        <span className="text-[10px] font-mono text-white/20">AI Emergency Command & Decision System · {district.name}</span>
      </div>
    </div>
  );
};
