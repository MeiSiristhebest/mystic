'use client';

import React from 'react';

interface BreathingLoadingProps {
  text?: string;
}

export default function BreathingLoading({ text = "阿卡夏正在感知..." }: BreathingLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer breathing aura */}
        <div 
          className="absolute inset-0 bg-[#C9A84C]/10 rounded-full animate-ping" 
          style={{ animationDuration: '4s' }}
        ></div>
        
        {/* Inner breathing aura */}
        <div 
          className="absolute inset-4 bg-[#C9A84C]/20 rounded-full animate-pulse" 
          style={{ animationDuration: '2s' }}
        ></div>
        
        {/* Core */}
        <div className="absolute inset-8 bg-gradient-to-tr from-[#C9A84C]/40 to-[#E8DFB8]/40 rounded-full blur-sm"></div>
      </div>
      
      <p className="text-[#E8DFB8]/80 font-serif italic tracking-widest animate-pulse text-lg">
        {text}
      </p>
    </div>
  );
}
