'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  User, 
  Calendar, 
  Clock, 
  Compass, 
  Brain, 
  Star,
  Save,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { calculateBazi, getZodiac, getSunSign } from '@/lib/metaphysics';

// MBTI Questions (Comprehensive 40-question version)
const MBTI_QUESTIONS = [
  { id: 1, text: "在社交聚会中，你通常：", options: [{ text: "待到很晚，并且越来越有精神", type: "E" }, { text: "早早离开，觉得精力被消耗", type: "I" }] },
  { id: 2, text: "你更关注：", options: [{ text: "眼前的事实和细节", type: "S" }, { text: "未来的可能性和隐藏的模式", type: "N" }] },
  { id: 3, text: "在做决定时，你主要依赖：", options: [{ text: "逻辑分析和客观事实", type: "T" }, { text: "个人价值观和他人的感受", type: "F" }] },
  { id: 4, text: "你的生活方式更倾向于：", options: [{ text: "有计划、有条理、按部就班", type: "J" }, { text: "随性、灵活、顺其自然", type: "P" }] },
  { id: 5, text: "你更喜欢：", options: [{ text: "广泛的社交圈，有很多朋友", type: "E" }, { text: "较小的社交圈，只有几个深交的知己", type: "I" }] },
  { id: 6, text: "你更喜欢哪种学习方式：", options: [{ text: "通过实际操作和具体例子", type: "S" }, { text: "通过理解概念和理论框架", type: "N" }] },
  { id: 7, text: "你认为哪种评价是对你更高的赞美：", options: [{ text: "“你非常有逻辑和理智”", type: "T" }, { text: "“你非常有同情心和人情味”", type: "F" }] },
  { id: 8, text: "在旅行前，你通常：", options: [{ text: "提前制定详细的行程和攻略", type: "J" }, { text: "只定个大概方向，到了再看", type: "P" }] },
  { id: 9, text: "遇到问题时，你倾向于：", options: [{ text: "与他人讨论来理清思路", type: "E" }, { text: "自己在内心深思熟虑", type: "I" }] },
  { id: 10, text: "你认为自己更像是一个：", options: [{ text: "务实、脚踏实地的人", type: "S" }, { text: "富有想象力、有远见的人", type: "N" }] },
  { id: 11, text: "在处理冲突时，你倾向于：", options: [{ text: "寻找公平、公正的解决方案，即使会伤人", type: "T" }, { text: "尽量维护和谐，照顾各方的情绪", type: "F" }] },
  { id: 12, text: "面对截止日期，你通常：", options: [{ text: "提前规划，按时或提前完成", type: "J" }, { text: "倾向于在最后时刻冲刺完成", type: "P" }] },
  { id: 13, text: "在新的环境中，你通常：", options: [{ text: "主动与陌生人交谈", type: "E" }, { text: "等待别人来找你搭话", type: "I" }] },
  { id: 14, text: "在描述一件事情时，你通常：", options: [{ text: "详细陈述具体发生的事实", type: "S" }, { text: "概括大意，强调整体印象", type: "N" }] },
  { id: 15, text: "你更看重：", options: [{ text: "真理和客观性", type: "T" }, { text: "和谐与人际关系", type: "F" }] },
  { id: 16, text: "你的工作空间通常是：", options: [{ text: "整洁有序，物品都有固定位置", type: "J" }, { text: "有些凌乱，但你自己能找到东西", type: "P" }] },
  { id: 17, text: "你的周末理想度过方式是：", options: [{ text: "参加热闹的活动或聚会", type: "E" }, { text: "独自在家看书、看电影或休息", type: "I" }] },
  { id: 18, text: "你更欣赏哪种人：", options: [{ text: "常识丰富、注重实际的人", type: "S" }, { text: "充满创意、思维跳跃的人", type: "N" }] },
  { id: 19, text: "当朋友向你诉苦时，你通常首先：", options: [{ text: "帮他们分析问题，提供解决建议", type: "T" }, { text: "给予情感上的支持，表达理解和同情", type: "F" }] },
  { id: 20, text: "你更喜欢：", options: [{ text: "把事情确定下来，做出决定", type: "J" }, { text: "保留多种选择，随时准备改变", type: "P" }] },
  { id: 21, text: "在团队合作中，你更喜欢：", options: [{ text: "积极发言，引导讨论", type: "E" }, { text: "倾听他人，在必要时才发表意见", type: "I" }] },
  { id: 22, text: "面对新任务，你倾向于：", options: [{ text: "按照已有的、被证明有效的方法去做", type: "S" }, { text: "尝试寻找新的、不同的方法", type: "N" }] },
  { id: 23, text: "你认为在工作中，更重要的是：", options: [{ text: "效率和任务的完成", type: "T" }, { text: "团队的氛围和成员的感受", type: "F" }] },
  { id: 24, text: "意外的改变会让你感到：", options: [{ text: "焦虑，打乱了你的计划", type: "J" }, { text: "兴奋，带来了新的可能性", type: "P" }] },
  { id: 25, text: "你觉得自己是：", options: [{ text: "容易接近，外向的人", type: "E" }, { text: "有点保留，内向的人", type: "I" }] },
  { id: 26, text: "你的注意力通常集中在：", options: [{ text: "此时此地，正在发生的事情", type: "S" }, { text: "未来可能发生的事情，以及事物的意义", type: "N" }] },
  { id: 27, text: "你的决策过程通常是：", options: [{ text: "冷静、客观、不带个人色彩的", type: "T" }, { text: "充满同理心、考虑对他人的影响的", type: "F" }] },
  { id: 28, text: "你更倾向于认为：", options: [{ text: "工作先于娱乐，做完事再玩", type: "J" }, { text: "工作和娱乐可以交替进行，享受过程", type: "P" }] },
  { id: 29, text: "工作时，你更喜欢：", options: [{ text: "充满互动和交流的环境", type: "E" }, { text: "安静、不被打扰的独立空间", type: "I" }] },
  { id: 30, text: "你更喜欢阅读哪类书籍：", options: [{ text: "纪实文学、传记或实用指南", type: "S" }, { text: "科幻、奇幻或哲学类书籍", type: "N" }] },
  { id: 31, text: "你更倾向于用什么来评判事物：", options: [{ text: "对与错，合理与不合理", type: "T" }, { text: "好与坏，喜欢与不喜欢", type: "F" }] },
  { id: 32, text: "在日常生活中，你更喜欢：", options: [{ text: "遵循固定的日程表和习惯", type: "J" }, { text: "每天都有不同的安排和惊喜", type: "P" }] },
  { id: 33, text: "表达想法时，你通常：", options: [{ text: "边说边想，脱口而出", type: "E" }, { text: "在脑海中组织好语言再说", type: "I" }] },
  { id: 34, text: "在做计划时，你更看重：", options: [{ text: "具体的操作步骤和可行性", type: "S" }, { text: "整体的愿景和长远目标", type: "N" }] },
  { id: 35, text: "在讨论问题时，你更容易：", options: [{ text: "坚持真理，哪怕引起争论", type: "T" }, { text: "为了避免伤害感情而妥协", type: "F" }] },
  { id: 36, text: "你更欣赏哪种工作态度：", options: [{ text: "严谨、守时、有始有终", type: "J" }, { text: "灵活、适应力强、善于变通", type: "P" }] },
  { id: 37, text: "经过一天的忙碌后，你如何恢复精力：", options: [{ text: "和朋友出去玩或聊天", type: "E" }, { text: "一个人独处，享受安静时光", type: "I" }] },
  { id: 38, text: "你认为哪种特质更重要：", options: [{ text: "准确和精确", type: "S" }, { text: "创新和灵感", type: "N" }] },
  { id: 39, text: "你认为自己是一个：", options: [{ text: "坚韧、讲求原则的人", type: "T" }, { text: "温和、体贴的人", type: "F" }] },
  { id: 40, text: "你觉得哪种状态更让你舒服：", options: [{ text: "事情已经解决，有了明确的结论", type: "J" }, { text: "事情还在发展中，充满未知", type: "P" }] },
  // Identity (A/T) Questions
  { id: 41, text: "面对压力和挑战时，你通常：", options: [{ text: "保持自信，相信自己能解决", type: "IdA" }, { text: "容易感到焦虑和自我怀疑", type: "IdT" }] },
  { id: 42, text: "对于自己做出的决定，你通常：", options: [{ text: "很少后悔，坚信自己的选择", type: "IdA" }, { text: "经常反思，担心做错决定", type: "IdT" }] },
  { id: 43, text: "你如何看待自己的能力：", options: [{ text: "充满自信，清楚自己的价值", type: "IdA" }, { text: "觉得自己还有很多不足，需要不断证明自己", type: "IdT" }] },
  { id: 44, text: "面对过去的错误，你倾向于：", options: [{ text: "很快放下，吸取教训向前看", type: "IdA" }, { text: "经常回想，感到内疚或遗憾", type: "IdT" }] },
];

// Enneagram Questions (Core Fear/Desire based)
const ENNEAGRAM_QUESTIONS = [
  { id: "1", text: "我追求完美，害怕犯错，总是努力做正确的事。", type: "1号 完美主义者" },
  { id: "2", text: "我渴望被爱和被需要，总是乐于助人，害怕被拒绝。", type: "2号 给予者" },
  { id: "3", text: "我追求成功和成就，害怕失败和变得平庸。", type: "3号 实干者" },
  { id: "4", text: "我渴望独特和真实，害怕变得普通和有缺陷。", type: "4号 浪漫主义者" },
  { id: "5", text: "我渴望知识和理解，害怕无能和被外界侵扰。", type: "5号 观察者" },
  { id: "6", text: "我追求安全和稳定，害怕失去支持和指引。", type: "6号 怀疑论者" },
  { id: "7", text: "我渴望快乐和新鲜感，害怕被剥夺和陷入痛苦。", type: "7号 享乐主义者" },
  { id: "8", text: "我追求掌控和独立，害怕被控制和受到伤害。", type: "8号 保护者" },
  { id: "9", text: "我渴望和平与和谐，害怕冲突和失去联系。", type: "9号 调停者" }
];

const ARCHETYPES = [
  "天真者 (The Innocent)", "孤儿 (The Orphan)", "战士 (The Warrior)", "照顾者 (The Caregiver)",
  "寻求者 (The Seeker)", "破坏者 (The Destroyer)", "爱人 (The Lover)", "创造者 (The Creator)",
  "愚者 (The Fool)", "智者 (The Sage)", "魔术师 (The Magician)", "统治者 (The Ruler)"
];

export default function DiscoveryView({ onComplete }: { onComplete?: () => void }) {
  const { profile, updateProfile, isLoaded } = useUserProfile();
  const [step, setStep] = useState(1); // 1: Intro, 2: Basic Info, 3: MBTI, 4: Enneagram, 5: Archetype, 6: Summary
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
  const [prevProfile, setPrevProfile] = useState(profile);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [archetypeAnalysis, setArchetypeAnalysis] = useState("");

  // Sync state when profile loads/changes (React 19 pattern)
  if (isLoaded && profile !== prevProfile) {
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
  }

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-[60vh] text-amber-500/60">正在读取灵魂档案...</div>;
  }

  // Calculate MBTI
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

  // AI Archetype Exploration
  const exploreArchetype = async () => {
    setIsAnalyzing(true);
    try {
      const { res: mbti, identity } = calculateMBTI();
      const bazi = calculateBazi(formData.birthDate, formData.birthTime);
      const sunSign = getSunSign(new Date(formData.birthDate));
      
      const promptText = `
        作为一名深层心理学专家、荣格分析师及神秘学导师，请根据以下用户信息，帮助他探索其“核心人格原型（Jungian Archetype）”。
        
        用户信息：
        - 姓名: ${formData.name}
        - 性别: ${formData.gender}
        - MBTI: ${mbti}${identity}
        - 九型人格: ${enneagramAnswer}
        - 八字: ${bazi}
        - 太阳星座: ${sunSign}
        
        请提供一段约250字的深度分析，探讨其性格中的阴影与光明，灵魂的渴望与恐惧，并从以下12个原型中推荐一个最契合的：
        ${ARCHETYPES.join(", ")}
        
        请以温暖、神秘、充满洞察力且富有文学美感的口吻回答。
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
    
    // Final step
    setStep(6);
  };

  const progress = (step / 6) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 min-h-[60vh] flex flex-col">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/5 rounded-full mb-12 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300"
        />
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
            key="basic-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <User className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-light text-amber-100">第一步：生命基石</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-amber-500/60">姓名/昵称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/40 border border-amber-500/20 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500/50 outline-none transition-all"
                  placeholder="如何称呼你？"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-amber-500/60">性别</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-black/40 border border-amber-500/20 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500/50 outline-none transition-all appearance-none"
                >
                  <option value="">选择性别</option>
                  <option value="男">乾 (男)</option>
                  <option value="女">坤 (女)</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-amber-500/60">出生日期</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full bg-black/40 border border-amber-500/20 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500/50 outline-none transition-all [color-scheme:dark]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-amber-500/60">出生时间</label>
                <input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  className="w-full bg-black/40 border border-amber-500/20 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500/50 outline-none transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex justify-between pt-8">
              <button onClick={() => setStep(1)} className="text-amber-500/60 hover:text-amber-500 flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> 返回
              </button>
              <button
                disabled={!formData.name || !formData.birthDate}
                onClick={() => setStep(3)}
                className="px-8 py-3 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-500/30 transition-all"
              >
                下一步
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="mbti"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-light text-amber-100">第二步：心理镜像 (MBTI)</h3>
              </div>
              <span className="text-xs text-amber-500/60 font-mono">
                {Object.keys(answers).length} / {MBTI_QUESTIONS.length}
              </span>
            </div>

            <div className="space-y-12 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
              {MBTI_QUESTIONS.map((q) => (
                <div key={q.id} className="space-y-4">
                  <p className="text-amber-100/90 font-light">{q.id}. {q.text}</p>
                  <div className="grid grid-cols-1 gap-3">
                    {q.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAnswers({ ...answers, [q.id]: opt.type })}
                        className={`text-left px-6 py-4 rounded-xl border transition-all ${
                          answers[q.id] === opt.type
                            ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                            : "bg-black/20 border-amber-500/10 text-amber-100/60 hover:border-amber-500/30"
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-8 border-t border-amber-500/10">
              <button onClick={() => setStep(2)} className="text-amber-500/60 hover:text-amber-500 flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> 返回
              </button>
              <button
                disabled={Object.keys(answers).length < MBTI_QUESTIONS.length}
                onClick={() => {
                  calculateMBTI();
                  setStep(4);
                }}
                className="px-8 py-3 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-500/30 transition-all"
              >
                下一步
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="enneagram"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-light text-amber-100">第三步：核心恐惧与渴望 (九型人格)</h3>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-amber-100/60 text-sm">请选择最符合你内心深处真实写照的一句话：</p>
              <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {ENNEAGRAM_QUESTIONS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setEnneagramAnswer(q.type)}
                    className={`text-left px-6 py-4 rounded-xl border transition-all ${
                      enneagramAnswer === q.type
                        ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        : "bg-black/20 border-amber-500/10 text-amber-100/60 hover:border-amber-500/30"
                    }`}
                  >
                    {q.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-8 border-t border-amber-500/10">
              <button onClick={() => setStep(3)} className="text-amber-500/60 hover:text-amber-500 flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> 返回
              </button>
              <button
                disabled={!enneagramAnswer}
                onClick={() => {
                  setStep(5);
                  exploreArchetype();
                }}
                className="px-8 py-3 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-500/30 transition-all"
              >
                探索原型
              </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="archetype"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-light text-amber-100">第四步：原型觉醒</h3>
            </div>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                  <Compass className="absolute inset-0 m-auto w-6 h-6 text-amber-500 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-amber-200 animate-pulse">正在链接集体无意识...</p>
                  <p className="text-xs text-amber-500/40">融合 MBTI 与星象能量中</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-amber-500/60">AI 推荐原型</span>
                    <span className="px-3 py-1 bg-amber-500/20 rounded-full text-xs text-amber-400 border border-amber-500/30">
                      {selectedArchetype}
                    </span>
                  </div>
                  <p className="text-amber-100/80 text-sm leading-relaxed italic">
                    “{archetypeAnalysis}”
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-xs uppercase tracking-widest text-amber-500/60">你感应最深的原型是？</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ARCHETYPES.map((arch) => (
                      <button
                        key={arch}
                        onClick={() => setSelectedArchetype(arch)}
                        className={`text-xs px-4 py-3 rounded-lg border transition-all ${
                          selectedArchetype === arch
                            ? "bg-amber-500/20 border-amber-500 text-amber-200"
                            : "bg-black/20 border-amber-500/10 text-amber-100/60 hover:border-amber-500/30"
                        }`}
                      >
                        {arch}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-8">
                  <button onClick={() => setStep(4)} className="text-amber-500/60 hover:text-amber-500 flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> 返回
                  </button>
                  <button
                    disabled={!selectedArchetype}
                    onClick={handleComplete}
                    className="px-8 py-3 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-500/30 transition-all flex items-center gap-2"
                  >
                    完成探索 <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 6 && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-12 py-8"
          >
            <div className="space-y-4">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
                <CheckCircle2 className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-3xl font-light tracking-widest text-amber-100">探索完成</h2>
              <p className="text-amber-200/60">你的灵魂档案已更新，所有模块已同步。</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-black/40 border border-amber-500/10 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-amber-500/40">MBTI</span>
                <p className="text-amber-200 font-mono text-lg">{mbtiResult}{mbtiIdentity}</p>
              </div>
              <div className="bg-black/40 border border-amber-500/10 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-amber-500/40">九型人格</span>
                <p className="text-amber-200 text-sm">{enneagramAnswer.split(' ')[0]}</p>
              </div>
              <div className="bg-black/40 border border-amber-500/10 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-amber-500/40">核心原型</span>
                <p className="text-amber-200 text-sm">{selectedArchetype.split(' ')[0]}</p>
              </div>
              <div className="bg-black/40 border border-amber-500/10 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-amber-500/40">星座</span>
                <p className="text-amber-200 text-sm">{getSunSign(new Date(formData.birthDate))}</p>
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 text-xs text-amber-500/60 font-mono">
              八字：{calculateBazi(formData.birthDate, formData.birthTime)}
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => onComplete ? onComplete() : window.location.reload()}
                className="px-12 py-4 bg-amber-500 text-black font-medium rounded-full hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)]"
              >
                进入神秘世界
              </button>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-amber-500/60 hover:text-amber-500 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> 重新探索
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
