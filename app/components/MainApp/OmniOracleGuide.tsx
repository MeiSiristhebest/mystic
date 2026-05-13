"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, Sparkles, ArrowRight } from "lucide-react";
import { useAIStream } from "@/hooks/useAIStream";
import { ORCHESTRATOR_PERSONA, MODELS } from "@/lib/ai";
import { AmbientCosmicBackground } from "./Visuals";
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
        
        const displayResponse = fullResponse
          .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
          .replace(/<execute>[\s\S]*?<\/execute>/g, '')
          .trim();
          
        setMessages([...newMsgs, { role: "model", content: displayResponse }]);
      }
      
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

      <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col justify-center px-6 sm:px-12 relative z-20 py-24">
        <div className="space-y-16 max-h-[75vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 flex flex-col items-center">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50, filter: 'blur(20px)' }}
                animate={{ 
                  opacity: msg.role === 'user' ? 0.3 : 1, 
                  y: 0, 
                  filter: 'blur(0px)',
                  scale: msg.role === 'user' ? 0.9 : 1
                }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-center text-center'}`}
              >
                {msg.role === 'user' ? (
                  <div className="text-[#E8DFB8]/60 text-2xl sm:text-3xl font-serif italic tracking-wide max-w-2xl text-right">
                    &quot;{msg.content}&quot;
                  </div>
                ) : (
                  <div className="text-3xl sm:text-5xl md:text-6xl text-[#E8DFB8] font-serif leading-tight tracking-[0.08em] drop-shadow-[0_0_30px_rgba(201,168,76,0.4)] whitespace-pre-line max-w-5xl mx-auto">
                    {msg.content === "" ? <BreathingLoading text="" /> : msg.content}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {handoffData && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1, duration: 1.5 }}
              className="flex flex-col items-center justify-center pt-16 space-y-6"
            >
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mb-4" />
              <button
                onClick={handleEmbark}
                className="group relative px-16 py-6 rounded-full overflow-hidden transition-all hover:scale-110 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/30 via-amber-400/50 to-amber-600/30 animate-pulse" />
                <div className="absolute inset-[1px] bg-black/60 backdrop-blur-3xl rounded-full" />
                <div className="relative flex items-center gap-6 text-amber-200 font-serif tracking-[0.5em] text-lg uppercase">
                  <span>即刻启程</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                </div>
              </button>
              <p className="text-amber-500/40 text-[10px] font-serif tracking-[0.3em] uppercase">准备开启深层命理契机</p>
            </motion.div>
          )}
          <div ref={bottomRef} className="h-48" />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute bottom-16 w-full max-w-3xl px-6 z-30"
      >
        <form onSubmit={handleSend} className="relative group">
          <div className="absolute inset-0 bg-[#C9A84C]/5 rounded-full blur-3xl group-focus-within:bg-[#C9A84C]/10 transition-colors duration-1000" />
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isTyping}
            placeholder="在阿卡夏记录中寻觅..."
            className="w-full bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full py-8 pl-12 pr-24 text-[#E8DFB8] placeholder-[#E8DFB8]/20 focus:outline-none focus:border-[#C9A84C]/50 transition-all text-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] font-serif"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-5 text-[#C9A84C] hover:text-white disabled:opacity-20 transition-all rounded-full hover:bg-white/5"
          >
            <Send className="w-8 h-8" />
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
