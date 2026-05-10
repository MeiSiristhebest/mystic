import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { Globe, Users, Activity } from "lucide-react";
import { useAIChat } from "@/hooks/useAIChat";
import BreathingLoading from "./BreathingLoading";

// Generate a consistent hexagram based on the current date
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
    { num: 64, name: "火水未济", meaning: "未完成、希望、重新开始" }
    // Add more as needed, keeping it simple for the demo
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
    systemInstruction: `你是一位精通《易经》与荣格集体无意识理论的智者。
请基于今日的全球能量场和指定的《易经》卦象，为全人类/集体意识提供一份「集体镜像」解读。
语气：宏大、悲悯、充满哲理，超越个人得失，关注人类共同的命运与精神状态。`,
  });

  const generateReading = useCallback(async () => {
    if (hasGenerated) return;
    
    const prompt = `
今天是：${today.toLocaleDateString()}
今日全球集体卦象：第${hexagram.num}卦 ${hexagram.name} (${hexagram.meaning})

请基于这个卦象，结合当前全球的集体潜意识状态（可以泛指现代社会的焦虑、科技发展、人际疏离或觉醒等），给出一份「今日集体镜像」的解读。
告诉我们：作为集体的一部分，我们今天共同面临着怎样的能量？我们应该如何在这个集体能量中自处？
`;

    try {
      const response = await sendMessage(prompt);
      setReading(response);
      setHasGenerated(true);
    } catch (e) {
      console.error(e);
    }
  }, [hasGenerated, today, hexagram.num, hexagram.name, hexagram.meaning, sendMessage]);

  useEffect(() => {
    if (!hasGenerated && !isLoading) {
      generateReading();
      setHasGenerated(true);
    }
  }, [generateReading, hasGenerated, isLoading]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-emerald-500 tracking-widest mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          集体镜像 (Collective Mirror)
        </h1>
        <p className="text-emerald-200/60 max-w-2xl mx-auto text-sm md:text-base">
          我们都是同一片海洋中的波浪。通过每日卦象，洞察全球集体潜意识的涌动。
        </p>
      </div>

      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-8 mb-8 backdrop-blur-sm text-center">
        <Globe className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-80" />
        <h2 className="text-xl font-serif text-emerald-300 mb-2">今日全球共振卦象</h2>
        <div className="text-4xl font-bold text-emerald-100 tracking-widest my-4">
          {hexagram.name}
        </div>
        <p className="text-emerald-200/80 text-lg">
          核心意象：{hexagram.meaning}
        </p>
      </div>

      <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm min-h-[300px]">
        <div className="flex items-center gap-3 mb-6 border-b border-emerald-500/20 pb-4">
          <Users className="w-6 h-6 text-emerald-500" />
          <h3 className="text-lg font-serif text-emerald-300">集体潜意识解读</h3>
        </div>

        {isLoading ? (
          <div className="py-12">
            <BreathingLoading text="正在感知全球集体意识的波动..." />
          </div>
        ) : error ? (
          <div className="text-center text-red-400 p-4">{error}</div>
        ) : reading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-invert prose-emerald max-w-none"
          >
            <div className="whitespace-pre-wrap text-emerald-50/90 leading-relaxed font-serif text-sm md:text-base">
              {reading}
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
