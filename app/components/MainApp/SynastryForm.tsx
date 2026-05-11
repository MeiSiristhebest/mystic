"use client";

import { motion } from "motion/react";
import { Users, Heart, Sparkles } from "lucide-react";

export default function SynastryForm({ 
  personA, 
  setPersonA, 
  personB, 
  setPersonB, 
  onSubmit 
}: { 
  personA: any, 
  setPersonA: any, 
  personB: any, 
  setPersonB: any, 
  onSubmit: () => void 
}) {
  return (
    <div className="glass-panel p-8 md:p-12 rounded-3xl space-y-12">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 rounded-2xl bg-pink-500/10">
          <Heart className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-3xl font-serif text-pink-100 tracking-widest">缘分共鸣契约</h2>
        <p className="text-pink-200/40 font-serif text-sm">请输入两位旅者的灵性基础信息</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
        {/* Connector Line */}
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-10">
          <Sparkles className="w-12 h-12 text-pink-500" />
        </div>

        {/* Person A */}
        <div className="space-y-6 relative z-10">
          <h4 className="text-xs font-serif text-pink-500/60 uppercase tracking-[0.2em]">甲方 (本人/主要方)</h4>
          <input
            type="text"
            placeholder="姓名/昵称"
            value={personA.name}
            onChange={(e) => setPersonA({...personA, name: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-white/20 focus:ring-2 focus:ring-pink-500/30"
          />
          <input
            type="date"
            value={personA.birthDate}
            onChange={(e) => setPersonA({...personA, birthDate: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:ring-2 focus:ring-pink-500/30"
          />
        </div>

        {/* Person B */}
        <div className="space-y-6 relative z-10">
          <h4 className="text-xs font-serif text-purple-500/60 uppercase tracking-[0.2em]">乙方 (对方/关联方)</h4>
          <input
            type="text"
            placeholder="对方姓名/昵称"
            value={personB.name}
            onChange={(e) => setPersonB({...personB, name: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-white/20 focus:ring-2 focus:ring-purple-500/30"
          />
          <input
            type="date"
            value={personB.birthDate}
            onChange={(e) => setPersonB({...personB, birthDate: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:ring-2 focus:ring-purple-500/30"
          />
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onSubmit}
          disabled={!personA.name || !personB.name}
          className="px-12 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-serif tracking-[0.3em] shadow-xl hover:scale-105 transition-all disabled:opacity-30"
        >
          感应缘分深度
        </button>
      </div>
    </div>
  );
}
