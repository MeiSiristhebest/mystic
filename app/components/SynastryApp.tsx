'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, AlertCircle, Send, Users, Compass, HeartHandshake, ShieldCheck, Flame, Scale, Clock } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAIChat } from "@/hooks/useAIChat";
import { generateDeck } from "@/lib/tarot-data";
import { useJourney } from "@/hooks/useJourney";
import BreathingLoading from "./BreathingLoading";
import MysticMarkdown from "./MysticMarkdown";
import { getSynastryPrompt, getVedicSynastryPrompt } from '@/lib/prompts';
import { SYNASTRY_PERSONA } from "@/lib/ai";
import { cryptoShuffle, getCryptoRandom } from "@/lib/random";
import { getVedicSynastryServerData } from "@/app/actions/aiActions";

export default function SynastryApp() {
  const { profile, getProfileContext } = useUserProfile();
  const [tab, setTab] = useState<'two_person' | 'tri_system'>('two_person');
  
  // Two person inputs
  const [nameA, setNameA] = useState(profile.name || "我");
  const [birthDateA, setBirthDateA] = useState(profile.birthDate || "1995-06-15");
  const [birthTimeA, setBirthTimeA] = useState(profile.birthTime || "10:30");

  const [nameB, setNameB] = useState("对方 / 合作伙伴");
  const [birthDateB, setBirthDateB] = useState("1996-08-20");
  const [birthTimeB, setBirthTimeB] = useState("14:00");
  const [twoPersonQuestion, setTwoPersonQuestion] = useState("");

  const [synastryMatrix, setSynastryMatrix] = useState<any>(null);

  // Tri-system inputs
  const [question, setQuestion] = useState("");
  const [drawnCards, setDrawnCards] = useState<any[]>([]);

  const { messages, sendMessage, isLoading, resetChat } = useAIChat({
    type: 'synastry',
    systemInstruction: SYNASTRY_PERSONA,
  });

  const handleTwoPersonSynastry = async () => {
    if (!birthDateA || !birthDateB) return;
    resetChat();
    setSynastryMatrix(null);

    try {
      const synastryResult = await getVedicSynastryServerData(
        birthDateA, birthTimeA, nameA,
        birthDateB, birthTimeB, nameB
      );
      setSynastryMatrix(synastryResult.matrix);

      const prompt = getVedicSynastryPrompt({
        matrixData: synastryResult.matrix,
        nameA,
        nameB,
        question: twoPersonQuestion || "我们双方在性格相处、情感承载力与未来运势发展上的深层契合度与暗礁",
        profileContext: getProfileContext(),
      });

      await sendMessage(prompt, {
        title: `双人六维合盘：${nameA} & ${nameB}`,
        details: {
          type: 'synastry',
          nameA,
          nameB,
          matrix: synastryResult.matrix
        }
      });
    } catch (e) {
      console.error("Vedic synastry calculation failed:", e);
    }
  };

  const handleTriSystem = async () => {
    if (!question.trim()) return;
    resetChat();

    const deck = generateDeck();
    const shuffled = cryptoShuffle(deck);
    const selected = shuffled.slice(0, 3).map(card => ({
      ...card,
      isReversed: getCryptoRandom() > 0.5
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-20">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-500 tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          命运合盘 · 六维共振矩阵
        </h1>
        <p className="text-amber-200/60 max-w-2xl mx-auto text-sm md:text-base font-serif">
          基于古印度吠陀合盘 (Ashtakoota) 与天纪合命法，从引力火花、相处承载力、价值观共振到大运时机全维透析。
        </p>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => { setTab('two_person'); resetChat(); setSynastryMatrix(null); }}
            className={`px-6 py-2.5 rounded-full text-xs font-serif tracking-widest transition-all cursor-pointer ${
              tab === 'two_person' 
                ? 'bg-amber-600 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                : 'bg-white/5 border border-white/10 text-amber-200/50 hover:text-amber-200'
            }`}
          >
            👥 双人六维合盘 (Synastry Matrix)
          </button>
          <button
            onClick={() => { setTab('tri_system'); resetChat(); }}
            className={`px-6 py-2.5 rounded-full text-xs font-serif tracking-widest transition-all cursor-pointer ${
              tab === 'tri_system' 
                ? 'bg-amber-600 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                : 'bg-white/5 border border-white/10 text-amber-200/50 hover:text-amber-200'
            }`}
          >
            🔮 单人天人地三才合参
          </button>
        </div>
      </div>

      {tab === 'two_person' ? (
        <div className="space-y-8">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-8 md:p-12 rounded-3xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Person A */}
                <div className="p-6 rounded-2xl bg-black/40 border border-amber-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 font-serif text-sm font-bold">
                    <Users className="w-4 h-4" />
                    <span>主体方信息 (Person A)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="姓名 / 称呼"
                    value={nameA}
                    onChange={(e) => setNameA(e.target.value)}
                    className="w-full bg-black/50 border border-amber-500/20 rounded-xl px-4 py-2.5 text-amber-100 text-sm font-serif"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={birthDateA}
                      onChange={(e) => setBirthDateA(e.target.value)}
                      className="bg-black/50 border border-amber-500/20 rounded-xl px-3 py-2.5 text-amber-100 text-xs font-serif"
                    />
                    <input
                      type="time"
                      value={birthTimeA}
                      onChange={(e) => setBirthTimeA(e.target.value)}
                      className="bg-black/50 border border-amber-500/20 rounded-xl px-3 py-2.5 text-amber-100 text-xs font-serif"
                    />
                  </div>
                </div>

                {/* Person B */}
                <div className="p-6 rounded-2xl bg-black/40 border border-amber-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 font-serif text-sm font-bold">
                    <HeartHandshake className="w-4 h-4" />
                    <span>合盘对方信息 (Person B)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="对方姓名 / 称呼"
                    value={nameB}
                    onChange={(e) => setNameB(e.target.value)}
                    className="w-full bg-black/50 border border-amber-500/20 rounded-xl px-4 py-2.5 text-amber-100 text-sm font-serif"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={birthDateB}
                      onChange={(e) => setBirthDateB(e.target.value)}
                      className="bg-black/50 border border-amber-500/20 rounded-xl px-3 py-2.5 text-amber-100 text-xs font-serif"
                    />
                    <input
                      type="time"
                      value={birthTimeB}
                      onChange={(e) => setBirthTimeB(e.target.value)}
                      className="bg-black/50 border border-amber-500/20 rounded-xl px-3 py-2.5 text-amber-100 text-xs font-serif"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-serif tracking-widest text-amber-500/60 uppercase">你最关切的合盘困惑 (如合作前景/情感波折)</label>
                <textarea
                  value={twoPersonQuestion}
                  onChange={(e) => setTwoPersonQuestion(e.target.value)}
                  placeholder="例如：我们彼此性格最大的雷区是什么？未来 3 年大运是否互补？"
                  rows={3}
                  className="w-full bg-black/40 border border-amber-500/20 rounded-xl p-4 text-amber-100 font-serif text-sm"
                />
              </div>

              <button
                onClick={handleTwoPersonSynastry}
                disabled={isLoading}
                className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-full font-serif text-base tracking-[0.3em] transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-40 cursor-pointer"
              >
                生成双人六维合盘矩阵
              </button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Synastry 4-Dimension Metric Cards */}
              {synastryMatrix && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-black/40 space-y-2">
                    <div className="flex items-center justify-between text-xs text-amber-400 font-serif">
                      <span className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-rose-400" /> 外在吸引火花</span>
                      <span className="font-bold text-amber-300">{synastryMatrix.attractionDynamics.level}</span>
                    </div>
                    <p className="text-xs text-amber-100/70 leading-relaxed font-serif">{synastryMatrix.attractionDynamics.analysis}</p>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-black/40 space-y-2">
                    <div className="flex items-center justify-between text-xs text-amber-400 font-serif">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 相处承载力</span>
                      <span className="font-bold text-amber-300">{synastryMatrix.containmentCapacity.frictionLevel}</span>
                    </div>
                    <p className="text-xs text-amber-100/70 leading-relaxed font-serif">{synastryMatrix.containmentCapacity.analysis}</p>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-black/40 space-y-2">
                    <div className="flex items-center justify-between text-xs text-amber-400 font-serif">
                      <span className="flex items-center gap-1.5"><Scale className="w-4 h-4 text-cyan-400" /> 价值观同频</span>
                      <span className="font-bold text-amber-300">{synastryMatrix.valueAlignment.direction}</span>
                    </div>
                    <p className="text-xs text-amber-100/70 leading-relaxed font-serif">{synastryMatrix.valueAlignment.analysis}</p>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-black/40 space-y-2">
                    <div className="flex items-center justify-between text-xs text-amber-400 font-serif">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-400" /> 大运时机共振</span>
                      <span className="font-bold text-amber-300">{synastryMatrix.dashaTimingResonance.resonance}</span>
                    </div>
                    <p className="text-xs text-amber-100/70 leading-relaxed font-serif">{synastryMatrix.dashaTimingResonance.analysis}</p>
                  </div>
                </div>
              )}

              <div className="glass-panel p-8 md:p-12 rounded-3xl">
                {isLoading && !messages.length ? (
                  <BreathingLoading text="正在计算双方恒星黄道星位、月宿配准与大运交叠..." />
                ) : (
                  <MysticMarkdown content={messages[0]?.content || ""} />
                )}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => { resetChat(); setSynastryMatrix(null); }}
                  className="px-8 py-3 border border-amber-500/30 text-amber-400 rounded-full font-serif text-sm hover:bg-amber-500/10 transition-all cursor-pointer"
                >
                  重新进行合盘推演
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Tri-System Single Person Analysis */
        <div className="space-y-8">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-8 md:p-12 rounded-3xl space-y-6">
              <div className="space-y-3">
                <label className="block text-xs font-serif tracking-widest text-amber-500/60 uppercase">心中的求问事项</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="描述你当下面临的人生瓶颈、关键抉择或困惑..."
                  rows={4}
                  className="w-full bg-black/40 border border-amber-500/20 rounded-xl p-4 text-amber-100 font-serif text-sm"
                />
              </div>

              <button
                onClick={handleTriSystem}
                disabled={isLoading || !question.trim()}
                className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-full font-serif text-base tracking-[0.3em] transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-40 cursor-pointer"
              >
                抽取命运塔罗 · 开启三才合参
              </button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <div className="glass-panel p-8 md:p-12 rounded-3xl">
                {isLoading && !messages.length ? (
                  <BreathingLoading text="正在融合八字五行、星盘与塔罗原型..." />
                ) : (
                  <MysticMarkdown content={messages[0]?.content || ""} />
                )}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => resetChat()}
                  className="px-8 py-3 border border-amber-500/30 text-amber-400 rounded-full font-serif text-sm hover:bg-amber-500/10 transition-all cursor-pointer"
                >
                  重新进行三才合参
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
