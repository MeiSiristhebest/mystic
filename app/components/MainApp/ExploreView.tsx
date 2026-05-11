"use client";

import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Map, 
  Eye, 
  Ghost, 
  Zap, 
  Heart,
  Clock,
  LayoutGrid
} from "lucide-react";

import { useAppStore } from "@/lib/store";
import dynamic from "next/dynamic";
import BreathingLoading from "../BreathingLoading";
import { ChevronLeft } from "lucide-react";

// Dynamic imports for sub-apps
const MysticTarot = dynamic(() => import("./MysticTarot").then(mod => ({ default: mod.MysticTarot })), {
  loading: () => <BreathingLoading text="正在感应塔罗能量..." />
});
const AstrologyApp = dynamic(() => import("../AstrologyApp"), {
  loading: () => <BreathingLoading text="正在对齐星辰..." />
});
const BaziApp = dynamic(() => import("../BaziApp"), {
  loading: () => <BreathingLoading text="正在排出四柱..." />
});
const IChingApp = dynamic(() => import("../IChingApp"), {
  loading: () => <BreathingLoading text="正在推演易数..." />
});
const FaceReadingApp = dynamic(() => import("../FaceReadingApp"), {
  loading: () => <BreathingLoading text="正在读取相貌..." />
});
const ShadowWorkApp = dynamic(() => import("../ShadowWorkApp"), {
  loading: () => <BreathingLoading text="正在映照阴影..." />
});
const SynastryApp = dynamic(() => import("../SynastryApp"), {
  loading: () => <BreathingLoading text="正在建立共鸣场..." />
});
const CollectiveMirrorApp = dynamic(() => import("../CollectiveMirrorApp"), {
  loading: () => <BreathingLoading text="正在连接集体潜意识..." />
});
const TimeWisdomApp = dynamic(() => import("../TimeWisdomApp"), {
  loading: () => <BreathingLoading text="正在穿越时间..." />
});

const apps = [
  {
    id: "tarot",
    name: "深层塔罗",
    description: "通过78张阿卡夏之牌，探索潜意识的映射与未来可能性。",
    icon: Sparkles,
    color: "from-amber-500/20 to-amber-900/40",
    textColor: "text-amber-200",
    component: MysticTarot
  },
  {
    id: "astrology",
    name: "星盘推演",
    description: "基于出生瞬间的天体布局，解析性格底层代码与大运走向。",
    icon: Moon,
    color: "from-blue-500/20 to-blue-900/40",
    textColor: "text-blue-200",
    component: AstrologyApp
  },
  {
    id: "bazi",
    name: "八字命理",
    description: "东方传统干支推演，洞察一生寒暑、五行喜忌与命运起伏。",
    icon: Sun,
    color: "from-red-500/20 to-red-900/40",
    textColor: "text-red-200",
    component: BaziApp
  },
  {
    id: "iching",
    name: "易经占卜",
    description: "阴阳交替，六爻玄机。在万物变易中寻找不变的真理。",
    icon: Map,
    color: "from-emerald-500/20 to-emerald-900/40",
    textColor: "text-emerald-200",
    component: IChingApp
  },
  {
    id: "face_reading",
    name: "相术洞察",
    description: "观人于微。通过面相与手相的纹路，窥见灵魂的印记。",
    icon: Eye,
    color: "from-purple-500/20 to-purple-900/40",
    textColor: "text-purple-200",
    component: FaceReadingApp
  },
  {
    id: "shadow_work",
    name: "暗影工作",
    description: "直面内心深处的恐惧与压抑，完成人格的最后整合。",
    icon: Ghost,
    color: "from-zinc-700/40 to-black",
    textColor: "text-zinc-200",
    component: ShadowWorkApp
  },
  {
    id: "synastry",
    name: "关系合盘",
    description: "解析两人能量场的交互与共振，预见情感的契合与挑战。",
    icon: Heart,
    color: "from-pink-500/20 to-pink-900/40",
    textColor: "text-pink-200",
    component: SynastryApp
  },
  {
    id: "collective",
    name: "集体镜像",
    description: "感知当下人类集体意识的律动，寻找共时性的觉醒指引。",
    icon: Zap,
    color: "from-cyan-500/20 to-cyan-900/40",
    textColor: "text-cyan-200",
    component: CollectiveMirrorApp
  },
  {
    id: "time_wisdom",
    name: "时空智慧",
    description: "超越线性时间。在不同的时空节点中寻找智慧的碎片。",
    icon: Clock,
    color: "from-orange-500/20 to-orange-900/40",
    textColor: "text-orange-200",
    component: TimeWisdomApp
  }
];

export function ExploreView() {
  const activeSubTab = useAppStore((state) => state.activeSubTab);
  const setActiveSubTab = useAppStore((state) => state.setActiveSubTab);

  if (activeSubTab) {
    const App = apps.find(a => a.id === activeSubTab)?.component;
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-8">
        <button 
          onClick={() => setActiveSubTab(null)}
          className="flex items-center gap-2 text-amber-500/60 hover:text-amber-500 transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-serif tracking-widest uppercase text-xs">返回探索</span>
        </button>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-20"
    >
      <div className="flex flex-col items-center mb-16 text-center">
        <div className="p-3 rounded-2xl bg-amber-500/10 mb-6">
          <LayoutGrid className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-amber-100 tracking-[0.2em] mb-4 uppercase">
          探索<span className="gold-gradient-text">阿卡夏</span>
        </h1>
        <p className="text-amber-200/40 font-serif tracking-[0.1em] max-w-xl">
          星辰大海，万物互联。在这里开启多维度的灵魂探索之旅。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app, idx) => (
          <motion.button
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setActiveSubTab(app.id)}
            className={`group relative p-8 rounded-3xl border border-white/5 bg-gradient-to-br ${app.color} text-left transition-all duration-500 hover:scale-[1.02] hover:border-white/10 shadow-lg`}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <app.icon className="w-24 h-24" />
            </div>
            
            <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 w-fit mb-6 ${app.textColor}`}>
              <app.icon className="w-6 h-6" />
            </div>
            
            <h3 className={`text-2xl font-serif mb-3 tracking-widest ${app.textColor}`}>
              {app.name}
            </h3>
            
            <p className="text-sm text-white/40 leading-relaxed font-light">
              {app.description}
            </p>
            
            <div className="mt-8 flex items-center gap-2 text-xs font-serif tracking-widest opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
              <span className={app.textColor}>开启探索</span>
              <div className={`w-8 h-px ${app.textColor.replace('text-', 'bg-')}`} />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
