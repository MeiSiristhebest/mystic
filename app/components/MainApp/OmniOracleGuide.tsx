"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, Sparkles, ArrowRight } from "lucide-react";
import { useAIStream } from "@/hooks/useAIStream";
import { ORCHESTRATOR_PERSONA, MODELS } from "@/lib/ai";
import { AmbientCosmicBackground } from "./TarotComponents";
import { useUserProfile } from "@/hooks/useUserProfile";
import { DivinationHandoff } from "@/app/types/divination";
import BreathingLoading from "../BreathingLoading";

interface OmniOracleGuideProps {
  onClose: () => void;
  onHandoff: (data: DivinationHandoff) => void;
}

export function OmniOracleGuide({ onClose, onHandoff }: OmniOracleGuideProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([
    { role: 'model', content: "旅人，什么风把你吹到了阿卡夏的场域？\n告诉我你内心的困惑，我将为你开启通往真理的门扉..." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [handoffData, setHandoffData] = useState<DivinationHandoff | null>(null);
  
  const { stream, isLoading, abort } = useAIStream({ model: MODELS.PRO });
  const { getProfileContext } = useUserProfile();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = inputMessage;
    setInputMessage("");
    setIsTyping(true);
    setHandoffData(null);

    const newMsgs = [...messages, { role: "user", content: userMsg } as const];
    setMessages([...newMsgs, { role: "model", content: "" }]);

    const profileContext = getProfileContext();
    
    try {
      let fullResponse = "";
      const historyContext = newMsgs.map(m => `${m.role === 'user' ? 'User' : 'Guide'}: ${m.content}`).join('\n\n');
      const prompt = `
<user_profile>
${profileContext}
</user_profile>

<conversation_history>
${historyContext}
</conversation_history>

<user_query>${userMsg}</user_query>
      `;
      
      for await (const chunk of stream(prompt, ORCHESTRATOR_PERSONA)) {
        fullResponse += chunk;
        
        // Hide internal tags from UI
        const displayResponse = fullResponse
          .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
          .replace(/<execute>[\s\S]*?<\/execute>/g, '')
          .trim();
          
        setMessages([...newMsgs, { role: "model", content: displayResponse }]);
      }
      
      // Parse execute tag for handoff
      const executeMatch = fullResponse.match(/<execute>([\s\S]*?)<\/execute>/);
      if (executeMatch && executeMatch[1]) {
        try {
          const actionData = JSON.parse(executeMatch[1].trim());
          setHandoffData({
            system: actionData.system,
            modeId: actionData.modeId,
            context: actionData.question || userMsg,
            autoTrigger: true
          });
        } catch (e) {
          console.error("Failed to parse orchestrator action", e);
        }
      }

    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
         setMessages([...newMsgs, { role: "model", content: "星辰暂被阴云遮蔽，我听不清你的声音，请再说一次。" }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleEmbark = () => {
    if (handoffData) {
      onHandoff(handoffData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#080510]/95 backdrop-blur-2xl"
    >
      <AmbientCosmicBackground />
      
      <button
        onClick={() => { abort(); onClose(); }}
        className="absolute top-8 right-8 p-3 text-amber-100/30 hover:text-amber-100 bg-white/5 hover:bg-white/10 rounded-full transition-all z-50 group"
      >
        <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
      </button>

      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 z-10 pointer-events-none">
        <Sparkles className="w-8 h-8 text-[#C9A84C] mb-2" />
        <span className="font-serif tracking-[0.4em] uppercase text-[10px] text-[#C9A84C]">Omni-Oracle Guide</span>
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-center px-6 sm:px-12 relative z-20 py-24">
        <div className="space-y-16 max-h-[70vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30, filter: 'blur(15px)' }}
                animate={{ 
                  opacity: msg.role === 'user' ? 0.4 : 1, 
                  y: 0, 
                  filter: 'blur(0px)',
                  scale: msg.role === 'user' ? 0.95 : 1
                }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-center text-center'}`}
              >
                {msg.role === 'user' ? (
                  <div className="text-[#E8DFB8]/70 text-xl sm:text-2xl font-serif italic tracking-wide">
                    &quot;{msg.content}&quot;
                  </div>
                ) : (
                  <div className="text-2xl sm:text-4xl md:text-5xl text-[#E8DFB8] font-serif leading-relaxed tracking-[0.05em] drop-shadow-[0_0_20px_rgba(201,168,76,0.3)] whitespace-pre-line max-w-4xl mx-auto">
                    {msg.content === "" ? <BreathingLoading text="" /> : msg.content}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {handoffData && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center pt-10"
            >
              <button
                onClick={handleEmbark}
                className="group relative px-12 py-5 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-amber-400/40 to-amber-600/20 animate-pulse" />
                <div className="absolute inset-[1px] bg-black/40 backdrop-blur-xl rounded-full" />
                <div className="relative flex items-center gap-4 text-amber-200 font-serif tracking-[0.4em] text-sm uppercase">
                  <span>即刻启程</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </button>
            </motion.div>
          )}
          <div ref={bottomRef} className="h-32" />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute bottom-16 w-full max-w-2xl px-6 z-30"
      >
        <form onSubmit={handleSend} className="relative group">
          <div className="absolute inset-0 bg-[#C9A84C]/5 rounded-full blur-2xl group-focus-within:bg-[#C9A84C]/10 transition-colors duration-700" />
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isTyping}
            placeholder="在阿卡夏记录中寻觅..."
            className="w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full py-6 pl-10 pr-20 text-[#E8DFB8] placeholder-[#E8DFB8]/20 focus:outline-none focus:border-[#C9A84C]/40 transition-all text-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-4 text-[#C9A84C] hover:text-white disabled:opacity-20 transition-all rounded-full hover:bg-white/5"
          >
            <Send className="w-7 h-7" />
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
