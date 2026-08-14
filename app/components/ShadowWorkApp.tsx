import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ShieldAlert, Send, AlertTriangle } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAIChat } from "@/hooks/useAIChat";
import { useJourney } from "@/hooks/useJourney";
import BreathingLoading from "./BreathingLoading";
import MysticMarkdown from "./MysticMarkdown";
import { SHADOW_WORK_PERSONA } from "@/lib/ai";
import { getShadowWorkPrompt } from "@/lib/prompts";

interface ShadowWorkAppProps {
  initialHandoff?: any;
  clearHandoff?: () => void;
}

export default function ShadowWorkApp({ initialHandoff, clearHandoff }: ShadowWorkAppProps = {}) {
  const { getProfileContext } = useUserProfile();
  const { addEntry } = useJourney();
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (initialHandoff) {
      const timer = setTimeout(() => {
        const q = initialHandoff.prefillQuestion || initialHandoff.question || initialHandoff.context;
        if (q) setInput(q);
        clearHandoff?.();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialHandoff, clearHandoff]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isLoading, error } = useAIChat({
    type: 'shadow_work',
    systemInstruction: SHADOW_WORK_PERSONA,
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    const currentInput = input;
    setInput("");
    
    const prompt = getShadowWorkPrompt(currentInput, getProfileContext());

    try {
      await sendMessage(prompt, {
        title: `阴影工作：${currentInput.substring(0, 15)}...`,
        details: {
          type: 'shadow_work',
          issue: currentInput
        }
      }, undefined, currentInput);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!hasAcceptedDisclaimer) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-950/30 border border-red-500/50 rounded-3xl p-8 md:p-10 backdrop-blur-md shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <ShieldAlert className="w-16 h-16 text-red-500 animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-red-400 text-center mb-6 tracking-wider">
            安全警告与免责声明
          </h2>
          <div className="space-y-4 text-red-200/80 text-sm md:text-base leading-relaxed mb-8 font-serif">
            <p>
              欢迎来到「阴影工作坊」。阴影工作（Shadow Work）和核心创伤探索是一项深刻且可能引发强烈情绪反应的自我觉察练习。
            </p>
            <p className="font-bold text-red-300">
              请注意：本工具仅用于自我反思与觉察，绝不能替代专业的临床心理治疗。
            </p>
            <p>
              如果您目前正处于严重的抑郁、焦虑状态，或曾经历过严重的心理创伤，请在专业心理咨询师的陪同下进行此类探索。
            </p>
            <p>
              如果您在对话过程中感到情绪失控、极度痛苦或有伤害自己的冲动，请立即停止使用，并寻求专业帮助（如拨打当地的心理危机干预热线）。
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => setHasAcceptedDisclaimer(true)}
              className="bg-gradient-to-r from-red-900/80 to-red-800/80 hover:from-red-800 hover:to-red-700 border border-red-500/60 text-red-100 px-10 py-3.5 rounded-full font-serif tracking-widest transition-all shadow-lg cursor-pointer"
            >
              我已阅读并理解，同意继续
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-zinc-200 tracking-widest mb-3 drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">
          阴影工作坊 (Shadow Work)
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base font-serif italic">
          “直到你让潜意识意识化，它就会主导你的生活，而你称之为命运。” —— 卡尔·荣格
        </p>
      </div>

      <div className="bg-black/60 border border-purple-500/20 rounded-3xl flex flex-col min-h-[620px] backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-zinc-400 font-serif text-center px-4 space-y-3">
              <AlertTriangle className="w-12 h-12 text-purple-400/40 animate-pulse" />
              <p className="text-base text-zinc-300 font-bold">这里是一个绝对安全的觉照空间</p>
              <p className="text-sm text-zinc-400 max-w-md">你可以谈论那些让你感到羞耻、愤怒、恐惧的模式或记忆。</p>
              <p className="text-xs text-purple-300/60 pt-2 italic">例如：“我总是在关系变亲密时感到恐慌想逃跑”、“我内心深处觉得自己不配得到赞美”</p>
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
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl p-5 bg-purple-950/40 border border-purple-500/30 text-purple-100 shadow-md">
                      <p className="font-serif whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full rounded-3xl p-6 sm:p-8 bg-zinc-900/60 border border-purple-500/20 text-zinc-200 shadow-xl">
                    <MysticMarkdown content={msg.content || (isLoading && idx === messages.length - 1 ? '...' : '')} />
                  </div>
                )}
              </motion.div>
            ))
          )}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div className="w-full">
              <div className="w-full rounded-3xl p-6 bg-zinc-900/60 border border-purple-500/20">
                <BreathingLoading text="正在潜入深层潜意识，觉照你未曾言说的阴影..." />
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

        <div className="p-4 sm:p-6 border-t border-purple-500/10 bg-black/50">
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
              placeholder="写下你此刻的感受、冲突或困惑..."
              className="w-full bg-zinc-900/60 border border-purple-500/30 rounded-2xl pl-5 pr-14 py-4 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-400 transition-all min-h-[56px] max-h-[160px] resize-none font-serif text-sm sm:text-base leading-relaxed"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-3.5 p-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center mt-3">
            <span className="text-[11px] text-zinc-500 font-serif">
              AI 并非临床心理医生。如遇紧急心理危机，请立即拨打专业心理援助热线。
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
