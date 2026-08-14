"use client";

import React, { useState } from "react";
import { Sparkles, Star, Flame, Droplets, Wind, Coins as CoinsIcon } from "lucide-react";
import { TarotCard } from "@/app/types/divination";

interface TarotCardFaceProps {
  card: TarotCard;
  className?: string;
  showDetails?: boolean;
}

export function getTarotImageSources(card: TarotCard): string[] {
  const sources: string[] = [];
  
  if (card.image) {
    // Convert github raw url to fastly jsdelivr mirror
    const jsdelivrUrl = card.image.replace(
      "https://raw.githubusercontent.com/wpwarman/TarotImages/master/",
      "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/"
    );
    sources.push(jsdelivrUrl);
    sources.push(card.image.replace(
      "https://raw.githubusercontent.com/wpwarman/TarotImages/master/",
      "https://cdn.jsdelivr.net/gh/wpwarman/TarotImages@master/"
    ));
    sources.push(card.image);
  }

  if (card.englishName) {
    const slug = card.englishName.toLowerCase().replace(/ /g, "-");
    sources.push(`https://www.trustedtarot.com/img/cards/${slug}.png`);
  }

  return sources;
}

export function TarotCardFace({ card, className = "", showDetails = true }: TarotCardFaceProps) {
  const sources = getTarotImageSources(card);
  const [srcIndex, setSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (srcIndex + 1 < sources.length) {
      setSrcIndex(srcIndex + 1);
    } else {
      setHasError(true);
    }
  };

  const getSuitIcon = () => {
    if (card.suit === "权杖") return <Flame className="w-8 h-8 text-[#C9A84C]" />;
    if (card.suit === "圣杯") return <Droplets className="w-8 h-8 text-[#9B7FD4]" />;
    if (card.suit === "宝剑") return <Wind className="w-8 h-8 text-[#E8DFB8]" />;
    if (card.suit === "星币") return <CoinsIcon className="w-8 h-8 text-[#F5E6AD]" />;
    return <Star className="w-8 h-8 text-[#C9A84C]" />;
  };

  return (
    <div className={`relative w-full h-full rounded-[inherit] overflow-hidden bg-[#080510] select-none ${className}`}>
      {!hasError && sources[srcIndex] ? (
        <img
          src={sources[srcIndex]}
          alt={card.name}
          onError={handleError}
          className={`w-full h-full object-cover transition-transform duration-700 ${card.isReversed ? 'rotate-180' : ''}`}
          crossOrigin="anonymous"
          loading="lazy"
        />
      ) : (
        /* 殿堂级黑曜石烫金艺术牌面 (当外部图片不可用时的奢华兜底) */
        <div className={`w-full h-full p-4 flex flex-col justify-between items-center text-center relative overflow-hidden bg-gradient-to-b from-[#140C24] via-[#080510] to-[#040208] border-2 border-[#C9A84C]/50 rounded-[inherit] ${card.isReversed ? 'rotate-180' : ''}`}>
          {/* Sacred Alchemy Watermark */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute inset-2 border border-[#C9A84C]/30 rounded-[inherit] pointer-events-none" />
          
          {/* Top Rank / Arcana */}
          <div className="relative z-10 w-full flex justify-between items-center text-[#C9A84C] font-serif text-xs tracking-widest pt-1 px-1">
            <span className="font-mono font-bold text-sm">{card.rank || "✦"}</span>
            <span className="text-[9px] uppercase tracking-[0.3em] opacity-60 font-mono">{card.arcana}</span>
          </div>

          {/* Central Emblem */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 flex items-center justify-center shadow-[0_0_25px_rgba(201,168,76,0.3)] animate-pulse">
              {getSuitIcon()}
            </div>
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-serif text-[#FFFDF6] tracking-widest font-bold drop-shadow-[0_0_12px_rgba(201,168,76,0.6)]">
                {card.name}
              </h3>
              <p className="text-[9px] md:text-[10px] font-serif text-[#C9A84C]/80 tracking-[0.25em] uppercase font-mono">
                {card.englishName}
              </p>
            </div>
          </div>

          {/* Bottom Flourish */}
          <div className="relative z-10 w-full flex flex-col items-center pb-1">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent mb-1" />
            <span className="text-[8px] text-[#C9A84C]/60 font-mono tracking-widest">AKASHA DECK</span>
          </div>
        </div>
      )}

      {/* Card Gradient Overlay & Labels */}
      {showDetails && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 px-2 pb-2.5 pt-4 text-center pointer-events-none">
            {card.isReversed && (
              <span className="inline-block text-[9px] font-serif text-amber-400 font-bold tracking-[0.3em] uppercase mb-0.5 drop-shadow-md">
                逆位
              </span>
            )}
            <span className="block font-serif text-[#FBF5D8] text-xs md:text-sm tracking-widest font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {card.name}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
