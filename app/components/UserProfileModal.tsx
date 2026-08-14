"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, User, Calendar, MapPin, Brain, Save, Sparkles, LogOut, 
  ChevronRight, Sun, Moon, Sliders, Layers, Check, ShieldCheck, Zap
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { EasternService } from "@/lib/services/easternService";
import { AstrologyService } from "@/lib/services/astrologyService";
import { getCoreSystems, getDefaultEnabledModules } from "@/lib/registry/systems";






export default function UserProfileModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { profile, updateProfile, isLoaded, clearProfile } = useUserProfile();
  const [formData, setFormData] = useState(profile);
  const [activeTab, setActiveTab] = useState<'profile' | 'modules'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && isLoaded) {
      setFormData(profile);
    }
  }, [isOpen, isLoaded, profile]);

  const enabledModules: Record<string, boolean> = (formData.enabledModules as any) || getDefaultEnabledModules();

  const toggleModule = (key: string) => {
    setFormData(prev => ({
      ...prev,
      enabledModules: {
        ...enabledModules,
        [key]: !enabledModules[key]
      }
    }));
  };


  const handleSave = async () => {
    setIsSaving(true);
    
    // Auto-calculate metaphysical data if birth info changed
    const bazi = EasternService.getBazi(formData.birthDate || "", formData.birthTime || "").baziString;
    const zodiac = formData.birthDate ? EasternService.getZodiac(new Date(formData.birthDate).getFullYear()) : "";
    
    updateProfile({
      ...formData,
      bazi,
      zodiac
    });


    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 600);
  };

  const handleClear = () => {
    clearProfile();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#120b0e] border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header with Tab Switch */}
            <div className="p-6 border-b border-amber-500/10 flex items-center justify-between bg-gradient-to-r from-amber-500/5 to-transparent">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 font-serif text-sm tracking-widest transition-all pb-1 border-b-2 cursor-pointer ${
                    activeTab === 'profile' ? 'border-amber-400 text-amber-200 font-bold' : 'border-transparent text-amber-100/40 hover:text-amber-100'
                  }`}
                >
                  <User className="w-4 h-4 text-amber-500" />
                  <span>灵魂档案</span>
                </button>
                <button
                  onClick={() => setActiveTab('modules')}
                  className={`flex items-center gap-2 font-serif text-sm tracking-widest transition-all pb-1 border-b-2 cursor-pointer ${
                    activeTab === 'modules' ? 'border-amber-400 text-amber-200 font-bold' : 'border-transparent text-amber-100/40 hover:text-amber-100'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span>秘境功能与偏好</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-amber-100/40 hover:text-amber-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {activeTab === 'profile' ? (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard label="MBTI" value={`${formData.mbti || "未测"}${formData.mbtiIdentity || ""}`} />
                    <StatCard label="九型" value={formData.enneagram?.split(" ")[0] || "未测"} />
                    <StatCard label="原型" value={formData.jungianArchetype?.split(" ")[0] || "未探"} />
                    <StatCard label="星座" value={formData.birthDate ? AstrologyService.getSunSign(new Date(formData.birthDate)) : "未知"} />

                  </div>

                  {/* Form Groups */}
                  <div className="space-y-6">
                    <section className="space-y-4">
                      <h3 className="text-xs font-bold text-amber-500/60 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> 基础生命信息
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputGroup label="姓名/昵称" value={formData.name || ""} onChange={(v) => setFormData({ ...formData, name: v })} />
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-amber-100/40 ml-1">性别 (元气属性)</label>
                          <div className="grid grid-cols-3 gap-2 bg-black/40 p-1.5 border border-white/10 rounded-2xl">
                            {[
                              { value: "男", label: "乾造 (男)", icon: Sun, color: "text-amber-500", glow: "rgba(245,158,11,0.15)" },
                              { value: "女", label: "坤造 (女)", icon: Moon, color: "text-purple-400", glow: "rgba(192,132,252,0.15)" },
                              { value: "", label: "太极 (未知)", icon: Sparkles, color: "text-amber-200/50", glow: "rgba(251,191,36,0.08)" }
                            ].map((item) => {
                              const isActive = formData.gender === item.value;
                              const Icon = item.icon;
                              return (
                                <button
                                  key={item.value}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, gender: item.value })}
                                  className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-500 gap-1 select-none cursor-pointer ${
                                    isActive 
                                      ? "text-white border border-amber-500/30 bg-[#160f22]/60" 
                                      : "text-amber-100/40 hover:text-amber-100 hover:bg-white/5 border border-transparent"
                                  }`}
                                  style={isActive ? { boxShadow: `0 0 15px ${item.glow}` } : {}}
                                >
                                  <Icon className={`w-3.5 h-3.5 ${item.color} ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-500`} />
                                  <span className="text-[9px] font-serif tracking-wider">{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <InputGroup label="出生日期" type="date" value={formData.birthDate || ""} onChange={(v) => setFormData({ ...formData, birthDate: v })} />
                        <InputGroup label="出生时间" type="time" value={formData.birthTime || ""} onChange={(v) => setFormData({ ...formData, birthTime: v })} />
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-xs font-bold text-amber-500/60 uppercase tracking-[0.2em] flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> 地理能量位
                      </h3>
                      <InputGroup label="出生地点" value={formData.birthPlace || ""} onChange={(v) => setFormData({ ...formData, birthPlace: v })} placeholder="省份、城市" />
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-xs font-bold text-amber-500/60 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Brain className="w-3 h-3" /> 心理图谱
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <InputGroup label="MBTI" value={formData.mbti || ""} onChange={(v) => setFormData({ ...formData, mbti: v })} placeholder="如 INFJ" />
                        <InputGroup label="九型人格" value={formData.enneagram || ""} onChange={(v) => setFormData({ ...formData, enneagram: v })} placeholder="如 4号" />
                        <InputGroup label="核心原型" value={formData.jungianArchetype || ""} onChange={(v) => setFormData({ ...formData, jungianArchetype: v })} placeholder="如 智者" />
                      </div>
                    </section>
                    <section className="space-y-4">

                      <h3 className="text-xs font-bold text-amber-500/60 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> 神谕与占卜解读语风 (Speaking Style)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { id: 'grounded', label: '🕊️ 温润白话 · 围炉解惑', desc: '彻底说人话、讲真话、接地气、拒绝空洞假大空黑话' },
                          { id: 'classical', label: '📜 东方道韵 · 渊雅古风', desc: '言简意赅、文辞隽永、周易道家禅意机锋' },
                          { id: 'poetic', label: '🌌 空灵诗意 · 哲思启迪', desc: '深邃自省、星空哲思、无翻译腔' },
                          { id: 'direct', label: '⚡ 犀利直断 · 破局决策', desc: '直奔主题、刀刀见血、直接给利弊与破局策略' },
                        ].map((tone) => (
                          <div
                            key={tone.id}
                            onClick={() => setFormData({ ...formData, oracleTone: tone.id as any })}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                              (formData.oracleTone || 'grounded') === tone.id
                                ? 'bg-amber-500/15 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                : 'bg-black/30 border-white/10 text-white/50 hover:border-white/20 hover:text-white/80'
                            }`}
                          >
                            <div className="text-xs font-bold font-serif">{tone.label}</div>
                            <div className="text-[11px] opacity-70 font-serif leading-relaxed">{tone.desc}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </>

              ) : (
                /* Modules and Synergy Toggles */
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-amber-300 font-serif mb-1">
                      神秘学体系激活管理 (System Modular Toggles)
                    </h3>
                    <p className="text-xs text-amber-100/60 font-serif">
                      自定义你希望启用的探索系统。关闭后，首页探索卡片与向导将完全隐藏对应体系，保持极简专注。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {getCoreSystems().map((mod) => {
                      const isEnabled = enabledModules[mod.id] ?? mod.defaultEnabled;
                      const Icon = mod.icon;
                      return (
                        <div
                          key={mod.id}
                          onClick={() => toggleModule(mod.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                            isEnabled 
                              ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                              : 'bg-black/30 border-white/5 opacity-50'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-200 font-serif">
                              <Icon className="w-3.5 h-3.5 text-amber-400" />
                              <span>{mod.name}</span>
                            </div>
                            <div className="text-[11px] text-amber-100/60 font-serif line-clamp-2">{mod.tagline || mod.desc}</div>
                          </div>
                          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ml-3 ${
                            isEnabled ? 'bg-amber-500 border-amber-400 text-black' : 'border-white/20'
                          }`}>
                            {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>


                  {/* Cross System Synergy Toggle */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 to-amber-950/20 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-300 font-serif">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>跨体系能量共振与联动 (Cross-System Synergy)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, enableCrossSystemSynergy: !prev.enableCrossSystemSynergy }))}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          formData.enableCrossSystemSynergy ? 'bg-amber-500' : 'bg-white/20'
                        }`}
                      >
                        <motion.div
                          className="w-5 h-5 rounded-full bg-black absolute top-0.5"
                          animate={{ left: formData.enableCrossSystemSynergy ? 'calc(100% - 22px)' : '2px' }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                    <p className="text-[11px] text-purple-200/70 font-serif leading-relaxed">
                      • <strong>开启后</strong>：在八字或星盘推演中，若发现身心五运六气或心理原型有强烈共振，AI 将提供跨维度的全息参照；<br />
                      • <strong>关闭后（推荐纯粹主义者）</strong>：AI 视界将保持 100% 独立与纯正专精，绝不穿插任何其他学科术语。
                    </p>
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              <div className="pt-8 border-t border-white/5">
                {!showClearConfirm ? (
                  <button 
                    onClick={() => setShowClearConfirm(true)}
                    className="text-xs text-red-500/40 hover:text-red-500 flex items-center gap-2 transition-colors ml-auto cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" /> 重置灵魂档案与偏好
                  </button>
                ) : (
                  <div className="flex items-center gap-4 justify-end">
                    <span className="text-xs text-red-500 animate-pulse">确定要清除所有数据吗？</span>
                    <button onClick={() => setShowClearConfirm(false)} className="text-xs text-amber-100/40 hover:text-amber-100 cursor-pointer">取消</button>
                    <button onClick={handleClear} className="text-xs text-red-500 font-bold px-3 py-1 bg-red-500/10 rounded-lg cursor-pointer">确定重置</button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-black/20 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-2xl border border-white/10 text-amber-100/60 hover:bg-white/5 transition-all text-sm font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-serif tracking-widest text-sm shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isSaving ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> 保存设定
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div 
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="bg-gradient-to-b from-[#181122]/60 to-[#0c0714]/80 backdrop-blur-xl border border-amber-500/15 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-lg hover:border-amber-500/40 transition-colors duration-500 relative group overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <span className="text-[9px] uppercase tracking-[0.2em] font-serif text-amber-500/50 mb-1 group-hover:text-amber-500/75 transition-colors">{label}</span>
      <span className="text-xs font-serif text-amber-100 line-clamp-1">{value}</span>
    </motion.div>
  );
}

function InputGroup({ label, value, onChange, type = "text", placeholder = "" }: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-amber-100/40 ml-1 font-serif tracking-[0.15em] uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#080510]/40 backdrop-blur-3xl border border-white/10 rounded-2xl px-4 py-3 text-amber-100 outline-none focus:border-amber-500/40 focus:bg-[#080510]/60 focus:shadow-[0_0_30px_rgba(245,158,11,0.06)] transition-all placeholder:text-white/10 text-sm [color-scheme:dark]"
      />
    </div>
  );
}
