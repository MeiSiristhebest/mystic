'use client';

import React from "react";
import { motion } from "motion/react";
import {
  Star,
  Moon,
  Sun,
  Compass,
  Users,
  Sparkles,
  Download,
  Clock,
  ChevronRight,
} from "lucide-react";
import BreathingLoading from "./BreathingLoading";
import MysticChatInterface from "./MainApp/MysticChatInterface";
import { useAstrologyPresenter, UseAstrologyPresenterProps } from "@/hooks/presenters/useAstrologyPresenter";

export default function AstrologyApp(props: UseAstrologyPresenterProps) {
  const { state, actions, constants } = useAstrologyPresenter(props);
  const {
    mode, selectedZodiac, selectedZodiac2, selectedMBTI, selectedTopic,
    question, birthDate, birthTime, birthCity, messages,
    isLoading, isStreaming, chatInput, isGeneratingPoster, posterRef
  } = state;
  const { ZODIAC_SIGNS, MBTI_TYPES, TOPICS, CITIES } = constants;

  const MODES = [
    { id: "zodiac", name: "个人星座", icon: Sun, desc: "单人太阳星座性格与星象能量" },
    { id: "mbti", name: "MBTI 占星", icon: Users, desc: "荣格心理学与星象人格跨界融合" },
    { id: "compatibility", name: "星座合盘", icon: Sparkles, desc: "推演双人引力、契合度与相处之道" },
    { id: "starchart", name: "天体星盘", icon: Compass, desc: "真恒星时排盘，解构行星宫位与相位" },
    { id: "daily", name: "今日运势", icon: Star, desc: "结合当下天象与个人星座的能量指引" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Mode Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {MODES.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => actions.setMode(m.id as any)}
              className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center cursor-pointer select-none ${
                isActive
                  ? "bg-gradient-to-b from-[#C9A84C]/25 to-[#080510] border-[#C9A84C] text-[#FFFDF6] shadow-[0_0_25px_rgba(201,168,76,0.35)] scale-105"
                  : "bg-[#080510]/80 border-white/5 text-[#E8DFB8]/60 hover:border-[#C9A84C]/40 hover:text-[#E8DFB8]"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-[#C9A84C]" : "text-[#E8DFB8]/50"}`} />
              <span className="font-serif text-xs font-bold tracking-wider">{m.name}</span>
            </button>
          );
        })}
      </div>

      {!messages.length && !isLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="obsidian-glass p-8 md:p-12 rounded-[2.5rem] space-y-8 border border-[#C9A84C]/30 shadow-[0_30px_90px_rgba(0,0,0,0.85)]"
        >
          {/* Mode-Specific Inputs */}
          {mode === "zodiac" && (
            <div className="space-y-4">
              <label className="block text-xs font-serif tracking-[0.3em] text-[#C9A84C] uppercase font-medium">选择你的太阳星座</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {ZODIAC_SIGNS.map((z) => (
                  <button
                    key={z.id}
                    onClick={() => actions.setSelectedZodiac(z.id)}
                    className={`p-3 rounded-xl border text-xs font-serif transition-all cursor-pointer ${
                      selectedZodiac === z.id
                        ? "bg-[#C9A84C]/20 border-[#C9A84C] text-[#FFFDF6] shadow-[0_0_15px_rgba(201,168,76,0.3)]"
                        : "bg-[#080510]/60 border-white/5 text-[#E8DFB8]/60 hover:border-[#C9A84C]/30"
                    }`}
                  >
                    <div className="font-bold">{z.name}</div>
                    <div className="text-[10px] opacity-60 font-mono">{z.dates}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "mbti" && (
            <div className="space-y-4">
              <label className="block text-xs font-serif tracking-[0.3em] text-[#C9A84C] uppercase font-medium">选择你的 MBTI 荣格人格</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {MBTI_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => actions.setSelectedMBTI(t.id)}
                    className={`p-3 rounded-xl border text-xs font-serif text-left transition-all cursor-pointer ${
                      selectedMBTI === t.id
                        ? "bg-[#C9A84C]/20 border-[#C9A84C] text-[#FFFDF6] shadow-[0_0_15px_rgba(201,168,76,0.3)]"
                        : "bg-[#080510]/60 border-white/5 text-[#E8DFB8]/60 hover:border-[#C9A84C]/30"
                    }`}
                  >
                    <div className="font-bold text-[#F5E6AD]">{t.id}</div>
                    <div className="text-[10px] text-[#E8DFB8]/60">{t.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "compatibility" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-xs font-serif tracking-[0.3em] text-[#C9A84C] uppercase">本人星座</label>
                  <select
                    value={selectedZodiac}
                    onChange={(e) => actions.setSelectedZodiac(e.target.value)}
                    className="w-full bg-[#080510]/80 border border-[#C9A84C]/25 rounded-xl p-3.5 text-[#FBF5D8] font-serif focus:border-[#C9A84C] focus:outline-none"
                  >
                    {ZODIAC_SIGNS.map((z) => (
                      <option key={z.id} value={z.id} className="bg-[#080510] text-[#E8DFB8]">{z.name} ({z.dates})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-serif tracking-[0.3em] text-[#C9A84C] uppercase">对方星座</label>
                  <select
                    value={selectedZodiac2}
                    onChange={(e) => actions.setSelectedZodiac2(e.target.value)}
                    className="w-full bg-[#080510]/80 border border-[#C9A84C]/25 rounded-xl p-3.5 text-[#FBF5D8] font-serif focus:border-[#C9A84C] focus:outline-none"
                  >
                    {ZODIAC_SIGNS.map((z) => (
                      <option key={z.id} value={z.id} className="bg-[#080510] text-[#E8DFB8]">{z.name} ({z.dates})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {mode === "starchart" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-serif text-[#C9A84C] uppercase">出生日期</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => actions.setBirthDate(e.target.value)}
                  className="w-full bg-[#080510]/80 border border-[#C9A84C]/25 rounded-xl p-3 text-[#FBF5D8] text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-serif text-[#C9A84C] uppercase">出生时间</label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => actions.setBirthTime(e.target.value)}
                  className="w-full bg-[#080510]/80 border border-[#C9A84C]/25 rounded-xl p-3 text-[#FBF5D8] text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-serif text-[#C9A84C] uppercase">出生城市</label>
                <select
                  value={birthCity}
                  onChange={(e) => actions.setBirthCity(e.target.value)}
                  className="w-full bg-[#080510]/80 border border-[#C9A84C]/25 rounded-xl p-3 text-[#FBF5D8] text-sm font-serif focus:border-[#C9A84C] focus:outline-none"
                >
                  {CITIES.map((c) => (
                    <option key={c.name} value={c.name} className="bg-[#080510] text-[#E8DFB8]">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Topic Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-serif tracking-[0.3em] text-[#C9A84C] uppercase font-medium">解读侧重</label>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => actions.setSelectedTopic(t.id)}
                  className={`px-4 py-2 rounded-xl border text-xs font-serif transition-all cursor-pointer ${
                    selectedTopic === t.id
                      ? "bg-[#C9A84C]/25 border-[#C9A84C] text-[#FFFDF6] shadow-[0_0_12px_rgba(201,168,76,0.3)]"
                      : "bg-[#080510]/60 border-white/5 text-[#E8DFB8]/60 hover:border-[#C9A84C]/30"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Question Input */}
          <div className="space-y-3">
            <label className="block text-xs font-serif tracking-[0.3em] text-[#C9A84C] uppercase font-medium">灵魂意图倾诉 (可选)</label>
            <textarea
              rows={3}
              value={question}
              onChange={(e) => actions.setQuestion(e.target.value)}
              placeholder="请倾诉你当前所思所想，或想获悉的星象启示..."
              className="w-full bg-[#080510]/80 border border-[#C9A84C]/25 rounded-2xl p-4 text-[#FBF5D8] text-sm focus:border-[#C9A84C] focus:outline-none focus:shadow-[0_0_25px_rgba(201,168,76,0.2)] transition-all resize-none placeholder:text-[#C9A84C]/35 font-serif"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={actions.handleGenerate}
            disabled={isLoading}
            className="w-full py-4.5 bg-gradient-to-r from-[#966316] via-[#C9A84C] to-[#966316] hover:from-[#aa721c] hover:to-[#dbb958] text-[#080510] font-bold rounded-full font-serif text-lg tracking-[0.35em] shadow-[0_0_35px_rgba(201,168,76,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
          >
            <Sparkles className="w-5 h-5" />
            开启星象推演
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-end gap-3">
            <button
              onClick={actions.handleReset}
              className="px-5 py-2.5 rounded-full border border-white/10 text-xs font-serif text-[#E8DFB8]/70 hover:text-white hover:border-[#C9A84C]/40 cursor-pointer transition-all"
            >
              重新推演
            </button>
            <button
              onClick={actions.handleGeneratePoster}
              disabled={isGeneratingPoster}
              className="px-5 py-2.5 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-xs font-serif text-[#F5E6AD] flex items-center gap-2 hover:bg-[#C9A84C]/25 cursor-pointer transition-all shadow-[0_0_15px_rgba(201,168,76,0.2)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPoster ? "正在生成..." : "保存星盘海报"}</span>
            </button>
          </div>

          <div ref={posterRef} className="space-y-6">
            {isLoading && !messages.length ? (
              <BreathingLoading text="正在计算天体相位与黄道星规..." />
            ) : (
              <MysticChatInterface
                messages={messages}
                input={chatInput}
                setInput={actions.setChatInput}
                onSend={(e) => {
                  e.preventDefault();
                  actions.sendMessage(chatInput);
                  actions.setChatInput("");
                }}
                isLoading={isLoading}
                isStreaming={isStreaming}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
