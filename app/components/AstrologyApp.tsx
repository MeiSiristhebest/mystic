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
} from "lucide-react";
import MysticMarkdown from "./MysticMarkdown";
import { AKASHA_PERSONA, DEFAULT_MODEL } from '@/lib/ai';
import { usePosterGenerator } from '@/hooks/usePosterGenerator';
import { useAIStream } from '@/hooks/useAIStream';
import { getZodiacFromLongitude } from '@/lib/astrology';
import { getBaziData, getStarChartData } from '@/app/actions/aiActions';
import BreathingLoading from "./BreathingLoading";
import { useJourney } from "@/hooks/useJourney";
import { useUserProfile } from "@/hooks/useUserProfile";

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
  { id: "career", name: "事业与财富" },
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
  { name: '纽约', lon: -74.00, lat: 40.71 },
  { name: '伦敦', lon: -0.12, lat: 51.50 },
  { name: '东京', lon: 139.65, lat: 35.67 },
  { name: '巴黎', lon: 2.35, lat: 48.85 },
  { name: '悉尼', lon: 151.20, lat: -33.86 },
];

export default function AstrologyApp() {
  const { profile, getProfileContext } = useUserProfile();
  const [mode, setMode] = useState<"zodiac" | "mbti" | "compatibility" | "starchart" | "daily">(
    "zodiac",
  );
  const [selectedZodiac, setSelectedZodiac] = useState("aries");
  const [selectedZodiac2, setSelectedZodiac2] = useState("taurus");
  const [selectedMBTI, setSelectedMBTI] = useState("INTJ");
  const [selectedTopic, setSelectedTopic] = useState("general");
  const [question, setQuestion] = useState("");
  
  // Star Chart state
  const [birthDate, setBirthDate] = useState(profile.birthDate || "1990-01-01");
  const [birthTime, setBirthTime] = useState(profile.birthTime || "12:00");
  const [birthCity, setBirthCity] = useState(profile.birthPlace || CITIES[0].name);

  useEffect(() => {
    if (profile.birthDate) setBirthDate(profile.birthDate);
    if (profile.birthTime) setBirthTime(profile.birthTime);
    if (profile.birthPlace) setBirthCity(profile.birthPlace);
    
    // Try to match zodiac
    if (profile.birthDate) {
      const date = new Date(profile.birthDate);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const sign = ZODIAC_SIGNS.find(s => {
        const [start, end] = s.dates.split('-').map(d => d.split('.').map(Number));
        if (month === start[0] && day >= start[1]) return true;
        if (month === end[0] && day <= end[1]) return true;
        return false;
      });
      if (sign) setSelectedZodiac(sign.id);
    }

    if (profile.mbti) {
      const mbti = MBTI_TYPES.find(m => profile.mbti?.includes(m.id));
      if (mbti) setSelectedMBTI(mbti.id);
    }
  }, [profile]);

  const [error, setError] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const posterRef = useRef<HTMLDivElement>(null);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);

  const { addEntry, updateEntry } = useJourney();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();
  const { stream, isLoading: isReading, error: streamError, abort } = useAIStream();
  
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);

  const handleGenerate = async () => {
    setMessages([]);
    setCurrentEntryId(null);
    
    try {
      let prompt = "";
      const profileContext = getProfileContext();
      const topicName =
        TOPICS.find((t) => t.id === selectedTopic)?.name || "综合解析";

      // Sanitize question
      const sanitizedQuestion = (question || '').replace(/[<>]/g, '').substring(0, 500);

      if (mode === "zodiac") {
        const sign = ZODIAC_SIGNS.find((s) => s.id === selectedZodiac);
        prompt = `
          这是一次正式的星象运势解析。
          用户的太阳星座是：【${sign?.name}】（${sign?.element}象星座）。
          关注的领域是：【${topicName}】。
          ${sanitizedQuestion ? `用户心中默念的问题或关注点是：“${sanitizedQuestion}”` : "用户没有提供具体问题，请提供近期的深度运势解析。"}
          ${profileContext}
          
          请用中文提供一份专业、深刻、严谨的星座运势与星象指引报告。
          请使用Markdown格式排版，必须包含以下结构：
          ### 🌌 星象能量共振
          （分析近期宇宙星象对该星座的核心影响，以及当前的能量状态）
          
          ### 🔍 深度领域解析 (${topicName})
          （结合用户的星座特质，针对所选领域或具体问题进行深度剖析）
          
          ### 🌟 宇宙的指引与建议
          （给出客观、具有启发性和建设性的最终行动建议，帮助用户顺应星象能量）
        `;
      } else if (mode === "daily") {
        const sign = ZODIAC_SIGNS.find((s) => s.id === selectedZodiac);
        const today = new Date().toLocaleDateString('zh-CN');
        prompt = `
          请为【${sign?.name}】生成今日（${today}）的专属运势简报（Daily Briefing）。
          ${profileContext}
          
          要求：
          1. 语气神秘、温暖、充满洞察力。
          2. 包含以下几个维度的简短分析：
             - 🌟 核心能量（今日整体氛围与关键指引）
             - 💼 事业与学业（行动建议）
             - ❤️ 情感与人际（关系互动）
             - 🍀 幸运提示（幸运色、幸运数字或幸运方位）
          3. 结尾给出一句充满力量的宇宙箴言。
          4. 使用Markdown格式排版，使其美观易读。
        `;
      } else if (mode === "starchart") {
        const city = CITIES.find(c => c.name === birthCity) || CITIES[0];
        const dateObj = new Date(`${birthDate}T${birthTime}:00.000+08:00`); 
        
        let chartData = `
          出生时间：${birthDate} ${birthTime}
          出生地点：${birthCity} (经度: ${city.lon}, 纬度: ${city.lat})
        `;

        try {
          const planets = await getStarChartData(birthDate, birthTime, city.lon, city.lat);
          
          const formatPlanetZodiac = (p: any) => {
            if (!p || typeof p.apparentLongitude !== 'number') return "未知";
            return getZodiacFromLongitude(p.apparentLongitude);
          };

          chartData += `
          【行星落点 (星座)】
          太阳 (Sun): ${formatPlanetZodiac(planets.observed.sun)}
          月亮 (Moon): ${formatPlanetZodiac(planets.observed.moon)}
          水星 (Mercury): ${formatPlanetZodiac(planets.observed.mercury)}
          金星 (Venus): ${formatPlanetZodiac(planets.observed.venus)}
          火星 (Mars): ${formatPlanetZodiac(planets.observed.mars)}
          木星 (Jupiter): ${formatPlanetZodiac(planets.observed.jupiter)}
          土星 (Saturn): ${formatPlanetZodiac(planets.observed.saturn)}
          天王星 (Uranus): ${formatPlanetZodiac(planets.observed.uranus)}
          海王星 (Neptune): ${formatPlanetZodiac(planets.observed.neptune)}
          冥王星 (Pluto): ${formatPlanetZodiac(planets.observed.pluto)}
          `;
        } catch (e) {
          console.error("Star Chart calculation failed:", e);
          chartData += `\n(注：星盘精确位置计算失败，请依赖AI基于出生时间地点的推算)`;
        }

        prompt = `
          这是一次深度的个人星盘（Natal Chart）解析。
          以下是基于用户出生信息，由专业天文历法库(ephemeris)计算出的精确行星落点数据：
          
          ${chartData}
          
          关注的领域是：【${topicName}】。
          ${sanitizedQuestion ? `用户心中默念的问题或关注点是：“${sanitizedQuestion}”` : "用户没有提供具体问题，请结合星盘提供深度的个人特质与命运潜能解析。"}
          ${profileContext}
          
          请用中文提供一份专业、深刻、严谨的星盘解析报告。
          请使用Markdown格式排版，必须包含以下结构：
          ### 🌌 核心星象格局
          （基于提供的行星星座数据，分析日月升等核心配置的特质与能量互动）
          
          ### 🔍 深度领域解析 (${topicName})
          （结合星盘特质，针对所选领域或具体问题进行深度剖析，指出天赋、挑战与业力课题）
          
          ### 🌟 灵魂进化的指引
          （给出客观、具有启发性和建设性的最终成长建议，帮助用户活出星盘的最高潜能）
        `;
      } else if (mode === "compatibility") {
        const sign1 = ZODIAC_SIGNS.find((s) => s.id === selectedZodiac);
        const sign2 = ZODIAC_SIGNS.find((s) => s.id === selectedZodiac2);
        prompt = `
          这是一次深度的星象合盘与关系匹配解析。
          用户（第一方）的太阳星座是：【${sign1?.name}】（${sign1?.element}象星座）。
          对方（第二方）的太阳星座是：【${sign2?.name}】（${sign2?.element}象星座）。
          关注的领域是：【${topicName}】。
          ${sanitizedQuestion ? `用户心中默念的问题或关注点是：“${sanitizedQuestion}”` : "用户没有提供具体问题，请提供这两个星座在当前领域的深度合盘解析。"}
          ${profileContext}
          
          请用中文提供一份专业、深刻、严谨的星座合盘解析报告。
          请使用Markdown格式排版，必须包含以下结构：
          ### 🌌 能量碰撞与化学反应
          （分析这两个星座的元素属性、性格特质在互动中产生的火花与摩擦）
          
          ### 🔍 深度关系解析 (${topicName})
          （结合双方星座特质，针对所选领域或具体问题进行深度剖析，指出契合点与潜在冲突）
          
          ### 🌟 相处之道与成长建议
          （给出客观、具有启发性和建设性的最终相处建议，帮助双方建立更健康、和谐的关系）
        `;
      } else {
        const mbti = MBTI_TYPES.find((m) => m.id === selectedMBTI);
        prompt = `
          这是一次深度的MBTI人格解析与成长咨询。
          用户的人格类型是：【${mbti?.name}】（属于${mbti?.group}）。
          关注的领域是：【${topicName}】。
          ${sanitizedQuestion ? `用户心中默念的问题或关注点是：“${sanitizedQuestion}”` : "用户没有提供具体问题，请提供该人格在当前领域的深度解析与成长建议。"}
          ${profileContext}
          
          请用中文提供一份专业、深刻、严谨的MBTI心理学解析报告。
          请使用Markdown格式排版，必须包含以下结构：
          ### 🧠 认知功能与核心动力
          （简要分析该人格类型的主导功能与辅助功能，以及这些特质如何影响他们当前的处境）
          
          ### 🔍 深度领域解析 (${topicName})
          （结合MBTI特质，针对所选领域或具体问题进行深度剖析，指出优势与盲区）
          
          ### 🌱 突破与成长建议
          （给出客观、具有启发性和建设性的最终行动建议，帮助用户发挥潜能、克服短板）
        `;
      }

      let fullResponse = "";
      setMessages([{ role: 'model', content: "" }]);
      
      for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
        fullResponse += chunk;
        setMessages([{ role: 'model', content: fullResponse }]);
      }
      
      let title = "";
      if (mode === "zodiac") {
        const sign = ZODIAC_SIGNS.find((s) => s.id === selectedZodiac);
        title = `${sign?.name}星象解析`;
      } else if (mode === "daily") {
        const sign = ZODIAC_SIGNS.find((s) => s.id === selectedZodiac);
        title = `${sign?.name}今日简报`;
      } else if (mode === "starchart") {
        title = `个人星盘解析`;
      } else if (mode === "mbti") {
        const mbti = MBTI_TYPES.find((m) => m.id === selectedMBTI);
        title = `${mbti?.name}人格解析`;
      } else {
        const sign1 = ZODIAC_SIGNS.find((s) => s.id === selectedZodiac);
        const sign2 = ZODIAC_SIGNS.find((s) => s.id === selectedZodiac2);
        title = `${sign1?.name} & ${sign2?.name} 合盘解析`;
      }

      // Save to Journey
      try {
        const id = await addEntry({
          type: "astrology",
          title: sanitizedQuestion ? `星象解析：${sanitizedQuestion}` : title,
          summary: fullResponse.substring(0, 100) + "...",
          details: {
            type: 'astrology',
            text: fullResponse,
            zodiac: selectedZodiac,
            messages: [{ role: "model", content: fullResponse }],
          },
        });
        setCurrentEntryId(id || null);
      } catch (e) {
        console.error("Failed to save journey", e);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error(err);
        setError("推演星象时遇到了宇宙干扰，请稍后再试。");
      } else if (!(err instanceof Error)) {
        console.error(err);
        setError("推演星象时遇到了宇宙干扰，请稍后再试。");
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentEntryId) return;

    const userMsg = inputMessage;
    setInputMessage("");
    setIsAskingFollowUp(true);

    const newMessages = [...messages, { role: 'user', content: userMsg } as const];
    setMessages([...newMessages, { role: 'model', content: "" }]);

    try {
      let fullResponse = "";
      for await (const chunk of stream(userMsg, AKASHA_PERSONA)) {
        fullResponse += chunk;
        setMessages([...newMessages, { role: 'model', content: fullResponse }]);
      }

      const finalMessages = [...newMessages, { role: 'model', content: fullResponse } as const];
      const fullText = finalMessages
        .map(m => m.role === 'user' ? `**你**：${m.content}` : `**阿卡夏**：${m.content}`)
        .join('\n\n---\n\n');
      
      updateEntry(currentEntryId, {
        details: {
          type: 'astrology',
          text: fullText,
          zodiac: selectedZodiac,
          messages: finalMessages,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Background elements specific to Astrology */}
      <div className="absolute top-20 left-20 text-indigo-500/10 animate-pulse">
        <Moon size={80} />
      </div>
      <div className="absolute bottom-40 right-20 text-purple-500/10 animate-pulse delay-700">
        <Star size={60} />
      </div>

      {messages.length === 0 && !isReading ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-5xl glass-panel p-6 md:p-8 rounded-2xl flex flex-col items-center relative z-10"
          style={{
            background:
              "linear-gradient(145deg, rgba(30, 20, 50, 0.4) 0%, rgba(10, 5, 20, 0.6) 100%)",
            borderColor: "rgba(139, 92, 246, 0.2)",
          }}
        >
          <div className="w-full flex flex-col gap-8 mb-8">
            {/* Mode Switcher */}
            <div className="flex justify-center mb-4">
              <div className="flex p-1 bg-black/50 rounded-full border border-indigo-500/30 flex-wrap justify-center gap-1">
                <button
                  onClick={() => setMode("zodiac")}
                  className={`px-6 py-2 rounded-full text-sm font-serif tracking-widest transition-all ${
                    mode === "zodiac"
                      ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                      : "text-indigo-300/60 hover:text-indigo-200"
                  }`}
                >
                  <Star className="inline-block w-4 h-4 mr-2 mb-0.5" />
                  星座运势
                </button>
                <button
                  onClick={() => setMode("daily")}
                  className={`px-6 py-2 rounded-full text-sm font-serif tracking-widest transition-all ${
                    mode === "daily"
                      ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.5)]"
                      : "text-emerald-300/60 hover:text-emerald-200"
                  }`}
                >
                  <Sun className="inline-block w-4 h-4 mr-2 mb-0.5" />
                  每日简报
                </button>
                <button
                  onClick={() => setMode("starchart")}
                  className={`px-6 py-2 rounded-full text-sm font-serif tracking-widest transition-all ${
                    mode === "starchart"
                      ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                      : "text-blue-300/60 hover:text-blue-200"
                  }`}
                >
                  <Compass className="inline-block w-4 h-4 mr-2 mb-0.5" />
                  个人星盘
                </button>
                <button
                  onClick={() => setMode("mbti")}
                  className={`px-6 py-2 rounded-full text-sm font-serif tracking-widest transition-all ${
                    mode === "mbti"
                      ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                      : "text-purple-300/60 hover:text-purple-200"
                  }`}
                >
                  <Users className="inline-block w-4 h-4 mr-2 mb-0.5" />
                  MBTI 解析
                </button>
                <button
                  onClick={() => setMode("compatibility")}
                  className={`px-6 py-2 rounded-full text-sm font-serif tracking-widest transition-all ${
                    mode === "compatibility"
                      ? "bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                      : "text-pink-300/60 hover:text-pink-200"
                  }`}
                >
                  <Users className="inline-block w-4 h-4 mr-2 mb-0.5" />
                  合盘匹配
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Inputs */}
              <div className="space-y-6">
                {mode === "zodiac" || mode === "daily" || mode === "compatibility" ? (
                  <div className="space-y-4">
                    <label className="block text-indigo-300 text-sm font-serif tracking-widest mb-2">
                      {mode === "compatibility" ? "你的星座" : "选择你的星座"}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {ZODIAC_SIGNS.map((sign) => (
                        <button
                          key={sign.id}
                          onClick={() => setSelectedZodiac(sign.id)}
                          className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                            selectedZodiac === sign.id
                              ? "bg-indigo-600/40 border-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                              : "bg-black/20 border-indigo-900/30 text-indigo-400/60 hover:border-indigo-500/50"
                          }`}
                        >
                          <span className="text-xs font-serif">{sign.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {mode === "compatibility" && (
                  <div className="space-y-4">
                    <label className="block text-pink-300 text-sm font-serif tracking-widest mb-2">
                      对方的星座
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {ZODIAC_SIGNS.map((sign) => (
                        <button
                          key={sign.id}
                          onClick={() => setSelectedZodiac2(sign.id)}
                          className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                            selectedZodiac2 === sign.id
                              ? "bg-pink-600/40 border-pink-400 text-white shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                              : "bg-black/20 border-pink-900/30 text-pink-400/60 hover:border-pink-500/50"
                          }`}
                        >
                          <span className="text-xs font-serif">{sign.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {mode === "mbti" && (
                  <div className="space-y-4">
                    <label className="block text-purple-300 text-sm font-serif tracking-widest mb-2">
                      选择你的 MBTI 类型
                    </label>
                    <select
                      value={selectedMBTI}
                      onChange={(e) => setSelectedMBTI(e.target.value)}
                      className="w-full bg-black/40 border border-purple-500/30 text-purple-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-serif"
                    >
                      {MBTI_TYPES.map((type) => (
                        <option key={type.id} value={type.id} className="bg-gray-900">
                          {type.name} ({type.group})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {mode === "starchart" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-blue-300 text-xs font-serif tracking-widest">
                          出生日期
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full bg-black/40 border border-blue-500/30 text-blue-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-blue-300 text-xs font-serif tracking-widest">
                          出生时间
                        </label>
                        <input
                          type="time"
                          value={birthTime}
                          onChange={(e) => setBirthTime(e.target.value)}
                          className="w-full bg-black/40 border border-blue-500/30 text-blue-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-blue-300 text-xs font-serif tracking-widest">
                        出生城市
                      </label>
                      <select
                        value={birthCity}
                        onChange={(e) => setBirthCity(e.target.value)}
                        className="w-full bg-black/40 border border-blue-500/30 text-blue-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-serif"
                      >
                        {CITIES.map((city) => (
                          <option key={city.name} value={city.name} className="bg-gray-900">
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {mode !== "daily" && (
                  <div className="space-y-4">
                    <label className="block text-indigo-300 text-sm font-serif tracking-widest mb-2">
                      解析领域
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TOPICS.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => setSelectedTopic(topic.id)}
                          className={`px-4 py-2 rounded-full border text-xs font-serif transition-all ${
                            selectedTopic === topic.id
                              ? "bg-indigo-600/40 border-indigo-400 text-white"
                              : "bg-black/20 border-indigo-900/30 text-indigo-400/60 hover:border-indigo-500/50"
                          }`}
                        >
                          {topic.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Question */}
              <div className="flex flex-col h-full">
                <label className="block text-indigo-300 text-sm font-serif tracking-widest mb-2">
                  心中所求 (可选)
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="在此输入你想要咨询的具体问题，或对当前处境的描述..."
                  className="flex-grow w-full bg-black/40 border border-indigo-500/30 text-indigo-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-serif resize-none placeholder-indigo-700/50"
                />
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={handleGenerate}
                className="group relative px-10 py-4 w-full md:w-1/2 bg-gradient-to-r from-indigo-700 to-purple-900 hover:from-indigo-600 hover:to-purple-800 text-indigo-100 rounded-full font-serif text-lg tracking-wider shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300 overflow-hidden disabled:opacity-50"
                disabled={isReading}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isReading ? (
                    <>
                      <Clock className="animate-spin" />
                      正在观测星空...
                    </>
                  ) : (
                    <>
                      <Sparkles className="group-hover:animate-pulse" />
                      开启星象解析
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="w-full max-w-4xl relative z-10"
          >
            <div
              ref={posterRef}
              data-poster-container
              className="w-full glass-panel p-8 md:p-12 rounded-3xl relative pb-8"
              style={{
                background:
                  "linear-gradient(145deg, rgba(30, 20, 50, 0.4) 0%, rgba(10, 5, 20, 0.6) 100%)",
                borderColor: "rgba(139, 92, 246, 0.2)",
              }}
            >
              {/* Poster Header */}
              <div className="hidden show-in-poster w-full text-center mb-8 pt-4">
                <h2 className="text-4xl font-serif text-indigo-400 mb-4 tracking-widest">
                  阿卡夏之眼 · {mode === "zodiac" ? "星座解析" : mode === "daily" ? "今日简报" : mode === "starchart" ? "个人星盘" : mode === "compatibility" ? "星象合盘" : "MBTI解析"}
                </h2>
                <p className="text-indigo-500/80 text-lg">
                  {(mode === "zodiac" || mode === "daily") && ZODIAC_SIGNS.find(s => s.id === selectedZodiac)?.name}
                  {mode === "starchart" && `出生于 ${birthCity}`}
                  {mode === "compatibility" && `${ZODIAC_SIGNS.find(s => s.id === selectedZodiac)?.name} & ${ZODIAC_SIGNS.find(s => s.id === selectedZodiac2)?.name}`}
                  {mode === "mbti" && MBTI_TYPES.find(m => m.id === selectedMBTI)?.name}
                  {mode !== "daily" && ' · '}
                  {mode !== "daily" && TOPICS.find(t => t.id === selectedTopic)?.name}
                </p>
              </div>

              {isReading ? (
                <BreathingLoading
                  text={
                    mode === "zodiac"
                      ? "正在解读星象轨迹与宇宙能量..."
                      : "正在分析认知功能与人格动力..."
                  }
                />
              ) : (error || streamError) ? (
                <div className="text-center text-red-400 py-8 font-serif">
                  {error || streamError}
                </div>
              ) : (
                <div className="flex flex-col space-y-8">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-center"}`}
                    >
                      <div
                        className={`max-w-[95%] md:max-w-[85%] rounded-2xl p-6 ${
                          msg.role === "user"
                            ? mode === "zodiac"
                              ? "bg-indigo-900/40 border border-indigo-500/30 text-indigo-100"
                              : "bg-purple-900/40 border border-purple-500/30 text-purple-100"
                            : "bg-black/30 markdown-body w-full"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <p className="font-serif">{msg.content}</p>
                        ) : (
                          <MysticMarkdown content={msg.content} />
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isAskingFollowUp && (
                    <div className="flex items-start hide-in-poster">
                      <div className="glass-panel bg-black/40 rounded-2xl p-6 w-full">
                        <BreathingLoading text="正在倾听星辰的回应..." />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Poster Footer */}
              <div className="hidden show-in-poster w-full text-center mt-12 pt-8 border-t border-indigo-500/20">
                <div className="flex items-center justify-center gap-2 text-indigo-500/60 mb-2">
                  <Sparkles size={16} />
                  <span className="font-serif tracking-widest text-sm">阿卡夏之眼 AI 命理</span>
                  <Sparkles size={16} />
                </div>
                <p className="text-xs text-indigo-500/40 font-mono">
                  {new Date().toLocaleDateString()} · 仅供娱乐与自我探索
                </p>
              </div>
            </div>

            {!isReading && !error && (
              <form onSubmit={handleSendMessage} className="mt-8 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    mode === "zodiac"
                      ? "对星象有疑问？继续向阿卡夏提问..."
                      : "对解析有疑问？继续向阿卡夏提问..."
                  }
                  className={`w-full bg-black/40 border rounded-full py-4 pl-6 pr-16 focus:outline-none focus:ring-2 transition-all font-serif ${
                    mode === "zodiac"
                      ? "border-indigo-500/30 text-indigo-100 placeholder-indigo-700/50 focus:ring-indigo-500/50"
                      : "border-purple-500/30 text-purple-100 placeholder-purple-700/50 focus:ring-purple-500/50"
                  }`}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    mode === "zodiac"
                      ? "bg-indigo-600 hover:bg-indigo-500 text-indigo-50"
                      : "bg-purple-600 hover:bg-purple-500 text-purple-50"
                  }`}
                >
                  <Send size={18} />
                </button>
              </form>
            )}

            {!isReading && (
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 hide-in-poster">
                <button
                  onClick={() => {
                    setMessages([]);
                    setCurrentEntryId(null);
                    abort();
                  }}
                  className={`px-6 py-2 border rounded-full font-serif transition-colors ${
                    mode === "zodiac"
                      ? "border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                      : "border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  }`}
                >
                  结束观测，离开星空
                </button>
                <button
                  onClick={() => handleGeneratePoster(posterRef.current, "akasha-astrology.jpg")}
                  disabled={isGeneratingPoster}
                  className={`glass-button px-6 py-2 rounded-full font-serif hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus-visible:ring-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 ${
                    mode === "zodiac"
                      ? "text-indigo-200 focus-visible:ring-indigo-400"
                      : "text-purple-200 focus-visible:ring-purple-400"
                  }`}
                >
                  <Download size={16} className={isGeneratingPoster ? "animate-bounce" : ""} />
                  {isGeneratingPoster ? "生成中..." : "生成分享海报"}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
