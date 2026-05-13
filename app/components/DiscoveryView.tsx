"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Compass, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  Target,
  Crown,
  Zap,
  Shield,
  Heart,
  Brain,
  Star,
  RefreshCw
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { calculateBazi, getZodiac, getSunSign } from "@/lib/metaphysics";
import BreathingLoading from "./BreathingLoading";
import MysticMarkdown from "./MysticMarkdown";

const ENNEAGRAM_TEST = [
  { id: "1", text: "我倾向于追求完美，对自己和他人要求都很高。", type: "1号 改革者" },
  { id: "2", text: "我对他人的需求非常敏感，喜欢帮助和照顾别人。", type: "2号 助人者" },
  { id: "3", text: "我很看重成就和形象，希望在别人眼中是成功的。", type: "3号 成就者" },
  { id: "4", text: "我觉得自己是独特的，经常沉浸在深层的情感中。", type: "4号 个人主义者" },
  { id: "5", text: "我喜欢观察和思考，渴望掌握知识以获得安全感。", type: "5号 理智者" },
  { id: "6", text: "我容易感到焦虑，总是预见潜在的危险并寻找保障。", type: "6号 忠诚者" },
  { id: "7", text: "我追求快乐和多样性，讨厌被束缚或感到痛苦。", type: "7号 活跃者" },
  { id: "8", text: "我追求力量和控制权，不喜欢表现出软弱的一面。", type: "8号 挑战者" },
  { id: "9", text: "我渴望和平与和谐，害怕冲突和失去联系。", type: "9号 调停者" }
];

const ARCHETYPES = [
  "天真者 (The Innocent)", "孤儿 (The Orphan)", "战士 (The Warrior)", "照顾者 (The Caregiver)",
  "寻求者 (The Seeker)", "破坏者 (The Destroyer)", "爱人 (The Lover)", "创造者 (The Creator)",
  "愚者 (The Fool)", "智者 (The Sage)", "魔术师 (The Magician)", "统治者 (The Ruler)"
];

const getStepColor = (step: number) => {
  switch (step) {
    case 1: return "from-amber-900/40 via-orange-900/20 to-transparent";
    case 2: return "from-amber-600/30 via-yellow-900/10 to-transparent";
    case 3: return "from-teal-900/40 via-blue-900/20 to-transparent";
    case 4: return "from-indigo-900/40 via-purple-900/20 to-transparent";
    case 5: return "from-amber-500/30 via-white/5 to-transparent";
    case 6: return "from-purple-900/40 via-amber-900/20 to-transparent";
    default: return "from-amber-900/20 to-transparent";
  }
};

export default function DiscoveryView({ onComplete }: { onComplete?: () => void }) {
  const { profile, updateProfile, isLoaded } = useUserProfile();
  const [step, setStep] = useState(1); 
  const [enneagramAnswer, setEnneagramAnswer] = useState(profile.enneagram || "");
  const [mbtiResult, setMbtiResult] = useState(profile.mbti || "");
  const [mbtiIdentity, setMbtiIdentity] = useState(profile.mbtiIdentity || "");
  const [selectedArchetype, setSelectedArchetype] = useState(profile.jungianArchetype || "");
  const [formData, setFormData] = useState({
    name: profile.name || "",
    gender: profile.gender || "",
    birthDate: profile.birthDate || "",
    birthTime: profile.birthTime || "",
    birthPlace: profile.birthPlace || ""
  });
  const [prevProfile, setPrevProfile] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [archetypeAnalysis, setArchetypeAnalysis] = useState("");

  useEffect(() => {
    if (isLoaded && profile !== prevProfile) {
      const timer = setTimeout(() => {
        if (profile.name && profile.mbti && profile.jungianArchetype && step < 6) {
          setStep(6);
        }
        setEnneagramAnswer(profile.enneagram || "");
        setMbtiResult(profile.mbti || "");
        setMbtiIdentity(profile.mbtiIdentity || "");
        setSelectedArchetype(profile.jungianArchetype || "");
        setFormData({
          name: profile.name || "",
          gender: profile.gender || "",
          birthDate: profile.birthDate || "",
          birthTime: profile.birthTime || "",
          birthPlace: profile.birthPlace || ""
        });
        setPrevProfile(profile);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, profile, prevProfile, step]);

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-[60vh] text-amber-500/60">正在读取灵魂档案...</div>;
  }

  const calculateMBTI = () => {
    const counts: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0, IdA: 0, IdT: 0 };
    Object.values(answers).forEach(type => {
      if (counts[type] !== undefined) counts[type]++;
    });
    
    const res = [
      counts.E >= counts.I ? "E" : "I",
      counts.S >= counts.N ? "S" : "N",
      counts.T >= counts.F ? "T" : "F",
      counts.J >= counts.P ? "J" : "P"
    ].join("");
    
    const identity = counts.IdA >= counts.IdT ? "-A" : "-T";
    
    setMbtiResult(res);
    setMbtiIdentity(identity);
    return { res, identity };
  };

  const exploreArchetype = async () => {
    setIsAnalyzing(true);
    try {
      const { res: mbti, identity } = calculateMBTI();
      const bazi = calculateBazi(formData.birthDate, formData.birthTime);
      const sunSign = getSunSign(new Date(formData.birthDate));
      
      const promptText = `
        作为一名深层心理学专家、荣格分析师及神秘学导师，请根据以下用户信息，帮助他探索其“核心人格原型（Jungian Archetype）”：
        用户信息：
        - 姓名: ${formData.name}
        - 性别: ${formData.gender}
        - MBTI: ${mbti}${identity}
        - 九型人格: ${enneagramAnswer}
        - 八字: ${bazi}
        - 太阳星座: ${sunSign}
        
        请提供一段约250字的深度分析，探讨其性格中的阴影与光明，灵魂的渴望与恐惧，并从以下12个原型中推荐一个最契合的：
        ${ARCHETYPES.join(", ")}
        
        最后请以 JSON 格式返回推荐的原型名称，格式为：{"recommendation": "原型名称", "analysis": "分析内容"}
      `;

      const resObj = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction: "你是一位深层心理学专家、荣格分析师及神秘学导师。",
          config: { responseMimeType: "application/json" }
        })
      });

      if (!resObj.ok) throw new Error("API request failed");
      
      const reader = resObj.body?.getReader();
      let responseText = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        responseText += new TextDecoder().decode(value);
      }

      const result = JSON.parse(responseText || "{}");
      setArchetypeAnalysis(result.analysis);
      setSelectedArchetype(result.recommendation);
    } catch (err) {
      console.error("Archetype exploration failed:", err);
      setArchetypeAnalysis("星象运行受阻，请稍后再试。你可以先手动选择一个你感应最深的原型。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleComplete = () => {
    const { res: mbti, identity: mbtiIdentity } = calculateMBTI();
    const bazi = calculateBazi(formData.birthDate, formData.birthTime);
    const zodiac = formData.birthDate ? getZodiac(new Date(formData.birthDate).getFullYear()) : "";
    
    updateProfile({
      ...formData,
      mbti,
      mbtiIdentity,
      enneagram: enneagramAnswer,
      bazi,
      zodiac,
      jungianArchetype: selectedArchetype
    });
    
    setStep(6);
    if (onComplete) onComplete();
  };

  const progress = (step / 6) * 100;

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Energy Field Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
          className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 ${getStepColor(step)}`}
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(252,211,77,0.1)_0%,transparent_60%)]"
        />
        <div className="absolute inset-0 bg-[#080510]/40 backdrop-blur-[4px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Subtle Progress Header */}
        <div className="flex flex-col items-center justify-center mb-16 opacity-40 space-y-4">
          <div className="flex gap-1">
            {[1,2,3,4,5,6].map(s => (
              <div key={s} className={`h-1 rounded-full transition-all duration-500 ${s <= step ? 'w-12 bg-amber-500' : 'w-4 bg-white/10'}`} />
            ))}
          </div>
          <span className="text-[10px] font-serif tracking-[0.3em] uppercase text-amber-500/60">Soul Registry • {step}/6</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8 py-12"
            >
              <div className="relative inline-block">
                <div className="absolute -inset-4 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
                <Compass className="w-20 h-20 text-amber-500 relative" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-light tracking-widest text-amber-100">开启灵魂探索</h2>
                <p className="text-amber-200/60 leading-relaxed max-w-md mx-auto">
                  通过 MBTI 心理测验、生辰八字推算与荣格原型探索，全方位打通你的生命图谱，发现潜藏在深处的真实自我。
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="group flex items-center gap-3 px-8 py-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 transition-all mx-auto"
              >
                开始探索 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="enneagram"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4 mb-12">
                <Target className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="text-2xl font-light text-amber-100 tracking-widest">第一步：核心倾向</h3>
                <p className="text-amber-100/40 text-sm">选择最符合你内心直觉的性格底色</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ENNEAGRAM_TEST.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setEnneagramAnswer(item.type);
                      setStep(3);
                    }}
                    className={`p-6 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                      enneagramAnswer === item.type 
                        ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                        : 'bg-white/5 border-white/10 hover:border-amber-500/50'
                    }`}
                  >
                    <span className="text-sm text-amber-100/80 leading-relaxed relative z-10">{item.text}</span>
                    <div className="absolute bottom-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Sparkles className="w-12 h-12 text-amber-500" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="basic-info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4 mb-12">
                <User className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="text-2xl font-light text-amber-100 tracking-widest">第二步：生命基石</h3>
                <p className="text-amber-100/40 text-sm">这些数据将决定你的八字与占星初见</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 p-8 rounded-3xl border border-white/10">
                <div className="space-y-3">
                  <label className="text-xs font-serif text-amber-500/60 uppercase tracking-widest">姓名</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="你的尊称"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-serif text-amber-500/60 uppercase tracking-widest">性别</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-500/50 transition-all appearance-none"
                  >
                    <option value="">请选择</option>
                    <option value="male">乾 (男)</option>
                    <option value="female">坤 (女)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-serif text-amber-500/60 uppercase tracking-widest">出生日期</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-serif text-amber-500/60 uppercase tracking-widest">出生时间</label>
                  <input
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => setFormData({...formData, birthTime: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>
              </div>
              
              <div className="flex justify-between pt-8">
                <button onClick={() => setStep(2)} className="text-amber-500/60 hover:text-amber-500 transition-colors flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> 上一步
                </button>
                <button 
                  onClick={() => setStep(4)}
                  disabled={!formData.name || !formData.birthDate}
                  className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full transition-all disabled:opacity-30 flex items-center gap-2"
                >
                  下一步 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="mbti"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <Brain className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="text-2xl font-light text-amber-100 tracking-widest">第三步：心智维度</h3>
                <p className="text-amber-100/40 text-sm">这些直觉判断将揭示你的 MBTI 属性</p>
              </div>

              <div className="space-y-12">
                {[
                  { q: "在社交场合，你通常是：", options: [{ l: "精力充沛，主动交流", v: "E" }, { l: "静观其变，保留能量", v: "I" }] },
                  { q: "面对新事物，你更关注：", options: [{ l: "当下的细节和事实", v: "S" }, { l: "未来的可能性和联系", v: "N" }] },
                  { q: "做决定时，你更倾向于：", options: [{ l: "客观逻辑和分析", v: "T" }, { l: "个人价值和他人感受", v: "F" }] },
                  { q: "你的生活方式更接近：", options: [{ l: "井然有序，提前计划", v: "J" }, { l: "随遇而安，保持灵活", v: "P" }] }
                ].map((item, i) => (
                  <div key={i} className="space-y-6">
                    <p className="text-lg text-amber-100/90 font-serif">{item.q}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.options.map(opt => (
                        <button
                          key={opt.v}
                          onClick={() => setAnswers({...answers, [i]: opt.v})}
                          className={`p-6 rounded-2xl border transition-all text-left ${
                            answers[i] === opt.v 
                              ? 'bg-amber-500/20 border-amber-500' 
                              : 'bg-white/5 border-white/10 hover:border-amber-500/30'
                          }`}
                        >
                          <span className="text-sm text-amber-100/80">{opt.l}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-8">
                <button onClick={() => setStep(3)} className="text-amber-500/60 hover:text-amber-500 transition-colors flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> 上一步
                </button>
                <button 
                  onClick={() => {
                    calculateMBTI();
                    setStep(5);
                  }}
                  disabled={Object.keys(answers).length < 4}
                  className="px-10 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full transition-all disabled:opacity-30"
                >
                  探索荣格原型
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="archetype"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4 mb-12">
                <Crown className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="text-2xl font-light text-amber-100 tracking-widest">终章：原型探索</h3>
                <p className="text-amber-100/40 text-sm">通过多维数据，召唤你灵魂深处的荣格原型</p>
              </div>

              <div className="bg-black/40 border border-amber-500/20 rounded-[40px] p-8 md:p-12 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)]" />
                
                {!archetypeAnalysis ? (
                  <div className="text-center space-y-8 relative z-10">
                    <div className="flex justify-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center animate-bounce">
                        <Star className="w-6 h-6 text-amber-500" />
                      </div>
                    </div>
                    <p className="text-amber-100/60 font-serif italic">准备好面对你真实的倒影了吗？</p>
                    <button 
                      onClick={exploreArchetype}
                      disabled={isAnalyzing}
                      className="px-12 py-4 bg-amber-600 text-white rounded-full font-serif tracking-widest hover:bg-amber-500 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                    >
                      {isAnalyzing ? "正在解析群星的旨意..." : "召唤我的原型"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8 relative z-10">
                    <div className="flex items-center gap-4 border-b border-amber-500/20 pb-6">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-amber-500" />
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-500/60 uppercase tracking-[0.3em]">深度觉察</span>
                        <h4 className="text-2xl font-serif text-amber-200">{selectedArchetype}</h4>
                      </div>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto pr-4 scrollbar-thin">
                       <MysticMarkdown content={archetypeAnalysis} />
                    </div>

                    <div className="pt-6 flex justify-center">
                      <button 
                        onClick={handleComplete}
                        className="px-12 py-4 bg-amber-600 text-white rounded-full font-serif tracking-widest hover:bg-amber-500 transition-all"
                      >
                        铭刻灵魂档案
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-12 py-20"
            >
              <div className="relative inline-block">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -inset-10 bg-amber-500/20 blur-3xl rounded-full" 
                />
                <Shield className="w-24 h-24 text-amber-500 relative" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-light text-amber-100 tracking-[0.3em]">档案已铭刻</h2>
                <p className="text-amber-100/60 font-serif italic">“你的名字已被记录在阿卡夏的长卷中。”</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {[
                  { l: "MBTI", v: `${mbtiResult}${mbtiIdentity}`, i: Brain },
                  { l: "九型", v: enneagramAnswer, i: Target },
                  { l: "原型", v: selectedArchetype.split(" ")[0], i: Crown },
                  { l: "太阳", v: formData.birthDate ? getSunSign(new Date(formData.birthDate)) : "未知", i: Star }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-2">
                    <item.i className="w-5 h-5 text-amber-500/40 mx-auto" />
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">{item.l}</p>
                    <p className="text-sm text-amber-200 font-serif">{item.v}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onComplete ? onComplete() : window.location.reload()}
                className="px-12 py-4 bg-amber-600 text-white rounded-full font-serif tracking-widest hover:bg-amber-500 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)]"
              >
                进入神秘世界
              </button>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  </div>
);
}
