"use client";

import { motion } from "motion/react";
import { 
  Sparkles, 
  Brain, 
  Fingerprint, 
  Dna, 
  Activity,
  ChevronRight,
  ShieldCheck,
  Zap,
  Heart
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

export function SoulView() {
  const { profile } = useUserProfile();

  const soulStats = [
    { name: "灵性感知", value: 85, color: "bg-purple-500" },
    { name: "情绪韧性", value: 72, color: "bg-blue-500" },
    { name: "直觉强度", value: 94, color: "bg-amber-500" },
    { name: "生命能量", value: 68, color: "bg-emerald-500" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto pb-20 space-y-12"
    >
      {/* Profile Header */}
      <section className="flex flex-col items-center text-center">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative w-full h-full rounded-full border-2 border-amber-500/30 flex items-center justify-center bg-[#080510]">
            <Fingerprint className="w-16 h-16 text-amber-500/80" />
          </div>
        </div>
        <h1 className="text-4xl font-serif text-amber-100 tracking-widest mb-2">
          {profile.name || "无名旅者"}
        </h1>
        <p className="text-amber-200/40 font-serif tracking-[0.2em] text-sm uppercase">
          Soul Signature: {profile.mbti || "Unknown"}-{profile.enneagram?.split(' ')[0] || "X"}
        </p>
      </section>

      {/* Main Traits Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TraitCard 
          icon={Brain}
          label="思维倾向"
          value={profile.mbti || "待测评"}
          description="你的核心人格类型，决定了你处理信息与决策的方式。"
          color="text-blue-400"
        />
        <TraitCard 
          icon={Heart}
          label="情感驱动"
          value={profile.enneagram || "待测评"}
          description="你的核心动机与恐惧，揭示了你内心最深处的渴望。"
          color="text-pink-400"
        />
        <TraitCard 
          icon={Zap}
          label="能量原型"
          value={profile.jungianArchetype || "待测评"}
          description="你灵魂深处的原始映射，指引着你的潜意识行为。"
          color="text-amber-400"
        />
      </section>

      {/* Soul Stats & Details */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 glass-panel p-8 rounded-3xl space-y-8">
          <h3 className="text-xl font-serif text-amber-100 tracking-widest flex items-center gap-3">
            <Activity className="w-5 h-5 text-amber-500" />
            灵魂能量维度
          </h3>
          <div className="space-y-8">
            {soulStats.map((stat) => (
              <div key={stat.name} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-serif text-amber-100/60 tracking-wider">{stat.name}</span>
                  <span className="text-xs font-mono text-amber-500">{stat.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.value}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full ${stat.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h4 className="text-amber-200 font-serif flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> 灵魂契约
            </h4>
            <p className="text-xs text-amber-100/40 leading-relaxed italic">
              "你生而完整，只是在旅途中暂忘了自己的光芒。此生的课题是学会在混乱中寻找平衡。"
            </p>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h4 className="text-amber-200 font-serif flex items-center gap-2">
              <Dna className="w-4 h-4" /> 业力轨迹
            </h4>
            <div className="space-y-3">
              {[
                "已开启 3/22 大阿尔卡那",
                "完成了 12 次深度冥想",
                "探索了 5 个不同的时空维度"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-[10px] text-amber-100/30 font-serif">
                  <div className="w-1 h-1 rounded-full bg-amber-500/40" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Action Footnote */}
      <div className="flex justify-center">
        <button className="flex items-center gap-2 px-8 py-3 rounded-full border border-amber-500/20 text-amber-500 hover:bg-amber-500/10 transition-all font-serif tracking-[0.2em] text-sm group">
          导出灵魂档案报告
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

function TraitCard({ icon: Icon, label, value, description, color }: any) {
  return (
    <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6 group hover:border-white/10 transition-all">
      <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 w-fit ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-xs font-serif text-white/30 uppercase tracking-[0.2em] mb-2">{label}</h4>
        <div className="text-2xl font-serif text-amber-100 tracking-widest mb-4">{value}</div>
        <p className="text-xs text-white/40 leading-relaxed font-light">
          {description}
        </p>
      </div>
    </div>
  );
}
