import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Save, Trash2 } from "lucide-react";
import { useUserProfile, UserProfile } from "@/hooks/useUserProfile";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { profile, updateProfile, clearProfile, isLoaded } = useUserProfile();
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [prevProfile, setPrevProfile] = useState<UserProfile>(profile);

  // Sync local profile when external profile changes (React 19 pattern)
  if (profile !== prevProfile) {
    setLocalProfile(profile);
    setPrevProfile(profile);
  }

  const handleSave = () => {
    updateProfile(localProfile);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-amber-500/20 bg-black/40">
              <div className="flex items-center gap-2 text-amber-300">
                <User className="w-5 h-5" />
                <h2 className="font-serif font-bold tracking-widest text-lg">个人档案</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-amber-100/60 hover:text-amber-300 transition-colors rounded-full hover:bg-amber-500/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <p className="text-xs text-amber-200/60 mb-4">
                预填写的个人信息将仅保存在本地浏览器中，用于为占卜和解析提供更精准的背景参考。
              </p>

              <div className="space-y-1">
                <label className="text-xs font-medium text-amber-200/80">称呼 / 姓名</label>
                <input
                  type="text"
                  value={localProfile.name}
                  onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                  className="w-full bg-black/50 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-amber-100 placeholder-amber-100/30 focus:outline-none focus:border-amber-500/50 transition-colors"
                  placeholder="例如：小明 / Alice"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-amber-200/80">性别</label>
                  <select
                    value={localProfile.gender}
                    onChange={(e) => setLocalProfile({ ...localProfile, gender: e.target.value })}
                    className="w-full bg-black/50 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                  >
                    <option value="">未选择</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-amber-200/80">MBTI</label>
                  <input
                    type="text"
                    value={localProfile.mbti}
                    onChange={(e) => setLocalProfile({ ...localProfile, mbti: e.target.value.toUpperCase() })}
                    className="w-full bg-black/50 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-amber-100 placeholder-amber-100/30 focus:outline-none focus:border-amber-500/50 transition-colors"
                    placeholder="例如：INTJ"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-amber-200/80">出生日期</label>
                  <input
                    type="date"
                    value={localProfile.birthDate}
                    onChange={(e) => setLocalProfile({ ...localProfile, birthDate: e.target.value })}
                    className="w-full bg-black/50 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500/50 transition-colors [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-amber-200/80">出生时间</label>
                  <input
                    type="time"
                    value={localProfile.birthTime}
                    onChange={(e) => setLocalProfile({ ...localProfile, birthTime: e.target.value })}
                    className="w-full bg-black/50 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500/50 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-amber-200/80">出生地点</label>
                <input
                  type="text"
                  value={localProfile.birthPlace || ''}
                  onChange={(e) => setLocalProfile({ ...localProfile, birthPlace: e.target.value })}
                  className="w-full bg-black/50 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-amber-100 placeholder-amber-100/30 focus:outline-none focus:border-amber-500/50 transition-colors"
                  placeholder="例如：北京, 上海"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-amber-200/80">当前状态 / 核心诉求</label>
                <textarea
                  value={localProfile.currentStatus}
                  onChange={(e) => setLocalProfile({ ...localProfile, currentStatus: e.target.value })}
                  className="w-full bg-black/50 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-amber-100 placeholder-amber-100/30 focus:outline-none focus:border-amber-500/50 transition-colors min-h-[60px] resize-none"
                  placeholder="例如：正在考虑换工作，或者最近感情遇到瓶颈..."
                />
              </div>

              <div className="pt-4 border-t border-amber-500/20 mt-4">
                <h3 className="text-sm font-serif font-bold text-amber-300 mb-3">深度灵魂档案 (Soul Profile)</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-amber-200/80">荣格原型 (Jungian Archetype)</label>
                    <select
                      value={localProfile.jungianArchetype || ''}
                      onChange={(e) => setLocalProfile({ ...localProfile, jungianArchetype: e.target.value })}
                      className="w-full bg-black/50 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                    >
                      <option value="">未选择</option>
                      <option value="天真者 (The Innocent)">天真者 (The Innocent)</option>
                      <option value="孤儿/凡夫俗子 (The Orphan/Regular Guy)">孤儿/凡夫俗子 (The Orphan)</option>
                      <option value="英雄 (The Hero)">英雄 (The Hero)</option>
                      <option value="照顾者 (The Caregiver)">照顾者 (The Caregiver)</option>
                      <option value="探索者 (The Explorer)">探索者 (The Explorer)</option>
                      <option value="反叛者 (The Rebel)">反叛者 (The Rebel)</option>
                      <option value="情人 (The Lover)">情人 (The Lover)</option>
                      <option value="创造者 (The Creator)">创造者 (The Creator)</option>
                      <option value="小丑/弄臣 (The Jester)">小丑/弄臣 (The Jester)</option>
                      <option value="智者 (The Sage)">智者 (The Sage)</option>
                      <option value="魔术师 (The Magician)">魔术师 (The Magician)</option>
                      <option value="统治者 (The Ruler)">统治者 (The Ruler)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-amber-200/80">核心人生议题 (Core Issues) - 用逗号分隔</label>
                    <input
                      type="text"
                      value={(localProfile.coreIssues || []).join(', ')}
                      onChange={(e) => setLocalProfile({ ...localProfile, coreIssues: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className="w-full bg-black/50 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-amber-100 placeholder-amber-100/30 focus:outline-none focus:border-amber-500/50 transition-colors"
                      placeholder="例如：原生家庭, 亲密关系恐惧, 完美主义"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-amber-200/80">重大人生节点 (Life Events)</label>
                      <button 
                        onClick={() => {
                          const newEvents = [...(localProfile.lifeEvents || []), { id: Date.now().toString(), date: '', description: '', impact: 'transformative' as const }];
                          setLocalProfile({ ...localProfile, lifeEvents: newEvents });
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300"
                      >
                        + 添加节点
                      </button>
                    </div>
                    <div className="space-y-2 mt-2">
                      {(localProfile.lifeEvents || []).map((event, index) => (
                        <div key={event.id} className="flex gap-2 items-start bg-black/30 p-2 rounded border border-amber-500/10">
                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <input 
                                type="date" 
                                value={event.date}
                                onChange={(e) => {
                                  const newEvents = [...(localProfile.lifeEvents || [])];
                                  newEvents[index].date = e.target.value;
                                  setLocalProfile({ ...localProfile, lifeEvents: newEvents });
                                }}
                                className="bg-black/50 border border-amber-500/20 rounded px-2 py-1 text-xs text-amber-100 [color-scheme:dark] w-1/2"
                              />
                              <select
                                value={event.impact}
                                onChange={(e) => {
                                  const newEvents = [...(localProfile.lifeEvents || [])];
                                  newEvents[index].impact = e.target.value as any;
                                  setLocalProfile({ ...localProfile, lifeEvents: newEvents });
                                }}
                                className="bg-black/50 border border-amber-500/20 rounded px-2 py-1 text-xs text-amber-100 w-1/2 appearance-none"
                              >
                                <option value="positive">正面影响</option>
                                <option value="negative">负面创伤</option>
                                <option value="transformative">重大蜕变</option>
                              </select>
                            </div>
                            <input 
                              type="text" 
                              value={event.description}
                              onChange={(e) => {
                                const newEvents = [...(localProfile.lifeEvents || [])];
                                newEvents[index].description = e.target.value;
                                setLocalProfile({ ...localProfile, lifeEvents: newEvents });
                              }}
                              placeholder="事件描述 (如: 亲人离世, 换城市生活)"
                              className="w-full bg-black/50 border border-amber-500/20 rounded px-2 py-1 text-xs text-amber-100 placeholder-amber-100/30"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              const newEvents = (localProfile.lifeEvents || []).filter((_, i) => i !== index);
                              setLocalProfile({ ...localProfile, lifeEvents: newEvents });
                            }}
                            className="text-red-400/60 hover:text-red-400 p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {(!localProfile.lifeEvents || localProfile.lifeEvents.length === 0) && (
                        <p className="text-xs text-amber-200/40 italic text-center py-2">暂无记录，添加重大节点帮助 AI 更好地理解你的生命轨迹</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-amber-500/20 bg-black/40 flex justify-between items-center">
              <button
                onClick={() => {
                  if (window.confirm('确定要重置所有档案信息吗？此操作不可撤销。')) {
                    clearProfile();
                    onClose();
                  }
                }}
                className="text-xs text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> 重置档案
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-amber-200/60 hover:text-amber-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-sm font-medium rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  <Save className="w-4 h-4" />
                  保存档案
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
