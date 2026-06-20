import { useState, useEffect } from "react";
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
          className="bg-amber-950/20 border border-amber-500/30 rounded-3xl p-8 backdrop-blur-md"
        >
          <div className="flex justify-center mb-6">
            <Moon className="w-16 h-16 text-amber-500" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-amber-400 text-center mb-6 tracking-widest">
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
              className="bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 px-10 py-3 rounded-full font-serif transition-all"
            >
              我已准备好面对内在真实的倒影
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-500 tracking-widest mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          梦境与潜意识 (Subconscious)
        </h1>
        <p className="text-amber-200/60 max-w-2xl mx-auto text-sm md:text-base">
          荣格认为，人类所有痛苦的根源是对自己阴影的逃避。在这里，直面你的潜意识。
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => handleModeSwitch('dream')}
          className={`px-6 py-2 rounded-full font-serif text-sm transition-all ${
            mode === 'dream' 
              ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
              : 'bg-black/40 border border-amber-500/20 text-amber-100/60 hover:text-amber-200'
          }`}
        >
          <Moon className="w-4 h-4 inline-block mr-2" />
          梦境解析
        </button>
        <button
          onClick={() => handleModeSwitch('imagination')}
          className={`px-6 py-2 rounded-full font-serif text-sm transition-all ${
            mode === 'imagination' 
              ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
              : 'bg-black/40 border border-amber-500/20 text-amber-100/60 hover:text-amber-200'
          }`}
        >
          <MessageCircle className="w-4 h-4 inline-block mr-2" />
          主动想象 (对话愚者)
        </button>
      </div>

      <div className="bg-black/40 border border-amber-500/20 rounded-2xl flex flex-col h-[600px] backdrop-blur-sm">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-amber-200/40 font-serif">
              {mode === 'dream' ? (
                <>
                  <Moon className="w-12 h-12 mb-4 opacity-50" />
                  <p>描述你昨晚的梦境，或是反复出现的梦...</p>
                </>
              ) : (
                <>
                  <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
                  <p>闭上眼睛，想象塔罗牌中的「愚者」站在悬崖边。</p>
                  <p className="mt-2">你想对他说什么？或者问他什么？</p>
                </>
              )}
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl p-6 ${
                    msg.role === 'user' 
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-100' 
                      : 'bg-zinc-900/80 border border-amber-500/20 text-amber-100/90'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="font-serif whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MysticMarkdown content={msg.content || (isLoading && idx === messages.length - 1 ? '...' : '')} />
                  )}
                </div>
              </motion.div>
            ))
          )}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-zinc-900/80 border border-amber-500/20 rounded-2xl p-4">
                <BreathingLoading text={mode === 'dream' ? "正在解析梦境符号..." : "愚者正在思考..."} />
              </div>
            </div>
          )}
          {error && (
            <div className="text-center text-red-400 text-sm p-2 bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-amber-500/20 bg-black/60 rounded-b-2xl">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={mode === 'dream' ? "描述你的梦境..." : "对愚者说..."}
              className="w-full bg-black/50 border border-amber-500/30 rounded-xl pl-4 pr-12 py-3 text-amber-100 placeholder-amber-100/30 focus:outline-none focus:border-amber-500/60 transition-colors min-h-[60px] max-h-[120px] resize-y custom-scrollbar"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 bottom-3 p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-amber-200/30">按 Enter 发送，Shift + Enter 换行</span>
          </div>
        </div>
      </div>
    </div>
  );
}
