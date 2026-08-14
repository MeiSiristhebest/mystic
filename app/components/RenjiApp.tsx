'use client';

import React from "react";
import { motion } from "motion/react";
import { 
  Flame, Leaf, Award, Activity, CheckCircle2, Download, Sparkles
} from "lucide-react";
import BreathingLoading from "./BreathingLoading";
import MysticChatInterface from "./MainApp/MysticChatInterface";
import { useRenjiPresenter } from "@/hooks/presenters/useRenjiPresenter";

export default function RenjiApp() {
  const { state, actions, constants } = useRenjiPresenter();
  const {
    tab, answers, evaluationResult, symptoms, question,
    birthYear, wuyunResult, messages, isLoading, isStreaming,
    chatInput, isGeneratingPoster, posterRef
  } = state;
  const { HEALTH_STANDARDS } = constants;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 pb-20 px-4 md:px-0 font-serif">
      {/* Header Banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 mb-1 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
          <Leaf className="w-7 h-7" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-[#FBF5D8] tracking-[0.2em] drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          人纪 · 汉唐经方身心辨证
        </h1>
        <p className="text-[#E8DFB8]/70 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-light">
          基于倪海厦《人纪》与汉唐经方医案体系。恪守八大健康金标准、六经枢机问止辨证与五运六气天人合一。
        </p>

        {/* Tab switcher */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <button
            onClick={() => actions.setTab('standards')}
            className={`px-6 py-3 rounded-full text-xs font-serif tracking-widest transition-all cursor-pointer select-none ${
              tab === 'standards'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-black font-bold shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105'
                : 'bg-[#080510]/80 border border-white/10 text-emerald-200/60 hover:text-emerald-200 hover:border-emerald-500/30'
            }`}
          >
            📊 八大健康金标准自测
          </button>
          <button
            onClick={() => actions.setTab('diagnosis')}
            className={`px-6 py-3 rounded-full text-xs font-serif tracking-widest transition-all cursor-pointer select-none ${
              tab === 'diagnosis'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-black font-bold shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105'
                : 'bg-[#080510]/80 border border-white/10 text-emerald-200/60 hover:text-emerald-200 hover:border-emerald-500/30'
            }`}
          >
            🩺 六经病机问止推演
          </button>
          <button
            onClick={() => actions.setTab('wuyun')}
            className={`px-6 py-3 rounded-full text-xs font-serif tracking-widest transition-all cursor-pointer select-none ${
              tab === 'wuyun'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-black font-bold shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105'
                : 'bg-[#080510]/80 border border-white/10 text-emerald-200/60 hover:text-emerald-200 hover:border-emerald-500/30'
            }`}
          >
            🌌 出生年份五运六气体质
          </button>
        </div>
      </div>

      {/* Tab 1: Health 8 Standards */}
      {tab === 'standards' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Summary status banner */}
          {evaluationResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="obsidian-glass p-6 rounded-2xl border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-400">
                  <span className="tracking-widest">综合健康指数</span>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-3xl font-bold text-emerald-300">
                  {evaluationResult.overallScore} <span className="text-sm font-normal opacity-60">/ 100</span>
                </div>
                <p className="text-xs text-emerald-200/70">
                  阴阳状态：<strong className="text-emerald-300">{evaluationResult.yinYangBalance}</strong>
                </p>
              </div>

              <div className="obsidian-glass p-6 rounded-2xl border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-400">
                  <span className="tracking-widest">气血核心病机</span>
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-lg font-bold text-amber-300">
                  {evaluationResult.qiBloodStatus}
                </div>
                <p className="text-xs text-[#E8DFB8]/70">
                  心火下潜肾水、手足温暖为常纲
                </p>
              </div>

              <div className="obsidian-glass p-6 rounded-2xl border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-400">
                  <span className="tracking-widest">推荐经络调摄</span>
                  <Award className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-emerald-200 space-y-1">
                  {evaluationResult.recommendedAcupoints.map((ac: string, idx: number) => (
                    <div key={idx}>• {ac}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 8 Question Sliders */}
          <div className="obsidian-glass p-8 md:p-12 rounded-[2.5rem] space-y-8 border border-emerald-500/30 shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
            <h3 className="text-lg font-bold text-emerald-300 border-b border-emerald-500/20 pb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>倪海厦健康八大金标准自查表（请按日常真实体感滑动）</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {HEALTH_STANDARDS.map((std) => (
                <div key={std.id} className="p-5 rounded-2xl bg-[#080510]/80 border border-emerald-500/20 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-emerald-200">{std.title}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono">
                      {answers[std.dimension] ?? 75} 分
                    </span>
                  </div>
                  <p className="text-xs text-[#E8DFB8]/70 leading-relaxed">{std.question}</p>
                  
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={answers[std.dimension] ?? 75}
                    onChange={(e) => actions.handleScoreChange(std.dimension, parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  
                  <div className="text-[11px] text-emerald-400/60 pt-1">
                    💡 金标准：{std.idealStandard}
                  </div>
                </div>
              ))}
            </div>

            {/* Key advice */}
            {evaluationResult && (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                <div className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>倪师调养方略与药食同源建议</span>
                </div>
                <div className="space-y-1.5 text-xs text-emerald-100/90">
                  {evaluationResult.keyAdvice.map((adv: string, i: number) => (
                    <p key={i}>• {adv}</p>
                  ))}
                  {evaluationResult.dietaryRecommendations.length > 0 && (
                    <p className="pt-2 text-amber-200">
                      🥣 <strong>推荐食疗：</strong>{evaluationResult.dietaryRecommendations.join('、')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Tab 2: Six Stages Diagnosis */}
      {tab === 'diagnosis' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {!messages.length && !isLoading ? (
            <div className="obsidian-glass p-8 md:p-12 rounded-[2.5rem] space-y-6 border border-emerald-500/30 shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
              <div className="space-y-3">
                <label className="block text-xs font-serif text-emerald-400 tracking-widest uppercase font-medium">
                  1. 主诉不适或身心症状（详述发作时间、寒热、渴否、睡眠等）
                </label>
                <textarea
                  rows={4}
                  value={symptoms}
                  onChange={(e) => actions.setSymptoms(e.target.value)}
                  placeholder="例如：近一周恶寒怕风，头项强痛，后背发紧，身体无汗，夜间口微渴喜温水，晨起胃口差..."
                  className="w-full bg-[#080510]/80 border border-emerald-500/25 rounded-2xl p-4 text-[#FBF5D8] text-sm focus:border-emerald-400 focus:outline-none transition-all resize-none shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-serif text-emerald-400 tracking-widest uppercase font-medium">
                  2. 具体的调理疑问或诉求 (选填)
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => actions.setQuestion(e.target.value)}
                  placeholder="例如：想了解此证属于六经哪一阶段？日常如何通过食疗与艾灸辅助调理？"
                  className="w-full bg-[#080510]/80 border border-emerald-500/25 rounded-2xl p-4 text-[#FBF5D8] text-sm focus:border-emerald-400 focus:outline-none transition-all shadow-inner"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={actions.handleRunDiagnosis}
                disabled={!symptoms.trim()}
                className="w-full py-4.5 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 disabled:opacity-40 text-black font-bold rounded-full text-base tracking-[0.3em] shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all cursor-pointer select-none flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                开启经方六经病机辨证
              </motion.button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-end gap-3">
                <button
                  onClick={actions.resetChat}
                  className="px-5 py-2.5 rounded-full border border-white/10 text-xs text-emerald-200/70 hover:text-white hover:border-emerald-500/40 cursor-pointer transition-all"
                >
                  重新问止辨证
                </button>
                <button
                  onClick={actions.handleGeneratePoster}
                  disabled={isGeneratingPoster}
                  className="px-5 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2 hover:bg-emerald-500/25 cursor-pointer transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGeneratingPoster ? "正在生成..." : "保存辨证长图"}</span>
                </button>
              </div>

              <div ref={posterRef} className="space-y-6">
                {isLoading && !messages.length ? (
                  <BreathingLoading text="正在依据《伤寒论》《金匮要略》六经枢机辨析病机..." />
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
        </motion.div>
      )}

      {/* Tab 3: Wuyun Liuqi */}
      {tab === 'wuyun' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="obsidian-glass p-8 md:p-12 rounded-[2.5rem] space-y-6 border border-emerald-500/30 shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-6">
              <div>
                <h3 className="text-xl font-bold text-emerald-300 tracking-wider">出生年份五运六气先天体质推演</h3>
                <p className="text-xs text-[#E8DFB8]/70 pt-1">天干统五运（木火土金水），地支应六气（司天在泉与客气加临）</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-400 font-medium">出生年份：</span>
                <input
                  type="number"
                  min="1920"
                  max="2035"
                  value={birthYear}
                  onChange={(e) => actions.setBirthYear(parseInt(e.target.value, 10) || 1995)}
                  className="w-24 bg-[#080510]/80 border border-emerald-500/40 rounded-xl px-3 py-2 text-[#FBF5D8] text-sm text-center font-bold font-mono focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            {wuyunResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#080510]/80 border border-emerald-500/20 space-y-3 shadow-inner">
                  <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest">先天大运与岁运</div>
                  <div className="text-2xl font-bold text-amber-300">
                    {wuyunResult.greatMovement?.element}运 ({wuyunResult.greatMovement?.excessOrDeficiency}) · {wuyunResult.yearGanZhi}
                  </div>
                  <p className="text-xs text-[#E8DFB8]/80 leading-relaxed">
                    {wuyunResult.greatMovement?.desc}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#080510]/80 border border-emerald-500/20 space-y-3 shadow-inner">
                  <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest">司天与在泉之气</div>
                  <div className="text-sm font-bold text-emerald-200">
                    司天：<span className="text-amber-300">{wuyunResult.siTian?.climate}</span> | 在泉：<span className="text-amber-300">{wuyunResult.zaiQuan?.climate}</span>
                  </div>
                  <p className="text-xs text-[#E8DFB8]/80 leading-relaxed">
                    {wuyunResult.siTian?.organImpact}；{wuyunResult.zaiQuan?.organImpact}。
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#080510]/80 border border-emerald-500/20 space-y-3 md:col-span-2 shadow-inner">
                  <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest">先天体质倾向与调摄法门</div>
                  <div className="text-sm font-bold text-amber-200">
                    {wuyunResult.constitutionalTendency?.predisposition}
                  </div>
                  <div className="space-y-1.5 pt-1 text-xs text-[#E8DFB8]/80 leading-relaxed">
                    <p><strong>易损脏腑：</strong>{wuyunResult.constitutionalTendency?.vulnerableOrgans?.join('、')}</p>
                    <p><strong>起居调养：</strong>{wuyunResult.constitutionalTendency?.lifestyleBalancingTips?.join('；')}</p>
                    <p><strong>推荐经方食疗：</strong>{wuyunResult.constitutionalTendency?.recommendedHerbalDiet?.join('、')}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      )}
    </div>
  );
}
