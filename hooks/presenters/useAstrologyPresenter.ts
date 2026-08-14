'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";
import { useAIChat } from "@/hooks/useAIChat";
import { getAstrologyPrompt } from "@/lib/prompts";
import { getStarChartData } from "@/app/actions/aiActions";

export const ZODIAC_SIGNS = [
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

export const MBTI_TYPES = [
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

export const TOPICS = [
  { id: "general", name: "综合解析" },
  { id: "career", name: "事业与财运" },
  { id: "love", name: "情感与人际" },
  { id: "health", name: "身心能量" },
  { id: "growth", name: "灵魂进化" },
];

export const CITIES = [
  { name: '北京', lon: 116.40, lat: 39.90 },
  { name: '上海', lon: 121.47, lat: 31.23 },
  { name: '广州', lon: 113.26, lat: 23.13 },
  { name: '深圳', lon: 114.05, lat: 22.54 },
  { name: '成都', lon: 104.06, lat: 30.67 },
  { name: '杭州', lon: 120.15, lat: 30.28 },
  { name: '香港', lon: 114.17, lat: 22.31 },
  { name: '台北', lon: 121.56, lat: 25.03 },
];

export interface UseAstrologyPresenterProps {
  initialHandoff?: any;
  clearHandoff?: () => void;
}

export function useAstrologyPresenter({ initialHandoff, clearHandoff }: UseAstrologyPresenterProps = {}) {
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

  const { messages, sendMessage, isLoading, isStreaming, resetChat } = useAIChat({ type: 'astrology' });
  const [chatInput, setChatInput] = useState("");

  const { handleGeneratePoster, isGeneratingPoster } = usePosterGenerator();
  const posterRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    const profileContext = getProfileContext();
    const topicName = TOPICS.find((t) => t.id === selectedTopic)?.name || "综合解析";
    const zodiacName = ZODIAC_SIGNS.find((z) => z.id === selectedZodiac)?.name || "白羊座";
    
    let preciseChartData: string | undefined = undefined;
    if (mode === "starchart") {
      const city = CITIES.find((c) => c.name === birthCity) || CITIES[0];
      const starChart = await getStarChartData(birthDate, birthTime, city.lon, city.lat);
      if (starChart) {
        preciseChartData = `上升: ${starChart.ascendant.formatted} | 太阳: ${starChart.sunSign} | 行星: ${starChart.planets.map(p => `${p.name}:${p.sign}`).join(', ')}`;
      }
    }

    const prompt = getAstrologyPrompt({
      mode,
      zodiac: zodiacName,
      topic: topicName,
      question,
      profileContext,
      preciseChartData,
    });

    await sendMessage(prompt, {
      title: `星象推演：${mode === 'zodiac' ? zodiacName : mode === 'mbti' ? selectedMBTI : '天体星盘'}`,
      details: {
        type: 'astrology',
        mode,
        topic: topicName,
      },
    });
  }, [
    mode, selectedZodiac, selectedMBTI, selectedTopic,
    question, birthDate, birthTime, birthCity, getProfileContext,
    sendMessage
  ]);

  // Handle handoff
  useEffect(() => {
    if (initialHandoff) {
      const timer = setTimeout(() => {
        if (initialHandoff.question) setQuestion(initialHandoff.question);
        if (initialHandoff.mode) setMode(initialHandoff.mode);
        clearHandoff?.();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialHandoff, clearHandoff]);

  const handleReset = useCallback(() => {
    resetChat();
    setQuestion("");
    setChatInput("");
  }, [resetChat]);

  return {
    state: {
      mode,
      selectedZodiac,
      selectedZodiac2,
      selectedMBTI,
      selectedTopic,
      question,
      birthDate,
      birthTime,
      birthCity,
      messages,
      isLoading,
      isStreaming,
      chatInput,
      isGeneratingPoster,
      posterRef,
    },
    actions: {
      setMode,
      setSelectedZodiac,
      setSelectedZodiac2,
      setSelectedMBTI,
      setSelectedTopic,
      setQuestion,
      setBirthDate,
      setBirthTime,
      setBirthCity,
      setChatInput,
      handleGenerate,
      handleReset,
      sendMessage,
      handleGeneratePoster: () => {
        if (posterRef.current) {
          handleGeneratePoster(posterRef.current, `astrology-${mode}.jpg`);
        }
      },
    },
    constants: {
      ZODIAC_SIGNS,
      MBTI_TYPES,
      TOPICS,
      CITIES,
    }
  };
}
