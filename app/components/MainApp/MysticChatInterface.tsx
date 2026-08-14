'use client';

import React, { useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import MysticMarkdown from '../MysticMarkdown';
import BreathingLoading from '../BreathingLoading';
import { Message } from '@/app/types/divination';

interface MysticChatInterfaceProps {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  onSend: (e: React.FormEvent) => void;
  isLoading: boolean;
  isStreaming: boolean;
  placeholder?: string;
  autoScroll?: boolean;
}

export default function MysticChatInterface({
  messages,
  input,
  setInput,
  onSend,
  isLoading,
  isStreaming,
  placeholder = "继续向阿卡夏请教...",
  autoScroll = true
}: MysticChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(messages.length);



  useEffect(() => {
    // Only scroll if a NEW message was actually added or actively streaming
    if (autoScroll && scrollRef.current && (messages.length > prevLengthRef.current || isStreaming)) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    prevLengthRef.current = messages.length;
  }, [messages.length, isStreaming, autoScroll]);


  return (
    <div className="w-full space-y-10">
      {/* Sacred Message Stream */}
      <div className="flex flex-col space-y-10 w-full">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-center'}`}
          >
            {msg.role === 'user' ? (
              /* Seeker Prompt Bubble */
              <div 
                className="max-w-[90%] md:max-w-[75%] rounded-[2rem] p-6 md:p-8 bg-gradient-to-br from-[#22130b]/90 to-[#120804]/90 border border-[#C9A84C]/35 text-[#FBF5D8] shadow-[0_15px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl relative ml-auto"
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#C9A84C]/20 text-[#C9A84C] text-xs font-mono tracking-widest uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
                  <span>👤 求问者 · SEEKER</span>
                </div>
                <p className="font-serif text-base md:text-lg leading-relaxed text-justify">{msg.content}</p>
              </div>
            ) : (
              /* Divine Revelation Scroll */
              <div 
                className="w-full sacred-scroll rounded-[3rem] p-8 md:p-14 border border-[#C9A84C]/30 text-[#E8DFB8] shadow-[0_25px_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl relative overflow-hidden"
              >
                {/* Ambient Alchemy Seal */}
                <div className="absolute top-4 right-6 opacity-10 font-serif text-7xl text-[#C9A84C] select-none pointer-events-none">✦</div>
                
                {/* Revelation Header Banner */}
                <div className="flex items-center gap-3 mb-10 pb-4 border-b border-[#C9A84C]/25 text-[#C9A84C] text-xs font-mono tracking-[0.4em] uppercase">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C9A84C] shadow-[0_0_12px_#C9A84C] animate-pulse" />
                  <span>🌌 阿卡夏神谕显化 · AKASHA CHRONICLE</span>
                </div>

                <MysticMarkdown content={msg.content} />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="w-full sacred-scroll rounded-[3rem] p-8">
            <BreathingLoading text="正在通过星轨与易数，为你调取深层启示..." />
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Sacred Input Bar */}
      {!isStreaming && !isLoading && (
        <form onSubmit={onSend} className="relative mt-10 group max-w-4xl mx-auto w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#C9A84C]/30 via-[#4C1D95]/30 to-[#C9A84C]/30 rounded-full blur-md opacity-40 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-[#080510]/90 border border-[#C9A84C]/40 rounded-full py-5 pl-8 pr-20 text-[#FBF5D8] placeholder-[#C9A84C]/45 focus:outline-none focus:border-[#C9A84C] focus:shadow-[0_0_35px_rgba(201,168,76,0.35)] transition-all font-serif text-base md:text-lg"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2.5 p-3.5 bg-gradient-to-r from-[#C9A84C] to-[#F5E6AD] hover:opacity-95 text-[#080510] rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(201,168,76,0.5)] cursor-pointer"
            >
              <Send size={18} className="translate-x-0.5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
