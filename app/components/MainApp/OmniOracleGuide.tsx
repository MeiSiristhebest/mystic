"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { X, Sparkles, Send } from "lucide-react";
import { useAIStream } from "@/hooks/useAIStream";
import { AKASHA_PERSONA } from "@/lib/ai";
import MysticMarkdown from "../MysticMarkdown";

export interface HandoffData {
  system: string;
  context: string;
}

interface OmniOracleGuideProps {
  onClose: () => void;
  onHandoff: (data: HandoffData) => void;
}

export function OmniOracleGuide({ onClose, onHandoff }: OmniOracleGuideProps) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const { stream, isLoading } = useAIStream();

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setResponse("");
    const prompt = `
<instruction>
你现在是“阿卡夏之窗”的全知向导。你存在于星辰与现实的交界处。
用户向你寻求指引，你必须用一种充满灵性、玄奥且温暖的语气回应。

【引导逻辑层 - 思维链推理】
1. 识别用户困惑的核心维度（是关于：命运转折、心理阴影、他人关系、还是时间契机？）。
2. 在建议系统前，先给出一句具有神谕感的话语，安抚或启迪其灵魂。
3. 根据其问题深度，从可选系统中挑选最契合的一个：
   - [tarot]: 适合具体选择、短期预测、象征性启示。
   - [eastern]: 适合宏观命运、流年运势、东方古老智慧（八字/易经）。
   - [astrology]: 适合性格建模、长期心理周期、能量相位分析。
   - [soul]: 适合潜意识探索、梦境解析、阴影工作、深层恐惧。

最后，你必须以 [RECOMMENDED_SYSTEM: 系统代号] 的格式结束，确保程序能自动为其开启法阵。
</instruction>

<user_query>${query}</user_query>
    `;

    let fullText = "";
    try {
      for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
        fullText += chunk;
        setResponse(fullText);
      }

      // Parse recommended system
      const match = fullText.match(/\[RECOMMENDED_SYSTEM:\s*([a-zA-Z]+)\]/);
      if (match && match[1]) {
        const system = match[1].toLowerCase();
        setTimeout(() => {
          onHandoff({ system, context: query });
        }, 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg luxury-card p-8 bg-[#0a0510] border border-[#C9A84C]/30 shadow-2xl overflow-hidden rounded-3xl"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#E8DFB8]/50 hover:text-[#C9A84C] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6 relative z-10">
          <Sparkles className="w-8 h-8 text-[#C9A84C] mb-3" />
          <h2 className="text-2xl font-serif gold-gradient-text tracking-widest text-center">
            全知向导
          </h2>
          <p className="text-[#E8DFB8]/60 text-sm mt-2 text-center font-serif">
            告诉我你心中的困惑，我将为你指引最适合的星辰之路。
          </p>
        </div>

        <form onSubmit={handleAsk} className="relative z-10 mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如：我最近该换工作吗？"
              disabled={isLoading || !!response}
              className="w-full bg-black/50 border border-[#C9A84C]/20 rounded-xl px-4 py-3 text-[#E8DFB8] placeholder-[#E8DFB8]/30 focus:outline-none focus:border-[#C9A84C]/50 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading || !!response}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#C9A84C] hover:text-[#E8DFB8] disabled:opacity-30 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {response && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl p-5"
          >
            <div className="text-sm text-[#E8DFB8]/80 font-serif leading-relaxed">
              <MysticMarkdown content={response.replace(/\[RECOMMENDED_SYSTEM:[^\]]+\]/g, "")} />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
