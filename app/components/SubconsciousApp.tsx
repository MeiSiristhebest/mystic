import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Moon, MessageCircle, Send } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAIChat } from "@/hooks/useAIChat";
import { useJourney } from "@/hooks/useJourney";
import BreathingLoading from "./BreathingLoading";
import MysticMarkdown from "./MysticMarkdown";
import { getSubconsciousPrompt } from '@/lib/prompts';
import { SUBCONSCIOUS_DREAM_PERSONA, SUBCONSCIOUS_FOOL_PERSONA } from "@/lib/ai";

interface SubconsciousAppProps {
  initialHandoff?: any;
  clearHandoff?: () => void;
}

export default function SubconsciousApp({ initialHandoff, clearHandoff }: SubconsciousAppProps = {}) {
  const { getProfileContext } = useUserProfile();
  const { addEntry } = useJourney();
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [mode, setMode] = useState<'dream' | 'imagination'>('dream');
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialHandoff) {
      const timer = setTimeout(() => {
        const q = initialHandoff.prefillQuestion || initialHandoff.question || initialHandoff.context;
        const m = initialHandoff.modeId;
        
        if (q) setInput(q);
        if (m === 'dream' || m === 'imagination') setMode(m);
        
        clearHandoff?.();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialHandoff, clearHandoff]);
  
  const { messages, sendMessage, isLoading, error } = useAIChat({
    type: 'subconscious',
    systemInstruction: mode === 'dream' ? SUBCONSCIOUS_DREAM_PERSONA : SUBCONSCIOUS_FOOL_PERSONA,
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    const currentInput = input;
    setInput("");
    
    const prompt = getSubconsciousPrompt({
      mode,
      input: currentInput,
      profileContext: getProfileContext()
    });

    try {
      await sendMessage(prompt, {
        title: `${mode === 'dream' ? '梦境解析' : '主动想象'}：${currentInput.substring(0, 15)}...`,
        details: {
          type: 'subconscious',
          mode,
          content: currentInput
        }
      }, undefined, currentInput);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleModeSwitch = (newMode: 'dream' | 'imagination') => {
    setMode(newMode);
    setInput("");
  };

  if (!hasAcceptedDisclaimer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-950/20 border border-amber-500/30 rounded-3xl p-8 md:p-10 backdrop-blur-md shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <Moon className="w-16 h-16 text-amber-500 animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-400 text-center mb-6 tracking-widest">
            潜意识探索安全指引
          </h2>
          <div className="space-y-4 text-amber-100/70 text-sm md:text-base leading-relaxed mb-8 font-serif">
            <p>
              欢迎来到「潜意识剧场」。梦境解析与主动想象是通往内心深处的门户。
            </p>
            <p className="font-bold text-amber-300/90">
              请知悉：这里提供的解析是基于心理学原型的象征性探讨，并非临床心理诊断或医疗建议。
            </p>
            <p>
              深入潜意识可能会唤起被遗忘的记忆或强烈的情绪。如果您正处于极度的心理压力中，请在专业人士的指导下进行此类探索。
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => setHasAcceptedDisclaimer(true)}
              className="bg-gradient-to-r from-amber-600/40 to-amber-700/40 hover:from-amber-600/60 hover:to-amber-700/60 border border-amber-500/50 text-amber-200 px-10 py-3.5 rounded-full font-serif tracking-widest transition-all shadow-lg cursor-pointer"
            >
              我已准备好面对内在真实的倒影
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-500 tracking-widest mb-3 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          梦境与潜意识 (Subconscious)
        </h1>
        <p className="text-amber-200/60 max-w-2xl mx-auto text-sm md:text-base font-serif italic">
          “荣格认为，人类所有痛苦的根源是对自己阴影的逃避。在这里，直面你的潜意识。”
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => handleModeSwitch('dream')}
          className={`px-6 py-2.5 rounded-full font-serif text-sm transition-all cursor-pointer ${
            mode === 'dream' 
              ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
              : 'bg-black/40 border border-amber-500/20 text-amber-100/60 hover:text-amber-200'
          }`}
        >
          <Moon className="w-4 h-4 inline-block mr-2" />
          梦境解析
        </button>
        <button
          onClick={() => handleModeSwitch('imagination')}
          className={`px-6 py-2.5 rounded-full font-serif text-sm transition-all cursor-pointer ${
            mode === 'imagination' 
              ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
              : 'bg-black/40 border border-amber-500/20 text-amber-100/60 hover:text-amber-200'
          }`}
        >
          <MessageCircle className="w-4 h-4 inline-block mr-2" />
          主动想象 (对话愚者)
        </button>
      </div>

      <div className="bg-black/50 border border-amber-500/20 rounded-3xl flex flex-col min-h-[620px] backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-amber-200/50 font-serif text-center px-4 space-y-3">
              {mode === 'dream' ? (
                <>
                  <Moon className="w-12 h-12 mb-2 opacity-50 animate-pulse text-amber-400" />
                  <p className="text-base text-amber-200 font-bold">描述你昨晚的梦境，或是反复出现的梦...</p>
                  <p className="text-xs text-amber-200/40">写下细节、感受、颜色或出现的象征物</p>
                </>
              ) : (
                <>
                  <MessageCircle className="w-12 h-12 mb-2 opacity-50 animate-pulse text-amber-400" />
                  <p className="text-base text-amber-200 font-bold">闭上眼睛，想象塔罗牌中的「愚者」站在悬崖边。</p>
                  <p className="text-xs text-amber-200/40">你想对他说什么？或者问他什么？</p>
                </>
              )}
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl p-5 bg-amber-500/10 border border-amber-500/30 text-amber-100 shadow-md">
                      <p className="font-serif whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full rounded-3xl p-6 sm:p-8 bg-zinc-900/60 border border-amber-500/20 text-amber-100/90 shadow-xl">
                    <MysticMarkdown content={msg.content || (isLoading && idx === messages.length - 1 ? '...' : '')} />
                  </div>
                )}
              </motion.div>
            ))
          )}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div className="w-full">
              <div className="w-full rounded-3xl p-6 bg-zinc-900/60 border border-amber-500/20">
                <BreathingLoading text={mode === 'dream' ? "正在解析梦境符号与原型..." : "愚者正在沉思你的问询..."} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="px-6 py-2">
            <div className="text-center text-red-400 text-sm p-3 bg-red-950/40 rounded-xl border border-red-500/30">
              {error}
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 border-t border-amber-500/20 bg-black/60">
          <div className="relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={mode === 'dream' ? "描述你的梦境细节与醒来时的情绪..." : "向愚者说出你的困惑..."}
              className="w-full bg-zinc-900/60 border border-amber-500/30 rounded-2xl pl-5 pr-14 py-4 text-amber-100 placeholder-amber-500/40 focus:outline-none focus:border-amber-400 transition-all min-h-[56px] max-h-[160px] resize-none font-serif text-sm sm:text-base leading-relaxed"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-3.5 p-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-amber-600 text-white rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
