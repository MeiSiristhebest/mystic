'use client';

import { useState, useEffect } from 'react';
import LZString from 'lz-string';
import { cleanupLocalStorage } from '@/lib/storage';

export type Message = {
  role: 'user' | 'model';
  content: string;
};

export type TarotCard = {
  id: string;
  name: string;
  englishName: string;
  arcana: 'Major' | 'Minor';
  suit?: string;
  isReversed: boolean;
  keywords?: { upright: string[]; reversed: string[] };
  coreTheme?: string;
};

export type JourneyDetails = 
  | { type: 'tarot'; text: string; cards: TarotCard[]; mode?: string; messages: Message[] }
  | { type: 'bazi'; text: string; mode?: string; birthDate?: string; birthTime?: string; gender?: string; fullName?: string; birthPlace?: string; messages: Message[] }
  | { type: 'iching'; text: string; data?: { method: string; question?: string; hexagrams?: unknown[] }; messages: Message[] }
  | { type: 'daily'; text: string; sign: string; messages: Message[] }
  | { type: 'astrology'; text: string; zodiac: string; messages: Message[] }
  | { type: 'face_reading'; text: string; imageType?: string; question?: string; messages: Message[] }
  | { type: 'shadow_work'; text: string; mode: string; messages: Message[] }
  | { type: 'unified'; text: string; bazi?: unknown; astrology?: unknown; tarot?: unknown; messages: Message[] };

export type JourneyEntry = {
  id: string;
  date: string;
  type: 'tarot' | 'bazi' | 'iching' | 'daily' | 'astrology' | 'face_reading' | 'shadow_work' | 'unified';
  title: string;
  summary: string;
  details?: JourneyDetails;
};

const STORAGE_KEY = 'akasha_journey_v2';

export function useJourney() {
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const decompressed = LZString.decompress(stored);
        if (decompressed) {
          setEntries(JSON.parse(decompressed));
        }
      } catch (e) {
        console.error('Failed to load journey', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveToLocalStorage = (updatedEntries: JourneyEntry[]) => {
    try {
      cleanupLocalStorage();
      const stringified = JSON.stringify(updatedEntries);
      const compressed = LZString.compress(stringified);
      localStorage.setItem(STORAGE_KEY, compressed);
    } catch (e) {
      console.error('Failed to save journey', e);
    }
  };

  const addEntry = async (entry: Omit<JourneyEntry, 'id' | 'date'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newEntry: JourneyEntry = {
      ...entry,
      id,
      date: new Date().toISOString(),
    };
    
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    saveToLocalStorage(updatedEntries);
    return id;
  };

  const updateEntry = async (id: string, updates: Partial<JourneyEntry>) => {
    const updatedEntries = entries.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    );
    setEntries(updatedEntries);
    saveToLocalStorage(updatedEntries);
  };

  const deleteEntry = async (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    saveToLocalStorage(updatedEntries);
  };

  const clearJourney = async () => {
    setEntries([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { entries, addEntry, updateEntry, deleteEntry, clearJourney, isLoaded };
}
