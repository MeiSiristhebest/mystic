"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, Sparkles } from "lucide-react";
import { useAIStream } from "@/hooks/useAIStream";
import { ORCHESTRATOR_PERSONA } from "@/lib/ai";
import { AmbientCosmicBackground } from "./TarotComponents";
import MysticMarkdown from "../MysticMarkdown";
import BreathingLoading from "../BreathingLoading";

export type HandoffData = {
  system: string;
  modeId: string;
  question: string;
};

interface OmniOracleGuideProps {
  onClose: () => void;
  onHandoff: (data: HandoffData) => void;
}

export function OmniOracleGuide({ onClose, onHandoff }: OmniOracleGuideProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([
    { role: 'model', content: "旅人，什么风把你吹到了阿卡夏的场域？\n告诉我你内心的困惑，我将为你开启通往真理的门扉..." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  const { stream, isLoading, abort } = useAIStream();
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

    const newMsgs = [...messages, { role: "user", content: userMsg } as const];
    setMessages([...newMsgs, { role: "model", content: "" }]);

    try {
      let fullResponse = "";
      const historyContext = newMsgs.map(m => `${m.role === 'user' ? 'User' : 'Guide'}: ${m.content}`).join('\n\n');
      
      for await (const chunk of stream(historyContext, ORCHESTRATOR_PERSONA)) {
        fullResponse += chunk;
        
        // Hide the <execute> tag from the UI while streaming if possible
        const displayResponse = fullResponse.replace(/<execute>[\s\S]*?<\/execute>/g, '').trim();
        setMessages([...newMsgs, { role: "model", content: displayResponse }]);
      }
      
      // Parse execute tag
      const executeMatch = fullResponse.match(/<execute>([\s\S]*?)<\/execute>/);
      if (executeMatch && executeMatch[1]) {
        try {
          const actionData = JSON.parse(executeMatch[1]);
          setTimeout(() => {
            onHandoff(actionData);
          }, 2500); // Wait 2.5s to let the user read the final message before transitioning
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
        className="absolute top-8 right-8 p-3 text-amber-100/50 hover:text-amber-100 bg-black/20 hover:bg-black/40 rounded-full transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 z-10 pointer-events-none">
        <Sparkles className="w-8 h-8 text-[#C9A84C] mb-2" />
        <span className="font-serif tracking-[0.3em] uppercase text-xs text-[#C9A84C]">Omni-Oracle Guide</span>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col justify-center px-6 sm:px-12 relative z-20 py-24">
        <div className="space-y-16 max-h-[70vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: msg.role === 'user' ? 0.3 : 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-center text-center'}`}
              >
                {msg.role === 'user' ? (
                  <div className="text-[#E8DFB8]/60 text-lg sm:text-xl font-serif italic tracking-wide">
                    "{msg.content}"
                  </div>
                ) : (
                  <div className="text-2xl sm:text-3xl text-[#E8DFB8] font-serif leading-relaxed tracking-widest drop-shadow-[0_0_15px_rgba(201,168,76,0.4)] whitespace-pre-line">
                    {msg.content === "" ? <BreathingLoading text="" /> : msg.content}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} className="h-24" />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 w-full max-w-2xl px-6 z-30"
      >
        <form onSubmit={handleSend} className="relative group">
          <div className="absolute inset-0 bg-[#C9A84C]/5 rounded-full blur-xl group-hover:bg-[#C9A84C]/10 transition-colors duration-500" />
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isTyping}
            placeholder="回应阿卡夏的召唤..."
            className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-full py-5 pl-8 pr-16 text-[#E8DFB8] placeholder-[#E8DFB8]/30 focus:outline-none focus:border-[#C9A84C]/50 transition-all text-xl shadow-2xl"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-[#C9A84C] hover:text-white disabled:opacity-30 transition-colors rounded-full hover:bg-white/5"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
