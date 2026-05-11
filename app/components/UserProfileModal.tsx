"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Calendar, MapPin, Brain, Save, Sparkles, LogOut, ChevronRight } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { calculateBazi, getZodiac, getSunSign } from "@/lib/metaphysics";

export default function UserProfileModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { profile, updateProfile, isLoaded, clearProfile } = useUserProfile();
  const [formData, setFormData] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (isLoaded && JSON.stringify(profile) !== JSON.stringify(formData)) {
      setFormData(profile);
    }
  }, [profile, isLoaded, formData]);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Auto-calculate metaphysical data if birth info changed
    const bazi = calculateBazi(formData.birthDate || "", formData.birthTime || "");
    const zodiac = formData.birthDate ? getZodiac(new Date(formData.birthDate).getFullYear()) : "";
    
    updateProfile({
      ...formData,
      bazi,
      zodiac
    });

    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 800);
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
            {/* Header */}
            <div className="p-6 border-b border-amber-500/10 flex items-center justify-between bg-gradient-to-r from-amber-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <User className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-xl font-serif text-amber-100 tracking-widest">灵魂档案</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-amber-100/40 hover:text-amber-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="MBTI" value={`${formData.mbti || "未测"}${formData.mbtiIdentity || ""}`} />
                <StatCard label="九型" value={formData.enneagram?.split(" ")[0] || "未测"} />
                <StatCard label="原型" value={formData.jungianArchetype?.split(" ")[0] || "未探"} />
                <StatCard label="星座" value={formData.birthDate ? getSunSign(new Date(formData.birthDate)) : "未知"} />
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
                      <label className="text-[10px] text-amber-100/40 ml-1">性别</label>
                      <select 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-amber-100 outline-none focus:border-amber-500/40 transition-all appearance-none"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <option value="">未知</option>
                        <option value="男">男 (乾造)</option>
                        <option value="女">女 (坤造)</option>
                      </select>
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
              </div>

              {/* Danger Zone */}
              <div className="pt-8 border-t border-white/5">
                {!showClearConfirm ? (
                  <button 
                    onClick={() => setShowClearConfirm(true)}
                    className="text-xs text-red-500/40 hover:text-red-500 flex items-center gap-2 transition-colors ml-auto"
                  >
                    <LogOut className="w-3 h-3" /> 重置灵魂档案
                  </button>
                ) : (
                  <div className="flex items-center gap-4 justify-end">
                    <span className="text-xs text-red-500 animate-pulse">确定要清除所有数据吗？</span>
                    <button onClick={() => setShowClearConfirm(false)} className="text-xs text-amber-100/40 hover:text-amber-100">取消</button>
                    <button onClick={handleClear} className="text-xs text-red-500 font-bold px-3 py-1 bg-red-500/10 rounded-lg">确定重置</button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-black/20 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-2xl border border-white/10 text-amber-100/60 hover:bg-white/5 transition-all text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-serif tracking-widest text-sm shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 group"
              >
                {isSaving ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> 封印档案
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
    <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
      <span className="text-[9px] uppercase tracking-widest text-amber-500/40 mb-1">{label}</span>
      <span className="text-xs font-serif text-amber-100 line-clamp-1">{value}</span>
    </div>
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
      <label className="text-[10px] text-amber-100/40 ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-amber-100 outline-none focus:border-amber-500/40 transition-all placeholder:text-white/5 text-sm [color-scheme:dark]"
      />
    </div>
  );
}
