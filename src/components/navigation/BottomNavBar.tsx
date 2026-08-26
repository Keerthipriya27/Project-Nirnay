import React from 'react';
import { useCrisisStore, TabType } from '../../store/useCrisisStore';
import { Home, Map as MapIcon, AlertTriangle, BrainCircuit, BarChart3, User } from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab } = useCrisisStore();

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home',    label: 'Home',    icon: <Home className="w-5 h-5" /> },
    { id: 'map',     label: 'Map',     icon: <MapIcon className="w-5 h-5" /> },
    { id: 'risk',    label: 'Risk',    icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'ai',      label: 'AI',      icon: <BrainCircuit className="w-5 h-5" /> },
    { id: 'status',  label: 'Status',  icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full z-40 h-[70px] bg-[#0a0a0c]/97 backdrop-blur-xl border-t border-white/10 flex justify-around items-center px-1 pb-2 pt-1 text-slate-200">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center transition-all duration-150 active:scale-90 min-w-0 flex-1 ${
              isActive
                ? 'text-[#00ff99]'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-600/20 border border-blue-500/30' : ''}`}>
              {item.icon}
            </div>
            <span className={`text-[9px] mt-0.5 tracking-wider uppercase font-bold font-mono ${isActive ? 'text-[#00ff99]' : 'text-white/30'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
