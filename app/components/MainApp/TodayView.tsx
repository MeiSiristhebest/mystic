"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Sparkles, Calendar, Wind, Star, RefreshCw, Share2 } from "lucide-react";
import { MysticImage } from "./MysticImage";
import MysticMarkdown from "../MysticMarkdown";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAIStream } from "@/hooks/useAIStream";
import { AKASHA_PERSONA } from "@/lib/ai";
import { getDailyTarotCards } from "@/lib/tarot-data";
import { getFromIndexedDB, saveToIndexedDB } from "@/lib/storage";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";

export function TodayView() {
  const { profile, isLoaded: isProfileLoaded } = useUserProfile();
  const { stream, isLoading: isStreaming, error: streamError } = useAIStream();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();
  const posterRef = useRef<HTMLDivElement>(null);
  
  const [dailyData, setDailyData] = useState<{
    date: string;
    cards: any[];
    reading: string;
    imagePrompt: string;
  } | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("早安");
    else if (hour >= 12 && hour < 18) setGreeting("午安");
    else if (hour >= 18 && hour < 22) setGreeting("晚安");
    else setGreeting("夜安");
  }, []);

  useEffect(() => {
    if (!isProfileLoaded) return;
    
    const initDaily = async () => {
      const now = new Date();
      const today = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const hour = now.getHours();
      const timePeriod = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 18 ? 'afternoon' : hour >= 18 && hour < 22 ? 'evening' : 'night';
      
      // Cache per day and time period to ensure greeting and context match
      const cacheKey = `daily_reading_${today}_${timePeriod}_${profile.name || 'guest'}`;
      
      const cached = await getFromIndexedDB(cacheKey);
      if (cached) {
        setDailyData(cached as any);
        setIsInitializing(false);
        return;
      }
      
      // Generate new daily reading
      const cards = getDailyTarotCards(3);
      const cardNames = cards.map(c => `${c.name}${c.isReversed ? '(逆位)' : '(正位)'}`).join('、');
      const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      
      const prompt = `
<instruction>
今天是${today}，现在是北京时间 ${timeStr}（${greeting}）。
请作为阿卡夏记录的引导者，为用户提供一份此刻专属的灵魂运势指引。
用户抽到了三张塔罗牌：${cardNames}。
请结合塔罗牌义、当前的时刻（${greeting}）以及用户的个人档案信息，给出运势解析。
如果是早晨，侧重于开启新的一天；如果是夜晚，侧重于回顾与潜意识的连接。</instruction>

<user_profile>
${JSON.stringify(profile)}
</user_profile>

<output_format>
请使用Markdown格式，包含以下章节：
# 🌟 ${greeting}，今日灵魂频率
## 🃏 启示之牌：${cardNames}
## 🔮 阿卡夏指引
（深入分析此时此刻的能量状态、建议的行为方向以及需要注意的避坑点）
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
  }, [isProfileLoaded, profile, stream, greeting]);

  const handleSavePoster = async () => {
    if (!posterRef.current || !dailyData) return;
    await handleGeneratePoster(posterRef.current, `daily-reading-${dailyData.date}.jpg`);
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="font-serif text-amber-200/40 tracking-[0.2em]">正在同步今日星象...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-12 pb-20"
    >
      <div ref={posterRef} className="space-y-12 bg-[#050308] p-4 rounded-[32px]">
        {/* Header Image */}
        <section className="relative h-[40vh] md:h-[50vh] rounded-3xl overflow-hidden group">
          <MysticImage 
            prompt={dailyData?.imagePrompt || "Cosmic energy field"} 
            aspectRatio="16:9" 
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080510] via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 flex flex-col gap-2">
            <div className="flex items-center gap-3 text-amber-500/80">
              <Calendar className="w-4 h-4" />
              <span className="font-serif tracking-[0.2em] text-sm">{dailyData?.date}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif text-amber-100 tracking-[0.1em] drop-shadow-lg">
              {greeting}，灵魂频率
            </h1>
          </div>
        </section>

        {/* Reading Content */}
        <section className="glass-panel p-8 md:p-12 rounded-3xl space-y-8 relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Wind className="w-48 h-48 text-amber-500" />
          </div>
          
          <div className="relative z-10">
            <MysticMarkdown content={dailyData?.reading || ""} cards={dailyData?.cards} />
          </div>
        </section>
      </div>
        
      <div className="flex justify-center pt-8 border-t border-white/5">
        <button 
          onClick={handleSavePoster}
          disabled={isGeneratingPoster}
          className="flex items-center gap-2 px-8 py-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-200 hover:text-white hover:bg-amber-500/20 transition-all font-serif tracking-[0.2em] text-sm group disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
        >
          {isGeneratingPoster ? (
            <span className="animate-pulse">正在生成海报...</span>
          ) : (
            <>
              <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              保存今日启示海报
            </>
          )}
        </button>
      </div>

      {/* Daily Task or Insight */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10">
            <Star className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h4 className="text-amber-200 font-serif mb-1">今日避坑</h4>
            <p className="text-sm text-amber-100/40 leading-relaxed">
              受当前星象影响，建议今日避免进行大宗交易或签署长期合同。保持低调，倾听内在声音。
            </p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10">
            <Sparkles className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h4 className="text-purple-200 font-serif mb-1">幸运色彩</h4>
            <p className="text-sm text-purple-100/40 leading-relaxed">
              丁香紫与月光银。这些频率能增强你的直觉力，帮助你在琐事中发现隐藏的契机。
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
