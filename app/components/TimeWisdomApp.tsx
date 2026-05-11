'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Moon, Sun, Star, Globe, Zap, AlertTriangle, Activity } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAIChat } from "@/hooks/useAIChat";
import BreathingLoading from "./BreathingLoading";
import MysticMarkdown from "./MysticMarkdown";
import { MODELS } from "@/lib/ai";

// Dynamic Global Context instruction
const GLOBAL_CONTEXT_INSTRUCTION = `
<dynamic_context_instruction>
  你必须使用 Google Search 工具来获取【此时此刻】的全球核心时事、地缘政治动态以及最新的占星学相位（星历数据）。
  将这些实时抓取的信息作为“大环境背景”，与用户的个人档案进行深度共振分析。
</dynamic_context_instruction>
`;

function getMoonPhase(date: Date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  if (month < 3) { year--; month += 12; }
  ++month;
  let c = 365.25 * year;
  let e = 30.6 * month;
  let jd = c + e + day - 694039.09;
  jd /= 29.5305882;
  let b = parseInt(jd.toString());
  jd -= b;
  let b2 = Math.round(jd * 8);
  if (b2 >= 8) b2 = 0;
  const phases = [
    { name: "新月 (New Moon)", desc: "播种意图，开启新周期的最佳时机。" },
    { name: "蛾眉月 (Waxing Crescent)", desc: "积蓄能量，开始采取初步行动。" },
    { name: "上弦月 (First Quarter)", desc: "遇到挑战，需要做出决定和调整。" },
    { name: "盈凸月 (Waxing Gibbous)", desc: "完善细节，保持耐心等待结果。" },
    { name: "满月 (Full Moon)", desc: "能量顶峰，情绪释放，收获与显化。" },
    { name: "亏凸月 (Waning Gibbous)", desc: "感恩回馈，分享经验，开始向内收敛。" },
    { name: "下弦月 (Last Quarter)", desc: "释放放手，清理不再服务于你的事物。" },
    { name: "残月 (Waning Crescent)", desc: "深度休息，反思与疗愈，准备下一个循环。" }
  ];
  return phases[b2];
}

export default function TimeWisdomApp() {
  const { profile, getProfileContext } = useUserProfile();
  const [reading, setReading] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const today = useMemo(() => new Date(), []);
  const moonPhase = useMemo(() => getMoonPhase(today), [today]);

  const { sendMessage, isLoading, error } = useAIChat({
    model: MODELS.FLASH,
    systemInstruction: `你是一位精通宇宙时空节律的「时间智者」。
你的使命是将宏观的全球局势（时事）、剧烈的天体相位与个体的灵魂档案进行深度对齐。
你拒绝给出平庸的运势描述，必须指出当下这一刻在整个人类进化史和用户个体生命史中的独特性。`,
  });

  const generateReading = useCallback(async () => {
    if (hasGenerated) return;
    
    const prompt = `
<instruction>
请基于以下【全球时空脉动】背景，结合今天的月相能量以及用户的【灵魂档案】，撰写一份极具深度的时间智慧报告。
要求：
1. 分析全球局势（如地缘张力、变革趋势）如何作为一种“背景低音”影响着用户的心理状态。
2. 结合冥王星在水瓶座逆行等星象，给出用户在这个五月进行“权力重构”或“自我变革”的深度建议。
3. 最后的输出必须符合 <output_format> 的 Markdown 要求。
</instruction>

<current_context>
  <iso_time>${today.toISOString()}</iso_time>
  <local_time>${today.toLocaleString()}</local_time>
  <moon_phase>${moonPhase.name} - ${moonPhase.desc}</moon_phase>
  ${GLOBAL_CONTEXT_INSTRUCTION}
</current_context>

<user_profile>
  ${getProfileContext()}
</user_profile>

<output_format>
使用极具专业感的Markdown排版：
- 使用 ### 作为主要标题。
- 使用 **粗体** 强调关键词。
- 必须包含：【🌌 宏观能量场】、【🧬 个体共振】、【⏳ 时间之礼：今日行动指南】。
</output_format>
`;

    try {
      const response = await sendMessage(prompt);
      setReading(response);
      setHasGenerated(true);
    } catch (e) {
      console.error(e);
    }
  }, [hasGenerated, today, moonPhase, getProfileContext, sendMessage]);

  useEffect(() => {
    if (profile.birthDate && !hasGenerated && !isLoading) {
      generateReading();
    }
  }, [profile.birthDate, generateReading, hasGenerated, isLoading]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block p-3 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
        >
          <Clock className="w-8 h-8 text-blue-400" />
        </motion.div>
        <h1 className="text-4xl font-serif gold-gradient-text mb-4 tracking-widest">时间智慧</h1>
        <p className="text-blue-200/60 font-serif italic">"在永恒的当下，锚定你的坐标"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="luxury-card p-6 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-4 mb-4">
            <Globe className="w-6 h-6 text-blue-400 opacity-70" />
            <h3 className="text-sm font-serif uppercase tracking-widest text-blue-300">全球共振节点</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-xs text-blue-200/50">
              <Zap className="w-3 h-3 mt-0.5 text-amber-400 shrink-0" />
              <span>实时星象脉动扫描中...</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-blue-200/50">
              <Zap className="w-3 h-3 mt-0.5 text-amber-400 shrink-0" />
              <span>全球时事能量场对齐中...</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-blue-200/50">
              <Activity className="w-3 h-3 mt-0.5 text-blue-400 shrink-0" />
              <span>正在检索今日核心共振节点</span>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-4 mb-4">
            <Moon className="w-6 h-6 text-blue-400 opacity-70" />
            <h3 className="text-sm font-serif uppercase tracking-widest text-blue-300">当前月相能量</h3>
          </div>
          <div className="text-center">
            <p className="text-xl font-serif text-blue-100 mb-2">{moonPhase.name}</p>
            <p className="text-xs text-blue-200/60 leading-relaxed">{moonPhase.desc}</p>
          </div>
        </div>
      </div>

      <div className="relative min-h-[400px] luxury-card p-8 md:p-12 border-blue-500/10 bg-black/40 overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Clock className="w-32 h-32 text-blue-500" />
        </div>

        {!profile.birthDate ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Star className="w-12 h-12 text-blue-500/30 mb-4 animate-pulse" />
            <p className="text-blue-200/50 mb-2">需要完善您的“灵魂档案”以开启时间智慧</p>
            <p className="text-[10px] text-blue-500/40 uppercase tracking-widest">Awaiting Cosmic Alignment</p>
          </div>
        ) : isLoading ? (
          <div className="py-20">
            <BreathingLoading text="正在读取 2026年5月 的全球时空记录..." />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={reading}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <MysticMarkdown content={reading} />
              
              {reading && (
                <div className="mt-12 pt-8 border-t border-blue-500/10 flex justify-center">
                  <button 
                    onClick={() => { setHasGenerated(false); generateReading(); }}
                    className="text-xs font-serif text-blue-400/40 hover:text-blue-400 transition-colors tracking-[0.3em] uppercase"
                  >
                    刷新时空场域
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
