"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import {
  Calendar,
  Sparkles,
  Star,
  Share2,
  RefreshCw,
  Zap,
  Download,
  Sun,
  User,
  Activity
} from "lucide-react";

// Components & Hooks
import { MysticImage } from "./MysticImage";
import MysticMarkdown from "../MysticMarkdown";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useJourney } from "@/hooks/useJourney";
import { useAIStream } from "@/hooks/useAIStream";
import { AKASHA_PERSONA } from "@/lib/ai";
import { getSunSign } from "@/lib/astrology";
import { getDailyTarotCards } from "@/lib/tarot-data";
import { getFromIndexedDB, saveToIndexedDB } from "@/lib/storage";
import { useAppStore } from "@/lib/store";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";

export function TodayView() {
  const { profile, isLoaded: isProfileLoaded } = useUserProfile();
  const { entries, isLoaded: journeyLoaded } = useJourney();
  const { stream } = useAIStream();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const setHandoff = useAppStore((state: any) => state.setHandoff);
  const posterRef = useRef<HTMLDivElement>(null);
  
  const [dailyData, setDailyData] = useState<{
    date: string;
    cards: any[];
    reading: string;
    imagePrompt: string;
  } | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);

  const isLoaded = isProfileLoaded && journeyLoaded;
  const lastEntry = entries[0];
  const sunSign = profile.birthDate ? getSunSign(new Date(profile.birthDate)) : "探索者";

  const { greeting, dateStr } = useMemo(() => {
    const d = new Date();
    const hour = d.getHours();
    let g = "夜安";
    if (hour >= 5 && hour < 12) g = "早安";
    else if (hour >= 12 && hour < 18) g = "午安";
    else if (hour >= 18 && hour < 22) g = "晚安";
    return { 
      greeting: g, 
      dateStr: d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) 
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    const initDaily = async () => {
      const now = new Date();
      const today = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const hour = now.getHours();
      const timePeriod = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 18 ? 'afternoon' : hour >= 18 && hour < 22 ? 'evening' : 'night';
      const cacheKey = `daily_fused_v2_${today}_${timePeriod}_${profile.name || 'guest'}`;
      
      const cached = await getFromIndexedDB(cacheKey);
      if (cached) {
        setDailyData(cached as any);
        setIsInitializing(false);
        return;
      }
      
      const cards = getDailyTarotCards(3);
      const cardNames = cards.map(c => `${c.name}${c.isReversed ? '(逆位)' : '(正位)'}`).join('、');
      
      const prompt = `
<instruction>
今天是${today}，${greeting}。请为用户生成今日专属的灵魂神谕。
用户抽到了三张塔罗牌：${cardNames}。
请结合牌义、${greeting}的时间背景以及用户的档案进行深度解析。</instruction>

<user_profile>
${JSON.stringify(profile)}
</user_profile>

<output_format>
请使用Markdown格式，包含以下章节：
# 🌟 ${greeting}，今日灵魂频率
## 🃏 启示之牌：${cardNames}
## 🔮 阿卡夏指引
（深入分析此时此刻的能量状态，200字左右）
[SOUL_MOTTO]一句充满力量的格言[/SOUL_MOTTO]
</output_format>
      `;

      let fullReading = "";
      try {
        for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
          fullReading += chunk;
        }

        const newDaily = {
          date: today,
          cards,
          reading: fullReading,
          imagePrompt: `A mystical, ethereal representation of ${cardNames} in a cosmic, dreamlike style, high fantasy, 8k resolution`,
        };
        
        await saveToIndexedDB(cacheKey, newDaily);
        setDailyData(newDaily);
      } catch (err) {
        console.error("Failed to generate daily reading:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    initDaily();
  }, [isLoaded, profile, stream, greeting]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="font-serif text-amber-200/40 tracking-[0.2em]">正在同步今日星象...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-12 pb-20 px-6">
      
      {/* 1. 艺术神谕区 (置顶) */}
      <div ref={posterRef} className="space-y-12 bg-[#050308] p-2 rounded-[40px] relative overflow-hidden">
        <header className="pt-10 px-8 space-y-6">
          <div className="flex items-center justify-between opacity-40">
            <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] font-serif uppercase">
              <Calendar className="w-3 h-3" />
              {dateStr}
            </div>
            <div className="text-[10px] tracking-[0.3em] font-serif uppercase text-amber-500/60 font-bold">宇宙能量：平衡</div>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tighter leading-tight">
            {greeting}，<span className="gold-gradient-text">{profile.name || "旅人"}</span>
          </h1>
        </header>

        <section className="relative aspect-[4/5] md:aspect-square rounded-[32px] overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 z-0">
            <MysticImage 
              prompt={dailyData?.imagePrompt || ""} 
              aspectRatio="1:1" 
              className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-[5s] opacity-60 mix-blend-lighten"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#050308] z-10" />
          
          <div className="absolute inset-0 z-20 p-8 md:p-16 flex flex-col justify-center">
            <div className="space-y-8">
              <div className="w-12 h-px bg-amber-500/50" />
              <div className="prose prose-invert max-w-none prose-headings:font-serif prose-p:font-serif prose-p:text-xl md:prose-p:text-2xl prose-p:leading-relaxed prose-p:text-amber-50/90">
                <MysticMarkdown content={dailyData?.reading || ""} cards={dailyData?.cards} />
              </div>
            </div>
            <div className="mt-auto flex justify-end">
              <p className="text-[10px] font-serif tracking-[0.2em] text-white/20 uppercase flex items-center gap-1">长按保存卡片 <Download className="w-3 h-3" /></p>
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-center -mt-6 relative z-30">
        <button 
          onClick={() => handleGeneratePoster(posterRef.current!, `mystic-oracle-${dailyData?.date}.jpg`)}
          disabled={isGeneratingPoster}
          className="px-10 py-4 rounded-full border border-amber-500/20 bg-[#050308]/60 backdrop-blur-xl text-amber-200 font-serif tracking-widest hover:bg-amber-500/10 transition-all flex items-center gap-3 group"
        >
          <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          {isGeneratingPoster ? "生成中..." : "保存今日启示海报"}
        </button>
      </div>

      {/* 2. 状态看板 (海报下方) */}
      <section className="grid grid-cols-3 gap-4 md:gap-6 pt-4">
        <div className="luxury-card p-4 md:p-8 flex flex-col items-center text-center space-y-4 group hover:border-amber-500/20 transition-all">
          <Sun className="w-6 h-6 text-amber-200/40 group-hover:text-amber-200 transition-colors" />
          <div className="space-y-1">
            <p className="text-[10px] font-serif tracking-[0.3em] text-white/20 uppercase">太阳</p>
            <p className="text-lg md:text-2xl font-serif text-amber-100">{sunSign}</p>
          </div>
        </div>
        <div className="luxury-card p-4 md:p-8 flex flex-col items-center text-center space-y-4 group hover:border-amber-500/20 transition-all">
          <User className="w-6 h-6 text-amber-200/40 group-hover:text-amber-200 transition-colors" />
          <div className="space-y-1">
            <p className="text-[10px] font-serif tracking-[0.3em] text-white/20 uppercase">性别</p>
            <p className="text-lg md:text-2xl font-serif text-amber-100">{profile.gender || "探索者"}</p>
          </div>
        </div>
        <div className="luxury-card p-4 md:p-8 flex flex-col items-center text-center space-y-4 group hover:border-amber-500/20 transition-all">
          <Activity className="w-6 h-6 text-amber-200/40 group-hover:text-amber-200 transition-colors" />
          <div className="space-y-1">
            <p className="text-[10px] font-serif tracking-[0.3em] text-white/20 uppercase">MBTI</p>
            <p className="text-lg md:text-2xl font-serif text-amber-100">{profile.mbti || "未觉醒"}</p>
          </div>
        </div>
      </section>

      {/* 3. 每日指标 (避坑/幸运色) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="luxury-card p-8 flex items-start gap-6 group hover:bg-white/[0.02] transition-all">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"><Star className="w-6 h-6 text-amber-500" /></div>
          <div className="space-y-2">
            <h4 className="text-amber-200 font-serif tracking-widest uppercase text-xs">今日避坑</h4>
            <p className="text-sm text-white/40 leading-relaxed font-serif">保持内心平静，避免在情绪波动时做出重要决定。多留些时间给自己。</p>
          </div>
        </div>
        <div className="luxury-card p-8 flex items-start gap-6 group hover:bg-white/[0.02] transition-all">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20"><Sparkles className="w-6 h-6 text-purple-500" /></div>
          <div className="space-y-2">
            <h4 className="text-purple-200 font-serif tracking-widest uppercase text-xs">幸运色彩</h4>
            <p className="text-sm text-white/40 leading-relaxed font-serif">丁香紫。这种频率能帮助你连接直觉，在繁杂的信息中找到真正的秩序。</p>
          </div>
        </div>
      </section>

      {/* 4. 快速开始 (改回每日一牌大卡片) */}
      <section className="space-y-8 pt-8">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-serif tracking-widest uppercase">快速开始</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={() => {
              setHandoff({ system: 'tarot', context: '今日单牌占卜' });
              setActiveTab("explore");
            }}
            className="luxury-card p-10 text-left space-y-6 group hover:bg-white/5 transition-all relative overflow-hidden"
          >
            <p className="text-[10px] font-serif tracking-[0.4em] text-amber-200/30 group-hover:text-amber-200/50 uppercase">Tarot</p>
            <div className="space-y-2">
              <h4 className="text-3xl font-serif gold-gradient-text">每日单牌占卜</h4>
              <p className="text-sm text-white/40 font-serif">抽取今日指引，洞察潜意识中的微光。</p>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-20 h-20" />
            </div>
          </button>

          <button 
            onClick={() => setActiveTab("journal")}
            className="luxury-card p-10 text-left space-y-6 group hover:bg-white/5 transition-all"
          >
            <p className="text-[10px] font-serif tracking-[0.4em] text-amber-200/30 group-hover:text-amber-200/50 uppercase">Journal</p>
            <div className="space-y-2">
              <h4 className="text-3xl font-serif text-white/80">上次未读解读</h4>
              <p className="text-sm text-white/40 font-serif">
                {lastEntry ? `你还有一份关于“${lastEntry.title}”的解读尚未读完。` : "暂无未读记录，开启新的探索。"}
              </p>
            </div>
          </button>
        </div>
      </section>
    </motion.div>
  );
}
