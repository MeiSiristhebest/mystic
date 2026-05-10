"use client";

import { motion } from "motion/react";
import { User, Star, Compass, Wand2, Sparkles, Book } from "lucide-react";

export const navItems = [
  { id: "today", name: "今日", icon: Star, label: "Today" },
  { id: "discovery", name: "发现", icon: Compass, label: "Discovery" },
  { id: "explore", name: "探索", icon: Wand2, label: "Explore" },
  { id: "soul", name: "灵魂", icon: Sparkles, label: "Soul" },
  { id: "journal", name: "日记", icon: Book, label: "Journal" },
];

export const CelestialLogo = ({ className = "" }: { className?: string }) => (
  <motion.svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-full h-full ${className}`}
    initial="initial"
    animate="animate"
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C9A84C" />
        <stop offset="50%" stopColor="#E8DFB8" />
        <stop offset="100%" stopColor="#9B7FD4" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    <motion.circle 
      cx="50" cy="50" r="45" 
      stroke="url(#logo-gradient)" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{ willChange: "transform", transform: "translateZ(0)", transformOrigin: "center" }}
    />
    <motion.circle 
      cx="50" cy="50" r="40" 
      stroke="url(#logo-gradient)" strokeWidth="1" opacity="0.3"
      animate={{ rotate: -360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      style={{ willChange: "transform", transform: "translateZ(0)", transformOrigin: "center" }}
    />
    
    <motion.path
      d="M15 50C15 50 30 30 50 30C70 30 85 50 85 50C85 50 70 70 50 70C30 70 15 50 15 50Z"
      stroke="url(#logo-gradient)"
      strokeWidth="2"
      filter="url(#glow)"
      animate={{ 
        strokeWidth: [2, 2.5, 2],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
    
    <motion.circle 
      cx="50" cy="50" r="12" 
      fill="url(#logo-gradient)" filter="url(#glow)"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    
    <path
      d="M58 50C58 54.4183 54.4183 58 50 58C45.5817 58 42 54.4183 42 50C42 45.5817 45.5817 42 50 42C52.5 42 54.5 43 56 44.5C54 44.5 52 46 52 50C52 54 54 55.5 56 55.5C54.5 57 52.5 58 50 58"
      fill="#080510"
      opacity="0.8"
    />
    
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <motion.line
        key={angle}
        x1="50"
        y1="50"
        x2={50 + 48 * Math.cos((angle * Math.PI) / 180)}
        y2={50 + 48 * Math.sin((angle * Math.PI) / 180)}
        stroke="url(#logo-gradient)"
        strokeWidth="0.5"
        opacity="0.2"
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 2, delay: angle / 100, repeat: Infinity }}
      />
    ))}
    
    <motion.circle cx="25" cy="25" r="1" fill="#E8DFB8" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
    <motion.circle cx="75" cy="25" r="1.5" fill="#C9A84C" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 3, repeat: Infinity }} />
    <motion.circle cx="30" cy="70" r="0.8" fill="#9B7FD4" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2.5, repeat: Infinity }} />
    <motion.circle cx="70" cy="75" r="1.2" fill="#E8DFB8" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 3.5, repeat: Infinity }} />
  </motion.svg>
);

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsProfileModalOpen: (isOpen: boolean) => void;
}

export function DesktopNavigation({ activeTab, setActiveTab, setIsProfileModalOpen }: NavigationProps) {
  return (
    <nav className="hidden md:block w-full border-b border-white/5 bg-[#080510]/80 backdrop-blur-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab("today")}>
              <div className="w-12 h-12 relative group-hover:scale-110 transition-transform duration-700 ease-out">
                <div className="absolute inset-0 bg-[#C9A84C]/20 blur-xl rounded-full group-hover:bg-[#C9A84C]/40 transition-colors duration-700" />
                <CelestialLogo className="relative z-10" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl tracking-[0.3em] gold-gradient-text font-light leading-none">星象塔罗</span>
                <span className="text-[8px] tracking-[0.5em] text-[#E8DFB8]/30 uppercase mt-1">Eye of Akasha</span>
              </div>
            </div>
            
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-1 py-2 text-sm font-serif tracking-[0.2em] transition-all duration-500 group ${
                    activeTab === item.id
                      ? "text-[#C9A84C]"
                      : "text-[#E8DFB8]/40 hover:text-[#E8DFB8]/80"
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-right from-transparent via-[#C9A84C] to-transparent"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5 transition-all duration-500 group"
            >
              <User className="w-5 h-5 text-[#E8DFB8]/60 group-hover:text-[#C9A84C] transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function MobileNavigation({ activeTab, setActiveTab }: Omit<NavigationProps, "setIsProfileModalOpen">) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 apple-glass border-t border-white/5 px-6 pb-safe">
      <div className="flex justify-between items-center h-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center gap-1.5 relative"
            >
              <div className={`p-2 rounded-2xl transition-all duration-500 ${
                isActive ? "bg-[#C9A84C]/10 text-[#C9A84C]" : "text-[#E8DFB8]/40"
              }`}>
                <Icon className={`w-6 h-6 transition-transform duration-500 ${isActive ? "scale-110" : "scale-100"}`} />
              </div>
              <span className={`text-[10px] font-serif tracking-widest transition-colors duration-500 ${
                isActive ? "text-[#C9A84C]" : "text-[#E8DFB8]/40"
              }`}>
                {item.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-dot"
                  className="absolute -top-1 w-1 h-1 rounded-full bg-[#C9A84C]"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileHeader({ setActiveTab, setIsProfileModalOpen }: Omit<NavigationProps, "activeTab">) {
  return (
    <header className="md:hidden flex items-center justify-between px-6 h-20 border-b border-white/5 bg-[#080510]/80 backdrop-blur-2xl sticky top-0 z-50">
      <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab("today")}>
        <div className="w-10 h-10 relative">
          <div className="absolute inset-0 bg-[#C9A84C]/20 blur-lg rounded-full" />
          <CelestialLogo className="relative z-10" />
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-lg tracking-[0.2em] gold-gradient-text font-light leading-none">星象塔罗</span>
          <span className="text-[6px] tracking-[0.4em] text-[#E8DFB8]/30 uppercase mt-0.5">Eye of Akasha</span>
        </div>
      </div>
      <button
        onClick={() => setIsProfileModalOpen(true)}
        className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
      >
        <User className="w-5 h-5 text-[#E8DFB8]/60" />
      </button>
    </header>
  );
}
