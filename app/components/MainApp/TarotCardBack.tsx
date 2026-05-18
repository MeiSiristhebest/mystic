import React from 'react';

interface TarotCardBackProps {
  className?: string;
  glowing?: boolean;
}

export const TarotCardBack: React.FC<TarotCardBackProps> = ({ className = "", glowing = false }) => {
  return (
    <div className={`relative w-full h-full rounded-xl md:rounded-[1.25rem] overflow-hidden bg-gradient-to-b from-[#140b2e] via-[#0a0518] to-[#05020a] border border-[#C9A84C]/40 ${glowing ? 'shadow-[0_0_20px_rgba(201,168,76,0.3)]' : ''} ${className}`}>
      {/* Background stardust noise for texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay pointer-events-none" />
      
      {/* Intricate SVG Mandala */}
      <svg viewBox="0 0 200 320" className="absolute inset-0 w-full h-full opacity-90" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#C9A84C" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Center Glow */}
        <circle cx="100" cy="160" r="90" fill="url(#centerGlow)" />
        
        {/* Outer Border with Corner Flourishes */}
        <rect x="8" y="8" width="184" height="304" rx="8" fill="none" stroke="#C9A84C" strokeWidth="0.75" strokeOpacity="0.6"/>
        <rect x="14" y="14" width="172" height="292" rx="4" fill="none" stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.4"/>
        
        {/* Art Deco Corner Diamonds */}
        <path d="M 8 28 L 28 8 M 172 8 L 192 28 M 8 292 L 28 312 M 172 312 L 192 292" stroke="#C9A84C" strokeWidth="0.75" strokeOpacity="0.6"/>
        <path d="M 14 34 L 34 14 M 166 14 L 186 34 M 14 286 L 34 306 M 166 306 L 186 286" stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.4"/>

        {/* Central Radiating Sunburst */}
        <g transform="translate(100, 160)" stroke="#C9A84C" strokeWidth="0.4" strokeOpacity="0.3">
          {[...Array(24)].map((_, i) => (
            <line key={i} x1="0" y1="-85" x2="0" y2="-120" transform={`rotate(${i * 15})`} />
          ))}
        </g>

        {/* Concentric Geometric Diamond Frames */}
        <g transform="translate(100, 160)">
          <polygon points="0,-110 75,0 0,110 -75,0" fill="none" stroke="#C9A84C" strokeWidth="0.75" strokeOpacity="0.7"/>
          <polygon points="0,-95 65,0 0,95 -65,0" fill="none" stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.4"/>
          <polygon points="0,-80 55,0 0,80 -55,0" fill="none" stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.3"/>
          <circle cx="0" cy="0" r="60" fill="none" stroke="#C9A84C" strokeWidth="0.4" strokeOpacity="0.2" strokeDasharray="2 2" />
        </g>

        {/* The Eye of Providence (Central Motif) */}
        <g transform="translate(100, 160)">
          {/* Glowing Halo */}
          <circle cx="0" cy="0" r="35" fill="url(#eyeGlow)" />
          
          {/* Outer Eye Shape */}
          <path d="M -40 0 Q 0 -35 40 0 Q 0 35 -40 0" fill="none" stroke="#C9A84C" strokeWidth="1.2" strokeOpacity="0.9" />
          <path d="M -35 0 Q 0 -28 35 0 Q 0 28 -35 0" fill="none" stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.5" />
          
          {/* Iris and Pupil */}
          <circle cx="0" cy="0" r="14" fill="none" stroke="#C9A84C" strokeWidth="1" strokeOpacity="0.8" />
          <circle cx="0" cy="0" r="10" fill="none" stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.5" />
          <circle cx="0" cy="0" r="4" fill="#C9A84C" fillOpacity="0.9" />
          
          {/* Compass Points around the Eye */}
          <circle cx="0" cy="-45" r="1.5" fill="#C9A84C" fillOpacity="0.8" />
          <circle cx="0" cy="45" r="1.5" fill="#C9A84C" fillOpacity="0.8" />
          <circle cx="-50" cy="0" r="1.5" fill="#C9A84C" fillOpacity="0.8" />
          <circle cx="50" cy="0" r="1.5" fill="#C9A84C" fillOpacity="0.8" />
        </g>
        
        {/* Top and Bottom Crescent Moons */}
        <g fill="#C9A84C" fillOpacity="0.7">
          <path d="M 100 25 A 12 12 0 0 1 100 49 A 9 9 0 0 0 100 25" />
          <path d="M 100 295 A 12 12 0 0 0 100 271 A 9 9 0 0 1 100 295" />
        </g>
        
        {/* Constellation Dots */}
        <g fill="#C9A84C" fillOpacity="0.5">
          <circle cx="40" cy="60" r="1" />
          <circle cx="50" cy="50" r="0.5" />
          <circle cx="160" cy="60" r="1" />
          <circle cx="150" cy="50" r="0.5" />
          <circle cx="40" cy="260" r="1" />
          <circle cx="50" cy="270" r="0.5" />
          <circle cx="160" cy="260" r="1" />
          <circle cx="150" cy="270" r="0.5" />
        </g>
      </svg>
    </div>
  );
};
