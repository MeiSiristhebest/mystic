"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Clock, Globe, Smile } from "lucide-react";
import dynamic from "next/dynamic";
import { MysticImage } from "./MysticImage";
import BreathingLoading from "../BreathingLoading";

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

  const systems = [
    { 
      id: "synastry", 
      name: "三才合参", 
      icon: Users, 
      desc: "多维度的关系合盘。探索两人之间的业力纠缠与灵魂契约。", 
      prompt: "Two glowing souls connected by cosmic threads, sacred geometry, esoteric art"
    },
    { 
      id: "time", 
      name: "时空智慧", 
      icon: Clock, 
      desc: "穿越过去与未来，解析特定时间节点的能量轨迹。", 
      prompt: "Giant golden clock gears in space, cosmic timeline, ancient esoteric hourglass"
    },
    { 
      id: "collective", 
      name: "集体镜像", 
      icon: Globe, 
      desc: "探索你与世界、社会趋势之间的潜意识连结。", 
      prompt: "A giant eye reflecting humanity, interconnected glowing minds, ethereal network"
    },
    { 
      id: "face", 
      name: "灵气面相", 
      icon: Smile, 
      desc: "融合传统相术与能量场感应，洞察你的隐藏特质。", 
      prompt: "A mystical glowing face profile, aura colors around a person, esoteric portrait"
    },
  ];

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
                isActive ? "border-[#C9A84C]/60 bg-[#C9A84C]/10" : "hover:bg-white/5"
              }`}
            >
              <div className="absolute inset-0 z-0">
                <MysticImage 
                  prompt={system.prompt} 
                  className={`w-full h-full transition-all duration-1000 ${isActive ? "opacity-60 scale-105" : "opacity-20 group-hover:opacity-40"}`}
                  aspectRatio="3:4"
                />
              </div>
              <div className="relative z-10">
                <Icon className={`w-10 h-10 mb-6 transition-all duration-700 ${
                  isActive ? "text-[#C9A84C] scale-110" : "text-[#E8DFB8]/20 group-hover:text-[#E8DFB8]/40"
                }`} />
                <h3 className={`text-2xl font-serif mb-3 transition-colors ${isActive ? "gold-gradient-text" : ""}`}>
                  {system.name}
                </h3>
                <p className="text-[#E8DFB8]/40 text-sm leading-relaxed">{system.desc}</p>
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
            transition={{ duration: 0.5 }}
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
