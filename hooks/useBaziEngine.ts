'use client';

import { useState, useCallback } from 'react';
import { getBaziData } from '@/app/actions/aiActions';

export function useBaziEngine() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [baziData, setBaziData] = useState<any>(null);

  const resetEngine = useCallback(() => {
    setBaziData(null);
  }, []);

  const calculateBazi = useCallback(async () => {
    if (!birthDate || !birthTime) return null;
    
    try {
      const data = await getBaziData(birthDate, birthTime);
      setBaziData(data);
      return data;
    } catch (err) {
      console.error('Bazi calculation failed:', err);
      throw err;
    }
  }, [birthDate, birthTime]);

  return {
    birthDate, setBirthDate,
    birthTime, setBirthTime,
    gender, setGender,
    fullName, setFullName,
    birthPlace, setBirthPlace,
    baziData, setBaziData,
    calculateBazi,
    resetEngine
  };
}
