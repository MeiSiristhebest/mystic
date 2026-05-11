"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";

// Components
import ErrorBoundary from './MainApp/ErrorBoundary';
import { DesktopNavigation, MobileNavigation, MobileHeader } from './MainApp/index';
import BreathingLoading from "./BreathingLoading";

// Modular Views (Named imports from central index)
import { TodayView, ExploreView, SoulView, MoreView } from "./MainApp/index";

// External App Modules (Dynamic for chunking)
const JourneyApp = dynamic(() => import("./JourneyApp"), { 
  loading: () => <BreathingLoading text="正在回顾你的旅程..." /> 
});
const DiscoveryView = dynamic(() => import("./DiscoveryView"), {
  loading: () => <BreathingLoading text="正在开启发现之窗..." />
});
const UserProfileModal = dynamic(() => import("./UserProfileModal"));

// State Management (Zustand)
import { useAppStore } from "@/lib/store";

import { AmbientCosmicBackground } from "./MainApp/index";

export default function App() {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const isProfileModalOpen = useAppStore((state) => state.isProfileModalOpen);
  const setIsProfileModalOpen = useAppStore((state) => state.setIsProfileModalOpen);
  const isLoaded = useAppStore((state) => state.isLoaded);

  // Global access for legacy or specialized components if needed
  useEffect(() => {
    (window as any).setActiveTab = setActiveTab;
    return () => { delete (window as any).setActiveTab; };
  }, [setActiveTab]);

  if (!isLoaded) {
    return <BreathingLoading text="正在同步星辰频率..." />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#050308] text-[#E8DFB8] font-sans selection:bg-[#C9A84C]/30 pb-20 md:pb-0 relative overflow-hidden">
        {/* Global Cosmic Background */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
          <AmbientCosmicBackground />
        </div>
        
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Navigation Layer */}
          <DesktopNavigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            setIsProfileModalOpen={setIsProfileModalOpen} 
          />
          <MobileNavigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          <MobileHeader 
            setActiveTab={setActiveTab} 
            setIsProfileModalOpen={setIsProfileModalOpen} 
          />

          {/* Main Content Layer */}
          <main className="relative min-h-[calc(100vh-160px)] md:min-h-[calc(100vh-80px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                className="w-full h-full"
              >
                {activeTab === "today" && <TodayView />}
                {activeTab === "discovery" && <DiscoveryView onComplete={() => setActiveTab("today")} />}
                {activeTab === "explore" && <ExploreView />}
                {activeTab === "soul" && <SoulView />}
                {activeTab === "journal" && <JourneyApp />}
                {activeTab === "more" && <MoreView />}
              </motion.div>
            </AnimatePresence>
          </main>
          
          {/* Modal Layer */}
          <UserProfileModal 
            isOpen={isProfileModalOpen} 
            onClose={() => setIsProfileModalOpen(false)} 
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
