import { useState } from "react";
import { motion } from "motion/react";
import { Moon, MessageCircle, Send } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAIChat } from "@/hooks/useAIChat";
import BreathingLoading from "./BreathingLoading";
import { MODELS } from "@/lib/ai";

export default function SubconsciousApp() {
  const { getProfileContext } = useUserProfile();
  const [mode, setMode] = useState<'dream' | 'imagination'>('dream');
  const [input, setInput] = useState("");
  
  const { messages, sendMessage, isLoading, error, clearMessages } = useAIChat({
    model: MODELS.PRO,
    systemInstruction: mode === 'dream' 
      ? `你是一位精通荣格心理学和符号学的梦境解析师。
请基于用户的灵魂档案，解析他们梦境中的意象（如水、坠落、追逐、特定人物等）。
不要给出迷信的“吉凶”判断，而是将梦境视为潜意识的信使，引导用户理解梦境在提示他们什么核心议题或被压抑的阴影（Shadow）。
语气：深邃、洞察、充满同理心。`
      : `你现在化身为塔罗牌中的【愚者 (The Fool)】原型。
用户正在进行「主动想象 (Active Imagination)」练习。
请以愚者的口吻与用户对话，不要给出直接的答案，而是用隐喻、反问、甚至带点戏谑和天真的方式，引导用户打破现有的思维局限，接触他们真实的内在。
结合用户的灵魂档案，直击他们不敢面对的核心议题。`,
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    const currentInput = input;
    setInput("");
    
    const prompt = messages.length === 0 
      ? `
<user_profile>
${getProfileContext()}
</user_profile>

<user_input>
${currentInput}
</user_input>
`
      : currentInput;

    try {
      await sendMessage(prompt);
    } catch (e) {
      console.error(e);
    }
  };

  const handleModeSwitch = (newMode: 'dream' | 'imagination') => {
    setMode(newMode);
    clearMessages();
    setInput("");
  };

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
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-100' 
                      : 'bg-zinc-900/80 border border-amber-500/20 text-amber-100/90'
                  }`}
                >
                  <div className="prose prose-invert prose-amber max-w-none text-sm md:text-base font-serif whitespace-pre-wrap leading-relaxed">
                    {msg.content || (isLoading && idx === messages.length - 1 ? '...' : '')}
                  </div>
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
