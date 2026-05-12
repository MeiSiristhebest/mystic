'use client';

import React from 'react';
import { TarotCard } from '@/lib/tarot-data';
import { Sparkles, Moon, Sun, Star } from 'lucide-react';
import Image from 'next/image';
import MysticMarkdown from './MysticMarkdown';

interface SoulCardProps {
  question: string;
  cards: TarotCard[];
  motto: string;
  date: string;
  fullReading?: string;
}

export default function SoulCard({ question, cards, motto, date, fullReading }: SoulCardProps) {
  return (
    <div 
      className={`soul-card-container w-[450px] ${fullReading ? 'min-h-[1200px]' : 'min-h-[800px]'} bg-[#0a0502] p-8 relative overflow-hidden flex flex-col items-center justify-between border-[12px] border-double border-amber-900/40`}
      style={{ 
        backgroundImage: 'radial-gradient(circle at center, #1a0f0a 0%, #0a0502 100%)',
      }}
    >
      {/* Decorative Corners */}
      <div className="absolute top-4 left-4 text-amber-600/30"><Sparkles size={24} /></div>
      <div className="absolute top-4 right-4 text-amber-600/30"><Sparkles size={24} /></div>
      <div className="absolute bottom-4 left-4 text-amber-600/30"><Sparkles size={24} /></div>
      <div className="absolute bottom-4 right-4 text-amber-600/30"><Sparkles size={24} /></div>

      {/* Header Section */}
      <div className="w-full text-center z-10 mt-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-600/50"></div>
          <span className="text-amber-500/60 font-serif tracking-[0.4em] text-[10px] uppercase">Akashic Records</span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-600/50"></div>
        </div>
        <h1 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 tracking-[0.3em] mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">
          灵魂卡片
        </h1>
        <div className="px-8 py-3 bg-amber-950/10 border-y border-amber-500/10 backdrop-blur-[2px] inline-block">
          <p className="text-amber-200/90 text-base font-serif italic tracking-wide">「{question || "探索未知的命运"}」</p>
        </div>
      </div>

      {/* Main Visual Section (Cards) */}
      <div className="flex-1 flex flex-col items-center justify-center w-full my-10 z-10">
        <div className="relative flex justify-center items-center w-full h-64">
          {/* Sacred Geometry Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none scale-150">
            <svg width="300" height="300" viewBox="0 0 100 100" className="text-amber-500">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M50 5 L50 95 M5 50 L95 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="2" fill="currentColor" />
            </svg>
          </div>

          {cards.slice(0, 3).map((card, idx) => (
            <div 
              key={card.id} 
              className="absolute w-32 h-52 rounded-xl overflow-hidden border-2 border-amber-500/40 shadow-[0_15px_35px_rgba(0,0,0,0.8)] transition-all duration-500"
              style={{ 
                left: '50%',
                marginLeft: '-64px',
                transform: cards.length > 1 
                  ? `translateX(${(idx - (Math.min(cards.length, 3) - 1) / 2) * 80}px) rotate(${(idx - (Math.min(cards.length, 3) - 1) / 2) * 12}deg) translateY(${Math.abs(idx - (Math.min(cards.length, 3) - 1) / 2) * 15}px)` 
                  : 'none',
                zIndex: 10 + idx,
                boxShadow: `0 0 30px rgba(180, 130, 50, ${0.1 + idx * 0.1})`
              }}
            >
              <Image
                src={card.image}
                alt={card.name}
                fill
                className={`object-cover ${card.isReversed ? 'rotate-180' : ''}`}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-0 right-0 text-center px-2">
                <span className="text-xs text-amber-100 font-serif tracking-widest drop-shadow-md">{card.name}</span>
                <div className="text-[8px] text-amber-500/70 font-mono mt-0.5 uppercase">{card.englishName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motto Section - The "Soul Motto" */}
      <div className="w-full px-10 text-center z-10 mb-12">
        <div className="relative py-10 px-6 border border-amber-500/10 rounded-2xl bg-amber-950/5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a0502] px-4 text-amber-500/60"><Moon size={20} /></div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0a0502] px-4 text-amber-500/60 rotate-180"><Sun size={20} /></div>
          
          <p className="text-2xl md:text-3xl font-serif text-amber-50 leading-relaxed tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {motto || "在星辰的指引下，寻找内心的宁静。"}
          </p>
          
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-[1px] w-8 bg-amber-500/20"></div>
            <span className="text-[10px] text-amber-600/50 font-serif uppercase tracking-[0.2em]">Soul Wisdom</span>
            <div className="h-[1px] w-8 bg-amber-500/20"></div>
          </div>
        </div>
      </div>

      {/* Full Reading Section (Optional) */}
      {fullReading && (
        <div className="w-full px-4 z-10 mb-12 flex-1">
          <div className="text-amber-100/90 text-sm">
            <MysticMarkdown content={fullReading.replace(/\[SOUL_MOTTO\][\s\S]*?\[\/SOUL_MOTTO\]/g, '').trim()} cards={cards} hideCards={true} />
          </div>
        </div>
      )}

      {/* Footer Section */}
      <div className="w-full flex flex-col items-center gap-4 z-10 pb-4">
        <div className="flex items-center gap-4 text-amber-600/40">
          <Star size={14} />
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent"></div>
          <Star size={14} />
        </div>
        
        <div className="text-center">
          <p className="text-[10px] text-amber-500/50 font-mono uppercase tracking-[0.2em] mb-1">
            Akasha&apos;s Eye · AI Divination
          </p>
          <p className="text-[9px] text-amber-700/60 font-mono mb-2">
            {date} · {new Array(5).fill('•').join(' ')}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 opacity-40">
            <div className="w-8 h-8 border border-amber-500/50 flex items-center justify-center">
              <div className="w-6 h-6 border border-amber-500/30"></div>
            </div>
            <span className="text-[8px] text-amber-600 font-mono uppercase tracking-tighter">Scan to Explore Your Destiny</span>
          </div>
        </div>
      </div>

      {/* Background Texture/Noise */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
    </div>
  );
}
