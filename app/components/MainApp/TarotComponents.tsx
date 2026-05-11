"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Moon, Star, X } from "lucide-react";
import Image from "next/image";
import MysticMarkdown from "../MysticMarkdown";
import { generateContent } from "@/lib/ai";
import { TarotCard as TarotCardType } from "@/lib/tarot-data";

export function TarotCardView({ card, isRevealed, onReveal, onSelect, size = "large" }: any) {
  let dims = "w-36 h-60 sm:w-48 sm:h-80";
  if (size === "small") dims = "w-24 h-40 sm:w-32 sm:h-56";
  else if (size === "medium") dims = "w-28 h-48 sm:w-40 sm:h-64";

  return (
    <div className={`${dims} relative perspective-1200 cursor-pointer hover:-translate-y-2 transition-transform duration-300`} onClick={() => isRevealed ? onSelect() : onReveal()}>
      <motion.div animate={{ rotateY: isRevealed ? 0 : 180 }} transition={{ duration: 0.8 }} className="w-full h-full relative preserve-3d">
        {/* Card Back - Enhanced Luxurious Design */}
        <div className="absolute inset-0 rounded-xl border-2 border-[#C9A84C]/60 bg-[#080510] backface-hidden rotate-y-180 overflow-hidden shadow-[0_0_30px_rgba(201,168,76,0.3)] group/back">
          {/* Sacred Geometry SVG Pattern */}
          <div className="absolute inset-0 opacity-[0.07] group-hover/back:opacity-10 transition-opacity duration-700">
            <svg width="100%" height="100%" className="text-[#C9A84C]">
              <defs>
                <pattern id="sacred-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#sacred-pattern)" />
            </svg>
          </div>

          <div className="absolute inset-3 border border-[#C9A84C]/30 rounded-lg flex items-center justify-center overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute w-32 h-32 bg-[#C9A84C]/5 rounded-full blur-3xl animate-pulse" />
            
            <div className="relative z-10 flex flex-col items-center">
              {/* Central Ornate Medallion */}
              <div className="relative flex items-center justify-center">
                {/* Rotating Rings */}
                <div className="absolute w-20 h-20 sm:w-28 sm:h-28 border border-[#C9A84C]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute w-16 h-16 sm:w-24 sm:h-24 border border-[#C9A84C]/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute w-24 h-24 sm:w-32 sm:h-32 border-[0.5px] border-[#C9A84C]/5 rounded-full animate-[spin_20s_linear_infinite]" />
                
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#1a1508] to-[#080510] border border-[#C9A84C]/40 flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.3)] z-20">
                  <Moon className="text-[#C9A84C] drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]" size={size === 'large' ? 32 : 24} />
                </div>
              </div>

              <div className="mt-6 flex gap-3 opacity-40">
                <Star size={8} className="text-[#C9A84C] animate-pulse" />
                <Star size={8} className="text-[#C9A84C] animate-pulse delay-500" />
                <Star size={8} className="text-[#C9A84C] animate-pulse delay-1000" />
              </div>
            </div>
          </div>

          {/* Decorative Corner Filigree */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-[1.5px] border-l-[1.5px] border-[#C9A84C]/50 rounded-tl-xl m-1" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-[1.5px] border-r-[1.5px] border-[#C9A84C]/50 rounded-tr-xl m-1" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[1.5px] border-l-[1.5px] border-[#C9A84C]/50 rounded-bl-xl m-1" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[1.5px] border-r-[1.5px] border-[#C9A84C]/50 rounded-br-xl m-1" />
          
          {/* Subtle Shine Layer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
        </div>
        <div className="absolute inset-0 rounded-xl border-2 border-amber-400 bg-black backface-hidden flex flex-col p-2 shadow-[0_0_15px_rgba(201,168,76,0.3)]">
          <div className="flex-1 relative w-full"><Image src={`https://www.trustedtarot.com/img/cards/${card.englishName.toLowerCase().replace(/ /g, "-")}.png`} alt={card.name} fill sizes="200px" className="object-contain" referrerPolicy="no-referrer" /></div>
          <div className="text-center bg-black/60 rounded-b-lg py-1 mt-1"><h3 className="text-amber-300 font-serif text-sm">{card.name}</h3>{card.isReversed && <span className="text-red-400 text-xs">逆位</span>}</div>
        </div>
      </motion.div>
    </div>
  );
}

export function CardMeaningModal({ card, onClose, cache, setCache }: any) {
  const [loading, setLoading] = useState(false);
  const [meaning, setMeaning] = useState("");
  useEffect(() => {
    const fetchMeaning = async () => {
      const key = `${card.id}-${card.isReversed ? "rev" : "up"}`;
      if (cache[key]) { setMeaning(cache[key]); return; }
      setLoading(true);
      try {
        const text = await generateContent(`解释塔罗牌【${card.name}】在【${card.isReversed ? "逆位" : "正位"}】时的含义。使用Markdown排版。重点讲解其象征意义和启示。`);
        setMeaning(text || "");
        setCache((prev: any) => ({ ...prev, [key]: text }));
      } finally { setLoading(false); }
    };
    fetchMeaning();
  }, [card, cache, setCache]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-panel rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 border border-amber-500/30 shadow-[0_0_40px_rgba(201,168,76,0.15)] relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6 border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-24 relative rounded border border-amber-500/30 overflow-hidden shrink-0">
              <Image src={`https://www.trustedtarot.com/img/cards/${card.englishName.toLowerCase().replace(/ /g, "-")}.png`} alt={card.name} fill sizes="100px" className="object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-amber-300">{card.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-amber-100/50 bg-amber-900/20 px-2 py-1 rounded">{card.arcana} Arcana</span>
                {card.isReversed ? <span className="text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded">逆位 (Reversed)</span> : <span className="text-xs text-amber-400 bg-amber-900/20 px-2 py-1 rounded">正位 (Upright)</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-amber-100/50 hover:text-amber-100"><X /></button>
        </div>
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <p className="animate-pulse text-amber-500/60 font-serif">正在感应阿卡夏记录...</p>
          </div>
        ) : (
          <div className="prose prose-invert prose-amber max-w-none font-serif">
            <MysticMarkdown content={meaning} />
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function SpreadLayoutRenderer({ mode, cards, revealedCards, handleRevealCard, setSelectedCard, cardSize, positions }: any) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-12 justify-center py-8">
      {cards.map((c: any, i: number) => (
        <div key={i} className="flex flex-col items-center group">
          <div className="text-sm text-amber-500 mb-4 px-4 py-1.5 bg-black/40 border border-amber-500/30 rounded-full shadow-[0_0_10px_rgba(201,168,76,0.1)] whitespace-nowrap z-10">{positions[i]}</div>
          <div className="relative">
            <TarotCardView card={c} isRevealed={revealedCards[i]} onReveal={() => handleRevealCard(i)} onSelect={() => setSelectedCard(c)} size={cardSize} />
            {revealedCards[i] && (
              <div className="absolute -inset-4 bg-amber-500/20 blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * A shared ambient cosmic background that uses fixed CSS rendering instead of stretched images.
 * Safe to use inside scrollable containers.
 */
export function AmbientCosmicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep space base */}
      <div className="absolute inset-0 bg-[#080510]" />
      
      {/* Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-900/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute top-[40%] left-[20%] w-[30vw] h-[30vw] bg-blue-900/5 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Floating particles/stars overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen" />
    </div>
  );
}
