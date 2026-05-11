import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, RefreshCcw, Sparkles } from 'lucide-react';
import { MysticMarkdown } from '../MysticMarkdown';
import { Message } from '@/hooks/useJourney';

interface TarotReadingResultProps {
  messages: Message[];
  isReading: boolean;
  soulMotto?: string;
  isAskingFollowUp: boolean;
  followUpText: string;
  setFollowUpText: (text: string) => void;
  onFollowUp: () => void;
  onReset: () => void;
  onShare: () => void;
  isSocraticMode: boolean;
  setIsSocraticMode: (val: boolean) => void;
}

export const TarotReadingResult: React.FC<TarotReadingResultProps> = ({
  messages,
  isReading,
  soulMotto,
  isAskingFollowUp,
  followUpText,
  setFollowUpText,
  onFollowUp,
  onReset,
  onShare,
  isSocraticMode,
  setIsSocraticMode
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic for streaming
  useEffect(() => {
    if (isReading && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isReading]);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Soul Motto Reveal */}
      <AnimatePresence>
        {soulMotto && !isReading && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-mystic-gold/10 blur-xl rounded-2xl" />
            <div className="glass-panel rounded-2xl p-8 md:p-10 text-center relative border border-mystic-gold/40 shadow-gold">
              <Sparkles className="w-6 h-6 text-mystic-gold absolute top-4 left-4 opacity-50" />
              <Sparkles className="w-6 h-6 text-mystic-gold absolute bottom-4 right-4 opacity-50" />
              <div className="text-mystic-gold uppercase tracking-[0.4em] text-xs font-bold mb-4">
                灵魂箴言
              </div>
              <p className="text-2xl md:text-3xl font-serif text-mystic-ink leading-relaxed italic">
                "{soulMotto}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading Content */}
      <div className="space-y-8">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? "flex justify-end" : "flex justify-start"}>
            <div className={`
              max-w-[95%] md:max-w-[85%] rounded-3xl p-6 md:p-8 
              ${msg.role === 'user' 
                ? "glass-panel-heavy border-mystic-gold/20" 
                : "glass-panel"}
            `}>
              {msg.role === 'user' ? (
                <div className="text-mystic-ink/80 leading-relaxed text-lg">{msg.content}</div>
              ) : (
                <div className="prose prose-invert prose-mystic max-w-none text-base md:text-lg leading-loose">
                  <MysticMarkdown content={msg.content} />
                </div>
              )}
            </div>
          </div>
        ))}
        {isReading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-mystic-gold/50 pl-4"
          >
            <div className="w-2 h-2 rounded-full bg-mystic-gold animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-mystic-gold animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-mystic-gold animate-bounce" style={{ animationDelay: '0.4s' }} />
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Actions */}
      {!isReading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="space-y-8 pt-8 border-t border-mystic-gold/20"
        >
          {/* Follow-up Section */}
          <div className="glass-panel rounded-3xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center relative overflow-hidden">
            {/* Socratic Mode Toggle */}
            <div className="absolute top-0 right-0 bg-mystic-gold/10 px-4 py-1 rounded-bl-xl text-[10px] text-mystic-gold/60 flex items-center gap-2 cursor-pointer hover:bg-mystic-gold/20 transition-colors" onClick={() => setIsSocraticMode(!isSocraticMode)}>
              <span className={`w-2 h-2 rounded-full ${isSocraticMode ? 'bg-mystic-gold shadow-gold animate-pulse' : 'bg-mystic-ink/30'}`} />
              苏格拉底追问
            </div>
            
            <input
              type="text"
              value={followUpText}
              onChange={(e) => setFollowUpText(e.target.value)}
              placeholder="对启示仍有疑惑？继续追问..."
              className="flex-1 bg-transparent text-base md:text-lg text-mystic-ink placeholder-mystic-ink/30 outline-none px-4 py-4 w-full"
              onKeyDown={(e) => e.key === 'Enter' && onFollowUp()}
            />
            <button
              onClick={onFollowUp}
              disabled={isAskingFollowUp || !followUpText.trim()}
              className="w-full md:w-auto px-10 py-4 rounded-2xl bg-mystic-gold text-mystic-void font-bold hover:shadow-gold transition-all disabled:opacity-50"
            >
              追问
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onShare}
              className="px-8 py-4 rounded-2xl glass-panel text-mystic-ink hover:text-mystic-gold transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              <span>封存启示</span>
            </button>
            <button
              onClick={onReset}
              className="px-8 py-4 rounded-2xl glass-panel text-mystic-ink hover:text-mystic-gold transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" />
              <span>新的轮回</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
