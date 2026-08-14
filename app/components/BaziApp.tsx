'use client';

import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Crown, Award, Sparkles } from 'lucide-react';

// Components & Layout
import RitualLayout from './MainApp/RitualLayout';
import MysticChatInterface from './MainApp/MysticChatInterface';
import BreathingLoading from './BreathingLoading';
import { BaziChart } from './MainApp/Bazi/BaziChart';
import { useBaziPresenter, UseBaziPresenterProps } from '@/hooks/presenters/useBaziPresenter';

export default function BaziApp(props: UseBaziPresenterProps) {
  const { state, actions } = useBaziPresenter(props);
  const {
    mode, question, chatInput, selectedPattern,
    birthDate, birthTime, gender, fullName, birthPlace,
    baziData, detectedPatterns, messages, isLoading, isStreaming,
    isGeneratingPoster, posterRef
  } = state;

  return (
    <RitualLayout
      title={mode === 'bazi' ? '八字命理' : mode === 'ziwei' ? '紫微斗数·天纪格局' : '流年运势'}
      subtitle={question}
      onReset={actions.handleReset}
      onShare={actions.handleGeneratePoster}
      isGeneratingPoster={isGeneratingPoster}
      isResultsVisible={messages.length > 0 || isLoading}
      posterRef={posterRef}
      resetLabel="重新排盘"
    >
      {!messages.length && !isLoading ? (
        <div className="w-full max-w-4xl mx-auto obsidian-glass p-8 md:p-12 rounded-[2.5rem] flex flex-col gap-10 shadow-[0_30px_90px_rgba(0,0,0,0.85)] border border-[#C9A84C]/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-xs font-serif tracking-[0.4em] text-[#C9A84C] uppercase font-medium">1. 出生天时 (阳历)</label>
              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A84C]/60 w-5 h-5" />
                  <input 
                    type="date" 
                    value={birthDate} 
                    onChange={(e) => actions.setBirthDate(e.target.value)} 
                    className="w-full bg-[#080510]/80 border border-[#C9A84C]/25 rounded-2xl py-3.5 pl-12 pr-4 text-[#FBF5D8] font-serif focus:border-[#C9A84C] focus:outline-none transition-all shadow-inner" 
                  />
                </div>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A84C]/60 w-5 h-5" />
                  <input 
                    type="time" 
                    value={birthTime} 
                    onChange={(e) => actions.setBirthTime(e.target.value)} 
                    className="w-full bg-[#080510]/80 border border-[#C9A84C]/25 rounded-2xl py-3.5 pl-12 pr-4 text-[#FBF5D8] font-serif focus:border-[#C9A84C] focus:outline-none transition-all shadow-inner" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-serif tracking-[0.4em] text-[#C9A84C] uppercase font-medium">2. 乾坤档案与地界</label>
              <div className="grid grid-cols-2 gap-4">
                <select 
                  value={gender} 
                  onChange={(e) => actions.setGender(e.target.value)} 
                  className="bg-[#080510]/80 border border-[#C9A84C]/25 rounded-2xl py-3.5 px-4 text-[#FBF5D8] font-serif focus:border-[#C9A84C] focus:outline-none transition-all cursor-pointer shadow-inner"
                >
                  <option value="" className="bg-[#080510] text-[#E8DFB8]">性别</option>
                  <option value="男" className="bg-[#080510] text-[#E8DFB8]">乾造 (男)</option>
                  <option value="女" className="bg-[#080510] text-[#E8DFB8]">坤造 (女)</option>
                </select>
                <input 
                  type="text" 
                  placeholder="姓名 / 雅号" 
                  value={fullName} 
                  onChange={(e) => actions.setFullName(e.target.value)} 
                  className="bg-[#080510]/80 border border-[#C9A84C]/25 rounded-2xl py-3.5 px-4 text-[#FBF5D8] font-serif focus:border-[#C9A84C] focus:outline-none transition-all placeholder:text-[#C9A84C]/35 shadow-inner" 
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A84C]/60 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="出生地点 (如：北京 / 成都)" 
                  value={birthPlace} 
                  onChange={(e) => actions.setBirthPlace(e.target.value)} 
                  className="w-full bg-[#080510]/80 border border-[#C9A84C]/25 rounded-2xl py-3.5 pl-11 pr-4 text-[#FBF5D8] font-serif text-sm focus:border-[#C9A84C] focus:outline-none transition-all placeholder:text-[#C9A84C]/35 shadow-inner" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-serif tracking-[0.4em] text-[#C9A84C] uppercase font-medium">3. 灵魂意图倾诉 (选填)</label>
            <textarea 
              rows={3} 
              value={question} 
              onChange={(e) => actions.setQuestion(e.target.value)} 
              placeholder="请倾诉你当前所面临的事业转折、感情纠葛或希望探索的命运轨迹..." 
              className="w-full bg-[#080510]/80 border border-[#C9A84C]/25 rounded-2xl p-4 text-[#FBF5D8] font-serif focus:border-[#C9A84C] focus:outline-none focus:shadow-[0_0_25px_rgba(201,168,76,0.2)] transition-all resize-none placeholder:text-[#C9A84C]/35 shadow-inner" 
            />
          </div>

          <motion.button 
            id="bazi-trigger" 
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={actions.handleGenerate} 
            disabled={!birthDate || !birthTime} 
            className="w-full py-4.5 bg-gradient-to-r from-[#966316] via-[#C9A84C] to-[#966316] hover:from-[#aa721c] hover:to-[#dbb958] disabled:opacity-40 text-[#080510] font-bold rounded-full font-serif text-lg tracking-[0.35em] shadow-[0_0_35px_rgba(201,168,76,0.35)] transition-all cursor-pointer select-none flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {mode === 'ziwei' ? '解构天纪紫微命盘与格局' : mode === 'liunian' ? '推演流年吉凶避坑指南' : '开启天干地支命盘之门'}
          </motion.button>
        </div>
      ) : (
        <div className="w-full max-w-4xl mx-auto space-y-10">
          {isLoading && !messages.length ? (
            <BreathingLoading text="正在通过阿卡夏记录与天纪星轨解密你的生命格局..." />
          ) : (
            <>
              {mode === 'ziwei' && detectedPatterns.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="obsidian-glass p-6 rounded-[2rem] border border-[#C9A84C]/35 space-y-4"
                >
                  <div className="flex items-center gap-2 text-[#C9A84C] font-serif text-sm tracking-widest uppercase font-bold">
                    <Crown className="w-4 h-4 text-[#C9A84C]" />
                    <span>命盘命中经典格局 ({detectedPatterns.length} 项)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detectedPatterns.map((p: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => actions.setSelectedPattern(p)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-serif flex items-center gap-2 transition-all cursor-pointer ${
                          p.level === 'excellent' 
                            ? 'bg-[#C9A84C]/25 border-[#C9A84C] text-[#FFFDF6] shadow-[0_0_15px_rgba(201,168,76,0.4)]'
                            : p.level === 'good'
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                            : 'bg-white/5 border-white/10 text-[#E8DFB8]/70'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Pattern Detail Card */}
                  {selectedPattern && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 rounded-2xl bg-[#080510]/90 border border-[#C9A84C]/50 space-y-2 mt-4 shadow-lg"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-serif font-bold text-[#F5E6AD] text-sm flex items-center gap-2">
                          <span>✦</span>
                          {selectedPattern.name}
                        </h4>
                        <button 
                          onClick={() => actions.setSelectedPattern(null)}
                          className="text-xs text-[#C9A84C]/50 hover:text-[#C9A84C] p-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs text-[#E8DFB8]/90 font-serif leading-relaxed">{selectedPattern.desc}</p>
                      <div className="text-[11px] text-[#C9A84C] font-mono tracking-wider pt-1">
                        诗决：{selectedPattern.verse || "天机玄妙，吉凶相伴"}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {baziData?.baziString && <BaziChart baziString={baziData.baziString} />}
              
              <MysticChatInterface
                messages={messages}
                input={chatInput}
                setInput={actions.setChatInput}
                onSend={(e) => {
                  e.preventDefault();
                  actions.sendMessage(chatInput);
                  actions.setChatInput('');
                }}
                isLoading={isLoading}
                isStreaming={isStreaming}
              />
            </>
          )}
        </div>
      )}
    </RitualLayout>
  );
}
