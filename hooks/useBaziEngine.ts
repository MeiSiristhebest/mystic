'use client';

import { useState, useCallback } from 'react';
import { getBaziData, getZiweiServerData } from '@/app/actions/aiActions';

export function useBaziEngine() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [baziData, setBaziData] = useState<any>(null);
  const [ziweiChart, setZiweiChart] = useState<any>(null);
  const [detectedPatterns, setDetectedPatterns] = useState<any[]>([]);

  const resetEngine = useCallback(() => {
    setBaziData(null);
    setZiweiChart(null);
    setDetectedPatterns([]);
  }, []);

  const calculateBazi = useCallback(async () => {
    if (!birthDate || !birthTime) return null;
    
    try {
      const bazi = await getBaziData(birthDate, birthTime);
      
      // Also calculate Ziwei & detect 80+ patterns
      const [hours] = birthTime.split(':').map(Number);
      const ziwei = await getZiweiServerData(birthDate, hours, (gender === '女' ? '女' : '男'));
      
      setBaziData(bazi);
      if (ziwei) {
        setZiweiChart(ziwei.chart);
        setDetectedPatterns(ziwei.detectedPatterns || []);
      }

      return {
        ...bazi,
        ziwei: ziwei?.chart,
        detectedPatterns: ziwei?.detectedPatterns || [],
      };
    } catch (err) {
      console.error('Bazi & Ziwei calculation failed:', err);
      throw err;
    }
  }, [birthDate, birthTime, gender]);

  return {
    birthDate, setBirthDate,
    birthTime, setBirthTime,
    gender, setGender,
    fullName, setFullName,
    birthPlace, setBirthPlace,
    baziData, setBaziData,
    ziweiChart,
    detectedPatterns,
    calculateBazi,
    resetEngine
  };
}
