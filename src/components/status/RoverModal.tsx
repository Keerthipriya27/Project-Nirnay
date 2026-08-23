import React, { useState, useEffect } from 'react';
import { useCrisisStore } from '../../store/useCrisisStore';
import {
  X,
  Bot,
  Video,
  Radio,
  Battery,
  Wifi,
  Navigation,
  Compass,
  Crosshair,
  Send,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';

export const RoverModal: React.FC = () => {
  const { isRoverModalOpen, closeRoverModal, activeRover, dispatchRoverMission } = useCrisisStore();
  const [missionTarget, setMissionTarget] = useState('Broadway St. Culvert #4');
  const [isLiveScanning, setIsLiveScanning] = useState(true);
  const [opticalDepth, setOpticalDepth] = useState(48);

  useEffect(() => {
    if (!isRoverModalOpen) return;
    const interval = setInterval(() => {
      setOpticalDepth((prev) => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1));
    }, 1500);
    return () => clearInterval(interval);
  }, [isRoverModalOpen]);

  if (!isRoverModalOpen) return null;

  const rover = activeRover || {
    id: 'asset-rover-07',
    name: 'ROVER-07',
    type: 'ROVER',
    status: 'ACTIVE',
    batteryPercent: 88,
    connectivity: '5G_SAT_UPLINK',
    mission: 'HIGH-WATER TRAIL INSPECTION',
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionTarget.trim()) return;
    dispatchRoverMission(rover.id, missionTarget.trim());
    closeRoverModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in select-none text-slate-200">
      <div className="bg-[#0a0a0c]/95 text-white rounded-lg max-w-3xl w-full shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Teleoperation HUD Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-600/20 text-[#00ff99] flex items-center justify-center border border-blue-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline text-base font-bold text-white tracking-wide">
                  {rover.name} // Telemetry & Recon Feed
                </h3>
                <span className="bg-[#00ff99]/20 text-[#00ff99] border border-[#00ff99]/40 px-2 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff99] animate-ping" />
                  LIVE 4K SENSOR
                </span>
              </div>
              <p className="text-[10px] text-white/40 font-mono">
                Model: NIRNAY Recon Mk-IV • Lat: 40.7128, Lng: -74.0060
              </p>
            </div>
          </div>

          <button
            onClick={closeRoverModal}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Canvas & Optical HUD */}
        <div className="relative w-full h-64 md:h-80 bg-[#050506] flex items-center justify-center overflow-hidden border-b border-white/10">
          {/* Simulated optical flood footage canvas */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent z-10 pointer-events-none" />

          {/* Grid Overlay HUD */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Video Scene representation */}
          <div className="relative z-0 w-full h-full flex items-center justify-center">
            {/* Synthetic image representation of rover flood inspection */}
            <div className="w-full h-full bg-[#080c14] flex flex-col items-center justify-center text-blue-400 font-mono text-xs">
              <Crosshair className="w-14 h-14 text-blue-400/40 animate-spin" />
              <span className="mt-2 text-white font-bold tracking-widest uppercase">
                TARGET LOCK: BROADWAY ST. WATER LEVEL
              </span>
              <span className="text-[10px] text-blue-400/70 mt-1 font-mono">
                LIDAR Point Cloud Density: 98,400 pts/sec • Flow: 1.8 m/s
              </span>
            </div>
          </div>

          {/* HUD Top Left Indicators */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 text-[10px] font-mono bg-[#0a0a0c]/80 backdrop-blur-xs p-2 rounded border border-white/10">
            <div className="text-[#00ff99] font-bold flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-[#00ff99] animate-pulse" />
              <span>SIGNAL: 98 dBm (5G SAT)</span>
            </div>
            <div className="text-white/70 flex items-center gap-1.5">
              <Battery className="w-3 h-3 text-[#00ff99]" />
              <span>BATTERY: 88% (4.2 hrs)</span>
            </div>
          </div>

          {/* HUD Bottom Left: Real-time Water Depth Gauge */}
          <div className="absolute bottom-3 left-3 z-20 bg-[#0a0a0c]/80 backdrop-blur-xs p-2.5 rounded border border-white/10 flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Compass className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-[9px] text-white/40 font-mono uppercase tracking-wider">Depth Gauge</div>
              <div className="text-base font-bold font-mono text-white">
                {opticalDepth} cm <span className="text-[10px] text-red-400">(+0.5 m/h)</span>
              </div>
            </div>
          </div>

          {/* HUD Bottom Right: Obstacle Alert */}
          <div className="absolute bottom-3 right-3 z-20 bg-red-950/80 backdrop-blur-xs p-2.5 rounded border border-red-500/40 text-[10px] font-mono text-red-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>SUBMERGED DEBRIS DETECTED</span>
          </div>
        </div>

        {/* Teleoperation Controls & Mission Dispatch */}
        <div className="p-4 bg-white/5 flex flex-col gap-3">
          <form onSubmit={handleDispatch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1">
              <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                Autonomous Waypoint / Recon Target:
              </label>
              <input
                type="text"
                value={missionTarget}
                onChange={(e) => setMissionTarget(e.target.value)}
                className="w-full bg-[#050506] border border-white/15 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. Zone C South Causeway, Highland Culvert #2"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider px-5 py-2 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer self-end w-full sm:w-auto min-h-[38px] shadow-[0_0_12px_rgba(59,130,246,0.4)]"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Transmit Mission</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
