'use client';

import { useState, useCallback } from 'react';
import { playCoinSound } from '@/lib/audio';
import { getCryptoRandom } from '@/lib/random';

export function useIChingEngine() {
  const [lines, setLines] = useState<number[]>([]);
  const [isTossing, setIsTossing] = useState(false);
  const [currentCoins, setCurrentCoins] = useState<("yang" | "yin")[]>(["yang", "yang", "yin"]);
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');

  const resetEngine = useCallback(() => {
    setLines([]);
    setIsTossing(false);
    setNum1('');
    setNum2('');
  }, []);

  const handleToss = useCallback(() => {
    if (lines.length >= 6 || isTossing) return;
    setIsTossing(true);
    
    // Generate coin states immediately for 3D physics
    const coins = [
      getCryptoRandom() > 0.5 ? 2 : 3,
      getCryptoRandom() > 0.5 ? 2 : 3,
      getCryptoRandom() > 0.5 ? 2 : 3,
    ];
    setCurrentCoins(coins.map(c => c === 3 ? "yang" : "yin"));
    
    // Line forms after 3D coins land
    setTimeout(() => {
      const sum = coins[0] + coins[1] + coins[2];
      setLines(prev => [...prev, sum]);
      setIsTossing(false);
    }, 1800);
  }, [lines.length, isTossing]);

  const calculateMeihua = useCallback((n1Str: string, n2Str: string) => {
    const n1 = parseInt(n1Str);
    const n2 = parseInt(n2Str);
    
    const upper = n1 % 8 === 0 ? 8 : n1 % 8;
    const lower = n2 % 8 === 0 ? 8 : n2 % 8;
    const moving = (n1 + n2) % 6 === 0 ? 6 : (n1 + n2) % 6;
    
    const TRIGRAMS: Record<number, number[]> = {
      1: [7, 7, 7], 2: [7, 7, 8], 3: [7, 8, 7], 4: [7, 8, 8],
      5: [8, 7, 7], 6: [8, 7, 8], 7: [8, 8, 7], 8: [8, 8, 8],
    };
    
    const meihuaLines = [...TRIGRAMS[lower], ...TRIGRAMS[upper]];
    meihuaLines[moving - 1] = meihuaLines[moving - 1] === 7 ? 9 : 6;
    
    return { lines: meihuaLines, n1, n2 };
  }, []);

  return {
    lines,
    setLines,
    isTossing,
    currentCoins,
    handleToss,
    calculateMeihua,
    num1,
    setNum1,
    num2,
    setNum2,
    resetEngine
  };
}
