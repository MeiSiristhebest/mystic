'use client';

import { useState, useEffect } from 'react';
import LZString from 'lz-string';
import { saveToIndexedDB, getFromIndexedDB, deleteFromIndexedDB } from '@/lib/storage';

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
  | { type: 'tarot'; text: string; cards: TarotCard[]; mode?: string; question?: string; messages: Message[] }
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

const STORAGE_KEY = 'akasha_journey_v3'; // Incremented version for IndexedDB migration

export function useJourney() {
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadJourney = async () => {
      try {
        // Try IndexedDB first
        const stored = await getFromIndexedDB(STORAGE_KEY);
        if (stored && typeof stored === 'string') {
          const decompressed = LZString.decompress(stored);
          if (decompressed) {
            setEntries(JSON.parse(decompressed));
          }
        } else if (stored && Array.isArray(stored)) {
          // If it's already an array (not compressed)
          setEntries(stored);
        } else {
          // Migration from localStorage if exists
          const legacy = localStorage.getItem('akasha_journey_v2');
          if (legacy) {
            const decompressed = LZString.decompress(legacy);
            if (decompressed) {
              const legacyEntries = JSON.parse(decompressed);
              setEntries(legacyEntries);
              // Save to IndexedDB for future
              await saveToIndexedDB(STORAGE_KEY, legacy);
              // Optionally remove legacy from localStorage
              // localStorage.removeItem('akasha_journey_v2');
            }
          }
        }
      } catch (e) {
        console.error('Failed to load journey from IndexedDB', e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadJourney();
  }, []);

  const persistToIndexedDB = async (updatedEntries: JourneyEntry[]) => {
    try {
      const stringified = JSON.stringify(updatedEntries);
      const compressed = LZString.compress(stringified);
      await saveToIndexedDB(STORAGE_KEY, compressed);
    } catch (e) {
      console.error('Failed to save journey to IndexedDB', e);
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
    await persistToIndexedDB(updatedEntries);
    return id;
  };

  const updateEntry = async (id: string, updates: Partial<JourneyEntry>) => {
    const updatedEntries = entries.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    );
    setEntries(updatedEntries);
    await persistToIndexedDB(updatedEntries);
  };

  const deleteEntry = async (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    await persistToIndexedDB(updatedEntries);
  };

  const clearJourney = async () => {
    setEntries([]);
    await deleteFromIndexedDB(STORAGE_KEY);
    localStorage.removeItem('akasha_journey_v2'); // Also clear legacy
  };

  return { entries, addEntry, updateEntry, deleteEntry, clearJourney, isLoaded };
}
