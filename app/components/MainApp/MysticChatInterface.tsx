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
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-center'}`}
          >
            <div 
              className={`max-w-[95%] md:max-w-[85%] rounded-2xl p-6 ${
                msg.role === 'user' 
                  ? 'bg-amber-900/40 border border-amber-500/30 text-amber-100' 
                  : 'bg-black/20 markdown-body w-full'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="font-serif">{msg.content}</p>
              ) : (
                <MysticMarkdown content={msg.content} />
              )}
            </div>
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
      {!isStreaming && !isLoading && messages.length > 0 && (
        <form onSubmit={onSend} className="relative mt-8">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-black/40 border border-amber-500/30 rounded-full py-4 pl-6 pr-16 text-amber-100 placeholder-amber-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-serif"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-amber-600 hover:bg-amber-500 text-amber-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
}
