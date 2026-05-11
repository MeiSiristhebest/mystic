"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Moon,
  Star,
  ShieldAlert,
  Clock,
  Users,
  User,
  Layers,
  ChevronLeft,
} from "lucide-react";
import dynamic from "next/dynamic";
import { MysticImage } from "./MysticImage";
import BreathingLoading from "../BreathingLoading";

const SynastryApp = dynamic(() => import("../SynastryApp"), { 
  loading: () => <BreathingLoading text="正在建立共鸣场..." /> 
});
const SubconsciousApp = dynamic(() => import("../SubconsciousApp"), { 
  loading: () => <BreathingLoading text="正在潜入深海..." /> 
});
const ShadowWorkApp = dynamic(() => import("../ShadowWorkApp"), { 
  loading: () => <BreathingLoading text="正在映照阴影..." /> 
});
const TimeWisdomApp = dynamic(() => import("../TimeWisdomApp"), { 
  loading: () => <BreathingLoading text="正在穿越时间..." /> 
});
const CollectiveMirrorApp = dynamic(() => import("../CollectiveMirrorApp"), { 
  loading: () => <BreathingLoading text="正在连接集体潜意识..." /> 
});
const FaceReadingApp = dynamic(() => import("../FaceReadingApp"), { 
  loading: () => <BreathingLoading text="正在读取相貌..." /> 
});
const IChingApp = dynamic(() => import("../IChingApp"), { 
  loading: () => <BreathingLoading text="正在推演易数..." /> 
});
const BaziApp = dynamic(() => import("../BaziApp"), { 
  loading: () => <BreathingLoading text="正在排出四柱..." /> 
});

export function MoreView() {
  const [subTab, setSubTab] = useState<string | null>(null);

  const moreApps = [
    { id: "synastry", name: "三才合参", icon: Sparkles, desc: "融合八字、星盘与塔罗，进行高维度的综合命理分析。", component: SynastryApp, prompt: "Mystic cosmic alignment, sacred geometry, golden light, ethereal atmosphere" },
    { id: "subconscious", name: "潜意识剧场", icon: Moon, desc: "探索梦境与潜意识的深层含义，揭示内心隐藏的渴望。", component: SubconsciousApp, prompt: "Surreal dreamscape, floating objects, ethereal nebula, deep purple and blue" },
    { id: "shadow", name: "阴影工作", icon: ShieldAlert, desc: "面对并整合内心的阴影，实现灵魂的完整与疗愈。", component: ShadowWorkApp, prompt: "Dark mysterious forest, ethereal light breaking through, mystical atmosphere, deep shadows" },
    { id: "time", name: "时间智慧", icon: Clock, desc: "在时间的流动中寻找智慧，洞察过去、现在与未来的连接。", component: TimeWisdomApp, prompt: "Ancient clockwork in space, floating gears, golden light, cosmic time flow" },
    { id: "collective", name: "集体镜像", icon: Users, desc: "连接集体潜意识，探索人类共同的命运与原型力量。", component: CollectiveMirrorApp, prompt: "Many glowing souls connected, cosmic web, ethereal light, collective consciousness" },
    { id: "face", name: "灵气面相", icon: User, desc: "通过面部特征洞察性格与命运，探索灵气在面容上的显化。", component: FaceReadingApp, prompt: "Ethereal glowing face, sacred geometry patterns, golden light, mystical portrait" },
    { id: "iching", name: "周易六爻", icon: Layers, desc: "古老的东方占卜智慧，通过卦象推演事物的发展规律。", component: IChingApp, prompt: "Ancient Chinese hexagrams, golden ink wash, cosmic clouds, mystical symbols" },
    { id: "bazi", name: "八字排盘", icon: Star, desc: "精准的东方命理推算，揭示人生的起伏与天命所在。", component: BaziApp, prompt: "Chinese zodiac signs, golden energy flow, cosmic background, ancient wisdom" },
  ];

  if (subTab) {
    const App = moreApps.find(a => a.id === subTab)?.component;
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <button 
          onClick={() => setSubTab(null)}
          className="flex items-center gap-2 text-[#E8DFB8]/60 hover:text-[#C9A84C] transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-serif tracking-widest">返回更多</span>
        </button>
        <AnimatePresence mode="wait">
          <motion.div
            key={subTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {App && <App />}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-16">
      <header className="max-w-2xl space-y-6">
        <h1 className="text-4xl md:text-6xl font-serif text-amber-100 tracking-widest uppercase">更多<span className="gold-gradient-text">奥秘</span></h1>
        <p className="text-xl text-[#E8DFB8]/60 font-serif leading-relaxed">
          深入探索宇宙的每一个角落，发现隐藏在星辰背后的更多智慧与力量。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {moreApps.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.id}
              role="button"
              tabIndex={0}
              onClick={() => setSubTab(app.id)}
              onKeyDown={(e) => e.key === 'Enter' && setSubTab(app.id)}
              className="luxury-card p-10 text-left transition-all duration-700 group relative overflow-hidden min-h-[320px] flex flex-col justify-end cursor-pointer hover:bg-[#C9A84C]/5"
            >
              <div className="absolute inset-0 z-0">
                <MysticImage 
                  prompt={app.prompt} 
                  className="w-full h-full opacity-20 group-hover:opacity-40 transition-all duration-1000 group-hover:scale-105"
                  aspectRatio="3:4"
                />
              </div>
              <div className="relative z-10">
                <Icon className="w-12 h-12 mb-8 text-[#E8DFB8]/20 group-hover:text-[#C9A84C] transition-all duration-700" />
                <h3 className="text-3xl font-serif mb-4 group-hover:gold-gradient-text transition-colors">
                  {app.name}
                </h3>
                <p className="text-[#E8DFB8]/40 leading-relaxed">{app.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
