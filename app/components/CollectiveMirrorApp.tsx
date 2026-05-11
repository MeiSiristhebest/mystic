'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Users, Activity, Sparkles, TrendingUp, Info } from "lucide-react";
import { useAIChat } from "@/hooks/useAIChat";
import BreathingLoading from "./BreathingLoading";
import MysticMarkdown from "./MysticMarkdown";
import { MODELS } from "@/lib/ai";

// Dynamic Global Psyche instruction
const DYNAMIC_PSYCHE_INSTRUCTION = `
<dynamic_psyche_instruction>
  你必须使用 Google Search 工具来获取【此时此刻】全球范围内最重要的 3-5 条新闻（社会、科技、地缘）。
  将这些新闻视为人类集体意识的“显化征兆”，结合今日卦象，分析全球集体心理的底层涌动与阴影。
</dynamic_psyche_instruction>
`;

function getDailyHexagram(date: Date) {
  const dateString = date.toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hexagrams = [
    { num: 1, name: "乾为天", meaning: "创造、刚健、自强不息" },
    { num: 2, name: "坤为地", meaning: "包容、柔顺、厚德载物" },
    { num: 11, name: "地天泰", meaning: "通达、和谐、阴阳交融" },
    { num: 12, name: "天地否", meaning: "闭塞、阻隔、需要耐心" },
    { num: 24, name: "地雷复", meaning: "复苏、转机、一阳来复" },
    { num: 43, name: "泽天夬", meaning: "决断、突破、消除隐患" },
    { num: 63, name: "水火既济", meaning: "完成、成功、防微杜渐" },
    { num: 64, name: "火水未济", meaning: "未完成、希望、重新开始" },
    { num: 29, name: "坎为水", meaning: "重险、历练、守信笃行" },
    { num: 30, name: "离为火", meaning: "光明、依附、柔顺中正" }
  ];
  const index = Math.abs(hash) % hexagrams.length;
  return hexagrams[index];
}

export default function CollectiveMirrorApp() {
  const [reading, setReading] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const today = useMemo(() => new Date(), []);
  const hexagram = useMemo(() => getDailyHexagram(today), [today]);

  const { sendMessage, isLoading, error } = useAIChat({
    model: MODELS.PRO,
    systemInstruction: `你是一位融合了《易经》辩证哲学与荣格分析心理学的「集体镜像观测者」。
你的任务是透过每日卦象，解析此时此刻全球集体潜意识的底层波动。
你不仅是在解卦，更是在为全人类进行一场心理分析。
你的回复应当充满宏大的慈悲、敏锐看社会洞察以及对人类命运的深度关怀。`,
  });

  const generateReading = useCallback(async () => {
    if (hasGenerated) return;
    
    const prompt = `
<instruction>
请基于今日的【全球共振卦象】以及提供的【全球集体潜意识脉动】，为全人类提供一份今日的集体镜像报告。
要求：
1. 分析卦象 ${hexagram.name} (${hexagram.num}) 在当前全球动荡背景下的象征意义。
2. 指出我们作为个体，如何在这种波动的集体海洋中保持觉察，而不被群体的恐惧或狂热卷走。
3. 必须包含对当前“美伊危机”或“核审议”所映射的集体阴影的深度洞察。
</instruction>

<divination_context>
  <iso_time>${today.toISOString()}</iso_time>
  <hexagram_energy>
    <name>${hexagram.name}</name>
    <archetype>${hexagram.meaning}</archetype>
  </hexagram_energy>
  ${DYNAMIC_PSYCHE_INSTRUCTION}
</divination_context>

<output_format>
使用结构严谨的Markdown排版：
- 使用 ### 为章节标题。
- 必须包含：【📡 集体频率监测】、【🌑 阴影与投射】、【🧘 全球处方：今日自处之道】。
</output_format>
`;

    try {
      const response = await sendMessage(prompt);
      setReading(response);
      setHasGenerated(true);
    } catch (e) {
      console.error(e);
    }
  }, [hasGenerated, today, hexagram, sendMessage]);

  useEffect(() => {
    if (!hasGenerated && !isLoading) {
      generateReading();
    }
  }, [generateReading, hasGenerated, isLoading]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <motion.div
          animate={{ 
            boxShadow: ["0 0 0px rgba(16,185,129,0)", "0 0 30px rgba(16,185,129,0.2)", "0 0 0px rgba(16,185,129,0)"]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-block p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
        >
          <Globe className="w-10 h-10 text-emerald-400" />
        </motion.div>
        <h1 className="text-4xl font-serif gold-gradient-text mb-4 tracking-widest">集体镜像</h1>
        <p className="text-emerald-200/60 font-serif italic text-sm md:text-base">
          “我们皆是集体意识之洋的一滴水，通过万物的共时性，观测波浪的去向。”
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="md:col-span-2 luxury-card p-8 border-emerald-500/30 bg-emerald-500/5 flex flex-col justify-center items-center text-center">
          <div className="flex items-center gap-2 text-emerald-400/60 mb-2 uppercase tracking-widest text-[10px]">
            <Sparkles className="w-3 h-3" />
            <span>今日全球共振卦象</span>
            <Sparkles className="w-3 h-3" />
          </div>
          <div className="text-5xl font-serif text-emerald-100 mb-4 tracking-[0.2em]">{hexagram.name}</div>
          <div className="p-1 px-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm">
            {hexagram.meaning}
          </div>
        </div>

        <div className="luxury-card p-6 border-emerald-500/20 bg-black/20">
          <h3 className="text-xs font-serif text-emerald-400/70 mb-4 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4" />
            意识波动指数
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] text-emerald-200/40 mb-1">
                <span>集体焦虑度</span>
                <span>HIGH</span>
              </div>
              <div className="h-1 bg-emerald-950 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "75%" }} className="h-full bg-red-400/50" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-emerald-200/40 mb-1">
                <span>变革渴求度</span>
                <span>URGENT</span>
              </div>
              <div className="h-1 bg-emerald-950 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "90%" }} className="h-full bg-blue-400/50" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[10px] text-emerald-200/30 bg-white/5 p-2 rounded-lg">
            <Info className="w-3 h-3" />
            <span>基于实时全球时事脉动深度估算</span>
          </div>
        </div>
      </div>

      <div className="relative min-h-[500px] luxury-card p-8 md:p-12 border-emerald-500/10 bg-black/60">
        <div className="flex items-center gap-3 mb-10 border-b border-emerald-500/20 pb-6">
          <Users className="w-6 h-6 text-emerald-500 opacity-60" />
          <h2 className="text-xl font-serif text-emerald-200 tracking-wider">集体潜意识深度观测报告</h2>
        </div>

        {isLoading ? (
          <div className="py-20">
            <BreathingLoading text="正在穿梭于集体无意识的深海，捕获关键共识..." />
          </div>
        ) : error ? (
          <div className="text-center text-red-400 p-8 border border-red-500/20 rounded-2xl bg-red-500/5">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4" />
            {error}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <MysticMarkdown content={reading} />
            
            {reading && (
              <div className="mt-16 pt-8 border-t border-emerald-500/10 flex flex-col items-center gap-4">
                <div className="text-[10px] text-emerald-500/30 font-serif tracking-[0.2em] uppercase">
                  End of Observation - Synchronicity Established
                </div>
                <button 
                  onClick={() => { setHasGenerated(false); generateReading(); }}
                  className="text-xs font-serif text-emerald-400/40 hover:text-emerald-400 transition-colors uppercase tracking-widest"
                >
                  重新感知集体脉动
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
