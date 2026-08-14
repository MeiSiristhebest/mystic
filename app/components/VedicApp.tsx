'use client';

import React, { useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, Calendar, Clock, Crown, 
  Layers, ShieldCheck, Star, Activity, CheckCircle, AlertTriangle
} from "lucide-react";
import MysticMarkdown from "./MysticMarkdown";
import BreathingLoading from "./BreathingLoading";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAIChat } from "@/hooks/useAIChat";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";
import { getVedicChartServerData } from "@/app/actions/aiActions";
import { getVedicPrompt } from "@/lib/prompts";
import { playMysticChime, triggerHapticVibration } from "@/lib/audio";
import { VedicChart } from "@/lib/vedic/types";

export default function VedicApp() {
  const { profile, getProfileContext } = useUserProfile();
  const [birthDate, setBirthDate] = useState(profile.birthDate || "1992-05-18");
  const [birthTime, setBirthTime] = useState(profile.birthTime || "08:45");
  const [question, setQuestion] = useState("");
  const [activeDivision, setActiveDivision] = useState<'D1' | 'D9' | 'D10'>('D1');

  const [vedicChart, setVedicChart] = useState<VedicChart | null>(null);
  const { messages, sendMessage, isLoading, resetChat } = useAIChat({ type: 'astrology' });
  const { handleGeneratePoster, isGeneratingPoster } = usePosterGenerator();
  const posterRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    if (!birthDate || !birthTime) return;

    playMysticChime();
    triggerHapticVibration();

    try {
      const chart = await getVedicChartServerData(birthDate, birthTime);
      setVedicChart(chart);

      const charaStr = chart.charaKarakas.map((k: any) => `${k.roleName}: ${k.planetCn}`).join(' | ');

      const prompt = getVedicPrompt({
        ascendantSign: `${chart.ascendant.signCn} (${chart.ascendant.nakshatraCn})`,
        moonNakshatraName: chart.moonNakshatra.cnName,
        moonNakshatraSummary: chart.moonNakshatra.summary,
        dashaPeriod: chart.currentDasha.formattedDisplay,
        charaKarakas: charaStr,
        chartSummary: `Lahiri Ayanamsa: ${chart.ayanamsa.toFixed(2)}° | 核心标签: ${chart.summaryTags.join(', ')}`,
        question,
        profileContext: getProfileContext(),
        evidences: chart.evidences,
      });

      await sendMessage(prompt, {
        title: `吠陀占星：${chart.moonNakshatra.cnName}`,
        details: {
          type: 'vedic',
          chart,
        }
      });
    } catch (e) {
      console.error("Vedic calculation failed:", e);
    }
  }, [birthDate, birthTime, question, getProfileContext, sendMessage]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-2">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-200 tracking-widest drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          吠陀占星推演中心 (Jyotish Engine)
        </h1>
        <p className="text-purple-200/60 max-w-2xl mx-auto text-sm md:text-base font-serif">
          基于古印度恒星黄道（True Citra / Lahiri Ayanamsa）与 KN Rao 体系，审计 27 月宿、D1/D9/D10 分盘与 120 年 Vimsottari (MD→AD→PD) 大运。
        </p>
      </div>

      {messages.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-8 md:p-12 rounded-3xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-xs font-serif tracking-widest text-purple-400 uppercase">出生日期与时间 (精确度至关重要)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/40 w-4 h-4" />
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-black/40 border border-purple-500/20 rounded-xl py-3 pl-10 pr-3 text-purple-100 text-xs font-serif"
                  />
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/40 w-4 h-4" />
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full bg-black/40 border border-purple-500/20 rounded-xl py-3 pl-10 pr-3 text-purple-100 text-xs font-serif"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-serif tracking-widest text-purple-400 uppercase">求问关切（事业成就 / 婚姻契约 / 灵魂觉醒）</label>
              <input
                type="text"
                placeholder="例如：我命中的灵魂进化课题是什么？当前大运适合创业吗？"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/20 rounded-xl p-3.5 text-purple-100 text-xs font-serif"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !birthDate || !birthTime}
            className="w-full py-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-full font-serif text-base tracking-[0.3em] transition-all shadow-[0_0_25px_rgba(147,51,234,0.4)] disabled:opacity-40 cursor-pointer"
          >
            开启吠陀全维星盘审计 (Phase 1-4)
          </button>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Vedic Chart Highlight Cards */}
          {vedicChart && (
            <div className="space-y-6">
              {/* Top Summary Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-purple-300 font-serif">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>27 月宿 (Nakshatra)</span>
                  </div>
                  <div className="text-lg font-serif font-bold text-amber-300">
                    {vedicChart.moonNakshatra.cnName}
                  </div>
                  <p className="text-[11px] text-purple-200/70 font-serif line-clamp-2">
                    {vedicChart.moonNakshatra.summary}
                  </p>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-purple-300 font-serif">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <span>灵魂指示星 (Atmakaraka)</span>
                  </div>
                  <div className="text-lg font-serif font-bold text-purple-200">
                    {vedicChart.charaKarakas.find(k => k.role === 'AK')?.planetCn || 'Sun'}
                  </div>
                  <p className="text-[11px] text-purple-200/70 font-serif">
                    代表此生最高灵魂进化目标与终极潜能
                  </p>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-purple-300 font-serif">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>三级 Vimsottari 大运 (MD→AD→PD)</span>
                  </div>
                  <div className="text-sm font-serif font-bold text-indigo-300">
                    {vedicChart.currentDasha.formattedDisplay}
                  </div>
                  <p className="text-[11px] text-purple-200/70 font-serif">
                    当前中运区间: {vedicChart.currentDasha.antarDasha.startDate} ~ {vedicChart.currentDasha.antarDasha.endDate}
                  </p>
                </div>
              </div>

              {/* Evidence Chain and Validation Bar */}
              <div className="p-4 rounded-2xl bg-purple-900/20 border border-purple-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-serif">
                <div className="flex items-center gap-2 text-purple-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>确定性证据链已锁定 ({vedicChart.evidences?.length || 0} 个核心证据节点)</span>
                </div>
                <div className="flex items-center gap-2">
                  {vedicChart.validation?.isValid ? (
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle className="w-3.5 h-3.5" /> 结构完整性校验通过 (16项基准)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" /> 存在退化警告
                    </span>
                  )}
                </div>
              </div>

              {/* Divisional Chart Switcher (D1, D9, D10) */}
              <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-black/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-purple-300 font-serif tracking-widest uppercase">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>吠陀分盘系统 (Varga Charts)</span>
                  </div>
                  <div className="flex gap-2">
                    {(['D1', 'D9', 'D10'] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setActiveDivision(d)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer ${
                          activeDivision === d
                            ? 'bg-purple-600 text-white font-bold shadow-[0_0_10px_rgba(147,51,234,0.5)]'
                            : 'bg-white/5 border border-white/10 text-purple-300/50 hover:text-purple-200'
                        }`}
                      >
                        {d === 'D1' ? 'D1 本命身盘' : d === 'D9' ? 'D9 灵魂/婚姻' : 'D10 事业成就'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid 12 Houses */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
                    const planetsInHouse = activeDivision === 'D1'
                      ? vedicChart.d1Chart[h] || []
                      : activeDivision === 'D9'
                      ? vedicChart.d9Chart[h] || []
                      : vedicChart.d10Chart[h] || [];

                    return (
                      <div key={h} className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/10 text-center space-y-1">
                        <div className="text-[10px] text-purple-400/60 font-serif">第 {h} 宫</div>
                        <div className="min-h-[28px] flex flex-wrap justify-center items-center gap-1">
                          {planetsInHouse.length > 0 ? (
                            planetsInHouse.map((p, pIdx) => (
                              <span key={pIdx} className="px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-200 text-[10px] font-serif border border-purple-500/20">
                                {p.cnName.split(' ')[0]}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-white/20">—</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* AI Audit Report */}
          <div ref={posterRef} className="glass-panel p-8 md:p-12 rounded-3xl">
            {isLoading && !messages.length ? (
              <BreathingLoading text="正在依据恒星黄道与证据防火墙生成吠陀全维审计报告..." />
            ) : (
              <MysticMarkdown content={messages[0]?.content || ""} />
            )}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => { resetChat(); setVedicChart(null); }}
              className="px-8 py-3 border border-purple-500/30 text-purple-300 rounded-full font-serif text-sm hover:bg-purple-500/10 transition-all cursor-pointer"
            >
              重新起盘推演
            </button>
            <button
              onClick={() => handleGeneratePoster(posterRef.current, "vedic-audit.jpg")}
              disabled={isGeneratingPoster}
              className="px-8 py-3 bg-purple-600 text-white rounded-full font-serif text-sm hover:bg-purple-500 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingPoster ? "生成中..." : "保存分享海报"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
