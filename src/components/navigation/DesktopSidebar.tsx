import React from 'react';
import { useCrisisStore, TabType } from '../../store/useCrisisStore';
import { Map as MapIcon, AlertTriangle, BrainCircuit, BarChart3, Radio } from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab, liveContextActive } = useCrisisStore();

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'map', label: 'Map', icon: <MapIcon className="w-5 h-5" /> },
    { id: 'risk', label: 'Risk', icon: <AlertTriangle className="w-5 h-5" />, badge: '3' },
    { id: 'ai', label: 'AI', icon: <BrainCircuit className="w-5 h-5" /> },
    { id: 'status', label: 'Status', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-[56px] md:top-[64px] bottom-0 w-[80px] bg-[#0a0a0c]/95 backdrop-blur-xl border-r border-white/10 flex-col items-center pt-6 gap-4 z-30 select-none">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center justify-center rounded-lg w-14 h-14 transition-all duration-150 active:scale-95 group cursor-pointer ${
              isActive
                ? 'bg-blue-600/20 text-[#00ff99] border border-blue-500/40 shadow-[0_0_15px_rgba(0,255,153,0.15)]'
                : 'text-white/40 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
            title={item.label}
          >
            <div className={isActive ? 'text-[#00ff99]' : 'text-current'}>{item.icon}</div>
            <span className="font-mono text-[9px] mt-1 font-bold uppercase tracking-wider">{item.label}</span>

            {item.badge && !isActive && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      {/* Live Status indicator at bottom of sidebar */}
      <div className="mt-auto mb-6 flex flex-col items-center gap-1.5 p-2 bg-white/5 rounded border border-white/5">
        <div
          className={`w-2 h-2 rounded-full ${
            liveContextActive ? 'bg-[#00ff99] animate-ping' : 'bg-white/20'
          }`}
        />
        <span className="text-[8px] font-bold font-mono text-white/50 uppercase tracking-widest">
          {liveContextActive ? 'LIVE' : 'IDLE'}
        </span>
      </div>
    </aside>
  );
};
