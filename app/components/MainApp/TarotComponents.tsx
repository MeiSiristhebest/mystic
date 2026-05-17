"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Sparkles, Compass } from "lucide-react";
import { CardFrame } from "./Visuals";
import ReactMarkdown from "react-markdown";
import { generateContentStream, AKASHA_PERSONA } from "@/lib/ai";
import { AssociationBubble } from "../AssociationBubble";



export function TarotCardBack({ size = "medium", className = "" }: { size?: "small" | "medium" | "large", className?: string }) {
  const sizeClasses = {
    small: "w-16 h-24 md:w-20 md:h-32",
    medium: "w-24 h-36 md:w-32 md:h-52",
    large: "w-32 h-48 md:w-40 md:h-64"
  };
  return (
    <CardFrame className={`${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full bg-[#0a0510] border border-amber-500/30 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay" />
        <div className="absolute inset-2 border border-amber-500/20 rounded-lg" />
        <div className="absolute inset-4 border border-amber-500/10 rounded-md" />
        <div className="w-8 h-8 rotate-45 border border-amber-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(201,168,76,0.2)]">
          <div className="w-4 h-4 rotate-45 bg-amber-500/20" />
        </div>
      </div>
    </CardFrame>
  );
}

interface SpreadLayoutRendererProps {
  cards: any[];
  mode?: string;
  revealedCards?: boolean[];
  handleRevealCard?: (idx: number) => void;
  setSelectedCard?: (card: any) => void;
  cardSize?: "small" | "medium" | "large";
  positions?: string[];
}

export function SpreadLayoutRenderer({ 
  cards, 
  mode, 
  revealedCards, 
  handleRevealCard, 
  setSelectedCard, 
  cardSize = "medium", 
  positions 
}: SpreadLayoutRendererProps) {
  const isSmall = cardSize === "small";
  
  return (
    <div className={`flex flex-wrap justify-center gap-4 md:gap-8 py-8 ${isSmall ? 'scale-90' : ''}`}>
      {cards.map((card, i) => {
        // Use card.image (GitHub) as primary, trustedtarot as fallback
        const imageUrl = card.image || `https://www.trustedtarot.com/img/cards/${card.englishName?.toLowerCase().replace(/ /g, "-") || card.id?.toLowerCase()}.png`;
        const isRevealed = revealedCards ? revealedCards[i] : true;
        
        return (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`flex flex-col items-center gap-3`}
            onClick={() => setSelectedCard?.(card)}
          >
            {positions && positions[i] && (
              <span className="text-[10px] font-serif text-amber-500/60 uppercase tracking-widest text-center max-w-[100px]">
                {positions[i]}
              </span>
            )}
            <div 
              className={`relative ${isSmall ? 'w-20 h-32 md:w-24 md:h-40' : 'w-24 h-40 md:w-32 md:h-52'} rounded-xl border border-amber-500/30 overflow-hidden shadow-2xl cursor-pointer group hover:border-amber-500/60 transition-all`}
            >
              <img 
                src={imageUrl} 
                alt={card.name} 
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${card.isReversed ? 'rotate-180' : ''}`} 
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                 <span className="text-[10px] font-serif text-amber-100 drop-shadow-md">{card.name}</span>
                 {card.isReversed && <div className="text-[8px] text-amber-500/80">逆位</div>}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

interface CardMeaningModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: any;
  cache?: Record<string, string>;
  setCache?: (cache: Record<string, string>) => void;
}

const modalMarkdownComponents = {
  h3: ({ children }: any) => <h3 className="text-lg md:text-xl font-serif text-amber-300 mt-6 mb-3 flex items-center gap-2 border-b border-amber-500/30 pb-2">{children}</h3>,
  h4: ({ children }: any) => <h4 className="text-md font-serif text-amber-400 mt-4 mb-2">{children}</h4>,
  p: ({ children }: any) => <p className="text-xs md:text-sm text-amber-100/90 font-serif leading-relaxed mb-4 tracking-wide">{children}</p>,
  strong: ({ children }: any) => <strong className="font-serif text-amber-300 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{children}</strong>,
  li: ({ children }: any) => <li className="text-xs md:text-sm text-amber-100/90 font-serif leading-relaxed mb-2.5 flex items-start gap-2"><span className="text-amber-500 mt-0.5">✦</span> <span>{children}</span></li>,
  ul: ({ children }: any) => <ul className="space-y-2 my-4 pl-2">{children}</ul>,
};

export function CardMeaningModal({ isOpen, onClose, card, cache, setCache }: CardMeaningModalProps) {
  const [deepMeaning, setDeepMeaning] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !card) return;
    const cacheKey = `${card.name}-${card.isReversed ? 'rev' : 'up'}`;
    if (cache && cache[cacheKey]) {
      setTimeout(() => {
        setDeepMeaning(cache[cacheKey]);
        setIsLoading(false);
      }, 0);
    } else {
      setTimeout(() => {
        setDeepMeaning("");
        setIsLoading(true);
      }, 0);
      let full = "";
      let isSubscribed = true;
      const runAI = async () => {
        try {
          const prompt = `<system_instruction>
<role>
你现在化身为一位学识渊博的“塔罗学者”与深层灵性分析师。你精通荣格分析心理学（自性化 Individuation、原型客体 Archetypes、阴影投射 Shadow Projection）以及阿卡夏秘辛。
</role>
<task_objective>
为用户针对特定塔罗牌提供一份极具古典典雅质感、充满智慧光芒与深刻临床心理学洞察的单牌深度解析档案。
</task_objective>
<esoteric_framework>
- 【原型与共时性】：将牌面意象解读为集体无意识中普遍存在的原型图式，反映用户生命历程中当下的共时性共振。
- 【正逆位能量流变】：正位代表能量的自然顺畅流露与显化；逆位则代表内在能量的内化、压抑、过度或正在积蓄等待破局（绝非单纯的厄运）。
</esoteric_framework>
<chain_of_thought_protocol>
在开始生成文本前，请在内部 <thinking> 标签内进行深层推盘分析（对用户不可见）：
1. 提取该卡牌（${card.name} ${card.isReversed ? '逆位' : '正位'}）的神话背景、色彩密码、星象元素对应关系。
2. 推测当抽到此牌时，求问者在情感依恋、事业发展与潜意识层面正面临何种心理防御机制与人生课题。
3. 构思“学者寄语”与破局转化的实操行动建议。
</chain_of_thought_protocol>
<formatting_and_tone>
- 语言基调：极具古典诗意、温暖包容、睿智深邃，如同一位温和优雅的导师在古老书房中向求问者娓娓道来。
- 符号点缀：自然且富有美感地使用星象与神秘学 Emoji（如 🌌 🔮 🌿 🌙 ✨ ⚡ 🧿 🗝️ 🎴 🦋 🌸 🕯️ 等），营造灵动高尚的仪式感。
- 排版要求：严格遵循如下的高级 Markdown 结构，禁止多余前缀或脱离大纲。
</formatting_and_tone>
</system_instruction>

<divination_context>
  <card_name>${card.name}</card_name>
  <english_name>${card.englishName || ''}</english_name>
  <arcana_type>${card.arcana}</arcana_type>
  <suit_domain>${card.suit || '大阿尔卡纳'}</suit_domain>
  <direction>${card.isReversed ? '逆位 (Reversed)' : '正位 (Upright)'}</direction>
  <core_theme>${card.coreTheme || ''}</core_theme>
</divination_context>

<output_format>
你好。我是塔罗学者。很高兴能为你深度解读${card.arcana === 'Major' ? '大阿尔卡纳中代表...' : `小阿尔卡纳【${card.suit}】牌组中象征...`}的——【${card.name}】（${card.englishName || ''}）。

在塔罗的宏大生命旅程中，（在此处用极富画面感与哲学深度的语言点出该牌的核心意涵，以及当前正/逆位象征的能量流动与生命启示）。

### 🃏 牌面符号与神话意象
（细致入微地拆解牌面构图、核心符号密码、色彩语言以及对应的荣格心理学原型或占星元素属性）

### 🔑 核心能量本质
（精准凝练当前位态下的核心启示、能量流向与深层灵性意涵）

### 🔮 具体领域深度感应
- **情感与亲密关系**：（结合依恋理论与情感动力学，深度剖析亲密关系、桃花能量与人际投射）
- **事业与财富流转**：（结合现实创造力、职场人际或资产积蓄，提供高维谋略）
- **身心健康与躯体能量**：（关注神经感知、容纳之窗与脉轮能量流转，照见躯体装甲与情绪调养之道）
- **潜意识与灵性蓝图**：（探索阴影整合、内在小孩与存在主义蓝图，直触自性化终极课题）

### 🌟 破局指引与学者寄语
（给出 3-4 条极具实操性的能量调和与行动建议，最后以一段温暖、宽容且赋能的“学者寄语”收尾）
</output_format>`;
          for await (const chunk of generateContentStream(prompt, AKASHA_PERSONA)) {
            if (!isSubscribed) return;
            full += chunk;
            setDeepMeaning(full);
          }
          if (isSubscribed && cache && setCache) {
            setCache({ ...cache, [cacheKey]: full });
          }
        } catch (err) {
          console.error(err);
          if (isSubscribed) setDeepMeaning("深层链接感应波动，请检查网络或稍后再试...");
        } finally {
          if (isSubscribed) setIsLoading(false);
        }
      };
      runAI();

      return () => {
        isSubscribed = false;
      };
    }
  }, [isOpen, card, cache, setCache]);

  if (!isOpen || !card) return null;
  
  const imageUrl = card.image || `https://www.trustedtarot.com/img/cards/${card.englishName?.toLowerCase().replace(/ /g, "-") || card.id?.toLowerCase()}.png`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#08040c]/90 backdrop-blur-xl overflow-y-auto" onClick={onClose}>
       <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         className="max-w-4xl w-full p-6 md:p-12 rounded-[36px] space-y-8 relative overflow-hidden my-auto border border-amber-500/40 shadow-[0_0_100px_rgba(201,168,76,0.25)] bg-gradient-to-b from-[#1c0f26]/95 via-[#12081c]/95 to-[#0a0410]/95 backdrop-blur-2xl"
         onClick={(e) => e.stopPropagation()}
       >
          {/* Elegant Corner Flourishes */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/60 rounded-tl-[36px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-500/60 rounded-tr-[36px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-500/60 rounded-bl-[36px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/60 rounded-br-[36px] pointer-events-none" />
          
          {/* Ambient glowing gold line across top */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80 shadow-[0_0_15px_#C9A84C]" />

          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none select-none">
            <Compass className="w-80 h-80 text-amber-500/20 animate-spin-slow" />
          </div>

          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-amber-200/40 hover:text-amber-200 hover:bg-white/10 rounded-full transition-all z-20 cursor-pointer">
             <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10 items-start">
             <div className="flex flex-col items-center gap-4 mx-auto lg:mx-0 shrink-0 lg:sticky lg:top-0 pt-4">
                <div className="w-48 h-76 md:w-56 md:h-88 shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-2xl overflow-hidden border-2 border-amber-500/40 hover:border-amber-400 transition-all group">
                   <img 
                     src={imageUrl} 
                     alt={card.name} 
                     className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${card.isReversed ? 'rotate-180' : ''}`} 
                     crossOrigin="anonymous"
                   />
                </div>
                <div className="text-center space-y-1 mt-2">
                  <h3 className="text-2xl md:text-3xl font-serif tracking-wider text-amber-100 flex items-center justify-center gap-2">
                    {card.name} <span className="text-amber-500 font-normal text-xl">{card.isReversed ? "· 逆位" : "· 正位"}</span>
                  </h3>
                  <p className="text-amber-200/50 text-xs font-mono tracking-[0.3em] uppercase">{card.arcana} Arcana</p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center max-w-[220px] mt-2">
                   {(card.isReversed ? card.keywords?.reversed : card.keywords?.upright || []).map((k: string) => (
                     <span key={k} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[11px] text-amber-200/80 font-serif">
                       {k}
                     </span>
                   ))}
                </div>
             </div>

             <div className="flex-1 w-full space-y-6 pt-4 lg:pl-6 border-t lg:border-t-0 lg:border-l border-amber-500/20 min-h-[400px] flex flex-col justify-center">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-6 py-20 my-auto text-center">
                    <div className="relative flex items-center justify-center w-28 h-28">
                      {/* Outer Clockwise Golden Ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 border-r-amber-500/30 shadow-[0_0_25px_rgba(201,168,76,0.5)] animate-spin" />
                      {/* Inner Counter-Clockwise Purple Ring */}
                      <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-purple-400 border-l-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-spin-reverse" />
                      {/* Ambient Core Ring */}
                      <div className="absolute inset-5 rounded-full border border-amber-500/20 animate-pulse bg-amber-500/5" />
                      <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-amber-100 font-serif tracking-widest text-base md:text-lg animate-pulse">正在穿透星灵界 · 查阅阿卡夏牌意记录...</p>
                      <p className="text-amber-200/40 text-xs font-mono tracking-[0.2em]">CHANNELING AKASHIC TAROT WISDOM</p>
                    </div>
                  </div>
                ) : (
                  (() => {
                    let association: any = null;
                    const processedContent = deepMeaning
                      .replace(/<thinking>[\s\S]*?(?:<\/thinking>|$)/g, '')
                      .replace(/<execute>[\s\S]*?(?:<\/execute>|$)/g, '')
                      .replace(/<mystic_association>([\s\S]*?)(?:<\/mystic_association>|$)/g, (match, p1) => {
                        try {
                          association = JSON.parse(p1.trim());
                        } catch (e) {
                          console.error("Failed to parse association in modal", e);
                        }
                        return "";
                      });

                    return (
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4 text-left">
                        <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 italic text-amber-200 text-xs md:text-sm font-serif leading-relaxed mb-6">
                          「 {card.coreTheme || "此牌象征着宇宙中一段未被言说的真理，等待着你去领悟。"} 」
                        </div>
                        <ReactMarkdown components={modalMarkdownComponents}>
                          {processedContent}
                        </ReactMarkdown>
                        {association && (
                          <div className="mt-8 pt-6 border-t border-amber-500/20">
                            <AssociationBubble association={association} />
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
             </div>
          </div>
       </motion.div>
    </div>
  );
}
