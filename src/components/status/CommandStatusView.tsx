import React, { useEffect } from 'react';
import { useCrisisStore } from '../../store/useCrisisStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  Radio,
  Bot,
  Users,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
  Droplets,
  Activity,
  Layers,
} from 'lucide-react';

export const CommandStatusView: React.FC = () => {
  const {
    timelineEvents,
    currentTimelineIndex,
    isTimelinePlaying,
    setTimelineIndex,
    toggleTimelinePlayback,
    nextTimelineStep,
    previousTimelineStep,
    intelligenceFeed,
    assets,
    openRoverModal,
    openRoadDetailModal,
    setActiveTab,
  } = useCrisisStore();

  // Automatic timeline playback loop
  useEffect(() => {
    if (!isTimelinePlaying) return;
    const interval = setInterval(() => {
      const { currentTimelineIndex, timelineEvents, setTimelineIndex, toggleTimelinePlayback } =
        useCrisisStore.getState();
      if (currentTimelineIndex < timelineEvents.length - 1) {
        setTimelineIndex(currentTimelineIndex + 1);
      } else {
        toggleTimelinePlayback();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isTimelinePlaying]);

  const currentEvent = timelineEvents[currentTimelineIndex] || timelineEvents[0];

  return (
    <div className="w-full flex-1 max-w-5xl mx-auto px-4 md:px-6 py-6 pb-28 md:pb-12 font-sans space-y-5 select-none text-slate-200">
      {/* Top Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0a0a0c]/90 p-4 rounded-lg border border-white/10 shadow-xl flex flex-col">
          <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
            Total In Danger
          </span>
          <span className="font-mono text-2xl md:text-3xl font-bold text-white mt-1">
            48,500
          </span>
          <span className="text-[10px] font-mono text-[#00ff99] mt-1 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-[#00ff99]" /> 18,200 Evacuated
          </span>
        </div>

        <div className="bg-[#0a0a0c]/90 p-4 rounded-lg border border-white/10 shadow-xl flex flex-col">
          <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
            Active Incidents
          </span>
          <span className="font-mono text-2xl md:text-3xl font-bold text-red-500 mt-1">
            14
          </span>
          <span className="text-[10px] font-mono text-red-400 mt-1 font-semibold">
            3 Critical Bottlenecks
          </span>
        </div>

        <div className="bg-[#0a0a0c]/90 p-4 rounded-lg border border-white/10 shadow-xl flex flex-col">
          <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
            Hospital Beds Open
          </span>
          <span className="font-mono text-2xl md:text-3xl font-bold text-blue-400 mt-1">
            182
          </span>
          <span className="text-[10px] font-mono text-white/40 mt-1">City Gen + Highland</span>
        </div>

        <div className="bg-[#0a0a0c]/90 p-4 rounded-lg border border-white/10 shadow-xl flex flex-col">
          <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
            Autonomous Fleet
          </span>
          <span className="font-mono text-2xl md:text-3xl font-bold text-[#00ff99] mt-1">
            4 / 4 Active
          </span>
          <span className="text-[10px] font-mono text-[#00ff99] mt-1 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff99] animate-ping" />
            Teleoperation Live
          </span>
        </div>
      </div>

      {/* 1. DISASTER TIMELINE PLAYBACK ENGINE */}
      <div className="bg-[#0a0a0c]/90 rounded-lg p-5 border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="font-headline text-base md:text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Disaster Timeline & Predictive Playback
            </h3>
            <p className="text-xs text-white/40 font-sans">
              Replay flood progression and preview AI forecast corridors
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={previousTimelineStep}
              disabled={currentTimelineIndex === 0}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-30 cursor-pointer transition-colors"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleTimelinePlayback}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.4)] transition-transform active:scale-95"
            >
              {isTimelinePlaying ? (
                <>
                  <Pause className="w-3 h-3" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-white" /> Playback
                </>
              )}
            </button>
            <button
              onClick={nextTimelineStep}
              disabled={currentTimelineIndex === timelineEvents.length - 1}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-30 cursor-pointer transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Timeline Visual Track */}
        <div className="relative pt-3 pb-1">
          {/* Progress track */}
          <div className="w-full h-1.5 bg-white/10 rounded-full relative">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              style={{
                width: `${(currentTimelineIndex / (timelineEvents.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Stepper nodes */}
          <div className="flex justify-between -mt-2">
            {timelineEvents.map((evt, idx) => {
              const isSelected = idx === currentTimelineIndex;
              return (
                <button
                  key={evt.id}
                  onClick={() => setTimelineIndex(idx)}
                  className={`group flex flex-col items-center cursor-pointer transition-transform ${
                    isSelected ? 'scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full border transition-colors ${
                      isSelected
                        ? 'bg-[#00ff99] border-white ring-2 ring-[#00ff99]'
                        : idx < currentTimelineIndex
                        ? 'bg-blue-500 border-white'
                        : 'bg-white/20 border-white/40'
                    }`}
                  />
                  <span className="text-[10px] font-mono font-semibold text-white/70 mt-1.5">
                    {evt.timeString || evt.time}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Active Timeline Event Card */}
        <div className="bg-white/5 p-3.5 rounded-lg border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded">
                T: {currentEvent.timeString || currentEvent.time}
              </span>
              <h4 className="font-headline font-bold text-xs md:text-sm text-white">
                {currentEvent.title}
              </h4>
            </div>
            <p className="text-xs text-white/50 mt-1 font-sans">{currentEvent.description}</p>
          </div>

          <button
            onClick={() => setActiveTab('map')}
            className="text-[11px] font-mono font-bold text-blue-400 hover:text-blue-300 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded self-start sm:self-auto cursor-pointer whitespace-nowrap uppercase tracking-wider transition-colors"
          >
            Sector Map
          </button>
        </div>
      </div>

      {/* 2. AUTONOMOUS ROVERS & FIELD ASSETS */}
      <div className="bg-[#0a0a0c]/90 rounded-lg p-5 border border-white/10 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-headline text-base md:text-lg font-bold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#00ff99]" />
            Autonomous Field Assets & Recon Feeds
          </h3>
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Real-time Telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {assets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => {
                if (asset.type === 'ROVER') openRoverModal(asset.id);
              }}
              className="p-3.5 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer flex justify-between items-start group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[#00ff99]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-headline font-bold text-xs md:text-sm text-white group-hover:text-blue-400 transition-colors">
                      {asset.name}
                    </h4>
                    <span className="text-[9px] font-mono font-bold bg-[#00ff99]/10 text-[#00ff99] border border-[#00ff99]/30 px-1.5 py-0.2 rounded">
                      {asset.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-1 font-sans">{asset.mission}</p>
                  <div className="text-[10px] text-blue-400 font-mono mt-1">
                    Battery: {asset.batteryPercent}% • {asset.connectivity || '5G_SAT_UPLINK'}
                  </div>
                </div>
              </div>

              <span className="text-xs text-blue-400 font-mono font-bold group-hover:underline flex items-center gap-1">
                Feed <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. VERIFIED INTELLIGENCE FEED */}
      <div className="bg-[#0a0a0c]/90 rounded-lg p-5 border border-white/10 shadow-xl space-y-4">
        <h3 className="font-headline text-base md:text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          Verified Intelligence Stream
        </h3>

        <div className="space-y-2.5">
          {intelligenceFeed.map((report) => (
            <div
              key={report.id}
              className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-start justify-between gap-3 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center border shrink-0 ${
                    report.sourceType === 'IOT_SENSOR'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : report.sourceType === 'ROVER'
                      ? 'bg-emerald-500/20 text-[#00ff99] border-[#00ff99]/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}
                >
                  {report.sourceType === 'IOT_SENSOR' ? (
                    <Droplets className="w-3.5 h-3.5" />
                  ) : report.sourceType === 'ROVER' ? (
                    <Bot className="w-3.5 h-3.5" />
                  ) : (
                    <Users className="w-3.5 h-3.5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-headline font-bold text-xs md:text-sm text-white">
                      {report.title}
                    </h5>
                    <span className="text-[10px] text-white/40 font-mono">{report.timeAgo}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 font-sans">{report.description}</p>
                </div>
              </div>

              <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-[#00ff99]/10 text-[#00ff99] border border-[#00ff99]/30 px-2 py-0.5 rounded shrink-0">
                Verified
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
