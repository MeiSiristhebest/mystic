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

// --- Extracted Memoized Markdown Renderers ---
const MemoH1 = React.memo(({ children }: { children?: React.ReactNode }) => (
  <div className="relative w-full flex flex-col items-center justify-center mb-16 mt-20">
    <div className="absolute top-0 w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
    <h1 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 text-center tracking-[0.2em] drop-shadow-[0_0_15px_rgba(252,211,77,0.5)] py-8">
      {children}
    </h1>
    <div className="absolute bottom-0 w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
    <span className="absolute -top-3 text-amber-500/40 text-lg">✦</span>
    <span className="absolute -bottom-3 text-amber-500/40 text-lg">✦</span>
  </div>
));
MemoH1.displayName = "MemoH1";

const MemoH2 = React.memo(({ children }: { children?: React.ReactNode }) => (
  <div className="w-full flex flex-col items-center mb-10 mt-16">
    <h2 className="text-2xl md:text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 pb-4 flex items-center gap-4 drop-shadow-[0_0_10px_rgba(252,211,77,0.3)] relative text-center">
      <span className="text-amber-500/60 text-xl drop-shadow-none">◈</span>
      {children}
      <span className="text-amber-500/60 text-xl drop-shadow-none">◈</span>
    </h2>
    <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mt-1"></div>
  </div>
));
MemoH2.displayName = "MemoH2";

const MemoH3 = React.memo(({ children }: { children?: React.ReactNode }) => (
  <div className="w-full flex justify-center mb-8 mt-12">
    <h3 className="text-xl md:text-2xl font-serif text-amber-300/90 flex items-center gap-3 tracking-wide text-center">
      <span className="text-amber-600/70 text-base">◇</span>
      {children}
      <span className="text-amber-600/70 text-base">◇</span>
    </h3>
  </div>
));
MemoH3.displayName = "MemoH3";

const MemoP = React.memo(({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10px" }}
    transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
    className={className}
  >
    <p className="leading-[2.2] tracking-[0.03em] text-[#E8DFB8]/90 font-light font-serif">{children}</p>
  </motion.div>
));
MemoP.displayName = "MemoP";

const MemoStrong = React.memo(({ children }: { children?: React.ReactNode }) => (
  <strong className="font-semibold text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-lg shadow-[0_0_15px_rgba(201,168,76,0.3)] border border-[#C9A84C]/30 mx-0.5 tracking-wider">
    {children}
  </strong>
));
MemoStrong.displayName = "MemoStrong";

const MemoEm = React.memo(({ children }: { children?: React.ReactNode }) => (
  <em className="italic text-[#E8DFB8] font-serif tracking-widest drop-shadow-[0_0_10px_rgba(232,223,184,0.4)]">{children}</em>
));
MemoEm.displayName = "MemoEm";

const MemoBlockquote = React.memo(({ children }: { children?: React.ReactNode }) => (
  <motion.blockquote 
    initial={{ opacity: 0, x: -15 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className="relative border-l-4 border-[#C9A84C] pl-10 py-8 my-12 bg-gradient-to-r from-[#C9A84C]/15 via-[#C9A84C]/5 to-transparent italic text-[#E8DFB8] rounded-r-2xl shadow-[inset_0_0_40px_rgba(201,168,76,0.08)] text-left backdrop-blur-sm border-r border-white/5"
  >
    <span className="absolute left-3 top-2 text-[#C9A84C]/30 text-6xl leading-none font-serif select-none pointer-events-none">&quot;</span>
    <div className="relative z-10 leading-[2.2] text-lg font-serif">{children}</div>
  </motion.blockquote>
));
MemoBlockquote.displayName = "MemoBlockquote";

const MemoUl = React.memo(({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <motion.ul 
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className={className}
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
    className={className}
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
    className={className}
  >
    {children}
  </motion.li>
));
MemoLi.displayName = "MemoLi";

const MemoHr = React.memo(() => (
  <div className="w-full flex items-center justify-center my-14 relative">
    <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
    <div className="px-6 bg-[#0a0502] text-amber-500/50 text-sm tracking-[0.5em] relative z-10 font-serif">✦ ✦ ✦</div>
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
    <code className="bg-amber-900/30 text-amber-200 px-1.5 py-0.5 rounded text-sm font-mono border border-amber-500/20">{children}</code>
  ) : (
    <code className="block bg-[#0a0502] text-amber-100/90 p-4 rounded-xl text-sm font-mono border border-amber-500/20 overflow-x-auto shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] text-left">{children}</code>
  )
);
MemoCode.displayName = "MemoCode";

const MemoPre = React.memo(({ children }: { children?: React.ReactNode }) => (
  <pre className="my-6">{children}</pre>
));
MemoPre.displayName = "MemoPre";


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

  processedContent = processedContent.replace(/ {2,}/g, ' ');

  // Memoized components map based on 'centered' prop
  const componentsMap = useMemo(() => ({
    h1: ({ children }: any) => <MemoH1>{children}</MemoH1>,
    h2: ({ children }: any) => <MemoH2>{children}</MemoH2>,
    h3: ({ children }: any) => <MemoH3>{children}</MemoH3>,
    p: ({ children }: any) => (
      <MemoP className={`text-amber-50/90 leading-[2.2] mb-8 last:mb-0 text-[16px] md:text-[17px] tracking-[0.02em] font-light ${centered ? 'text-center' : 'text-left'}`}>
        {children}
      </MemoP>
    ),
    strong: ({ children }: any) => <MemoStrong>{children}</MemoStrong>,
    em: ({ children }: any) => <MemoEm>{children}</MemoEm>,
    blockquote: ({ children }: any) => <MemoBlockquote>{children}</MemoBlockquote>,
    ul: ({ children }: any) => (
      <MemoUl className={`space-y-4 mb-10 ml-2 ${centered ? 'flex flex-col items-center' : 'text-left'}`}>
        {children}
      </MemoUl>
    ),
    ol: ({ children }: any) => (
      <MemoOl className={`space-y-4 mb-10 ml-6 list-decimal text-amber-200/80 marker:text-amber-500/70 font-serif text-[16px] md:text-[17px] ${centered ? 'flex flex-col items-center' : 'text-left'}`}>
        {children}
      </MemoOl>
    ),
    li: ({ children }: any) => (
      <MemoLi className={`text-amber-50/90 leading-[2.2] mb-4 last:mb-0 pl-6 relative before:content-['✦'] before:absolute before:left-0 before:top-[8px] before:text-amber-500/60 before:text-xs tracking-[0.02em] font-light ${centered ? 'text-center' : 'text-left'}`}>
        {children}
      </MemoLi>
    ),
    hr: () => <MemoHr />,
    a: ({ href, children }: any) => <MemoA href={href}>{children}</MemoA>,
    code: ({ inline, children }: any) => <MemoCode inline={inline}>{children}</MemoCode>,
    pre: ({ children }: any) => <MemoPre>{children}</MemoPre>,
  }), [centered]);

  return (
    <div className="mystic-markdown relative">
      {isLoading && <StreamingParticles />}
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
      <ReactMarkdown components={componentsMap}>
        {processedContent}
      </ReactMarkdown>
      {soulMotto && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-16 py-10 border-t border-b border-amber-500/20 text-center relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-[#0a0502] text-amber-500/40 text-[10px] tracking-[0.5em] uppercase">
            今日格言
          </div>
          <p className="text-2xl md:text-3xl font-serif gold-gradient-text tracking-[0.1em] italic leading-relaxed">
            「 {soulMotto} 」
          </p>
        </motion.div>
      )}
      {association && <AssociationBubble association={association} />}
    </div>
  );
});
MysticMarkdown.displayName = "MysticMarkdown";

export default MysticMarkdown;
