"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Moon,
  Sun,
  Star,
  Heart,
  Briefcase,
  Coins,
  Compass,
  Layers,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Activity,
  Users,
  Wand2,
  Book,
  Download,
  Share2,
  ShieldAlert,
  Clock,
  User,
  Globe,
  Eye,
  ArrowUpCircle,
  Loader2,
  RefreshCw,
  Zap,
} from "lucide-react";
import {
  generateDeck,
  shuffleDeck,
  TarotCard as TarotCardType,
} from "@/lib/tarot-data";
import MysticMarkdown from "./MysticMarkdown";
import SoulCard from "./SoulCard";
import { generatePosterImage } from "@/lib/exportImage";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";
import { useAIStream } from "@/hooks/useAIStream";
import { AKASHA_PERSONA, SOCRATIC_PERSONA, generateContent, DEFAULT_MODEL } from "@/lib/ai";
import Image from "next/image";

import ErrorBoundary from './MainApp/ErrorBoundary';
import { CATEGORIES, SPREAD_MODES } from './MainApp/constants';
import { MysticImage } from './MainApp/MysticImage';
import { DesktopNavigation, MobileNavigation, MobileHeader } from './MainApp/Navigation';


import dynamic from "next/dynamic";

const AstrologyApp = dynamic(() => import("./AstrologyApp"), { 
  loading: () => <BreathingLoading text="正在连接星辰..." /> 
});
const EasternApp = dynamic(() => import("./EasternApp"), { 
  loading: () => <BreathingLoading text="正在对齐东方历法..." /> 
});
const JourneyApp = dynamic(() => import("./JourneyApp"), { 
  loading: () => <BreathingLoading text="正在回顾你的旅程..." /> 
});
const SynastryApp = dynamic(() => import("./SynastryApp"), { 
  loading: () => <BreathingLoading text="正在建立共鸣场..." /> 
});
const SubconsciousApp = dynamic(() => import("./SubconsciousApp"), { 
  loading: () => <BreathingLoading text="正在潜入深海..." /> 
});
const ShadowWorkApp = dynamic(() => import("./ShadowWorkApp"), { 
  loading: () => <BreathingLoading text="正在映照阴影..." /> 
});
const TimeWisdomApp = dynamic(() => import("./TimeWisdomApp"), { 
  loading: () => <BreathingLoading text="正在穿越时间..." /> 
});
const CollectiveMirrorApp = dynamic(() => import("./CollectiveMirrorApp"), { 
  loading: () => <BreathingLoading text="正在连接集体潜意识..." /> 
});
const FaceReadingApp = dynamic(() => import("./FaceReadingApp"), { 
  loading: () => <BreathingLoading text="正在读取相貌..." /> 
});
const IChingApp = dynamic(() => import("./IChingApp"), { 
  loading: () => <BreathingLoading text="正在推演易数..." /> 
});
const BaziApp = dynamic(() => import("./BaziApp"), { 
  loading: () => <BreathingLoading text="正在排出四柱..." /> 
});
const UserProfileModal = dynamic(() => import("./UserProfileModal"));
const DiscoveryView = dynamic(() => import("./DiscoveryView"));

import { saveToIndexedDB, getFromIndexedDB } from '@/lib/storage';
import BreathingLoading from "./BreathingLoading";

import { playCardSound } from "@/lib/audio";
import { useJourney } from "@/hooks/useJourney";
import { useUserProfile } from "@/hooks/useUserProfile";
import { 
  getSunSign, 
  getAscendant, 
  getDescendant, 
  getRulingPlanet 
} from "@/lib/astrology";
import { db } from "@/lib/firebase";

export default function App() {
  const [activeTab, setActiveTab] = useState("today");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  useEffect(() => {
    (window as any).setActiveTab = setActiveTab;
    return () => { delete (window as any).setActiveTab; };
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#080510] text-[#E8DFB8] font-sans selection:bg-[#C9A84C]/30 pb-20 md:pb-0">
        <DesktopNavigation activeTab={activeTab} setActiveTab={setActiveTab} setIsProfileModalOpen={setIsProfileModalOpen} />
        <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <MobileHeader setActiveTab={setActiveTab} setIsProfileModalOpen={setIsProfileModalOpen} />

        {/* Main Content */}
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
              {activeTab === "today" && <TodayView onNavigate={setActiveTab} />}
              {activeTab === "discovery" && <DiscoveryView onComplete={() => setActiveTab("today")} />}
              {activeTab === "explore" && <ExploreView />}
              {activeTab === "soul" && <SoulView onOpenProfile={() => setIsProfileModalOpen(true)} onStartDiscovery={() => setActiveTab("discovery")} />}
              {activeTab === "journal" && <JourneyApp />}
              {activeTab === "more" && <MoreView />}
            </motion.div>
          </AnimatePresence>
        </main>
        
        <UserProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
      </div>
    </ErrorBoundary>
  );
}

function MoreView() {
  const [subTab, setSubTab] = useState<string | null>(null);

  const moreApps = [
    { id: "synastry", name: "三才合参", icon: Sparkles, desc: "融合八字、星盘与塔罗，进行高维度的综合命理分析。", component: SynastryApp, prompt: "Mystic cosmic alignment, sacred geometry, golden light, ethereal atmosphere" },
    { id: "subconscious", name: "潜意识剧场", icon: Moon, desc: "探索梦境与潜意识的深层含义，揭示内心隐藏的渴望。", component: SubconsciousApp, prompt: "Surreal dreamscape, floating objects, ethereal nebula, deep purple and blue" },
    { id: "shadow", name: "阴影工作", icon: ShieldAlert, desc: "面对并整合内心的阴影，实现灵魂的完整与疗愈。", component: ShadowWorkApp, prompt: "Dark mysterious forest, ethereal light breaking through, mystical atmosphere, deep shadows" },
    { id: "time", name: "时间智慧", icon: Clock, desc: "在时间的流动中寻找智慧，洞察过去、现在与未来的连接。", component: TimeWisdomApp, prompt: "Ancient clockwork in space, floating gears, golden light, cosmic time flow" },
    { id: "collective", name: "集体镜像", icon: Users, desc: "连接集体潜意识，探索人类共同的命运与原型力量。", component: CollectiveMirrorApp, prompt: "Many glowing souls connected, cosmic web, ethereal light, collective consciousness" },
    { id: "face", name: "灵气面相", icon: User, desc: "通过面部特征洞察性格与命运，探索灵气在面容上的显化。", component: FaceReadingApp, prompt: "Ethereal glowing face, sacred geometry patterns, golden light, mystical portrait" },
    { id: "iching", name: "周易六爻", icon: Layers, desc: "古老的东方占卜智慧，通过卦象推演事物的演化规律。", component: IChingApp, prompt: "Ancient Chinese hexagrams, golden ink wash, cosmic clouds, mystical symbols" },
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
        <h1 className="editorial-title">更多<span className="gold-gradient-text">奥秘</span></h1>
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

function TodayView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { profile, getProfileContext, isLoaded } = useUserProfile();
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  const sunSign = profile.birthDate ? getSunSign(new Date(profile.birthDate)) : "白羊座";
  const name = profile.name || "探索者";
  
  const [oracle, setOracle] = useState("「 此刻你所逃避的，正是你最需要面对的。星辰已为你排好阵列，只待你勇敢一跃。」");
  const [energyTip, setEnergyTip] = useState("保持觉察，在呼吸间感受宇宙的律动。");
  const [isGenerating, setIsGenerating] = useState(false);
  const generatingRef = useRef(false);

  useEffect(() => {
    const generateDailyContent = async () => {
      if (!isLoaded) return;
      if (!profile.name && !profile.birthDate) return;
      if (generatingRef.current) return;
      
      // Check cache
      const localDateStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const todayKey = `daily_content_${localDateStr}`;
      const cached = localStorage.getItem(todayKey);
      if (cached) {
        try {
          const { oracle: cachedOracle, energyTip: cachedEnergyTip } = JSON.parse(cached);
          console.log("Using cached daily content for", todayKey);
          setOracle(`「 ${cachedOracle.trim()} 」`);
          setEnergyTip(cachedEnergyTip.trim());
          return;
        } catch (e) {
          console.error("解析缓存失败:", e);
        }
      }

      console.log("Generating new daily content for", todayKey);
      generatingRef.current = true;
      setIsGenerating(true);
      try {
        const context = getProfileContext();
        const prompt = `
          你是一位充满智慧的灵魂导师。请根据以下用户信息，为他/她生成今日的“灵魂神谕”和“能量建议”。
          
          用户信息：
          ${context}
          
          请返回一个JSON对象，包含以下字段：
          1. oracle: 灵魂神谕，语气优雅、深邃、富有哲理，30-50字。
          2. energyTip: 今日能量建议，具体且可操作，15-25字。
          
          仅返回JSON对象，不要有任何解释。
        `;
        
        const text = await generateContent(prompt, AKASHA_PERSONA, {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              oracle: { type: "STRING" },
              energyTip: { type: "STRING" },
            },
            required: ["oracle", "energyTip"],
          },
        });
        
        const result = JSON.parse(text || "{}");
        if (result.oracle && result.energyTip) {
          const finalOracle = `「 ${result.oracle.trim()} 」`;
          const finalEnergyTip = result.energyTip.trim();
          setOracle(finalOracle);
          setEnergyTip(finalEnergyTip);
          // Save to cache
          localStorage.setItem(todayKey, JSON.stringify({
            oracle: result.oracle.trim(),
            energyTip: result.energyTip.trim()
          }));
        }
      } catch (err) {
        console.error("生成每日内容失败:", err);
      } finally {
        setIsGenerating(false);
        generatingRef.current = false;
      }
    };

    generateDailyContent();
  }, [profile.name, profile.birthDate, getProfileContext, isLoaded]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-16">
      <header className="space-y-4 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-center md:justify-start gap-4"
        >
          <span className="micro-label">{dateStr}</span>
          <div className="w-1 h-1 rounded-full bg-[#C9A84C]/40" />
          <span className="micro-label">宇宙能量：平衡</span>
        </motion.div>
        <h1 className="editorial-title">
          早安，<span className="gold-gradient-text">{name}</span>
        </h1>
      </header>

      <section className="luxury-card relative overflow-hidden group min-h-[300px] flex items-center">
        <div className="absolute inset-0 z-0">
          <MysticImage 
            prompt="A mystical oracle card floating in a nebula, cosmic eye, sacred geometry" 
            className="w-full h-full opacity-50 group-hover:opacity-70 transition-opacity duration-1000"
            aspectRatio="16:9"
          />
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-1000 z-10">
          <Sparkles className="w-32 h-32 text-[#C9A84C]" />
        </div>
        <div className="space-y-8 relative z-20 p-8 md:p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-[#C9A84C]/40" />
            <span className="font-serif text-sm tracking-[0.3em] text-[#C9A84C]">今日神谕</span>
          </div>
          {isGenerating ? (
            <div className="space-y-4 max-w-3xl">
              <div className="h-8 bg-white/5 animate-pulse rounded w-full" />
              <div className="h-8 bg-white/5 animate-pulse rounded w-3/4" />
            </div>
          ) : (
            <motion.blockquote 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl md:text-5xl font-serif leading-tight gold-gradient-text italic max-w-3xl"
            >
              {oracle}
            </motion.blockquote>
          )}
          <div className="flex justify-end">
            <button className="text-xs font-serif tracking-[0.2em] text-[#E8DFB8]/40 hover:text-[#C9A84C] transition-colors flex items-center gap-2">
              长按保存卡片 <Download className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "太阳", sign: sunSign, icon: Sun },
          { label: "性别", sign: profile.gender || "未设置", icon: User },
          { label: "MBTI", sign: profile.mbti || "未设置", icon: Activity },
        ].map((item, i) => (
          <div key={i} className="cinematic-panel rounded-3xl p-8 flex flex-col items-center gap-4 group hover:border-[#C9A84C]/20 transition-all duration-700">
            <item.icon className="w-8 h-8 text-[#C9A84C]/60 group-hover:text-[#C9A84C] transition-colors duration-700" />
            <div className="text-center">
              <p className="micro-label mb-1">{item.label}</p>
              <p className="font-serif text-xl tracking-widest">{item.sign}</p>
            </div>
          </div>
        ))}
      </section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="luxury-card p-8 border-[#C9A84C]/20 bg-[#C9A84C]/5 flex items-center gap-6"
      >
        <div className="w-12 h-12 rounded-full bg-[#C9A84C]/20 flex items-center justify-center shrink-0">
          <Zap className="w-6 h-6 text-[#C9A84C]" />
        </div>
        <div className="space-y-1">
          <p className="micro-label text-[#C9A84C]">今日能量建议</p>
          <p className="text-lg font-serif italic text-[#E8DFB8]/80">
            {isGenerating ? "正在同步宇宙频率..." : energyTip}
          </p>
        </div>
      </motion.section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl tracking-widest">快速开始</h2>
          <div className="h-px flex-1 mx-8 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={() => onNavigate("explore")} className="luxury-card p-10 text-left group hover:bg-[#C9A84C]/5">
            <p className="micro-label mb-4">Tarot</p>
            <h3 className="text-2xl font-serif mb-4 group-hover:gold-gradient-text transition-all">每日单牌占卜</h3>
            <p className="text-[#E8DFB8]/40 text-sm leading-relaxed">抽取今日指引，洞察潜意识中的微光。</p>
          </button>
          <button onClick={() => onNavigate("journal")} className="luxury-card p-10 text-left group hover:bg-[#C9A84C]/5">
            <p className="micro-label mb-4">Journal</p>
            <h3 className="text-2xl font-serif mb-4 group-hover:gold-gradient-text transition-all">上次未读解读</h3>
            <p className="text-[#E8DFB8]/40 text-sm leading-relaxed">你还有一份关于“事业发展”的解读尚未读完。</p>
          </button>
        </div>
      </section>
    </div>
  );
}

function ExploreView() {
  const [subTab, setSubTab] = useState("tarot");

  const systems = [
    { id: "tarot", name: "塔罗占卜", icon: Sparkles, desc: "通过78张神秘卡片，洞察当下与未来的能量流动。" },
    { id: "eastern", name: "东方命理", icon: Star, desc: "八字、紫微、六爻，传承千年的东方智慧推演。" },
    { id: "astrology", name: "星象人格", icon: Moon, desc: "解读星盘与天象，探索灵魂的蓝图与性格底色。" },
    { id: "discovery", name: "发现自我", icon: Compass, desc: "通过MBTI、八字与原型探索，开启你的深度灵魂发现之旅。", isSpecial: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-16">
      <header className="max-w-2xl space-y-6">
        <h1 className="editorial-title">探索<span className="gold-gradient-text">宇宙</span></h1>
        <p className="text-xl text-[#E8DFB8]/60 font-serif leading-relaxed">
          选择一个神秘系统，开启你的探索之旅。无论是当下的困惑，还是长远的人生蓝图，星辰皆有回应。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {systems.map((system) => {
          const Icon = system.icon;
          const isActive = subTab === system.id;
          const prompts: Record<string, string> = {
            tarot: "Mysterious tarot cards floating in a nebula, golden sacred geometry, ethereal light",
            eastern: "Ancient Chinese astrology, bagua, yin yang, golden dragon in cosmic clouds, ink wash style",
            astrology: "Zodiac wheel, constellations, glowing planets, nebula background, celestial map",
            discovery: "Ethereal soul discovery, glowing compass, sacred geometry, cosmic light"
          };
          return (
            <div
              key={system.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (system.id === "discovery") {
                  // Use window dispatch or state lifting if needed, but here we can just set activeTab
                  // Since ExploreView is inside App, we need to pass setActiveTab
                  (window as any).setActiveTab?.("discovery");
                } else {
                  setSubTab(system.id);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && setSubTab(system.id)}
              className={`luxury-card p-10 text-left transition-all duration-700 group relative overflow-hidden min-h-[320px] flex flex-col justify-end cursor-pointer ${
                isActive ? "border-[#C9A84C]/40 bg-[#C9A84C]/5" : "hover:bg-white/5"
              }`}
            >
              <div className="absolute inset-0 z-0">
                <MysticImage 
                  prompt={prompts[system.id]} 
                  className={`w-full h-full transition-all duration-1000 ${isActive ? "opacity-60 scale-105" : "opacity-20 group-hover:opacity-40"}`}
                  aspectRatio="3:4"
                />
              </div>
              <div className="relative z-10">
                <Icon className={`w-12 h-12 mb-8 transition-all duration-700 ${
                  isActive ? "text-[#C9A84C] scale-110" : "text-[#E8DFB8]/20 group-hover:text-[#E8DFB8]/40"
                }`} />
                <h3 className={`text-3xl font-serif mb-4 transition-colors ${isActive ? "gold-gradient-text" : ""}`}>
                  {system.name}
                </h3>
                <p className="text-[#E8DFB8]/40 leading-relaxed">{system.desc}</p>
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
            {subTab === "tarot" && <MysticTarot />}
            {subTab === "eastern" && <EasternApp />}
            {subTab === "astrology" && <AstrologyApp />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MoodCheckIn({ profile, updateProfile }: { profile: any, updateProfile: any }) {
  const [words, setWords] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = profile.emotionalBaseline?.some((e: any) => e.date === today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!words.trim()) return;

    setIsSubmitting(true);
    const wordList = words.split(/[,，\s]+/).filter(w => w.trim());
    
    const newBaseline = [...(profile.emotionalBaseline || [])];
    const todayIndex = newBaseline.findIndex(e => e.date === today);
    
    if (todayIndex >= 0) {
      newBaseline[todayIndex].words = [...new Set([...newBaseline[todayIndex].words, ...wordList])];
    } else {
      newBaseline.push({ date: today, words: wordList });
    }

    updateProfile({ emotionalBaseline: newBaseline });
    setWords("");
    setIsSubmitting(false);
  };

  if (hasCheckedInToday && !words) {
    return (
      <div className="text-center p-4 border border-[#C9A84C]/20 rounded-xl bg-[#C9A84C]/5">
        <p className="text-sm text-[#C9A84C]">今日情绪已记录，能量正在流转。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-[#E8DFB8]/60 font-serif">记录当下的情绪词汇（用空格或逗号分隔），它们将化作你的灵魂能量：</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={words}
          onChange={(e) => setWords(e.target.value)}
          placeholder="例如：平静 期待 焦虑..."
          className="flex-1 bg-black/40 border border-[#C9A84C]/20 rounded-lg px-4 py-2 text-sm text-[#E8DFB8] focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
        />
        <button
          type="submit"
          disabled={isSubmitting || !words.trim()}
          className="px-4 py-2 bg-[#C9A84C]/20 text-[#C9A84C] rounded-lg text-sm hover:bg-[#C9A84C]/30 transition-colors disabled:opacity-50"
        >
          注入能量
        </button>
      </div>
    </form>
  );
}

function SoulView({ onOpenProfile, onStartDiscovery }: { onOpenProfile: () => void, onStartDiscovery: () => void }) {
  const { profile, isLoaded, updateProfile } = useUserProfile();
  const { entries } = useJourney();
  
  const birthDate = profile.birthDate ? new Date(profile.birthDate) : null;
  const sunSign = birthDate ? getSunSign(birthDate) : "未知";
  const ascendant = birthDate && profile.birthTime ? getAscendant(birthDate, profile.birthTime) : "未知";
  const descendant = ascendant !== "未知" ? getDescendant(ascendant) : "未知";
  const rulingPlanet = sunSign !== "未知" ? getRulingPlanet(sunSign) : "未知";
  
  const mbti = profile.mbti || "未设置";
  let archetype = profile.jungianArchetype?.split('(')[0].trim() || "";
  
  // Basic check for garbled text (like è±é)
  if (archetype && /[\u0080-\u00ff]/.test(archetype) && !/[\u4e00-\u9fa5]/.test(archetype)) {
    archetype = "";
  }
  const coreIssues = profile.coreIssues && profile.coreIssues.length > 0 ? profile.coreIssues : ["暂无记录"];
  
  // Calculate energy levels based on emotional baseline if available
  const energyLevels = useMemo(() => {
    const levels = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const dayEmotion = profile.emotionalBaseline?.find(e => e.date === dateStr);
      if (dayEmotion) {
        levels.push(Math.min(100, 40 + dayEmotion.words.length * 15));
      } else {
        levels.push(40 + Math.sin(i) * 10); // Default fluctuation
      }
    }
    return levels;
  }, [profile.emotionalBaseline]);

  if (!isLoaded) return <BreathingLoading text="正在同步灵魂频率..." />;

  const isProfileIncomplete = !profile.name || !profile.birthDate;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-16">
      <header className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="editorial-title">灵魂<span className="gold-gradient-text">档案</span></h1>
          <button 
            onClick={onOpenProfile}
            className="px-4 py-2 rounded-full border border-[#C9A84C]/40 text-sm font-serif tracking-widest hover:bg-[#C9A84C]/10 transition-all flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            编辑档案
          </button>
        </div>
        <p className="text-xl text-[#E8DFB8]/60 font-serif leading-relaxed">
          {profile.name ? `欢迎回来，${profile.name}。` : ""}这是你与宇宙连接的独特印记。每一颗星辰的排列，都构成了你不可复制的灵魂底色。
        </p>
      </header>

      {isProfileIncomplete && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="luxury-card p-8 border-amber-500/30 bg-amber-500/5 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl font-serif text-amber-300">完善你的灵魂档案</h4>
            <p className="text-sm text-amber-100/60">填写出生日期与基础信息，解锁精准的星象解析与心理原型分析。</p>
          </div>
          <button 
            onClick={onOpenProfile}
            className="px-8 py-3 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-serif tracking-widest hover:bg-amber-500/30 transition-all"
          >
            立即完善
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="luxury-card p-10 relative overflow-hidden min-h-[400px] flex flex-col justify-center">
            <div className="absolute inset-0 z-0">
              <MysticImage 
                prompt={`A glowing ethereal soul essence for ${archetype || 'Seeker'}, nebula heart, cosmic energy flow, sacred geometry`} 
                className="w-full h-full opacity-60"
                aspectRatio="16:9"
              />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-[#C9A84C]/40 flex items-center justify-center">
                  <User className="w-6 h-6 text-[#C9A84C]" />
                </div>
                <div>
                  {archetype ? (
                    <>
                      <h3 className="text-3xl font-serif gold-gradient-text">核心人格：{archetype}</h3>
                      <p className="micro-label">Soul Core: The {profile.jungianArchetype?.split('(')[1]?.replace(')', '') || 'Seeker'}</p>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif text-[#E8DFB8]/40 italic">核心人格：尚未觉醒</h3>
                      <button 
                        onClick={onStartDiscovery}
                        className="text-xs text-[#C9A84C] hover:underline flex items-center gap-1"
                      >
                        <Wand2 className="w-3 h-3" /> 开启原型探索，发现你的灵魂本色
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "太阳", value: sunSign },
                  { label: "上升", value: ascendant },
                  { label: "下降", value: descendant },
                  { label: "生肖", value: profile.zodiac || "未设置" },
                  { label: "八字", value: profile.bazi || "未设置" },
                  { label: "守护星", value: rulingPlanet },
                  { label: "性别", value: profile.gender || "未设置" },
                  { label: "MBTI", value: mbti },
                  { label: "状态", value: profile.currentStatus ? "已同步" : "待更新" },
                ].map((trait, i) => (
                  <div key={i} className="cinematic-panel p-6 rounded-2xl text-center">
                    <p className="micro-label mb-2">{trait.label}</p>
                    <p className="font-serif text-lg">{trait.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="luxury-card p-8 space-y-6">
              <h4 className="font-serif text-xl tracking-widest">核心人生议题</h4>
              <div className="flex flex-wrap gap-3">
                {coreIssues.map((word) => (
                  <span key={word} className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-sm font-serif tracking-widest hover:border-[#C9A84C]/40 transition-colors">
                    {word}
                  </span>
                ))}
              </div>
            </div>
            <div className="luxury-card p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-xl tracking-widest">能量波动</h4>
              </div>
              <div className="h-32 flex items-end gap-2">
                {energyLevels.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="flex-1 bg-gradient-to-t from-[#C9A84C]/20 to-[#C9A84C]/60 rounded-t-lg relative group"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[#C9A84C] font-mono">
                      {Math.round(h)}
                    </div>
                  </motion.div>
                ))}
              </div>
              <MoodCheckIn profile={profile} updateProfile={updateProfile} />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="luxury-card p-8 space-y-8">
            <h4 className="font-serif text-xl tracking-widest text-center">当前生命节点</h4>
            <div className="space-y-6">
              {profile.lifeEvents && profile.lifeEvents.length > 0 ? (
                profile.lifeEvents.slice(-3).map((event, i) => (
                  <div key={event.id} className="relative pl-6 border-l border-[#C9A84C]/20">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-[#C9A84C]" />
                    <p className="text-xs text-[#C9A84C]/60 mb-1">{event.date}</p>
                    <p className="text-sm font-serif leading-relaxed">{event.description}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-[#C9A84C]/10 blur-3xl rounded-full animate-pulse" />
                    <MysticImage 
                      prompt="A quiet serene landscape, misty mountains, zen atmosphere" 
                      className="w-full h-full rounded-full border-2 border-[#C9A84C]/20"
                      aspectRatio="1:1"
                    />
                  </div>
                  <p className="text-sm text-[#E8DFB8]/40 italic">暂无重大生命节点记录</p>
                </div>
              )}
            </div>
          </section>

          <section className="luxury-card p-8 space-y-6">
            <h4 className="font-serif text-xl tracking-widest">成长建议</h4>
            <ul className="space-y-4">
              {profile.currentStatus ? (
                [
                  "在冥想中寻找内心的宁静",
                  "尝试用艺术表达潜意识",
                  "关注梦境中的符号指引",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/40 mt-2 group-hover:scale-150 transition-transform" />
                    <p className="text-sm text-[#E8DFB8]/70 font-serif leading-relaxed">{tip}</p>
                  </li>
                ))
              ) : (
                <p className="text-sm text-[#E8DFB8]/40 italic text-center">完善档案后，阿卡夏将为你提供个性化建议</p>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function MysticTarot() {
  const { getProfileContext } = useUserProfile();
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("general");
  const [mode, setMode] = useState("time");
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [isSelectingCards, setIsSelectingCards] = useState(false);
  const [deckCards, setDeckCards] = useState<TarotCardType[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<TarotCardType[]>([]);
  const [revealedCards, setRevealedCards] = useState<boolean[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [zodiacSign, setZodiacSign] = useState("");
  const [recommendError, setRecommendError] = useState("");
  const [error, setError] = useState("");
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);
  const [cardMeaningsCache, setCardMeaningsCache] = useState<Record<string, string>>({});
  
  const [soulMotto, setSoulMotto] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const soulCardRef = useRef<HTMLDivElement>(null);
  const soulCardFullRef = useRef<HTMLDivElement>(null);

  const { addEntry, updateEntry } = useJourney();
  const { stream, isLoading: isReading, error: streamError, abort } = useAIStream();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();
  
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);
  const [isSocraticMode, setIsSocraticMode] = useState(false);
  const [isProfessionalMode, setIsProfessionalMode] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const currentMode =
    SPREAD_MODES.find((m) => m.id === mode) || SPREAD_MODES[1];

  const onGeneratePosterSimple = async () => {
    if (!soulCardRef.current) return;
    setShowExportOptions(false);
    handleGeneratePoster(soulCardRef.current, `soul-card-simple-${mode}.jpg`);
  };

  const onGeneratePosterFull = async () => {
    if (!soulCardFullRef.current) return;
    setShowExportOptions(false);
    handleGeneratePoster(soulCardFullRef.current, `soul-card-full-${mode}.jpg`);
  };

  const [followUpText, setFollowUpText] = useState("");

  const onFollowUp = async () => {
    if (!followUpText.trim()) return;
    const text = followUpText.trim();
    setFollowUpText("");
    await handleFollowUp(text);
  };

  const onReset = () => {
    setDrawnCards([]);
    setQuestion("");
    setMessages([]);
    setCurrentEntryId(null);
    abort();
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 256; // 240px width + 16px gap
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleRecommendMode = async () => {
    if (!question.trim()) {
      setRecommendError("请先输入您的疑问，我才能为您推荐最合适的牌阵。");
      return;
    }
    setRecommendError("");
    setIsRecommending(true);
    try {
      const prompt = `
      你是一位资深的塔罗占卜大师。用户提出了一个问题："${question}"。
      请根据这个问题，从以下分类和牌阵中，推荐最合适的一个分类和一个牌阵。

      分类列表：
      ${CATEGORIES.map((c) => `${c.id} (${c.name})`).join(", ")}

      牌阵列表：
      ${SPREAD_MODES.map((m) => `${m.id} (${m.name}: ${m.description})`).join("\n")}

      请仅返回一个JSON对象，包含 'categoryId' 和 'modeId' 两个字段。不要包含任何其他文本、markdown标记或解释。
      示例：{"categoryId": "love", "modeId": "relationship"}
      `;
      const text = await generateContent(prompt, AKASHA_PERSONA, {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            categoryId: { type: "STRING" },
            modeId: { type: "STRING" },
          },
        },
      });
      const result = JSON.parse(text || "{}");
      if (
        result.categoryId &&
        CATEGORIES.some((c) => c.id === result.categoryId)
      ) {
        setCategory(result.categoryId);
      }
      if (result.modeId && SPREAD_MODES.some((m) => m.id === result.modeId)) {
        setMode(result.modeId);
      }
    } catch (error) {
      console.error("推荐牌阵失败:", error);
      setRecommendError("推荐牌阵失败，请稍后再试或手动选择。");
    } finally {
      setIsRecommending(false);
    }
  };

  const handleDrawCards = () => {
    if (isShuffling) return;
    setIsShuffling(true);
    setDrawnCards([]);
    setDeckCards([]);
    setSelectedIndices([]);
    setMessages([]);
    setError("");

    // Simulate the formal shuffling, cutting, and focusing ritual
    setTimeout(() => {
      const deck = shuffleDeck(generateDeck());
      setDeckCards(deck);
      setIsShuffling(false);
      setIsSelectingCards(true);
    }, 3500);
  };

  const handleSelectCardFromDeck = (index: number) => {
    if (selectedIndices.includes(index)) return;
    if (selectedIndices.length >= currentMode.cardCount) return;

    playCardSound();
    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === currentMode.cardCount) {
      setTimeout(() => {
        const selectedCards = newSelected.map(i => deckCards[i]);
        setDrawnCards(selectedCards);
        setRevealedCards(new Array(currentMode.cardCount).fill(false));
        setIsSelectingCards(false);
      }, 800);
    }
  };

  const handleRevealCard = (index: number) => {
    if (revealedCards[index]) return;

    playCardSound();
    const newRevealed = [...revealedCards];
    newRevealed[index] = true;
    setRevealedCards(newRevealed);
  };

  useEffect(() => {
    if (
      drawnCards.length > 0 &&
      drawnCards.length === currentMode.cardCount &&
      revealedCards.every((r) => r) &&
      !isReading &&
      messages.length === 0
    ) {
      generateReading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    revealedCards,
    drawnCards,
    isReading,
    messages.length,
    currentMode.cardCount,
  ]);

  const generateReading = async () => {
    try {
      const categoryName =
        CATEGORIES.find((c) => c.id === category)?.name || "综合运势";

      const cardsList = drawnCards
        .map((card, index) => {
          return `${index + 1}. ${currentMode.positions[index]}：${card.name} ${card.isReversed ? "（逆位）" : "（正位）"}`;
        })
        .join("\n        ");

      const profileContext = getProfileContext();

      const prompt = `
        这是一次正式的塔罗占卜仪式。用户经过了冥想与洗牌，选择了【${currentMode.name}】（共${currentMode.cardCount}张牌）。
        本次占卜的领域是：【${categoryName}】
        ${zodiacSign ? `用户的太阳星座是：【${zodiacSign}】，请在解读中融入该星座的星象能量特质。` : ""}
        ${question ? `用户心中默念的问题是：“${question}”` : "用户没有提供具体问题，请根据占卜领域提供深度的整体运势解读。"}
        ${profileContext}
        
        牌阵展开如下（严格按照牌阵位置与正逆位解析）：
        ${cardsList}
        
        请用中文提供一份专业、深刻、严谨且富有神秘学底蕴的解读报告。
        请使用Markdown格式排版，必须包含以下结构：
        ### 🔮 牌阵解析（${currentMode.name}）
        （请结合具体的牌阵位置含义，逐一深度解析每张牌的象征意义及其在当前位置的映射）
        
        ### 🌌 牌面间的能量连结
        （分析这几张牌之间的元素互动、大阿卡纳与小阿卡纳的比例、以及整体的能量流动趋势）
        
        ### 🌟 最终神谕与指引
        （结合所有牌面与用户的问题，给出客观、具有启发性和建设性的最终建议）

        最后，请为用户提炼一句直击灵魂、富有诗意且神秘的「灵魂箴言」（Soul Motto），字数在20字以内。
        格式如下：
        [SOUL_MOTTO] 你的灵魂箴言内容 [/SOUL_MOTTO]
      `;

      let fullResponse = "";
      setMessages([{ role: 'model', content: "" }]);

      for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
        fullResponse += chunk;
        setMessages([{ role: 'model', content: fullResponse }]);
      }

      // Extract Soul Motto
      const mottoMatch = fullResponse.match(/\[SOUL_MOTTO\]([\s\S]*?)\[\/SOUL_MOTTO\]/);
      if (mottoMatch && mottoMatch[1]) {
        const motto = mottoMatch[1].trim();
        setSoulMotto(motto);
        // Clean up the response for display
        const cleanedResponse = fullResponse.replace(/\[SOUL_MOTTO\][\s\S]*?\[\/SOUL_MOTTO\]/g, '').trim();
        setMessages([{ role: 'model', content: cleanedResponse }]);
      }

      // Save to Journey
      try {
        const id = await addEntry({
          type: 'tarot',
          title: question ? `塔罗占卜：${question}` : `塔罗占卜：${categoryName}`,
          summary: fullResponse.substring(0, 100) + '...',
          details: { 
            type: 'tarot',
            text: fullResponse, 
            cards: drawnCards, 
            mode: currentMode.name, 
            messages: [{ role: 'model', content: fullResponse }] 
          }
        });
        setCurrentEntryId(id || null);
      } catch (e) {
        console.error('Failed to save journey', e);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error("Error generating reading:", err);
      } else if (!(err instanceof Error)) {
        console.error("Error generating reading:", err);
      }
    }
  };

  const handleFollowUp = async (text: string) => {
    if (!text.trim() || isReading || !currentEntryId) return;

    const userMsg = text.trim();
    setIsAskingFollowUp(true);
    
    const newMessages = [...messages, { role: 'user', content: userMsg } as const];
    setMessages([...newMessages, { role: 'model', content: "" }]);

    try {
      let fullResponse = "";
      
      const historyContext = newMessages.slice(0, -1).map(m => `${m.role === 'user' ? '用户' : '阿卡夏'}: ${m.content}`).join('\n\n');
      const promptWithHistory = `以下是之前的对话记录：\n${historyContext}\n\n用户的新回复：${userMsg}`;
      
      const personaToUse = isSocraticMode ? SOCRATIC_PERSONA : AKASHA_PERSONA;

      for await (const chunk of stream(promptWithHistory, personaToUse)) {
        fullResponse += chunk;
        setMessages([...newMessages, { role: 'model', content: fullResponse }]);
      }
      
      const finalMsgs = [...newMessages, { role: 'model', content: fullResponse } as const];
      const fullText = finalMsgs.map(m => m.role === 'user' ? `**你**：${m.content}` : `**阿卡夏**：${m.content}`).join('\n\n---\n\n');
      
      updateEntry(currentEntryId, { 
        details: { 
          type: 'tarot',
          text: fullText, 
          cards: drawnCards, 
          mode: currentMode.name, 
          messages: finalMsgs 
        }
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error("Error generating follow-up:", err);
      } else if (!(err instanceof Error)) {
        console.error("Error generating follow-up:", err);
      }
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  // Determine card size based on spread size
  let cardSize: "small" | "medium" | "large" = "large";
  if (currentMode.cardCount > 6) cardSize = "small";
  else if (currentMode.cardCount > 3) cardSize = "medium";

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 text-amber-500/20 animate-pulse">
        <Moon size={64} />
      </div>
      <div className="absolute bottom-20 right-10 text-amber-500/20 animate-pulse delay-1000">
        <Sun size={64} />
      </div>
      <div className="absolute top-40 right-20 text-amber-500/20 animate-pulse delay-500">
        <Star size={48} />
      </div>
      <div className="absolute bottom-40 left-20 text-amber-500/20 animate-pulse delay-700">
        <Star size={32} />
      </div>

      <div className="max-w-6xl w-full z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl md:text-7xl font-serif mb-4 tracking-wider gold-gradient-text drop-shadow-lg">
            星象塔罗
          </h1>
          <p className="text-amber-200/70 font-serif italic text-lg md:text-xl max-w-2xl mx-auto">
            &quot;倾听宇宙的指引，探索未知的命运&quot;
          </p>
        </motion.div>

        {isShuffling ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl glass-panel p-12 rounded-3xl flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="relative w-32 h-48 mb-8 perspective-1000">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    x: [0, i % 2 === 0 ? 40 : -40, 0],
                    y: [0, -20, 0],
                    rotateZ: [0, i % 2 === 0 ? 15 : -15, 0],
                    zIndex: [1, 10, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-xl border border-amber-500/40 shadow-[0_0_20px_rgba(0,0,0,0.6)]"
                  style={{
                    background:
                      "linear-gradient(135deg, #1a1025 0%, #0a050f 100%)",
                  }}
                >
                  <div className="absolute inset-2 border border-amber-500/30 rounded-lg flex items-center justify-center">
                    <div
                      className="w-full h-full opacity-20"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z' fill='%23f59e0b' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                      }}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </div>
            <h2 className="text-2xl font-serif text-amber-300 mb-4 tracking-widest animate-pulse">
              正在洗牌与切牌...
            </h2>
            <p className="text-amber-200/70 text-center max-w-md">
              请闭上眼睛，深呼吸。在心中默念你的问题，将你的能量与宇宙的频率连接...
            </p>
          </motion.div>
        ) : isSelectingCards ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full glass-panel p-8 md:p-12 rounded-3xl flex flex-col items-center justify-center min-h-[400px]"
          >
            <h2 className="text-2xl font-serif text-amber-300 mb-4 tracking-widest">
              请凭直觉抽取 {currentMode.cardCount} 张牌 ({selectedIndices.length}/{currentMode.cardCount})
            </h2>
            <p className="text-amber-200/70 text-center max-w-md mb-8">
              将注意力集中在你的问题上，点击你最有感觉的牌。
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-5xl">
              {deckCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  onClick={() => handleSelectCardFromDeck(idx)}
                  className={`relative w-10 h-16 sm:w-14 sm:h-20 md:w-16 md:h-24 rounded-lg border cursor-pointer transition-all duration-300 ${
                    selectedIndices.includes(idx)
                      ? "border-amber-400 opacity-0 scale-50"
                      : "border-amber-500/30 hover:border-amber-400 hover:-translate-y-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                  }`}
                  style={{
                    background: "linear-gradient(135deg, #1a1025 0%, #0a050f 100%)",
                  }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: selectedIndices.includes(idx) ? 0 : 1, y: 0 }}
                  transition={{ delay: idx * 0.01 }}
                >
                  <div className="absolute inset-1 border border-amber-500/20 rounded flex items-center justify-center overflow-hidden">
                    <div
                      className="w-full h-full opacity-20"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z' fill='%23f59e0b' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                      }}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : drawnCards.length === 0 ? (
          <div className="w-full max-w-5xl space-y-8">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsProfessionalMode(false)}
                className={`px-6 py-2 rounded-full font-serif text-sm tracking-widest transition-all duration-500 ${
                  !isProfessionalMode ? "bg-[#C9A84C] text-[#080510] shadow-lg shadow-[#C9A84C]/20" : "bg-white/5 text-[#E8DFB8]/40 hover:bg-white/10"
                }`}
              >
                AI 引导模式
              </button>
              <button
                onClick={() => setIsProfessionalMode(true)}
                className={`px-6 py-2 rounded-full font-serif text-sm tracking-widest transition-all duration-500 ${
                  isProfessionalMode ? "bg-[#C9A84C] text-[#080510] shadow-lg shadow-[#C9A84C]/20" : "bg-white/5 text-[#E8DFB8]/40 hover:bg-white/10"
                }`}
              >
                专业牌阵模式
              </button>
            </div>

            {!isProfessionalMode ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="luxury-card p-10 md:p-16 space-y-12 relative overflow-hidden"
              >
                <div className="absolute inset-0 z-0">
                  <MysticImage 
                    prompt="A cosmic oracle holding a glowing crystal ball, ethereal nebula background, starlight" 
                    className="w-full h-full opacity-40"
                    aspectRatio="16:9"
                  />
                </div>
                <div className="relative z-10 space-y-12">
                  <div className="space-y-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-serif gold-gradient-text">今天，你心里在想什么？</h2>
                    <p className="text-[#E8DFB8]/40 font-serif italic">输入你的困惑，让星辰为你指引方向</p>
                  </div>

                  <div className="relative">
                    <textarea
                      className="glass-input-v2 w-full min-h-[150px] text-xl font-serif leading-relaxed"
                      placeholder="例如：我最近的感情走向如何？或 我该如何突破事业瓶颈？"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                    <div className="absolute bottom-6 right-6">
                      <button
                        onClick={handleDrawCards}
                        disabled={!question.trim()}
                        className="action-button-luxury !px-8 !py-3 !text-sm disabled:opacity-50 disabled:grayscale"
                      >
                        开始占卜
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="micro-label text-center">不知道怎么说？选一个感受：</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {["迷茫", "焦虑", "期待", "困惑", "心碎", "纠结", "好奇", "平静"].map((emotion) => (
                        <button
                          key={emotion}
                          onClick={() => setQuestion(`我感觉很${emotion}，请给我一些指引。`)}
                          className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5 transition-all duration-500 font-serif text-sm tracking-widest"
                        >
                          {emotion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-5xl glass-panel p-6 md:p-8 rounded-2xl flex flex-col items-center relative overflow-hidden"
              >
                <div className="absolute inset-0 z-0">
                  <MysticImage 
                    prompt="Sacred geometry patterns, golden ratio, celestial clockwork, dark cosmic background" 
                    className="w-full h-full opacity-30"
                    aspectRatio="16:9"
                  />
                </div>
                <div className="relative z-10 w-full flex flex-col gap-8 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-amber-200/80 mb-3 font-serif uppercase tracking-widest">
                        1. 选择占卜领域
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {CATEGORIES.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setCategory(cat.id)}
                              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                                category === cat.id
                                  ? "glass-button active text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.2)] scale-[1.02]"
                                  : "glass-button text-amber-100/60 hover:text-amber-200 hover:scale-[1.02]"
                              }`}
                            >
                              <Icon size={16} />
                              <span className="text-sm">{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Question */}
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-3">
                        <label
                          htmlFor="question"
                          className="block text-sm font-medium text-amber-200/80 font-serif uppercase tracking-widest"
                        >
                          2. 你的问题（选填）
                        </label>
                        <button
                          onClick={handleRecommendMode}
                          disabled={isRecommending || !question.trim()}
                          className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-500/30 shadow-[0_0_10px_rgba(251,191,36,0.1)] hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:scale-105 active:scale-95"
                        >
                          {!isRecommending && <Wand2 size={12} />}
                          {isRecommending ? "正在推荐..." : "智能推荐牌阵"}
                        </button>
                      </div>
                      <textarea
                        id="question"
                        rows={4}
                        className="glass-input w-full flex-1 rounded-xl p-4 text-amber-100 placeholder-amber-700/50 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300"
                        placeholder="例如：我最近的感情走向如何？或 我该如何突破事业瓶颈？"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                      />
                      {recommendError && (
                        <p className="text-red-400 text-xs mt-2">{recommendError}</p>
                      )}
                    </div>
                  </div>

                  {/* Zodiac Selection */}
                  <div className="w-full flex flex-col mb-8">
                    <label className="block text-sm font-medium text-amber-200/80 mb-3 font-serif uppercase tracking-widest">
                      3. 你的星座（选填，用于星象塔罗共振）
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "白羊座",
                        "金牛座",
                        "双子座",
                        "巨蟹座",
                        "狮子座",
                        "处女座",
                        "天秤座",
                        "天蝎座",
                        "射手座",
                        "摩羯座",
                        "水瓶座",
                        "双鱼座",
                      ].map((sign) => (
                        <button
                          key={sign}
                          onClick={() =>
                            setZodiacSign(sign === zodiacSign ? "" : sign)
                          }
                          className={`py-1.5 px-3 rounded-full text-xs transition-all duration-300 border ${
                            zodiacSign === sign
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.2)]"
                              : "bg-black/40 border-amber-500/10 text-amber-100/60 hover:border-amber-500/30 hover:text-amber-200"
                          }`}
                        >
                          {sign}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode Selection Carousel */}
                  <div className="w-full flex flex-col">
                    <label className="block text-sm font-medium text-amber-200/80 mb-3 font-serif uppercase tracking-widest">
                      4. 选择牌阵模式
                    </label>
                    <div className="relative w-full group">
                      {/* Left Scroll Button */}
                      <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-black/80 border border-amber-500/50 text-amber-300 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-0 hover:bg-amber-500/20 hover:scale-110 active:scale-95 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] hidden md:block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      >
                        <ChevronLeft size={24} />
                      </button>

                      {/* Carousel Container */}
                      <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-4 pb-6 pt-2 px-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      >
                        {SPREAD_MODES.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={`min-w-[240px] flex-shrink-0 snap-center relative rounded-2xl p-5 cursor-pointer flex flex-col h-[280px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all duration-300 ${
                              mode === m.id
                                ? "glass-button active -translate-y-2 shadow-[0_10px_30px_rgba(251,191,36,0.2)]"
                                : "glass-button text-amber-100/60 hover:-translate-y-1 hover:shadow-[0_5px_20px_rgba(251,191,36,0.1)]"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-4">
                              <div
                                className={`p-2 rounded-lg transition-colors duration-300 ${mode === m.id ? "bg-amber-500/30 text-amber-300" : "bg-black/50 text-amber-600/50"}`}
                              >
                                <Layers size={20} />
                              </div>
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-medium tracking-wider transition-colors duration-300 ${mode === m.id ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "bg-black/50 text-amber-500/50 border border-amber-500/20"}`}
                              >
                                {m.cardCount} 张牌
                              </span>
                            </div>

                            <h3
                              className={`font-serif text-xl mb-2 transition-colors duration-300 ${mode === m.id ? "text-amber-300" : "text-amber-100/80"}`}
                            >
                              {m.name}
                            </h3>

                            <div className="text-xs opacity-70 leading-relaxed flex-1">
                              {m.description}
                            </div>

                            {/* Mini Spread Visualization */}
                            <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-amber-500/10">
                              {Array.from({ length: Math.min(m.cardCount, 6) }).map(
                                (_, i) => (
                                  <div
                                    key={i}
                                    className={`w-4 h-6 border rounded-[2px] transition-colors duration-300 ${mode === m.id ? "border-amber-400/60 bg-amber-400/20" : "border-amber-500/30 bg-amber-500/5"}`}
                                  />
                                ),
                              )}
                              {m.cardCount > 6 && (
                                <div className="w-4 h-6 flex items-center justify-center text-[10px] text-amber-500/60 font-mono">
                                  +{m.cardCount - 6}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Right Scroll Button */}
                      <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-black/80 border border-amber-500/50 text-amber-300 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-0 hover:bg-amber-500/20 hover:scale-110 active:scale-95 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] hidden md:block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDrawCards}
                  className="group relative px-10 py-4 w-full md:w-1/2 bg-gradient-to-r from-amber-600/80 to-amber-800/80 hover:from-amber-500/90 hover:to-amber-700/90 text-amber-50 rounded-full font-serif text-lg tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden mt-4 border border-amber-400/30 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles size={20} className="text-amber-300" />
                    开始占卜仪式 ({currentMode.cardCount}张)
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <AnimatePresence>
              {!revealedCards.every((r) => r) && currentMode.cardCount > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8"
                >
                  <button
                    onClick={() =>
                      setRevealedCards(
                        new Array(currentMode.cardCount).fill(true),
                      )
                    }
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-full text-amber-200 font-serif transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    <Wand2 size={18} />
                    一键翻开所有牌
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={posterRef} className="w-full flex flex-col items-center relative pb-8">
              {/* Poster Header (Hidden normally, shown in poster) */}
              <div className="hidden show-in-poster w-full text-center mb-12 pt-8">
                <h2 className="text-4xl font-serif text-amber-400 mb-4 tracking-widest">阿卡夏之眼 · 塔罗启示</h2>
                <p className="text-amber-500/80 text-lg">{question || "通用占卜"}</p>
              </div>

              <div className="mb-12 w-full">
                <SpreadLayoutRenderer
                  mode={currentMode.id}
                  cards={drawnCards}
                  revealedCards={revealedCards}
                  handleRevealCard={handleRevealCard}
                  setSelectedCard={setSelectedCard}
                  cardSize={cardSize}
                  positions={currentMode.positions}
                />
              </div>

              <AnimatePresence>
                {revealedCards.every((r) => r) && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="w-full max-w-4xl glass-panel p-8 md:p-12 rounded-3xl relative"
                  >


                    {isReading && messages.length === 0 ? (
                      <BreathingLoading text="正在查阅阿卡夏记录..." />
                    ) : streamError ? (
                      <div className="text-center text-red-400 py-8 font-serif">
                        {streamError}
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-8">
                        {messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-center"}`}
                          >
                            <div
                              className={`${msg.role === "user" ? "max-w-[95%] md:max-w-[85%]" : "w-full"} rounded-2xl p-6 ${msg.role === "user" ? "glass-panel bg-amber-900/20 text-amber-100" : "glass-panel bg-black/40 markdown-body"}`}
                            >
                              {msg.role === "user" ? (
                                <p className="font-serif">{msg.content}</p>
                              ) : (
                                <MysticMarkdown content={msg.content} cards={drawnCards} hideCards={idx > 1} />
                              )}
                            </div>
                          </div>
                        ))}

                        {isReading && messages.length > 0 && (
                          <div className="flex items-start hide-in-poster">
                            <div className="glass-panel bg-black/40 rounded-2xl p-6 w-full">
                              <div className="text-amber-200/60 italic animate-pulse">
                                阿卡夏正在感知...
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!isReading && messages.length > 0 && (
                      <div className="mt-12 flex flex-col items-center gap-6 border-t border-amber-500/20 pt-8">
                        <div className="w-full flex gap-3 hide-in-poster">
                          <input
                            type="text"
                            value={followUpText}
                            onChange={(e) => setFollowUpText(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && onFollowUp()
                            }
                            placeholder="向阿卡夏追问更多细节..."
                            className="glass-input flex-1 rounded-full px-6 py-3 text-amber-100 placeholder-amber-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300"
                            disabled={isReading || isAskingFollowUp}
                          />
                          <button
                            onClick={onFollowUp}
                            disabled={isReading || isAskingFollowUp || !followUpText.trim()}
                            className="glass-button active disabled:opacity-50 disabled:cursor-not-allowed text-amber-300 p-3 rounded-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_10px_rgba(251,191,36,0.2)] hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                          >
                            <Send size={20} />
                          </button>
                        </div>
                        <div className="w-full flex flex-col md:flex-row gap-4 hide-in-poster">
                          <button
                            onClick={() => setIsSocraticMode(!isSocraticMode)}
                            className={`glass-button flex-1 py-3 rounded-full font-serif hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 flex items-center justify-center gap-2 ${
                              isSocraticMode 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                                : 'text-amber-200 hover:shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                            }`}
                          >
                            <Moon size={18} />
                            {isSocraticMode ? "深潜模式 (已开启)" : "深潜模式 (灵魂对话)"}
                          </button>
                          <div className="relative flex-1">
                            <button
                              onClick={() => setShowExportOptions(!showExportOptions)}
                              disabled={isGeneratingPoster}
                              className="glass-button w-full py-3 text-amber-200 rounded-full font-serif hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 hover:shadow-[0_0_15px_rgba(251,191,36,0.2)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                            >
                              <Download size={18} className={isGeneratingPoster ? "animate-bounce" : ""} />
                              {isGeneratingPoster ? "生成中..." : "导出灵魂卡片"}
                            </button>
                            
                            <AnimatePresence>
                              {showExportOptions && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className="absolute bottom-full left-0 w-full mb-2 bg-[#1a0f0a] border border-amber-500/30 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden z-50"
                                >
                                  <button
                                    onClick={onGeneratePosterSimple}
                                    className="w-full px-4 py-3 text-left text-amber-200 hover:bg-amber-900/40 transition-colors border-b border-amber-500/10 font-serif text-sm"
                                  >
                                    简易版 (仅一言)
                                  </button>
                                  <button
                                    onClick={onGeneratePosterFull}
                                    className="w-full px-4 py-3 text-left text-amber-200 hover:bg-amber-900/40 transition-colors font-serif text-sm"
                                  >
                                    丰富版 (包含完整解读)
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <button
                            onClick={onReset}
                            className="glass-button flex-1 py-3 text-amber-400 rounded-full font-serif hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 hover:shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                          >
                            结束占卜，收起塔罗
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Poster Footer (Hidden normally, shown in poster) */}
              <div className="hidden show-in-poster w-full text-center mt-12 pt-8 border-t border-amber-500/20">
                <div className="flex items-center justify-center gap-2 text-amber-500/60 mb-2">
                  <Sparkles size={16} />
                  <span className="font-serif tracking-widest text-sm">阿卡夏之眼 AI 占卜</span>
                  <Sparkles size={16} />
                </div>
                <p className="text-xs text-amber-500/40 font-mono">
                  {new Date().toLocaleDateString()} · 仅供娱乐与自我探索
                </p>
              </div>

              {/* Hidden Soul Card for Export */}
              <div className="fixed -left-[9999px] top-0 pointer-events-none">
                <div ref={soulCardRef}>
                  <SoulCard 
                    question={question}
                    cards={drawnCards}
                    motto={soulMotto}
                    date={new Date().toLocaleDateString()}
                  />
                </div>
                <div ref={soulCardFullRef}>
                  <SoulCard 
                    question={question}
                    cards={drawnCards}
                    motto={soulMotto}
                    date={new Date().toLocaleDateString()}
                    fullReading={messages.map(m => m.role === 'user' ? `**你**：${m.content}` : `**阿卡夏**：${m.content}`).join('\n\n---\n\n')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedCard && (
          <CardMeaningModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            cache={cardMeaningsCache}
            setCache={setCardMeaningsCache}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TarotCardView({
  card,
  isRevealed,
  onReveal,
  onSelect,
  delay,
  size = "large",
}: {
  card: TarotCardType;
  isRevealed: boolean;
  onReveal: () => void;
  onSelect: () => void;
  delay: number;
  size?: "small" | "medium" | "large";
}) {
  let cardDimensions = "w-36 h-60 sm:w-40 sm:h-64 md:w-48 md:h-80";
  if (size === "small")
    cardDimensions = "w-24 h-40 sm:w-28 sm:h-48 md:w-32 md:h-56";
  else if (size === "medium")
    cardDimensions = "w-28 h-48 sm:w-32 sm:h-56 md:w-40 md:h-64";

  return (
    <div
      className={`${cardDimensions} relative`}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, rotateY: 180 }}
        animate={{ opacity: 1, y: 0, rotateY: isRevealed ? 0 : 180 }}
        whileHover={
          !isRevealed
            ? {
                y: -15,
                scale: 1.05,
                rotateZ: 2,
                rotateX: 10,
                rotateY: 170,
                boxShadow: "0 0 30px rgba(251,191,36,0.6)",
              }
            : { scale: 1.02, boxShadow: "0 0 30px rgba(251,191,36,0.5)" }
        }
        transition={{
          duration: 0.8,
          delay: isRevealed ? 0 : delay,
          type: "spring",
          stiffness: 70,
          damping: 14,
          mass: 0.8,
        }}
        onClick={() => {
          if (!isRevealed) onReveal();
          else onSelect();
        }}
        className={`w-full h-full relative rounded-xl cursor-pointer group ${isRevealed ? "hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-shadow duration-300" : ""}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Card Back */}
        <div
          className="absolute inset-0 rounded-xl border border-amber-500/40 shadow-[0_0_25px_rgba(0,0,0,0.8)] overflow-hidden"
          style={{
            background:
              "linear-gradient(to bottom right, #110a1f 0%, #050208 100%)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="absolute inset-0 w-full h-full animate-mystic-float flex items-center justify-center">
            {/* Mandala Geometric Texture */}
            <div
              className="absolute inset-0 opacity-30 mix-blend-screen"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23f59e0b' stroke-width='1' stroke-opacity='0.5'%3E%3Ccircle cx='40' cy='40' r='30'/%3E%3Ccircle cx='40' cy='40' r='20'/%3E%3Cpath d='M40 10 L40 70 M10 40 L70 40 M18.78 18.78 L61.22 61.22 M18.78 61.22 L61.22 18.78'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "80px 80px",
                backgroundPosition: "center",
              }}
            ></div>

            <div className="absolute inset-2 border border-amber-500/30 rounded-lg flex items-center justify-center">
              <div className="absolute inset-3 border border-amber-500/10 rounded-md"></div>

              {/* Central Mystic Symbol */}
              <div className="relative flex items-center justify-center">
                {/* Glowing Energy Ball */}
                <div className="absolute w-24 h-24 bg-amber-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div
                  className="absolute w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>

                {/* Rotating Sacred Geometry Borders */}
                <div className="absolute w-20 h-20 border border-amber-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute w-16 h-16 border border-amber-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]">
                  <div className="absolute top-0 left-1/2 w-1 h-1 bg-amber-400 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-amber-400 rounded-full -translate-x-1/2 translate-y-1/2"></div>
                </div>
                <div className="absolute w-24 h-24 border border-amber-500/10 rounded-full animate-[spin_20s_linear_infinite]">
                  <div className="absolute top-1/2 left-0 w-1 h-1 bg-amber-400 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 right-0 w-1 h-1 bg-amber-400 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Main Icon Container */}
                <div className="relative z-10 flex items-center justify-center bg-black/60 p-3 md:p-4 rounded-full border border-amber-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                  <Moon
                    size={24}
                    className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  />
                </div>

                {/* Corner Accents */}
                <div className="absolute -top-12 -left-12 w-6 h-6 border-t border-l border-amber-500/40 opacity-70"></div>
                <div className="absolute -top-12 -right-12 w-6 h-6 border-t border-r border-amber-500/40 opacity-70"></div>
                <div className="absolute -bottom-12 -left-12 w-6 h-6 border-b border-l border-amber-500/40 opacity-70"></div>
                <div className="absolute -bottom-12 -right-12 w-6 h-6 border-b border-r border-amber-500/40 opacity-70"></div>

                {/* Sun, Moon, Stars Symbols */}
                <Sun
                  size={10}
                  className="absolute -top-10 right-0 text-amber-500/60 animate-pulse"
                  style={{ animationDuration: "3s" }}
                />
                <Star
                  size={8}
                  className="absolute bottom-8 -left-10 text-amber-500/50 animate-pulse"
                  style={{ animationDuration: "4s" }}
                />
                <Moon
                  size={10}
                  className="absolute top-8 -left-8 text-amber-500/50 animate-pulse"
                  style={{ animationDuration: "5s" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card Front */}
        <div
          className="absolute inset-0 rounded-xl border-2 border-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.2)] bg-gradient-to-br from-[#2a1b38] to-[#0a0502] flex flex-col items-center justify-between p-1 md:p-3"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          <div className="w-full h-full border border-amber-500/30 rounded-lg p-1 md:p-2 flex flex-col items-center relative overflow-hidden">
            {/* Top Rank/Suit */}
            <div
              className={`text-amber-200/80 font-serif text-[10px] md:text-sm absolute top-1 md:top-2 left-1 md:left-2 ${card.isReversed ? "rotate-180" : ""}`}
            >
              {card.arcana === "Major" ? "★" : card.suit?.charAt(0)}
            </div>
            <div
              className={`text-amber-200/80 font-serif text-[10px] md:text-sm absolute top-1 md:top-2 right-1 md:right-2 ${card.isReversed ? "rotate-180" : ""}`}
            >
              {card.arcana === "Major" ? "★" : card.suit?.charAt(0)}
            </div>

            {/* Center Image Placeholder */}
            <div
              className={`flex-1 w-full mt-3 mb-3 md:mt-6 md:mb-6 flex items-center justify-center relative ${card.isReversed ? "rotate-180" : ""}`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent rounded-md"></div>
              <div className="relative w-full h-full p-1 md:p-2">
                <Image
                  src={`https://www.trustedtarot.com/img/cards/${card.englishName.toLowerCase().replace(/ /g, "-")}.png`}
                  alt={card.name}
                  fill
                  className="object-contain drop-shadow-lg rounded-sm"
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 768px) 100px, 200px"
                />
              </div>
            </div>

            {/* Hover Overlay for Details */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center backdrop-blur-sm rounded-lg">
              <span className="text-amber-300 border border-amber-400/50 px-3 py-1 rounded-full text-xs md:text-sm font-serif tracking-wider bg-black/40 flex items-center gap-1 whitespace-nowrap">
                <Sparkles size={12} />
                查看牌意
              </span>
            </div>

            {/* Card Name */}
            <div className="text-center mt-auto pb-0.5 md:pb-2 z-10 w-full bg-black/40 backdrop-blur-md rounded-b-lg">
              <h3 className="text-amber-300 font-serif text-[10px] md:text-lg leading-tight drop-shadow-md truncate px-1">
                {card.name}
              </h3>
              {card.isReversed && (
                <span className="text-red-400/80 text-[8px] md:text-xs tracking-widest mt-0.5 md:mt-1 block font-sans">
                  逆位
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CardMeaningModal({
  card,
  onClose,
  cache,
  setCache,
}: {
  card: TarotCardType;
  onClose: () => void;
  cache: Record<string, string>;
  setCache: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const [loading, setLoading] = useState(false);
  const [meaning, setMeaning] = useState("");

  useEffect(() => {
    const fetchMeaning = async () => {
      const cacheKey = `${card.id}-${card.isReversed ? "reversed" : "upright"}`;
      if (cache[cacheKey]) {
        setMeaning(cache[cacheKey]);
        return;
      }

      setLoading(true);
      try {
        const prompt = `你是一位资深塔罗牌学者。请详细解释塔罗牌【${card.name}】（${card.englishName}）在【${card.isReversed ? "逆位" : "正位"}】时的详细含义。
        请包含以下结构：
        ### 🃏 牌面描述
        （简述牌面图案与核心象征）
        ### 🔑 核心牌意
        （关键词与主要含义）
        ### 🔮 具体领域解析
        - **爱情与人际**：...
        - **事业与财富**：...
        - **个人成长与灵性**：...
        ### 🌟 建议与指引
        （给抽到这张牌的人的建议）
        
        请使用Markdown排版，语言优美、充满洞察力。`;

        const text = await generateContent(prompt);
        setMeaning(text || "暂无解析");
        setCache((prev) => ({ ...prev, [cacheKey]: text || "暂无解析" }));
      } catch (err) {
        setMeaning("获取解析失败，请稍后再试。");
      } finally {
        setLoading(false);
      }
    };

    fetchMeaning();
  }, [card, cache, setCache]);

  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)]"
      >
        <div className="p-4 md:p-6 border-b border-amber-500/20 flex justify-between items-center bg-black/20">
          <h3 className="text-xl md:text-2xl font-serif text-amber-300 flex items-center gap-3">
            <Sparkles size={20} className="text-amber-500" />
            {card.name} {card.isReversed ? "（逆位）" : "（正位）"}
          </h3>
          <button
            onClick={onClose}
            className="text-amber-500/60 hover:text-amber-300 p-2 rounded-full hover:bg-amber-500/10 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 hover:scale-110 active:scale-95"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-8">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 border-[2px] border-dashed border-amber-500/40 rounded-full animate-[spin_8s_linear_infinite]"></div>
                <div className="absolute inset-3 border-[2px] border-dashed border-purple-500/40 rounded-full animate-[spin_6s_linear_infinite_reverse]"></div>
                <div className="absolute w-10 h-10 bg-amber-400/30 rounded-full blur-xl animate-pulse"></div>
                <Sparkles
                  size={20}
                  className="text-amber-300 relative z-10 animate-pulse"
                />
              </div>
              <p className="text-amber-200/90 font-serif animate-pulse text-lg tracking-widest drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                正在查阅阿卡夏记录...
              </p>
            </div>
          ) : (
            <div className="markdown-body text-amber-100/90 text-base md:text-lg leading-relaxed">
              <MysticMarkdown content={meaning} />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SpreadLayoutRenderer({
  mode,
  cards,
  revealedCards,
  handleRevealCard,
  setSelectedCard,
  cardSize,
  positions,
}: {
  mode: string;
  cards: TarotCardType[];
  revealedCards: boolean[];
  handleRevealCard: (index: number) => void;
  setSelectedCard: (card: TarotCardType) => void;
  cardSize: "small" | "medium" | "large";
  positions: string[];
}) {
  const renderCard = (index: number) => {
    if (!cards[index]) return null;
    return (
      <motion.div
        key={cards[index].id}
        className="flex flex-col items-center group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.15 }}
      >
        <span className="text-amber-500/80 font-serif tracking-widest text-xs md:text-sm mb-3 bg-black/40 px-3 py-1 rounded-full border border-amber-500/20 max-w-[120px] md:max-w-[160px] text-center truncate shadow-[0_0_10px_rgba(251,191,36,0.1)] transition-all duration-300 group-hover:text-amber-300 group-hover:border-amber-500/50 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] group-hover:-translate-y-1">
          {positions[index]}
        </span>
        <TarotCardView
          card={cards[index]}
          isRevealed={revealedCards[index]}
          onReveal={() => handleRevealCard(index)}
          onSelect={() => setSelectedCard(cards[index])}
          delay={index * 0.15}
          size={cardSize}
        />
      </motion.div>
    );
  };

  const defaultLayout = (
    <div className="flex flex-wrap gap-4 md:gap-6 justify-center items-center w-full max-w-6xl mx-auto">
      {cards.map((_: unknown, i: number) => renderCard(i))}
    </div>
  );

  switch (mode) {
    case "week":
      return (
        <div className="flex flex-wrap gap-4 md:gap-6 justify-center items-center w-full max-w-6xl mx-auto">
          {[0, 1, 2, 3, 4, 5, 6].map(renderCard)}
        </div>
      );
    case "four_elements":
    case "relationship":
    case "blind_spot":
      return (
        <div className="grid grid-cols-2 gap-8 md:gap-16 justify-center items-center max-w-2xl mx-auto">
          {cards.map((_: unknown, i: number) => renderCard(i))}
        </div>
      );
    case "past_life":
      return (
        <div className="flex flex-wrap gap-4 md:gap-8 justify-center items-center w-full max-w-6xl mx-auto">
          {[0, 1, 2, 3, 4].map(renderCard)}
        </div>
      );
    case "choice":
    case "mirror":
      return (
        <div className="grid grid-cols-3 gap-y-8 gap-x-4 md:gap-x-12 items-center justify-items-center w-full max-w-4xl mx-auto">
          <div className="col-start-1 row-start-1">
            {renderCard(mode === "choice" ? 1 : 0)}
          </div>
          <div className="col-start-3 row-start-1">
            {renderCard(mode === "choice" ? 2 : 1)}
          </div>
          <div className="col-start-2 row-start-2">
            {renderCard(mode === "choice" ? 0 : 2)}
          </div>
          <div className="col-start-1 row-start-3">{renderCard(3)}</div>
          <div className="col-start-3 row-start-3">{renderCard(4)}</div>
        </div>
      );
    case "career":
      return (
        <div className="grid grid-cols-3 gap-y-8 gap-x-4 md:gap-x-12 items-center justify-items-center w-full max-w-4xl mx-auto">
          <div className="col-start-2 row-start-1">{renderCard(4)}</div>
          <div className="col-start-1 row-start-2">{renderCard(2)}</div>
          <div className="col-start-2 row-start-2">{renderCard(0)}</div>
          <div className="col-start-3 row-start-2">{renderCard(3)}</div>
          <div className="col-start-2 row-start-3">{renderCard(1)}</div>
        </div>
      );
    case "hexagram":
      return (
        <div className="grid grid-cols-3 gap-y-8 gap-x-4 md:gap-x-12 items-center justify-items-center w-full max-w-4xl mx-auto">
          <div className="col-start-2 row-start-1">{renderCard(0)}</div>
          <div className="col-start-1 row-start-2">{renderCard(4)}</div>
          <div className="col-start-3 row-start-2">{renderCard(5)}</div>
          <div className="col-start-2 row-start-3">{renderCard(6)}</div>
          <div className="col-start-1 row-start-4">{renderCard(1)}</div>
          <div className="col-start-3 row-start-4">{renderCard(2)}</div>
          <div className="col-start-2 row-start-5">{renderCard(3)}</div>
        </div>
      );
    case "chakra":
      return (
        <div className="flex flex-col gap-6 items-center w-full max-w-4xl mx-auto">
          {[6, 5, 4, 3, 2, 1, 0].map(renderCard)}
        </div>
      );
    case "tree_of_life":
      return (
        <div className="grid grid-cols-3 gap-y-6 gap-x-4 md:gap-x-12 items-center justify-items-center w-full max-w-4xl mx-auto">
          <div className="col-start-2 row-start-1">{renderCard(0)}</div>
          <div className="col-start-3 row-start-2">{renderCard(1)}</div>
          <div className="col-start-1 row-start-2">{renderCard(2)}</div>
          <div className="col-start-3 row-start-3">{renderCard(3)}</div>
          <div className="col-start-1 row-start-3">{renderCard(4)}</div>
          <div className="col-start-2 row-start-4">{renderCard(5)}</div>
          <div className="col-start-3 row-start-5">{renderCard(6)}</div>
          <div className="col-start-1 row-start-5">{renderCard(7)}</div>
          <div className="col-start-2 row-start-6">{renderCard(8)}</div>
          <div className="col-start-2 row-start-7">{renderCard(9)}</div>
        </div>
      );
    case "celtic_cross":
      return (
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center justify-center w-full max-w-6xl mx-auto">
          {/* Cross Section */}
          <div className="grid grid-cols-3 grid-rows-3 gap-4 items-center justify-items-center">
            <div className="col-start-2 row-start-1">{renderCard(4)}</div>
            <div className="col-start-1 row-start-2">{renderCard(3)}</div>
            <div className="col-start-2 row-start-2 relative w-full h-full flex items-center justify-center">
              <div className="absolute z-10">{renderCard(0)}</div>
              <div className="absolute z-20 rotate-90 scale-90">
                {renderCard(1)}
              </div>
              {/* Invisible placeholder to keep grid size */}
              <div className="opacity-0 pointer-events-none">
                {renderCard(0)}
              </div>
            </div>
            <div className="col-start-3 row-start-2">{renderCard(5)}</div>
            <div className="col-start-2 row-start-3">{renderCard(2)}</div>
          </div>
          {/* Staff Section */}
          <div className="flex flex-col gap-6">
            {[9, 8, 7, 6].map(renderCard)}
          </div>
        </div>
      );
    case "zodiac":
    case "yearly":
      return (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 justify-center items-center w-full max-w-6xl mx-auto">
          {cards.map((_: unknown, i: number) => renderCard(i))}
        </div>
      );
    default:
      return defaultLayout;
  }
}
