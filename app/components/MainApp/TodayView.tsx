"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Sun,
  User,
  Activity,
  Zap,
  RefreshCw
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useJourney } from "@/hooks/useJourney";
import { getSunSign } from "@/lib/astrology";
import { AKASHA_PERSONA } from "@/lib/ai";
import { useAIStream } from "@/hooks/useAIStream";
import { useAppStore } from "@/lib/store";
import { getDailyTarotCards } from "@/lib/tarot-data";
import { getFromIndexedDB, saveToIndexedDB } from "@/lib/storage";

export function TodayView() {
  const { profile, isLoaded: isProfileLoaded } = useUserProfile();
  const { entries, isLoaded: journeyLoaded } = useJourney();
  const { stream } = useAIStream();
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const setHandoff = useAppStore((state: any) => state.setHandoff);
  
  const isLoaded = isProfileLoaded && journeyLoaded;
  const lastEntry = entries[0];
  
  const { today, greeting } = useMemo(() => {
    const d = new Date();
    const hour = d.getHours();
    let g = "夜安";
    if (hour >= 5 && hour < 12) g = "早安";
    else if (hour >= 12 && hour < 18) g = "午安";
    else if (hour >= 18 && hour < 22) g = "晚安";
    return { today: d, greeting: g };
  }, []);

  const sunSign = profile.birthDate ? getSunSign(new Date(profile.birthDate)) : "探索者";
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [dailyData, setDailyData] = useState({
    oracle: "「 星辰已为你排好阵列，只待你勇敢一跃。」",
  });

  useEffect(() => {
    if (!isLoaded) return;
    
    const initDaily = async () => {
      const todayStr = today.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const hour = today.getHours();
      const timePeriod = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 18 ? 'afternoon' : hour >= 18 && hour < 22 ? 'evening' : 'night';
      const cacheKey = `daily_merged_v1_${todayStr}_${timePeriod}_${profile.name || 'guest'}`;
      
      try {
        const cached = await getFromIndexedDB(cacheKey);
        if (cached) {
          setDailyData(cached as any);
          setIsInitializing(false);
          return;
        }
      } catch (e) {
        console.warn("IndexedDB read failed", e);
      }
      
      const cards = getDailyTarotCards(3);
      const cardNames = cards.map(c => `${c.name}${c.isReversed ? '(逆位)' : '(正位)'}`).join('、');
      
      const prompt = `
<instruction>
今日是${todayStr}，${greeting}。请为用户生成今日专属的灵魂神谕与能量指引。
用户抽到了三张塔罗牌：${cardNames}。
请严格使用以下标签返回数据，不需要其他多余文本：
[SOUL_MOTTO] 一句充满力量的简短格言，作为今日神谕，20字以内 [/SOUL_MOTTO]
</instruction>

<user_profile>
${JSON.stringify(profile)}
</user_profile>
      `;

      let fullResponse = "";
      try {
        for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
          fullResponse += chunk;
        }

        const mottoMatch = fullResponse.match(/\[SOUL_MOTTO\]([\s\S]*?)\[\/SOUL_MOTTO\]/);
        const oracle = mottoMatch ? `「 ${mottoMatch[1].trim()} 」` : "「 星辰的轨迹已经显现，跟随直觉指引方向。」";

        const newDaily = { oracle };
        await saveToIndexedDB(cacheKey, newDaily);
        setDailyData(newDaily);
      } catch (err) {
        console.error("Failed to generate daily reading:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    initDaily();
  }, [isLoaded, profile.name, greeting, today]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 text-[#C9A84C] animate-spin" />
        <p className="font-serif text-[#E8DFB8]/40 tracking-[0.2em]">正在同步宇宙频率与灵魂轨迹...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-12">
      {/* 顶部三宫格 - 还原截图布局 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="luxury-card p-8 flex flex-col items-center text-center space-y-4 group">
          <div className="w-10 h-10 rounded-full border border-amber-500/10 flex items-center justify-center bg-amber-500/5">
            <Sun className="w-5 h-5 text-amber-200/40 group-hover:text-amber-200 transition-colors" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-serif tracking-[0.3em] text-amber-100/30 uppercase">太阳</p>
            <p className="text-2xl font-serif text-amber-100">{sunSign}</p>
          </div>
        </div>
        <div className="luxury-card p-8 flex flex-col items-center text-center space-y-4 group">
          <div className="w-10 h-10 rounded-full border border-amber-500/10 flex items-center justify-center bg-amber-500/5">
            <User className="w-5 h-5 text-amber-200/40 group-hover:text-amber-200 transition-colors" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-serif tracking-[0.3em] text-amber-100/30 uppercase">性别</p>
            <p className="text-2xl font-serif text-amber-100">{profile.gender || "探索者"}</p>
          </div>
        </div>
        <div className="luxury-card p-8 flex flex-col items-center text-center space-y-4 group">
          <div className="w-10 h-10 rounded-full border border-amber-500/10 flex items-center justify-center bg-amber-500/5">
            <Activity className="w-5 h-5 text-amber-200/40 group-hover:text-amber-200 transition-colors" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-serif tracking-[0.3em] text-amber-100/30 uppercase">MBTI</p>
            <p className="text-2xl font-serif text-amber-100">{profile.mbti || "未觉醒"}</p>
          </div>
        </div>
      </section>

      {/* 今日能量建议 - 还原长条栏 */}
      <section className="luxury-card p-6 md:p-10 rounded-[2.5rem] flex items-center gap-6 group hover:border-amber-500/30 transition-all">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
          <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-serif tracking-[0.3em] text-amber-200/40 uppercase">今日能量建议</p>
          <p className="text-lg md:text-xl font-serif text-amber-50/90 leading-relaxed italic">
            {dailyData.oracle.replace(/「|」/g, '')}
          </p>
        </div>
      </section>

      {/* 快速开始 - 还原大型卡片网格 */}
      <section className="space-y-8">
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
                {lastEntry ? `你还有一份关于“${lastEntry.title}”的解读尚未读完。` : "暂无未读记录，开启你的命运探索。"}
              </p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
