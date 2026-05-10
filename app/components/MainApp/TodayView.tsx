"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Sun,
  User,
  Activity,
  Zap,
  Download,
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getSunSign } from "@/lib/astrology";
import { AKASHA_PERSONA, generateContent } from "@/lib/ai";
import { MysticImage } from "./MysticImage";
import { saveToIndexedDB, getFromIndexedDB } from "@/lib/storage";
import { useAppStore } from "@/lib/store";

export function TodayView() {
  const { profile, getProfileContext, isLoaded } = useUserProfile();
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  
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
      
      // Check cache (Now using IndexedDB)
      const localDateStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const todayKey = `daily_content_${localDateStr}`;
      
      try {
        const cached = await getFromIndexedDB(todayKey);
        if (cached && typeof cached === 'object') {
          const { oracle: cachedOracle, energyTip: cachedEnergyTip } = cached as any;
          console.log("Using cached daily content (IndexedDB) for", todayKey);
          setOracle(`「 ${cachedOracle.trim()} 」`);
          setEnergyTip(cachedEnergyTip.trim());
          return;
        }
      } catch (e) {
        console.warn("Failed to load from IndexedDB, falling back to generation", e);
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
          
          // Save to cache (IndexedDB)
          await saveToIndexedDB(todayKey, {
            oracle: result.oracle.trim(),
            energyTip: result.energyTip.trim()
          });
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
          <button onClick={() => setActiveTab("explore")} className="luxury-card p-10 text-left group hover:bg-[#C9A84C]/5">
            <p className="micro-label mb-4">Tarot</p>
            <h3 className="text-2xl font-serif mb-4 group-hover:gold-gradient-text transition-all">每日单牌占卜</h3>
            <p className="text-[#E8DFB8]/40 text-sm leading-relaxed">抽取今日指引，洞察潜意识中的微光。</p>
          </button>
          <button onClick={() => setActiveTab("journal")} className="luxury-card p-10 text-left group hover:bg-[#C9A84C]/5">
            <p className="micro-label mb-4">Journal</p>
            <h3 className="text-2xl font-serif mb-4 group-hover:gold-gradient-text transition-all">上次未读解读</h3>
            <p className="text-[#E8DFB8]/40 text-sm leading-relaxed">你还有一份关于“事业发展”的解读尚未读完。</p>
          </button>
        </div>
      </section>
    </div>
  );
}
