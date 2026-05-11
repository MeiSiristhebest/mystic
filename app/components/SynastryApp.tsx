import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, AlertCircle, Send } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAIChat } from "@/hooks/useAIChat";
import { generateDeck } from "@/lib/tarot-data";
import { useJourney } from "@/hooks/useJourney";
import BreathingLoading from "./BreathingLoading";
import MysticMarkdown from "./MysticMarkdown";
import { MODELS } from "@/lib/ai";

export default function SynastryApp() {
  const { profile, getProfileContext } = useUserProfile();
  const { addEntry } = useJourney();
  const [question, setQuestion] = useState("");
  const [reading, setReading] = useState("");
  const [drawnCards, setDrawnCards] = useState<any[]>([]);
  const { sendMessage, isLoading, error } = useAIChat({
    model: MODELS.PRO,
    systemInstruction: `<system>
<role>
你是一位精通东西方神秘学的「三才合参」大师。你能够将用户的【八字命理】、【星象人格】与当下的【塔罗潜意识投射】完美融合，给出一份不矛盾、高维度的综合解读。</role>
<tone_and_style>
深邃、包容、充满智慧，像一位认识用户多年的荣格派分析师。</tone_and_style>
</system>`,
  });

  const hasRequiredInfo = profile.birthDate && profile.birthTime;

  const handleSynastry = async () => {
    if (!question.trim()) return;
    
    const deck = generateDeck();
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map(card => ({
      ...card,
      isReversed: Math.random() > 0.5
    }));
    setDrawnCards(selected);

    const cardsText = selected.map((c, i) => `[${i+1}] ${c.name} (${c.isReversed ? '逆位' : '正位'})`).join(', ');
    
    const prompt = `
<instruction>
请基于用户的灵魂档案（包含八字、星象、荣格原型等）以及刚刚抽取的塔罗牌，进行深度「三才合参」解读。请不要生硬地罗列三种体系，而是将它们交织在一起，像一面跨越时间的镜子，照出用户当下的处境和未来的方向。</instruction>

<user_profile>
${getProfileContext()}
</user_profile>

<divination_context>
  <method>三才合参（八字 + 星象 + 塔罗）</method>
  <drawn_cards>
    ${cardsText}
  </drawn_cards>
</divination_context>

<user_question>
  ${question}
</user_question>

<thinking_process>
在给出最终解读前，请先在内部进行思考，并以 <thinking> 标签包裹你的思考过程（这部分对用户隐藏）：
1. 提取八字核心五行喜忌与当前流年流月的影响。2. 提取星象中与用户问题最相关的行运（Transit）或本命相位。3. 结合抽出的三张塔罗牌（过去、现在、未来或身心灵），看看牌面如何具象化了八字与星象的抽象能量。4. 寻找这三种体系的“共振点”，即它们都在指向的同一个核心议题。</thinking_process>

<output_format>
完成思考后，请输出最终的解读报告（使用Markdown，直接输出正文内容，无需将最终内容包裹在特定标签中，只要确保前面有 <thinking> 即可）。</output_format>
`;

    try {
      const response = await sendMessage(prompt);
      setReading(response);
      
      await addEntry({
        type: "synastry",
        title: `三才合参：${question.substring(0, 15)}...`,
        summary: response.substring(0, 100) + "...",
        details: {
          type: 'synastry',
          text: response,
          question,
          messages: [
            { role: 'user', content: question },
            { role: 'model', content: response }
          ]
        }
      });
    } catch (e) {
      console.error(e);
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

          {isLoading && (
            <div className="py-12">
              <BreathingLoading text="正在对齐星辰、八字与潜意识..." />
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-200 text-sm">
              {error}
            </div>
          )}

          {drawnCards.length > 0 && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-sm"
            >
              <h3 className="text-lg font-serif text-amber-300 mb-4 text-center">潜意识投射 (塔罗)</h3>
              <div className="flex justify-center gap-4 mb-6">
                {drawnCards.map((card, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-sm text-amber-200/80 mb-1">{['过去', '现在', '未来'][idx]}</div>
                    <div className="w-24 h-40 bg-zinc-800 border border-amber-500/30 rounded-lg flex items-center justify-center p-2 text-center">
                      <span className="text-amber-100 text-sm font-serif">
                        {card.name}<br/>
                        <span className="text-xs text-amber-500/80">{card.isReversed ? '(逆位)' : '(正位)'}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="prose prose-invert prose-amber max-w-none">
                <MysticMarkdown content={reading.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim()} />
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
