import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { motion } from "motion/react";
import { TarotCard } from "@/lib/tarot-data";
import { useAppStore } from "@/lib/store";
import { Compass, Sparkles, ArrowRight } from "lucide-react";
import { AssociationBubble } from "./AssociationBubble";
import { CardMeaningModal, processMysticMarkdownContent } from "./MainApp/TarotComponents";


const StreamingParticles = React.memo(() => {
  const particles = useMemo(() => {
    return [...Array(6)].map((_, i) => ({
      id: i,
      x: (15 + i * 14) + "%",
      delay: (i * 0.7) % 2,
      duration: 3 + (i % 3) * 1.5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-amber-400/40 rounded-full blur-[1px]"
          initial={{ 
            x: p.x, 
            y: "100%", 
            opacity: 0 
          }}
          animate={{ 
            y: "-10%", 
            opacity: [0, 1, 0],
            x: p.x 
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            delay: p.delay,
            ease: "linear" 
          }}
        />
      ))}
    </div>
  );
});
StreamingParticles.displayName = "StreamingParticles";

const MemoH1 = React.memo(({ children }: { children?: React.ReactNode }) => (
  <div className="relative w-full flex flex-col items-center justify-center mb-20 mt-24 group select-none">
    <div className="flex items-center gap-4 mb-6 text-[#C9A84C]/70 text-[11px] tracking-[0.7em] uppercase font-mono">
      <span className="w-16 h-px bg-gradient-to-r from-transparent to-[#C9A84C]/80" />
      <span>✦ SACRED REVELATION ✦</span>
      <span className="w-16 h-px bg-gradient-to-l from-transparent to-[#C9A84C]/80" />
    </div>
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF6] via-[#E8DFB8] to-[#C9A84C] text-center tracking-[0.25em] drop-shadow-[0_0_35px_rgba(201,168,76,0.6)] py-4 font-normal scale-105 group-hover:scale-110 transition-transform duration-700">
      {children}
    </h1>
    <div className="flex items-center gap-3 mt-6">
      <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent shadow-[0_0_15px_#C9A84C]" />
      <span className="text-[#C9A84C] text-lg animate-spin-slow">⎊</span>
      <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent shadow-[0_0_15px_#C9A84C]" />
    </div>
  </div>
));
MemoH1.displayName = "MemoH1";

const MemoH2 = React.memo(({ children }: { children?: React.ReactNode }) => (
  <div className="w-full flex flex-col items-center mb-16 mt-20 select-none">
    <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF6] via-[#C9A84C] to-[#FFFDF6] pb-4 flex items-center gap-6 drop-shadow-[0_0_20px_rgba(201,168,76,0.5)] relative text-center tracking-widest bg-[length:200%_auto] animate-[gradient_8s_ease_infinite]">
      <span className="text-[#C9A84C] text-xl drop-shadow-[0_0_12px_#C9A84C] animate-pulse">⟡</span>
      {children}
      <span className="text-[#C9A84C] text-xl drop-shadow-[0_0_12px_#C9A84C] animate-pulse">⟡</span>
    </h2>
    <div className="w-80 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent relative mt-1">
      <div className="absolute inset-0 bg-[#C9A84C]/40 blur-sm" />
      <div className="absolute -top-[1.5px] left-1/2 -translate-x-1/2 w-4 h-[4px] rounded-full bg-[#E8DFB8] shadow-[0_0_10px_#E8DFB8]" />
    </div>
  </div>
));
MemoH2.displayName = "MemoH2";

const MemoH3 = React.memo(({ children }: { children?: React.ReactNode }) => (
  <div className="w-full flex justify-center mb-12 mt-16 select-none">
    <div className="inline-flex items-center gap-6 px-10 py-3 rounded-full bg-gradient-to-r from-transparent via-[#C9A84C]/15 to-transparent border-y border-[#C9A84C]/30 shadow-[inset_0_0_20px_rgba(201,168,76,0.15)]">
      <span className="text-[#C9A84C] text-lg animate-pulse">✧</span>
      <h3 className="text-xl md:text-2xl font-serif text-[#E8DFB8] tracking-widest text-center font-normal drop-shadow-md">
        {children}
      </h3>
      <span className="text-[#C9A84C] text-lg animate-pulse">✧</span>
    </div>
  </div>
));
MemoH3.displayName = "MemoH3";

const MemoP = React.memo(({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10px" }}
    transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
    className={className}
  >
    <p className="leading-[2.4] tracking-[0.04em] text-[#E8DFB8]/90 font-light font-serif text-[17px] md:text-lg break-words text-justify selection:bg-[#C9A84C]/30 selection:text-white first-letter:text-2xl md:first-letter:text-3xl first-letter:font-serif first-letter:text-[#C9A84C] first-letter:font-normal first-letter:mr-1 first-letter:drop-shadow-[0_0_10px_#C9A84C]">
      {children}
    </p>
  </motion.div>
));
MemoP.displayName = "MemoP";

const MemoStrong = React.memo(({ children }: { children?: React.ReactNode }) => (
  <strong className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF6] via-[#C9A84C] to-[#E8DFB8] drop-shadow-[0_0_15px_rgba(201,168,76,0.8)] px-1.5 py-0.5 mx-0.5 tracking-wider bg-[length:200%_auto] selection:text-white border-b border-[#C9A84C]/40 bg-[#C9A84C]/5 rounded-md">
    {children}
  </strong>
));
MemoStrong.displayName = "MemoStrong";

const MemoEm = React.memo(({ children }: { children?: React.ReactNode }) => (
  <em className="italic text-[#E8DFB8] font-serif tracking-widest drop-shadow-[0_0_12px_rgba(232,223,184,0.5)] border-b border-[#C9A84C]/30 pb-0.5 mx-0.5 selection:bg-[#C9A84C]/30 selection:text-white">{children}</em>
));
MemoEm.displayName = "MemoEm";

const MemoBlockquote = React.memo(({ children }: { children?: React.ReactNode }) => (
  <motion.blockquote 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className="relative my-16 p-10 md:p-14 text-left rounded-[3rem] obsidian-glass border border-[#C9A84C]/40 shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden group selection:bg-[#C9A84C]/30 selection:text-white"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/15 via-transparent to-[#C9A84C]/10 z-0" />
    <div className="absolute inset-0 opacity-25 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none z-0" />
    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-[#C9A84C] via-[#FFFDF6] to-[#C9A84C] shadow-[0_0_25px_#C9A84C] z-10" />
    
    <span className="absolute right-8 -top-8 text-[#C9A84C]/15 text-[140px] font-serif select-none pointer-events-none z-0 rotate-12 transition-transform duration-1000 group-hover:rotate-0">”</span>
    
    <div className="relative z-10 leading-[2.4] text-lg md:text-xl font-serif text-[#E8DFB8]/95 italic font-light tracking-wide pt-2">
      {children}
    </div>
  </motion.blockquote>
));
MemoBlockquote.displayName = "MemoBlockquote";

const MemoUl = React.memo(({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <motion.ul 
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className={`${className} space-y-4 my-6 selection:bg-[#C9A84C]/30 selection:text-white`}
  >
    {children}
  </motion.ul>
));
MemoUl.displayName = "MemoUl";

const MemoOl = React.memo(({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <motion.ol 
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className={`${className} space-y-4 my-6 list-decimal list-inside text-[#C9A84C]/80 font-serif selection:bg-[#C9A84C]/30 selection:text-white`}
  >
    {children}
  </motion.ol>
));
MemoOl.displayName = "MemoOl";

const MemoLi = React.memo(({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <motion.li 
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`${className} pl-7 relative leading-[2.3] tracking-wide text-[#E8DFB8]/85 font-light selection:bg-[#C9A84C]/30 selection:text-white`}
  >
    <span className="absolute left-1 top-3 w-1.5 h-1.5 rounded-full bg-[#C9A84C] shadow-[0_0_10px_#C9A84C]" />
    {children}
  </motion.li>
));
MemoLi.displayName = "MemoLi";

const MemoHr = React.memo(() => (
  <div className="w-full flex items-center justify-center my-24 relative select-none">
    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />
    <div className="px-8 flex items-center gap-3 text-[#C9A84C]">
      <span className="text-sm animate-pulse">✧</span>
      <span className="w-3 h-3 rotate-45 border border-[#C9A84C] shadow-[0_0_12px_#C9A84C] inline-block" />
      <span className="text-sm animate-pulse">✧</span>
    </div>
    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />
  </div>
));
MemoHr.displayName = "MemoHr";

const MemoA = React.memo(({ href, children }: { href?: string, children?: React.ReactNode }) => (
  <a href={href} className="text-amber-400 underline decoration-amber-500/30 underline-offset-4 hover:decoration-amber-400 transition-colors" target="_blank" rel="noopener noreferrer">
    {children}
  </a>
));
MemoA.displayName = "MemoA";

const MemoCode = React.memo(({ inline, children }: { inline?: boolean, children?: React.ReactNode }) => 
  inline ? (
    <code className="bg-[#C9A84C]/15 text-[#E8DFB8] px-2 py-0.5 rounded-md text-sm font-mono border border-[#C9A84C]/30 shadow-[0_0_10px_rgba(201,168,76,0.2)]">{children}</code>
  ) : (
    <div className="my-10 relative rounded-[2.5rem] obsidian-glass border border-[#C9A84C]/30 shadow-[inset_0_0_40px_rgba(201,168,76,0.1),0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden group">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
      <div className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-[#C9A84C]/20 via-[#C9A84C]/5 to-transparent border-b border-[#C9A84C]/30">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#C9A84C] animate-pulse" />
          <span className="text-[10px] font-mono tracking-[0.5em] text-[#C9A84C] uppercase font-bold">阿卡夏排盘矩阵 / DIVINATION MATRIX</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#C9A84C]/40 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-[#C9A84C]/60" />
        </div>
      </div>
      <code className="block p-8 text-[#E8DFB8]/90 text-sm md:text-base font-mono leading-[2.2] overflow-x-auto text-left relative z-10 selection:bg-[#C9A84C]/30">{children}</code>
    </div>
  )
);
MemoCode.displayName = "MemoCode";

const MemoPre = React.memo(({ children }: { children?: React.ReactNode }) => (
  <pre className="my-2">{children}</pre>
));
MemoPre.displayName = "MemoPre";

const MemoTable = React.memo(({ children }: { children?: React.ReactNode }) => (
  <div className="w-full overflow-x-auto my-12 rounded-[2.5rem] obsidian-glass border border-[#C9A84C]/30 shadow-[0_30px_70px_rgba(0,0,0,0.8)]">
    <table className="w-full text-left border-collapse">{children}</table>
  </div>
));
MemoTable.displayName = "MemoTable";

const MemoTh = React.memo(({ children }: { children?: React.ReactNode }) => (
  <th className="p-6 md:p-8 bg-gradient-to-r from-[#C9A84C]/25 via-[#C9A84C]/10 to-transparent border-b border-[#C9A84C]/40 text-[#E8DFB8] font-serif text-sm md:text-base tracking-widest font-medium uppercase drop-shadow-sm">
    {children}
  </th>
));
MemoTh.displayName = "MemoTh";

const MemoTd = React.memo(({ children }: { children?: React.ReactNode }) => (
  <td className="p-6 md:p-8 border-b border-white/5 text-[#E8DFB8]/80 font-serif leading-[2.2] text-sm md:text-base hover:bg-white/5 transition-colors">
    {children}
  </td>
));
MemoTd.displayName = "MemoTd";


interface MysticMarkdownProps {
  content: string;
  cards?: TarotCard[];
  hideCards?: boolean;
  isLoading?: boolean;
  centered?: boolean;
}

const MysticMarkdown = React.memo(({ content, cards, hideCards, isLoading, centered }: MysticMarkdownProps) => {
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const { processedContent, association, soulMotto } = processMysticMarkdownContent(content);

  // Memoized components map based on 'centered' prop
  const componentsMap = useMemo(() => ({
    h1: ({ children }: any) => <MemoH1>{children}</MemoH1>,
    h2: ({ children }: any) => <MemoH2>{children}</MemoH2>,
    h3: ({ children }: any) => <MemoH3>{children}</MemoH3>,
    h4: ({ children }: any) => <MemoH3>{children}</MemoH3>,
    h5: ({ children }: any) => <MemoH3>{children}</MemoH3>,
    h6: ({ children }: any) => <MemoH3>{children}</MemoH3>,
    p: ({ children }: any) => (
      <MemoP className={`mb-8 md:mb-10 last:mb-0 first-of-type:text-lg first-of-type:md:text-xl first-of-type:text-white first-of-type:border-l-2 first-of-type:border-[#C9A84C] first-of-type:pl-6 first-of-type:py-1 first-of-type:my-8 first-of-type:font-normal first-of-type:drop-shadow-sm text-left text-justify leading-relaxed tracking-wide`}>
        {children}
      </MemoP>
    ),
    strong: ({ children }: any) => <MemoStrong>{children}</MemoStrong>,
    em: ({ children }: any) => <MemoEm>{children}</MemoEm>,
    blockquote: ({ children }: any) => <MemoBlockquote>{children}</MemoBlockquote>,
    ul: ({ children }: any) => (
      <MemoUl className="space-y-3 mb-10 pl-6 text-left list-disc list-outside text-amber-100/90 leading-relaxed tracking-wide">
        {children}
      </MemoUl>
    ),
    ol: ({ children }: any) => (
      <MemoOl className="space-y-3 mb-10 pl-6 text-left list-decimal list-outside text-amber-100/90 leading-relaxed tracking-wide">
        {children}
      </MemoOl>
    ),
    li: ({ children }: any) => (
      <MemoLi className="text-left leading-relaxed tracking-wide">
        {children}
      </MemoLi>
    ),
    hr: () => <MemoHr />,
    a: ({ href, children }: any) => <MemoA href={href}>{children}</MemoA>,
    code: ({ inline, children }: any) => <MemoCode inline={inline}>{children}</MemoCode>,
    pre: ({ children }: any) => <MemoPre>{children}</MemoPre>,
    table: ({ children }: any) => <MemoTable>{children}</MemoTable>,
    th: ({ children }: any) => <MemoTh>{children}</MemoTh>,
    td: ({ children }: any) => <MemoTd>{children}</MemoTd>,
  }), [centered]);

  return (
    <div className="mystic-markdown relative">
      {isLoading && <StreamingParticles />}
      {!hideCards && cards && cards.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12 mt-4 relative z-10">
          {cards.map((card, idx) => {
            const imageUrl = card.image || `https://www.trustedtarot.com/img/cards/${card.englishName.toLowerCase().replace(/ /g, "-")}.png`;
            return (
              <div 
                key={idx} 
                onClick={() => setSelectedCard(card)}
                className="relative w-24 h-40 md:w-32 md:h-52 rounded-2xl overflow-hidden border border-[#C9A84C]/40 shadow-[0_15px_40px_rgba(0,0,0,0.9)] hover:scale-105 hover:border-[#C9A84C] cursor-pointer transition-all duration-500 group"
              >
                <img
                  src={imageUrl}
                  alt={card.name}
                  className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`}
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080510]/95 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity"></div>
                <div className="absolute bottom-3 left-0 right-0 text-center px-2 pointer-events-none">
                  <span className="text-[11px] md:text-sm text-[#E8DFB8] font-serif tracking-widest drop-shadow-md">{card.name}</span>
                  <div className="text-[9px] text-[#C9A84C]/80 font-serif mt-1 tracking-widest">{card.isReversed ? '逆位' : '正位'}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ReactMarkdown components={componentsMap}>
        {processedContent}
      </ReactMarkdown>
      {soulMotto && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-20 p-12 rounded-[3rem] obsidian-glass border border-[#C9A84C]/40 text-center relative shadow-[0_30px_80px_rgba(0,0,0,0.9)] overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/10 via-transparent to-[#C9A84C]/10 opacity-60" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 px-8 py-1.5 bg-[#C9A84C]/15 border-b border-x border-[#C9A84C]/40 rounded-b-2xl text-[#C9A84C] text-[10px] tracking-[0.6em] uppercase font-mono shadow-[0_5px_15px_rgba(201,168,76,0.2)]">
            灵魂铭刻 / SOUL MOTTO
          </div>
          <p className="text-2xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#E8DFB8] via-[#C9A84C] to-[#E8DFB8] tracking-[0.15em] italic leading-[2.1] pt-6 pb-2 drop-shadow-[0_0_25px_rgba(201,168,76,0.5)]">
            「 {soulMotto} 」
          </p>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-50">
            <span className="w-1 h-1 rounded-full bg-[#C9A84C]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
            <span className="w-1 h-1 rounded-full bg-[#C9A84C]" />
          </div>
        </motion.div>
      )}
      
      {/* Akashic Seal & Epilogue Flourish */}
      <div className="w-full flex items-center justify-center pt-16 pb-8 opacity-45 font-mono select-none pointer-events-none">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent max-w-[120px]" />
        <span className="px-4 text-[10px] text-[#C9A84C] tracking-[0.6em] uppercase font-serif">✦ 铭刻于阿卡夏矩阵 · 洞悉天命之流 ✦</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent max-w-[120px]" />
      </div>

      {association && <AssociationBubble association={association} />}

      <CardMeaningModal 
        isOpen={!!selectedCard} 
        onClose={() => setSelectedCard(null)} 
        card={selectedCard} 
      />
    </div>
  );
});
MysticMarkdown.displayName = "MysticMarkdown";

export default MysticMarkdown;
