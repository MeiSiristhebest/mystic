"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import dynamic from "next/dynamic";
import BreathingLoading from "../BreathingLoading";
import { getAdvancedSystems } from "@/lib/registry/systems";

const SynastryApp = dynamic(() => import("../SynastryApp"), { 
  loading: () => <BreathingLoading text="正在推演因果连结..." /> 
});
const TimeWisdomApp = dynamic(() => import("../TimeWisdomApp"), { 
  loading: () => <BreathingLoading text="正在拨动时间齿轮..." /> 
});
const CollectiveMirrorApp = dynamic(() => import("../CollectiveMirrorApp"), { 
  loading: () => <BreathingLoading text="正在连接集体潜意识..." /> 
});
const FaceReadingApp = dynamic(() => import("../FaceReadingApp"), { 
  loading: () => <BreathingLoading text="正在洞察五官灵气..." /> 
});

export function MoreView() {
  const [subTab, setSubTab] = useState("");
  const systems = useMemo(() => getAdvancedSystems(), []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-16">
      <header className="max-w-2xl space-y-6">
        <h1 className="editorial-title">更多<span className="gold-gradient-text">奥秘</span></h1>
        <p className="text-xl text-[#E8DFB8]/60 font-serif leading-relaxed">
          深入神秘学的幽微之处。这里收录了进阶的灵性工具与小众的命理系统。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {systems.map((system) => {
          const Icon = system.icon;
          const isActive = subTab === system.id;
          return (
            <div
              key={system.id}
              role="button"
              onClick={() => {
                setSubTab(system.id);
                setTimeout(() => {
                  window.scrollTo({ top: 500, behavior: 'smooth' });
                }, 300);
              }}
              className={`luxury-card p-10 text-left transition-all duration-700 group relative overflow-hidden min-h-[320px] flex flex-col justify-end cursor-pointer ${
                isActive ? "border-[#C9A84C]/60 bg-[#C9A84C]/10 shadow-[0_0_50px_rgba(201,168,76,0.2)]" : "hover:border-[#C9A84C]/30 hover:bg-white/5"
              }`}
            >
              <div className="absolute inset-0 z-0 overflow-hidden">
                <Image 
                  src={system.bgImage}
                  alt={system.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className={`object-cover transition-all duration-1000 ${
                    isActive ? "opacity-60 scale-105" : "opacity-25 group-hover:opacity-45 group-hover:scale-105"
                  }`}
                  priority
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-[#080510] via-[#080510]/60 to-transparent z-10" />

              <div className="relative z-20">
                <div className="w-14 h-14 rounded-2xl border border-[#C9A84C]/20 flex items-center justify-center bg-[#C9A84C]/5 mb-6 group-hover:bg-[#C9A84C]/15 group-hover:scale-110 transition-all duration-700">
                  <Icon className={`w-7 h-7 transition-all duration-700 ${
                    isActive ? "text-[#C9A84C]" : "text-[#C9A84C]/50 group-hover:text-[#C9A84C]"
                  }`} />
                </div>
                <h3 className={`text-2xl font-serif mb-3 transition-colors ${isActive ? "gold-gradient-text" : "text-[#E8DFB8] group-hover:text-white"}`}>
                  {system.name}
                </h3>
                <p className="text-[#E8DFB8]/60 text-sm font-serif leading-relaxed line-clamp-3">{system.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-12 border-t border-white/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={subTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            {subTab === "synastry" && <SynastryApp />}
            {subTab === "time" && <TimeWisdomApp />}
            {subTab === "collective" && <CollectiveMirrorApp />}
            {subTab === "face" && <FaceReadingApp />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
