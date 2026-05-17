"use client";

import { motion } from "motion/react";
import { Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCryptoRandom } from "@/lib/random";

export default function TimeWisdomRitual({ onComplete }: { onComplete: () => void }) {
  const [year, setYear] = useState(2026);

  useEffect(() => {
    const timer = setInterval(() => {
      setYear(y => {
        const next = y + (getCryptoRandom() > 0.5 ? 1 : -1) * Math.floor(getCryptoRandom() * 50);
        if (Math.abs(next - 2026) > 2000) return 2026;
        return next;
      });
    }, 100);
    const finish = setTimeout(onComplete, 5000);
    return () => { clearInterval(timer); clearTimeout(finish); };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-12">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-orange-500/20 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border border-orange-500/10 rounded-full border-dashed"
        />
        <div className="relative flex flex-col items-center">
          <Clock className="w-12 h-12 text-orange-500 animate-pulse" />
          <div className="mt-4 font-mono text-2xl text-orange-200/80 tabular-nums">
            {year}
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-xl font-serif text-orange-100 tracking-[0.4em] uppercase">正在折叠时空维度</h3>
        <p className="text-orange-400/40 text-[10px] font-serif tracking-widest uppercase flex items-center justify-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          Synchronizing temporal shards...
        </p>
      </div>
    </div>
  );
}
