"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { CardFrame } from "./Visuals";


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

export function CardMeaningModal({ isOpen, onClose, card, cache, setCache }: CardMeaningModalProps) {
  if (!isOpen || !card) return null;
  
  const imageUrl = card.image || `https://www.trustedtarot.com/img/cards/${card.englishName?.toLowerCase().replace(/ /g, "-") || card.id?.toLowerCase()}.png`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={onClose}>
       <motion.div 
         initial={{ opacity: 0, scale: 0.9, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         className="glass-panel max-w-2xl w-full p-8 md:p-12 rounded-[32px] space-y-8 relative overflow-hidden"
         onClick={(e) => e.stopPropagation()}
       >
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <X className="w-64 h-64 text-amber-500" />
          </div>

          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-amber-200/40 hover:text-amber-200 hover:bg-white/5 rounded-full transition-all">
             <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col md:flex-row gap-10 relative z-10">
             <div className="w-40 h-64 md:w-48 md:h-80 shrink-0 mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden border-2 border-amber-500/40">
                <img 
                  src={imageUrl} 
                  alt={card.name} 
                  className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`} 
                />
             </div>
             <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-3xl md:text-4xl font-serif text-amber-100 mb-2">
                    {card.name} <span className="text-amber-500/60 font-light">{card.isReversed ? "· 逆位" : "· 正位"}</span>
                  </h3>
                  <p className="text-amber-200/40 text-xs font-serif tracking-[0.3em] uppercase">{card.arcana} Arcana</p>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 italic text-amber-100/80 font-serif leading-relaxed">
                  {card.coreTheme || "此牌象征着宇宙中一段未被言说的真理，等待着你去领悟。"}
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-serif text-amber-500/40 uppercase tracking-[0.4em] mb-2">核心启示</h4>
                   <div className="flex flex-wrap gap-2">
                      {(card.isReversed ? card.keywords?.reversed : card.keywords?.upright || []).map((k: string) => (
                        <span key={k} className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-200/80 font-serif">
                          {k}
                        </span>
                      ))}
                   </div>
                </div>
             </div>
          </div>
       </motion.div>
    </div>
  );
}
