import React from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { TarotCard } from "@/lib/tarot-data";

interface MysticMarkdownProps {
  content: string;
  cards?: TarotCard[];
  hideCards?: boolean;
}

export default function MysticMarkdown({ content, cards, hideCards }: MysticMarkdownProps) {
  // Pre-process markdown to fix common formatting issues from the model
  let processedContent = content
    // Filter out [SOUL_MOTTO] tags
    .replace(/\[SOUL_MOTTO\][\s\S]*?\[\/SOUL_MOTTO\]/g, '')
    // Fix missing space after list dash (e.g., "-**text**" -> "- **text**")
    .replace(/^-(?=\*\*|\*)/gm, '- ')
    // Fix ****text**** to **text**
    .replace(/\*\*\*\*([^\n]*?)\*\*\*\*/g, '**$1**')
    // Clean up hallucinated combinations like "*** **"
    .replace(/\*\*\*\s+\*\*/g, '**')
    .replace(/\*\*\s+\*\*\*/g, '***');

  // 1. Extract ***...*** and replace with placeholder
  const tripleStars: string[] = [];
  processedContent = processedContent.replace(/\*\*\*([\s\S]*?)\*\*\*/g, (match, p1) => {
    if (!p1.trim()) return match;
    tripleStars.push(p1.trim());
    return `__MYSTIC_TRIPLE_${tripleStars.length - 1}__`;
  });

  // 2. Extract **...** and replace with placeholder
  const doubleStars: string[] = [];
  processedContent = processedContent.replace(/\*\*([\s\S]*?)\*\*/g, (match, p1) => {
    if (!p1.trim()) return match;
    doubleStars.push(p1.trim());
    return `__MYSTIC_DOUBLE_${doubleStars.length - 1}__`;
  });

  // 3. Restore placeholders with spaces on the outside to guarantee CommonMark parsing
  processedContent = processedContent.replace(/__MYSTIC_TRIPLE_(\d+)__/g, (match, p1) => {
    return ' ***' + tripleStars[parseInt(p1)] + '*** ';
  });

  processedContent = processedContent.replace(/__MYSTIC_DOUBLE_(\d+)__/g, (match, p1) => {
    return ' **' + doubleStars[parseInt(p1)] + '** ';
  });

  // 4. Clean up spaces before closing punctuation
  processedContent = processedContent.replace(/\*\*\*? ([.,:;!?，。：；！？、）】”’])/g, (match) => {
    return match.replace(' ', '');
  });

  // 5. Clean up spaces after opening punctuation
  processedContent = processedContent.replace(/([（【“‘]) \*\*\*?/g, (match) => {
    return match.replace(' ', '');
  });

  // 6. Clean up multiple spaces (but preserve newlines)
  processedContent = processedContent.replace(/ {2,}/g, ' ');

  return (
    <div className="mystic-markdown">
      {!hideCards && cards && cards.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12 mt-4 relative z-10">
          {cards.map((card, idx) => {
            const imageUrl = card.image || `https://www.trustedtarot.com/img/cards/${card.englishName.toLowerCase().replace(/ /g, "-")}.png`;
            return (
              <div key={idx} className="relative w-24 h-40 md:w-32 md:h-52 rounded-xl overflow-hidden border-2 border-[#C9A84C]/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform duration-500 group">
                <img
                  src={imageUrl}
                  alt={card.name}
                  className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`}
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080510]/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                <div className="absolute bottom-2 left-0 right-0 text-center px-1 pointer-events-none">
                  <span className="text-[10px] md:text-xs text-[#E8DFB8] font-serif tracking-widest drop-shadow-md">{card.name}</span>
                  <div className="text-[8px] text-[#C9A84C]/80 font-serif mt-0.5">{card.isReversed ? '逆位' : '正位'}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ReactMarkdown
        components={{
          h1: ({ ...props }) => (
            <div className="relative w-full flex flex-col items-center justify-center mb-16 mt-20">
              <div className="absolute top-0 w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
              <h1
                className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 text-center tracking-[0.2em] drop-shadow-[0_0_15px_rgba(252,211,77,0.5)] py-8"
              >
                {props.children}
              </h1>
              <div className="absolute bottom-0 w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
              <span className="absolute -top-3 text-amber-500/40 text-lg">✦</span>
              <span className="absolute -bottom-3 text-amber-500/40 text-lg">✦</span>
            </div>
          ),
          h2: ({ ...props }) => (
            <div className="w-full flex flex-col items-center mb-10 mt-16">
              <h2
                className="text-2xl md:text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 pb-4 flex items-center gap-4 drop-shadow-[0_0_10px_rgba(252,211,77,0.3)] relative text-center"
              >
                <span className="text-amber-500/60 text-xl drop-shadow-none">◈</span>
                {props.children}
                <span className="text-amber-500/60 text-xl drop-shadow-none">◈</span>
              </h2>
              <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mt-1"></div>
            </div>
          ),
          h3: ({ ...props }) => (
            <div className="w-full flex justify-center mb-8 mt-12">
              <h3
                className="text-xl md:text-2xl font-serif text-amber-300/90 flex items-center gap-3 tracking-wide text-center"
              >
                <span className="text-amber-600/70 text-base">◇</span>
                {props.children}
                <span className="text-amber-600/70 text-base">◇</span>
              </h3>
            </div>
          ),
          p: ({ ...props }) => (
            <p
              className="text-amber-50/90 leading-[2.2] mb-8 last:mb-0 text-[16px] md:text-[17px] tracking-[0.02em] font-light text-left"
              {...props}
            />
          ),
          strong: ({ ...props }) => (
            <strong
              className="font-semibold text-amber-200 bg-amber-500/10 px-1.5 py-0.5 rounded-md drop-shadow-[0_0_8px_rgba(252,211,77,0.4)] border border-amber-500/20"
              {...props}
            />
          ),
          em: ({ ...props }) => (
            <em className="italic text-amber-200/90 font-serif tracking-wide" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="relative border-l-4 border-amber-500/50 pl-8 py-6 my-10 bg-gradient-to-r from-amber-900/30 via-amber-900/10 to-transparent italic text-amber-100/90 rounded-r-xl shadow-[inset_0_0_30px_rgba(252,211,77,0.05)] text-left"
              {...props}
            >
              <span className="absolute left-3 top-2 text-amber-500/20 text-5xl leading-none font-serif select-none">
                &quot;
              </span>
              <div className="relative z-10 leading-relaxed text-[16px] md:text-[17px] font-serif">
                {props.children}
              </div>
            </blockquote>
          ),
          ul: ({ ...props }) => (
            <ul className="space-y-4 mb-10 ml-2 text-left" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol
              className="space-y-4 mb-10 ml-6 list-decimal text-amber-200/80 marker:text-amber-500/70 font-serif text-[16px] md:text-[17px] text-left"
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li className="text-amber-50/90 leading-[2.2] mb-4 last:mb-0 pl-6 relative before:content-['✦'] before:absolute before:left-0 before:top-[8px] before:text-amber-500/60 before:text-xs tracking-[0.02em] font-light text-left" {...props} />
          ),
          hr: () => (
            <div className="w-full flex items-center justify-center my-14 relative">
              <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
              <div className="px-6 bg-[#0a0502] text-amber-500/50 text-sm tracking-[0.5em] relative z-10 font-serif">
                ✦ ✦ ✦
              </div>
            </div>
          ),
          a: ({ ...props }) => (
            <a
              className="text-amber-400 underline decoration-amber-500/30 underline-offset-4 hover:decoration-amber-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          code: ({ inline, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => 
            inline ? (
              <code className="bg-amber-900/30 text-amber-200 px-1.5 py-0.5 rounded text-sm font-mono border border-amber-500/20" {...props} />
            ) : (
              <code className="block bg-[#0a0502] text-amber-100/90 p-4 rounded-xl text-sm font-mono border border-amber-500/20 overflow-x-auto shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] text-left" {...props} />
            ),
          pre: ({ ...props }) => (
            <pre className="my-6" {...props} />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
