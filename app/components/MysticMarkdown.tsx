import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { motion } from "motion/react";
import { TarotCard } from "@/lib/tarot-data";
import { useAppStore } from "@/lib/store";
import { Compass, Sparkles, ArrowRight } from "lucide-react";

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

const AssociationBubble = React.memo(({ association }: { association: any }) => {
  const setActiveTab = useAppStore(state => state.setActiveTab);
  const setActiveSubTab = useAppStore(state => state.setActiveSubTab);
  const setHandoff = useAppStore(state => state.setHandoff);

  const handleNavigate = () => {
    if (association.system === 'tarot') {
      setActiveTab('explore');
      setActiveSubTab('tarot');
    } else if (association.system === 'eastern') {
      setActiveTab('explore');
      setActiveSubTab('eastern');
    } else if (association.system === 'astrology') {
      setActiveTab('explore');
      setActiveSubTab('astrology');
    } else {
      setActiveTab('explore');
      if (association.system) setActiveSubTab(association.system);
    }

    if (association.system && association.modeId) {
      setHandoff({
        system: association.system,
        modeId: association.modeId,
        question: association.reason,
        context: association.reason,
        autoTrigger: true
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="my-12 p-1 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 rounded-[2rem] relative group"
    >
      <div className="bg-[#0a0502]/90 backdrop-blur-xl rounded-[1.9rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border border-white/5">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center relative flex-shrink-0">
          <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full group-hover:bg-amber-500/40 transition-all"></div>
          <Compass className="w-8 h-8 text-amber-500 relative animate-spin-slow" />
        </div>
        
        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-amber-500/60 text-[10px] uppercase tracking-[0.3em] font-serif">
            <Sparkles className="w-3 h-3" />
            <span>阿卡夏指引 · 灵觉共振</span>
            <Sparkles className="w-3 h-3" />
          </div>
          <h4 className="text-lg text-amber-100 font-serif">前往探索：{association.target}</h4>
          <p className="text-sm text-amber-200/40 leading-relaxed font-light italic">
            &quot;{association.reason}&quot;
          </p>
        </div>

        <button
          onClick={handleNavigate}
          className="px-8 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-200 text-sm font-serif tracking-widest transition-all flex items-center gap-2 group-hover:scale-105"
        >
          即刻前往 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
});
AssociationBubble.displayName = "AssociationBubble";

const MemoH1 = React.memo(({ children }: { children?: React.ReactNode }) => (
  <div className="relative w-full flex flex-col items-center justify-center mb-16 mt-20 group">
    <div className="absolute top-0 w-48 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/80 to-transparent shadow-[0_0_15px_#C9A84C]"></div>
    <h1 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-[#E8DFB8] to-[#C9A84C] text-center tracking-[0.25em] drop-shadow-[0_0_25px_rgba(201,168,76,0.4)] py-8 font-medium">
      {children}
    </h1>
    <div className="absolute bottom-0 w-48 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/80 to-transparent shadow-[0_0_15px_#C9A84C]"></div>
    <span className="absolute -top-4 text-[#C9A84C]/60 text-2xl animate-pulse">✧</span>
    <span className="absolute -bottom-4 text-[#C9A84C]/60 text-2xl animate-pulse">✧</span>
  </div>
));
MemoH1.displayName = "MemoH1";

const MemoH2 = React.memo(({ children }: { children?: React.ReactNode }) => (
  <div className="w-full flex flex-col items-center mb-12 mt-20">
    <h2 className="text-2xl md:text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#E8DFB8] via-[#C9A84C] to-[#E8DFB8] pb-5 flex items-center gap-6 drop-shadow-[0_0_15px_rgba(201,168,76,0.3)] relative text-center tracking-widest bg-[length:200%_auto] animate-[gradient_8s_ease_infinite]">
      <span className="text-[#C9A84C]/50 text-xl drop-shadow-none">⟡</span>
      {children}
      <span className="text-[#C9A84C]/50 text-xl drop-shadow-none">⟡</span>
    </h2>
    <div className="w-64 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent mt-2 relative">
      <div className="absolute inset-0 bg-[#C9A84C]/20 blur-sm"></div>
    </div>
  </div>
));
MemoH2.displayName = "MemoH2";

const MemoH3 = React.memo(({ children }: { children?: React.ReactNode }) => (
  <div className="w-full flex justify-center mb-8 mt-14">
    <h3 className="text-xl md:text-2xl font-serif text-[#E8DFB8]/90 flex items-center gap-4 tracking-wider text-center drop-shadow-md">
      <span className="text-[#C9A84C]/70 text-lg">✦</span>
      {children}
      <span className="text-[#C9A84C]/70 text-lg">✦</span>
    </h3>
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
    <p className="leading-[2.4] tracking-[0.04em] text-[#E8DFB8]/90 font-light font-serif text-[17px] md:text-lg break-words text-justify selection:bg-[#C9A84C]/30 selection:text-white">
      {children}
    </p>
  </motion.div>
));
MemoP.displayName = "MemoP";

const MemoStrong = React.memo(({ children }: { children?: React.ReactNode }) => (
  <strong className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#E8DFB8] via-[#C9A84C] to-[#E8DFB8] drop-shadow-[0_0_15px_rgba(201,168,76,0.6)] mx-0.5 tracking-wider bg-[length:200%_auto] selection:text-white">
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
    className="relative my-14 p-10 md:p-12 text-left rounded-[2.5rem] obsidian-glass border border-[#C9A84C]/30 shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden group selection:bg-[#C9A84C]/30 selection:text-white"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/10 via-transparent to-[#C9A84C]/5 z-0" />
    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none z-0" />
    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C9A84C] via-[#E8DFB8] to-[#C9A84C] shadow-[0_0_20px_#C9A84C] z-10" />
    
    <span className="absolute right-6 -top-6 text-[#C9A84C]/10 text-[120px] font-serif select-none pointer-events-none z-0 rotate-12 transition-transform duration-1000 group-hover:rotate-0">”</span>
    
    <div className="relative z-10 leading-[2.4] text-lg md:text-xl font-serif text-[#E8DFB8]/90 italic font-light tracking-wide">
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
  <div className="w-full flex flex-col items-center justify-center my-20 relative gap-3">
    <Sparkles className="w-5 h-5 text-[#C9A84C]/40 animate-pulse" />
    <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />
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
  let association: any = null;
  let soulMotto = "";
  let processedContent = content
    .replace(/\[SOUL_MOTTO\]([\s\S]*?)\[\/SOUL_MOTTO\]/g, (match, p1) => {
      soulMotto = p1.trim();
      return "";
    })
    .replace(/<thinking>[\s\S]*?(?:<\/thinking>|$)/g, '')
    .replace(/<execute>[\s\S]*?(?:<\/execute>|$)/g, '')
    .replace(/<mystic_association>([\s\S]*?)(?:<\/mystic_association>|$)/g, (match, p1) => {
      try {
        association = JSON.parse(p1.trim());
      } catch (e) {
        console.error("Failed to parse association", e);
      }
      return "";
    })
    .replace(/^-(?=\*\*|\*)/gm, '- ')
    .replace(/\*\*\*\*([^\n]*?)\*\*\*\*/g, '**$1**')
    .replace(/\*\*\*\s+\*\*/g, '**')
    .replace(/\*\*\s+\*\*\*/g, '***');

  const tripleStars: string[] = [];
  processedContent = processedContent.replace(/\*\*\*([\s\S]*?)\*\*\*/g, (match, p1) => {
    if (!p1.trim()) return match;
    tripleStars.push(p1.trim());
    return `__MYSTIC_TRIPLE_${tripleStars.length - 1}__`;
  });

  const doubleStars: string[] = [];
  processedContent = processedContent.replace(/\*\*([\s\S]*?)\*\*/g, (match, p1) => {
    if (!p1.trim()) return match;
    doubleStars.push(p1.trim());
    return `__MYSTIC_DOUBLE_${doubleStars.length - 1}__`;
  });

  processedContent = processedContent.replace(/__MYSTIC_TRIPLE_(\d+)__/g, (match, p1) => {
    return ' ***' + tripleStars[parseInt(p1)] + '*** ';
  });

  processedContent = processedContent.replace(/__MYSTIC_DOUBLE_(\d+)__/g, (match, p1) => {
    return ' **' + doubleStars[parseInt(p1)] + '** ';
  });

  processedContent = processedContent.replace(/\*\*\*? ([.,:;!?，。：；！？、）】”’])/g, (match) => {
    return match.replace(' ', '');
  });

  processedContent = processedContent.replace(/([（【“‘]) \*\*\*?/g, (match) => {
    return match.replace(' ', '');
  });

  // Automated Kerning: Elegant half-space between CJK characters and alphanumerics
  processedContent = processedContent
    .replace(/([\u4e00-\u9fa5])([a-zA-Z0-9@#%&=\$\(\)\[\]\{\}])/g, '$1 $2')
    .replace(/([a-zA-Z0-9@#%&=\$\(\)\[\]\{\}])([\u4e00-\u9fa5])/g, '$1 $2');

  processedContent = processedContent.replace(/ {2,}/g, ' ');

  // Memoized components map based on 'centered' prop
  const componentsMap = useMemo(() => ({
    h1: ({ children }: any) => <MemoH1>{children}</MemoH1>,
    h2: ({ children }: any) => <MemoH2>{children}</MemoH2>,
    h3: ({ children }: any) => <MemoH3>{children}</MemoH3>,
    p: ({ children }: any) => (
      <MemoP className={`mb-8 md:mb-10 last:mb-0 first-of-type:text-lg first-of-type:md:text-xl first-of-type:text-white first-of-type:border-l-2 first-of-type:border-[#C9A84C] first-of-type:pl-6 first-of-type:py-1 first-of-type:my-8 first-of-type:font-normal first-of-type:drop-shadow-sm ${centered ? 'text-center' : 'text-left'}`}>
        {children}
      </MemoP>
    ),
    strong: ({ children }: any) => <MemoStrong>{children}</MemoStrong>,
    em: ({ children }: any) => <MemoEm>{children}</MemoEm>,
    blockquote: ({ children }: any) => <MemoBlockquote>{children}</MemoBlockquote>,
    ul: ({ children }: any) => (
      <MemoUl className={`mb-10 ${centered ? 'flex flex-col items-center' : 'text-left'}`}>
        {children}
      </MemoUl>
    ),
    ol: ({ children }: any) => (
      <MemoOl className={`mb-10 ml-6 ${centered ? 'flex flex-col items-center' : 'text-left'}`}>
        {children}
      </MemoOl>
    ),
    li: ({ children }: any) => (
      <MemoLi className={`mb-4.5 last:mb-0 ${centered ? 'text-center' : 'text-left'}`}>
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
              <div key={idx} className="relative w-24 h-40 md:w-32 md:h-52 rounded-2xl overflow-hidden border border-[#C9A84C]/40 shadow-[0_15px_40px_rgba(0,0,0,0.9)] hover:scale-105 transition-transform duration-500 group">
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
    </div>
  );
});
MysticMarkdown.displayName = "MysticMarkdown";

export default MysticMarkdown;
