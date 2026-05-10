import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { Clock, Moon, Sun, Star } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAIChat } from "@/hooks/useAIChat";
import BreathingLoading from "./BreathingLoading";

// Simple moon phase calculator
function getMoonPhase(date: Date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  
  if (month < 3) {
    year--;
    month += 12;
  }
  
  ++month;
  let c = 365.25 * year;
  let e = 30.6 * month;
  let jd = c + e + day - 694039.09; // jd is total days elapsed
  jd /= 29.5305882; // divide by the moon cycle
  let b = parseInt(jd.toString()); // int(jd) -> b, take integer part of jd
  jd -= b; // subtract integer part to leave fractional part of original jd
  let b2 = Math.round(jd * 8); // scale fraction from 0-8 and round
  
  if (b2 >= 8) b2 = 0; // 0 and 8 are the same so turn 8 into 0
  
  const phases = [
    { name: "新月 (New Moon)", desc: "播种意图，开启新周期的最佳时机。" },
    { name: "蛾眉月 (Waxing Crescent)", desc: "积蓄能量，开始采取初步行动。" },
    { name: "上弦月 (First Quarter)", desc: "遇到挑战，需要做出决定和调整。" },
    { name: "盈凸月 (Waxing Gibbous)", desc: "完善细节，保持耐心等待结果。" },
    { name: "满月 (Full Moon)", desc: "能量顶峰，情绪释放，收获与显化。" },
    { name: "亏凸月 (Waning Gibbous)", desc: "感恩回馈，分享经验，开始向内收敛。" },
    { name: "下弦月 (Last Quarter)", desc: "释放放手，清理不再服务于你的事物。" },
    { name: "残月 (Waning Crescent)", desc: "深度休息，反思与疗愈，准备下一个循环。" }
  ];
  
  return phases[b2];
}

export default function TimeWisdomApp() {
  const { profile, getProfileContext } = useUserProfile();
  const [reading, setReading] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const today = useMemo(() => new Date(), []);
  const moonPhase = useMemo(() => getMoonPhase(today), [today]);

  const { sendMessage, isLoading, error } = useAIChat({
    systemInstruction: `你是一位精通占星学（Astrology）和时间周期律的「时间智者」。
请基于当前的宇宙天象（如今天的月相、近期的重要星象）以及用户的灵魂档案，为他们提供一份当下的「时间智慧」解读。
语气：充满宇宙的宏大感，同时又落地于日常生活的指导。`,
  });

  const generateReading = useCallback(async () => {
    if (hasGenerated) return;
    
    const prompt = `
<instruction>
请结合今天的月相能量和近期的宏观星象（如土星、木星的行进，或水逆等，可根据当前日期合理推演），为我提供一份专属的「流年/近期运势提醒」。
重点放在：我当下的能量适合做什么？需要避开什么？
</instruction>

<divination_context>
  <time>${today.toLocaleDateString()}</time>
  <moon_phase>${moonPhase.name}</moon_phase>
</divination_context>

<user_profile>
  ${getProfileContext()}
</user_profile>

<output_format>
使用Markdown排版。结构应清晰，重点分明，给出具体可操作的能量建议。
</output_format>
`;

    try {
      const response = await sendMessage(prompt);
      setReading(response);
      setHasGenerated(true);
    } catch (e) {
      console.error(e);
    }
  }, [hasGenerated, today, moonPhase.name, getProfileContext, sendMessage]);

  useEffect(() => {
    if (profile.birthDate && !hasGenerated && !isLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      generateReading();
      setHasGenerated(true);
    }
  }, [profile.birthDate, generateReading, hasGenerated, isLoading]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-blue-400 tracking-widest mb-4 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">
          时间智慧 (Time Wisdom)
        </h1>
        <p className="text-blue-200/60 max-w-2xl mx-auto text-sm md:text-base">
          顺应宇宙的呼吸。通过星象、月相与流年，把握当下的能量节律。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center text-center">
          <Clock className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-sm font-medium text-blue-300 mb-1">今日日期</h3>
          <p className="text-lg font-serif text-blue-100">{today.toLocaleDateString()}</p>
        </div>
        <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center text-center">
          <Moon className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-sm font-medium text-blue-300 mb-1">当前月相</h3>
          <p className="text-lg font-serif text-blue-100 mb-2">{moonPhase.name}</p>
          <p className="text-xs text-blue-200/70">{moonPhase.desc}</p>
        </div>
        <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center text-center">
          <Sun className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-sm font-medium text-blue-300 mb-1">宇宙能量</h3>
          <p className="text-xs text-blue-200/70 mt-2">
            结合您的本命盘与当前天象，计算专属流年指引。
          </p>
        </div>
      </div>

      <div className="bg-black/40 border border-blue-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm min-h-[300px]">
        {!profile.birthDate ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <Star className="w-12 h-12 text-blue-500/50 mb-4" />
            <p className="text-blue-200/70 mb-4">需要您的出生信息来计算专属的时间智慧。</p>
            <p className="text-sm text-blue-300/50">请在右上角「档案」中完善信息。</p>
          </div>
        ) : isLoading ? (
          <div className="py-20">
            <BreathingLoading text="正在观测星象轨迹与流年能量..." />
          </div>
        ) : error ? (
          <div className="text-center text-red-400 p-4">{error}</div>
        ) : reading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-invert prose-blue max-w-none"
          >
            <div className="whitespace-pre-wrap text-blue-50/90 leading-relaxed font-serif text-sm md:text-base">
              {reading}
            </div>
          </motion.div>
        ) : (
          <div className="flex justify-center py-12">
            <button
              onClick={generateReading}
              className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-200 px-8 py-3 rounded-full font-serif transition-colors"
            >
              获取今日时间智慧
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
