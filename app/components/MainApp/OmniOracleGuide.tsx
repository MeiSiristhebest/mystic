"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { X, Sparkles, Send } from "lucide-react";
import { useAIStream } from "@/hooks/useAIStream";
import MysticMarkdown from "../MysticMarkdown";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ORCHESTRATOR_PERSONA, MODELS } from "@/lib/ai";
import { DivinationHandoff } from "@/app/types/divination";

interface OmniOracleGuideProps {
  onClose: () => void;
  onHandoff: (data: DivinationHandoff) => void;
}

export function OmniOracleGuide({ onClose, onHandoff }: OmniOracleGuideProps) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const { stream, isLoading } = useAIStream({ model: MODELS.PRO });
  const { getProfileContext } = useUserProfile();

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setResponse("");
    const profileContext = getProfileContext();
    const prompt = `
<user_profile>
${profileContext}
</user_profile>

<user_query>${query}</user_query>
    `;

    let fullText = "";
    try {
      for await (const chunk of stream(prompt, ORCHESTRATOR_PERSONA)) {
        fullText += chunk;
        setResponse(fullText);
      }

      // Parse recommended system using the new <execute> tag format defined in ORCHESTRATOR_PERSONA
      const executeMatch = fullText.match(/<execute>([\s\S]*?)<\/execute>/);
      if (executeMatch && executeMatch[1]) {
        try {
          const executeData = JSON.parse(executeMatch[1].trim());
          setTimeout(() => {
            onHandoff({ 
              system: executeData.system, 
              context: executeData.question || query,
              modeId: executeData.modeId,
              autoTrigger: true
            });
          }, 3000);
        } catch (e) {
          console.error("Failed to parse execute tag", e);
        }
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
