import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, AlertCircle, Send } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAIChat } from "@/hooks/useAIChat";
import { generateDeck } from "@/lib/tarot-data";
import { useJourney } from "@/hooks/useJourney";
import BreathingLoading from "./BreathingLoading";
import MysticMarkdown from "./MysticMarkdown";
import { getSynastryPrompt } from '@/lib/prompts';
import { MODELS, SYNASTRY_PERSONA } from "@/lib/ai";

export default function SynastryApp() {
  const { profile, getProfileContext } = useUserProfile();
  const { addEntry, updateEntry } = useJourney();
  const [question, setQuestion] = useState("");
  const [reading, setReading] = useState("");
  const [drawnCards, setDrawnCards] = useState<any[]>([]);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);

  const { sendMessage, isLoading, error } = useAIChat({
    type: 'synastry',
    model: MODELS.PRO,
    systemInstruction: SYNASTRY_PERSONA,
  });

  const hasRequiredInfo = profile.birthDate && profile.birthTime;

  const handleSynastry = async () => {
    if (!question.trim()) return;
    
    setMessages([]);
    setReading("");
    setCurrentEntryId(null);

    const deck = generateDeck();
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map(card => ({
      ...card,
      isReversed: Math.random() > 0.5
    }));
    setDrawnCards(selected);

    const cardsText = selected.map((c, i) => `[${i+1}] ${c.name} (${c.isReversed ? '逆位' : '正位'})`).join(', ');
    
    const prompt = getSynastryPrompt({
      question,
      profileContext: getProfileContext(),
      cardsText
    });

    try {
      await sendMessage(prompt, {
        title: `三才合参：${question.substring(0, 15)}...`,
        details: {
          type: 'synastry',
          question,
          cards: selected
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !currentEntryId) return;

    const userMsg = inputMessage;
    setInputMessage("");
    setIsAskingFollowUp(true);

    try {
      const contextPin = `[系统提醒：当前正在进行命运三才合参的追问。请结合用户的八字、星象与所抽取的塔罗牌回答。]`;
      await sendMessage(`${contextPin}\n\n${userMsg}`, undefined, undefined, userMsg);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-500 tracking-widest mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          命运合盘 (Destiny Synastry)
        </h1>
        <p className="text-amber-200/60 max-w-2xl mx-auto text-sm md:text-base">
          打破孤岛，融合东方八字、西方星象与塔罗潜意识，为你提供统一的高维度解读。
        </p>
      </div>

      {!hasRequiredInfo ? (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-serif text-amber-300 mb-2">需要完善灵魂档案</h3>
          <p className="text-amber-100/70 text-sm mb-4">
            命运合盘需要您的出生日期和时间来进行精准的八字与星象推演。请在右上角「档案」中完善信息。
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {messages.length === 0 && !isLoading ? (
            <div className="bg-black/40 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <label className="block text-sm font-medium text-amber-200/80 mb-2">
                你现在站在哪里？你想问什么？
              </label>
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="描述你当下的处境、困惑或选择..."
                  className="w-full bg-black/50 border border-amber-500/30 rounded-xl pl-4 pr-12 py-3 text-amber-100 placeholder-amber-100/30 focus:outline-none focus:border-amber-500/60 transition-colors min-h-[100px] resize-none"
                />
                <button
                  onClick={handleSynastry}
                  disabled={isLoading || !question.trim()}
                  className="absolute right-3 bottom-3 p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 pb-20">
              <div className="bg-black/40 border border-amber-500/20 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
                <div className="flex flex-col space-y-12">
                  {drawnCards.length > 0 && (
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-serif text-amber-300 mb-4 text-center">潜意识投射 (塔罗)</h3>
                      <div className="flex justify-center gap-4">
                        {drawnCards.map((card, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-xs text-amber-200/60 mb-1">{['过去', '现在', '未来'][idx]}</div>
                            <div className="w-20 h-32 md:w-24 md:h-40 bg-zinc-800 border border-amber-500/30 rounded-lg flex items-center justify-center p-2 text-center">
                              <span className="text-amber-100 text-xs md:text-sm font-serif leading-tight">
                                {card.name}<br/>
                                <span className="text-[10px] md:text-xs text-amber-500/80">{card.isReversed ? '(逆位)' : '(正位)'}</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-8">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-center'}`}>
                        <div className={`max-w-[95%] md:max-w-[85%] rounded-2xl p-6 ${
                          msg.role === 'user' 
                            ? 'bg-amber-900/40 border border-amber-500/30 text-amber-100' 
                            : 'bg-black/20 markdown-body w-full'
                        }`}>
                          {msg.role === 'model' ? (
                            <MysticMarkdown content={msg.content.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim()} />
                          ) : (
                            <p className="font-serif text-lg">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isAskingFollowUp && (
                      <div className="flex justify-center">
                        <BreathingLoading text="阿卡夏正在为您深入推演..." />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isLoading && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-40">
                  <form onSubmit={handleSendMessage} className="relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="继续探索这份合盘的深意..."
                      className="w-full bg-black/60 border border-amber-500/40 rounded-full py-4 pl-6 pr-16 text-amber-100 placeholder-amber-100/30 focus:outline-none focus:border-amber-500 transition-all backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isAskingFollowUp}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full transition-colors disabled:opacity-50"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {isLoading && messages.length === 0 && (
            <div className="py-12">
              <BreathingLoading text="正在对齐星辰、八字与潜意识..." />
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
