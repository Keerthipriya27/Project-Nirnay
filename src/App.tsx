import React, { useEffect } from 'react';
import { useCrisisStore } from './store/useCrisisStore';
import { CommandHeader } from './components/navigation/CommandHeader';
import { BottomNavBar } from './components/navigation/BottomNavBar';
import { DesktopSidebar } from './components/navigation/DesktopSidebar';
import { Tactical2DMap } from './components/map/Tactical2DMap';
import { Crisis3DMap } from './components/map/Crisis3DMap';
import { RoadDetailModal } from './components/map/RoadDetailModal';
import { ClosureImpactView } from './components/map/ClosureImpactView';
import { ResourcePriorityView } from './components/risk/ResourcePriorityView';
import { AskAIView } from './components/ai/AskAIView';
import { ExplainWhyModal } from './components/ai/ExplainWhyModal';
import { CommandStatusView } from './components/status/CommandStatusView';
import { RoverModal } from './components/status/RoverModal';

export function App() {
  const { activeTab, viewMode3D, hydrate } = useCrisisStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-screen bg-[#050506] text-slate-200 flex flex-col font-sans select-none antialiased selection:bg-red-600 selection:text-white">
      {/* Top Header */}
      <CommandHeader />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex relative w-full overflow-hidden bg-[#0d0e12]">
        {/* Desktop Sidebar Navigation */}
        <DesktopSidebar />

        {/* Dynamic Center Work Area (Offsets on desktop for the 80px sidebar) */}
        <main className="flex-1 md:ml-[80px] flex flex-col relative w-full overflow-y-auto custom-scrollbar">
          {activeTab === 'map' && (
            <div className="w-full h-full flex-1 relative animate-in fade-in duration-200">
              {viewMode3D ? <Crisis3DMap /> : <Tactical2DMap />}
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="w-full flex-1 animate-in fade-in duration-200">
              <ResourcePriorityView />
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="w-full flex-1 animate-in fade-in duration-200">
              <AskAIView />
            </div>
          )}

          {activeTab === 'status' && (
            <div className="w-full flex-1 animate-in fade-in duration-200">
              <CommandStatusView />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar />

      {/* Global Interactive Modals & Simulation Overlays */}
      <RoadDetailModal />
      <ClosureImpactView />
      <ExplainWhyModal />
      <RoverModal />
    </div>
  );
}

export default App;
