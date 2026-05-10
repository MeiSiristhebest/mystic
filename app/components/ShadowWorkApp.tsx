import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ShieldAlert, MessageCircle, Send, AlertTriangle } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAIChat } from "@/hooks/useAIChat";
import BreathingLoading from "./BreathingLoading";

export default function ShadowWorkApp() {
  const { getProfileContext } = useUserProfile();
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isLoading, error, clearMessages } = useAIChat({
    systemInstruction: `你现在是一位受过严格训练的荣格派分析师和IFS（内部家庭系统）引导者。
用户正在进行「阴影工作坊」与核心创伤探索。

【最高安全护栏（Guardrails）- 绝对遵守】
1. 你的基调是「自我觉察与反思工具」，绝对不是「临床心理治疗」。
2. 如果用户表达出任何自残、自杀倾向、严重的抑郁爆发或创伤闪回（如“我不想活了”、“我控制不住想伤害自己”、“我感觉回到了被虐待的时候”），你必须：
   - 立即停止深挖和分析。
   - 表达深深的共情和支持。
   - 明确告知你是一个AI，无法提供医疗帮助。
   - 强制提供心理危机干预热线（如：中国大陆请拨打 110 或 心理危机干预热线 400-161-9995；美国请拨打 988）。
3. 不要给出任何医疗诊断（如“你患有PTSD”）。

【对话原则】
1. 引导用户与他们的“部分”（Parts）或“阴影”（Shadow）对话，而不是直接评判。
2. 每次只问一个温和、开放的问题。
3. 结合用户的灵魂档案，帮助他们看到行为模式背后的保护机制。
4. 语气：极度安全、包容、不带任何评判。`,
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    const currentInput = input;
    setInput("");
    
    const prompt = messages.length === 0 
      ? `${getProfileContext()}\n\n用户输入：${currentInput}`
      : currentInput;

    try {
      await sendMessage(prompt);
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
          className="bg-red-950/30 border border-red-500/50 rounded-2xl p-8 backdrop-blur-sm"
        >
          <div className="flex justify-center mb-6">
            <ShieldAlert className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-red-400 text-center mb-6 tracking-wider">
            安全警告与免责声明
          </h2>
          <div className="space-y-4 text-red-200/80 text-sm md:text-base leading-relaxed mb-8">
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
              className="bg-red-900/50 hover:bg-red-800/60 border border-red-500/50 text-red-200 px-8 py-3 rounded-full font-serif transition-colors"
            >
              我已阅读并理解，同意继续
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-zinc-300 tracking-widest mb-4 drop-shadow-[0_0_15px_rgba(212,212,216,0.3)]">
          阴影工作坊 (Shadow Work)
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base">
          “直到你让潜意识意识化，它就会主导你的生活，而你称之为命运。” —— 卡尔·荣格
        </p>
      </div>

      <div className="bg-black/60 border border-zinc-700/50 rounded-2xl flex flex-col h-[600px] backdrop-blur-md shadow-2xl">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 font-serif text-center px-4">
              <AlertTriangle className="w-12 h-12 mb-4 opacity-30" />
              <p className="mb-2">这里是一个绝对安全的空间。</p>
              <p>你可以谈论那些让你感到羞耻、愤怒、恐惧的模式或记忆。</p>
              <p className="text-sm mt-4 opacity-70">例如：“我总是破坏一段好的关系”、“我内心深处觉得自己不配得到爱”</p>
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
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-zinc-800/50 border border-zinc-600/30 text-zinc-200' 
                      : 'bg-zinc-900/80 border border-zinc-700/50 text-zinc-300'
                  }`}
                >
                  <div className="prose prose-invert prose-zinc max-w-none text-sm md:text-base font-serif whitespace-pre-wrap leading-relaxed">
                    {msg.content || (isLoading && idx === messages.length - 1 ? '...' : '')}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-2xl p-4">
                <BreathingLoading text="正在倾听你内心的声音..." />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="px-6 py-2">
            <div className="text-center text-red-400 text-sm p-2 bg-red-900/20 rounded-lg border border-red-500/20">
              {error}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-zinc-800/50 bg-black/40">
          <div className="relative flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="写下你此刻的感受或困扰..."
              className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl pl-4 pr-12 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors min-h-[50px] max-h-[150px] resize-y"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 bottom-3 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-zinc-600">
              AI 并非心理医生。如遇紧急心理危机，请立即拨打专业热线。
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
