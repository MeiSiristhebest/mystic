'use client';

import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
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
  placeholder = "继续向阿卡夏提问...",
  autoScroll = true
}: MysticChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, autoScroll]);

  return (
    <div className="w-full space-y-8">
      {/* Message List */}
      <div className="flex flex-col space-y-8 w-full">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-center'}`}
          >
            {msg.role === 'user' ? (
              <div 
                className="max-w-[95%] md:max-w-[80%] rounded-[2.5rem] p-7 md:p-8 bg-gradient-to-br from-[#2a170d]/90 to-[#180c06]/90 border border-[#d97706]/40 text-[#fef3c7] shadow-[0_15px_35px_rgba(217,119,6,0.15)] backdrop-blur-md relative"
              >
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#d97706]/20 text-[#d97706] text-xs font-mono tracking-widest uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#d97706] animate-ping" />
                  <span>👤 觉察者 · SEEKER</span>
                </div>
                <p className="font-serif text-base md:text-lg leading-relaxed text-justify">{msg.content}</p>
              </div>
            ) : (
              <div 
                className="max-w-[100%] md:max-w-[95%] rounded-[3rem] p-8 md:p-12 bg-gradient-to-br from-[#0c0617]/95 via-[#080310]/95 to-[#06020a]/95 border border-[#C9A84C]/40 text-[#E8DFB8] shadow-[0_20px_50px_rgba(201,168,76,0.2)] backdrop-blur-xl relative overflow-hidden w-full"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 font-serif text-6xl text-[#C9A84C] select-none pointer-events-none">🌌</div>
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#C9A84C]/20 text-[#C9A84C] text-xs font-mono tracking-[0.4em] uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#C9A84C] shadow-[0_0_10px_#C9A84C] animate-pulse" />
                  <span>🌌 阿卡夏神谕 · AKASHA CHRONICLE</span>
                </div>
                <MysticMarkdown content={msg.content} />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex items-start">
            <div className="glass-panel bg-black/40 rounded-2xl p-6 w-full">
              <BreathingLoading text="正在倾听星辰的回答..." />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Form */}
      {!isStreaming && !isLoading && (
        <form onSubmit={onSend} className="relative mt-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/20 via-transparent to-[#C9A84C]/20 rounded-full blur-md opacity-50 group-focus-within:opacity-100 transition-opacity" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="relative w-full bg-[#0a0612]/90 border border-[#C9A84C]/40 rounded-full py-4.5 pl-8 pr-16 text-[#E8DFB8] placeholder-[#C9A84C]/50 focus:outline-none focus:border-[#C9A84C] focus:shadow-[0_0_25px_rgba(201,168,76,0.3)] transition-all font-serif text-base md:text-lg"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3.5 bg-gradient-to-r from-[#C9A84C] to-[#E8DFB8] hover:opacity-90 text-[#080510] rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(201,168,76,0.5)] z-10"
          >
            <Send size={18} className="translate-x-0.5" />
          </button>
        </form>
      )}
    </div>
  );
}
