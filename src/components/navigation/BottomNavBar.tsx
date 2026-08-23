import React from 'react';
import { useCrisisStore, TabType } from '../../store/useCrisisStore';
import { Map as MapIcon, AlertTriangle, BrainCircuit, BarChart3 } from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab } = useCrisisStore();

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'map', label: 'Map', icon: <MapIcon className="w-5 h-5" /> },
    { id: 'risk', label: 'Risk', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'ai', label: 'AI', icon: <BrainCircuit className="w-5 h-5" /> },
    { id: 'status', label: 'Status', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full z-40 h-[70px] bg-[#0a0a0c]/95 backdrop-blur-xl border-t border-white/10 flex justify-around items-center px-3 pb-2 pt-1 text-slate-200">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center transition-all duration-150 active:scale-90 ${
              isActive
                ? 'bg-blue-600/30 text-[#00ff99] border border-blue-500/40 rounded-lg px-5 py-1.5 font-mono shadow-[0_0_12px_rgba(0,255,153,0.15)]'
                : 'text-white/40 hover:bg-white/5 px-3 py-1.5 rounded-lg font-mono'
            }`}
          >
            <div className={isActive ? 'text-[#00ff99]' : 'text-white/40'}>{item.icon}</div>
            <span className={`text-[10px] mt-0.5 tracking-wider uppercase font-bold font-mono ${isActive ? 'text-[#00ff99]' : 'text-white/40'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
