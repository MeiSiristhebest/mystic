'use client';

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Star,
  Moon,
  Sun,
  Compass,
  Users,
  Sparkles,
  Send,
  Download,
  Clock,
  ChevronRight,
} from "lucide-react";
import MysticMarkdown from "./MysticMarkdown";
import { getAstrologyPrompt } from '@/lib/prompts';
import { usePosterGenerator } from '@/hooks/usePosterGenerator';
import { useAIStream } from '@/hooks/useAIStream';
import { useAIChat } from '@/hooks/useAIChat';
import { getZodiacFromLongitude } from '@/lib/astrology';
import { getStarChartData } from '@/app/actions/aiActions';
import BreathingLoading from "./BreathingLoading";
import { useJourney } from "@/hooks/useJourney";
import { useUserProfile } from "@/hooks/useUserProfile";
import { MODELS } from '@/lib/ai';

const ZODIAC_SIGNS = [
  { id: "aries", name: "白羊座", element: "火", dates: "3.21-4.19" },
  { id: "taurus", name: "金牛座", element: "土", dates: "4.20-5.20" },
  { id: "gemini", name: "双子座", element: "风", dates: "5.21-6.21" },
  { id: "cancer", name: "巨蟹座", element: "水", dates: "6.22-7.22" },
  { id: "leo", name: "狮子座", element: "火", dates: "7.23-8.22" },
  { id: "virgo", name: "处女座", element: "土", dates: "8.23-9.22" },
  { id: "libra", name: "天秤座", element: "风", dates: "9.23-10.23" },
  { id: "scorpio", name: "天蝎座", element: "水", dates: "10.24-11.22" },
  { id: "sagittarius", name: "射手座", element: "火", dates: "11.23-12.21" },
  { id: "capricorn", name: "摩羯座", element: "土", dates: "12.22-1.19" },
  { id: "aquarius", name: "水瓶座", element: "风", dates: "1.20-2.18" },
  { id: "pisces", name: "双鱼座", element: "水", dates: "2.19-3.20" },
];

const MBTI_TYPES = [
  { id: "INTJ", name: "INTJ 建筑师", group: "分析家" },
  { id: "INTP", name: "INTP 逻辑学家", group: "分析家" },
  { id: "ENTJ", name: "ENTJ 指挥官", group: "分析家" },
  { id: "ENTP", name: "ENTP 辩论家", group: "分析家" },
  { id: "INFJ", name: "INFJ 提倡者", group: "外交家" },
  { id: "INFP", name: "INFP 调解员", group: "外交家" },
  { id: "ENFJ", name: "ENFJ 主人公", group: "外交家" },
  { id: "ENFP", name: "ENFP 竞选者", group: "外交家" },
  { id: "ISTJ", name: "ISTJ 物流师", group: "守护者" },
  { id: "ISFJ", name: "ISFJ 守卫者", group: "守护者" },
  { id: "ESTJ", name: "ESTJ 总管", group: "守护者" },
  { id: "ESFJ", name: "ESFJ 执政官", group: "守护者" },
  { id: "ISTP", name: "ISTP 鉴赏家", group: "探险家" },
  { id: "ISFP", name: "ISFP 探险家", group: "探险家" },
  { id: "ESTP", name: "ESTP 企业家", group: "探险家" },
  { id: "ESFP", name: "ESFP 表演者", group: "探险家" },
];

const TOPICS = [
  { id: "general", name: "综合解析" },
  { id: "career", name: "事业与财运" },
  { id: "love", name: "情感与人际" },
  { id: "health", name: "身心能量" },
  { id: "growth", name: "灵魂进化" },
];

const CITIES = [
  { name: '北京', lon: 116.40, lat: 39.90 },
  { name: '上海', lon: 121.47, lat: 31.23 },
  { name: '广州', lon: 113.26, lat: 23.13 },
  { name: '深圳', lon: 114.05, lat: 22.54 },
  { name: '成都', lon: 104.06, lat: 30.67 },
  { name: '杭州', lon: 120.15, lat: 30.28 },
  { name: '香港', lon: 114.17, lat: 22.31 },
  { name: '台北', lon: 121.56, lat: 25.03 },
];

interface AstrologyAppProps {
  initialHandoff?: any;
  clearHandoff?: () => void;
}

export default function AstrologyApp({ initialHandoff, clearHandoff }: AstrologyAppProps) {
  const { profile, getProfileContext } = useUserProfile();
  const [mode, setMode] = useState<"zodiac" | "mbti" | "compatibility" | "starchart" | "daily">("zodiac");
  const [selectedZodiac, setSelectedZodiac] = useState("aries");
  const [selectedZodiac2, setSelectedZodiac2] = useState("taurus");
  const [selectedMBTI, setSelectedMBTI] = useState("INTJ");
  const [selectedTopic, setSelectedTopic] = useState("general");
  const [question, setQuestion] = useState("");
  
  const [birthDate, setBirthDate] = useState(profile.birthDate || "1990-01-01");
  const [birthTime, setBirthTime] = useState(profile.birthTime || "12:00");
  const [birthCity, setBirthCity] = useState(profile.birthPlace || CITIES[0].name);

  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const { sendMessage, isLoading: isChatLoading } = useAIChat({ type: 'astrology', model: MODELS.PRO });
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  const { addEntry, updateEntry } = useJourney();
  const { handleGeneratePoster, isGeneratingPoster } = usePosterGenerator();
  const posterRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    const profileContext = getProfileContext();
    const topicName = TOPICS.find((t) => t.id === selectedTopic)?.name || "综合解析";
    const prompt = getAstrologyPrompt({
      mode,
      zodiac: selectedZodiac,
      topic: topicName,
      question,
      profileContext
    });

    try {
      await sendMessage(prompt, {
        title: `星象：${topicName}`,
        details: { 
          type: 'astrology', 
          mode,
          topic: topicName,
          zodiac: selectedZodiac
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatLoading || !currentEntryId) return;

    const userMsg = inputMessage;
    setInputMessage("");
    setIsAskingFollowUp(true);

    try {
      const contextPin = `[系统提醒：当前正在进行关于“${selectedZodiac}”星座的“${TOPICS.find(t => t.id === selectedTopic)?.name}”专题分析。请基于此背景回答。]`;
      await sendMessage(`${contextPin}\n\n${userMsg}`, undefined, undefined, userMsg);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  useEffect(() => {
    if (initialHandoff) {
      const timer = setTimeout(() => {
        const q = initialHandoff.question || initialHandoff.context;
        const m = initialHandoff.modeId;
        
        if (q) setQuestion(q);
        if (m && ["zodiac", "daily", "starchart", "mbti", "compatibility"].includes(m)) {
          setMode(m as any);
        }
        
        // Auto-trigger if question is substantial
        if (q && q.length > 5) {
          handleGenerate();
        }
        clearHandoff?.();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialHandoff, clearHandoff, handleGenerate]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20">
      {messages.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-8 md:p-12 rounded-3xl space-y-10">
          <div className="flex flex-col items-center text-center gap-4">
             <div className="p-3 rounded-2xl bg-indigo-500/10">
                <Star className="w-8 h-8 text-indigo-500" />
             </div>
             <h2 className="text-3xl font-serif text-indigo-100 tracking-widest">星象推演中心</h2>
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            {["zodiac", "daily", "starchart", "mbti", "compatibility"].map(m => (
              <button
                key={m}
                onClick={() => setMode(m as any)}
                className={`px-4 py-2 rounded-full border text-xs font-serif tracking-widest transition-all ${
                  mode === m ? "bg-indigo-600 border-indigo-400 text-white" : "bg-white/5 border-white/5 text-indigo-300/40"
                }`}
              >
                {m === "zodiac" ? "星座解析" : m === "daily" ? "每日简报" : m === "starchart" ? "个人星盘" : m === "mbti" ? "MBTI解析" : "合盘匹配"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-6">
                <label className="block text-xs font-serif text-indigo-500/60 uppercase tracking-widest">选择主体</label>
                <div className="grid grid-cols-4 gap-2">
                  {ZODIAC_SIGNS.map(sign => (
                    <button
                      key={sign.id}
                      onClick={() => setSelectedZodiac(sign.id)}
                      className={`p-2 rounded-lg text-xs font-serif border transition-all ${
                        selectedZodiac === sign.id ? "bg-indigo-600/20 border-indigo-500 text-white" : "bg-white/5 border-white/5 text-white/40"
                      }`}
                    >
                      {sign.name}
                    </button>
                  ))}
                </div>
             </div>
             <div className="space-y-6">
                <label className="block text-xs font-serif text-indigo-500/60 uppercase tracking-widest">心中所想</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="输入你想咨询的具体问题..."
                  className="w-full h-32 bg-black/40 border border-white/5 rounded-xl p-4 text-indigo-100 font-serif"
                />
             </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={isChatLoading}
              className="px-16 py-4 bg-indigo-700 text-white rounded-full font-serif tracking-[0.3em] hover:bg-indigo-600 transition-all disabled:opacity-30"
            >
              开启星象解析
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-8 max-w-4xl mx-auto">
           <div ref={posterRef} className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Star className="w-32 h-32 text-indigo-500" />
              </div>
              <div className="relative z-10">
                <MysticMarkdown content={messages[0]?.content || ""} />

                {/* Follow-up Messages */}
                <div className="mt-12 space-y-8">
                  {messages.slice(1).map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-6 ${
                        msg.role === 'user' 
                          ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-100' 
                          : 'bg-white/5 border border-white/10 text-indigo-100/80'
                      }`}>
                        <MysticMarkdown content={msg.content} />
                      </div>
                    </motion.div>
                  ))}
                  
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <BreathingLoading text="正在观测更深层的星轨..." />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
           </div>

           {/* Deep Dive Input Area */}
           <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20">
             <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
               <div className="flex-1 relative">
                 <input
                   type="text"
                   value={inputMessage}
                   onChange={(e) => setInputMessage(e.target.value)}
                   placeholder="对星象有何疑惑？开启深潜模式..."
                   disabled={isChatLoading}
                   className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-indigo-100 placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all font-serif"
                 />
                 <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10" />
               </div>
               <button
                 type="submit"
                 disabled={isChatLoading || !inputMessage.trim()}
                 className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-30"
               >
                 <Send className="w-5 h-5" />
               </button>
             </form>
           </div>

           <div className="flex justify-center gap-4">
              <button 
                onClick={() => {
                  setMessages([]);
                  setIsAskingFollowUp(false);
                }} 
                className="px-8 py-3 border border-indigo-500/20 text-indigo-400 rounded-full font-serif text-sm hover:bg-indigo-500/10 transition-all"
              >
                返回重新推演
              </button>
              <button 
                onClick={() => handleGeneratePoster(posterRef.current, "astrology.jpg")} 
                disabled={isGeneratingPoster}
                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-serif text-sm hover:bg-indigo-500 transition-all disabled:opacity-50"
              >
                {isGeneratingPoster ? "生成中..." : "保存分享海报"}
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
