'use client';

import { useState, useEffect } from 'react';
import LZString from 'lz-string';
import { 
  saveToStore, 
  getFromStore, 
  getAllFromStore, 
  deleteFromStore, 
  clearStore 
} from '@/lib/storage';

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
  | { type: 'tarot'; text: string; cards: TarotCard[]; mode?: string; spread?: string; question?: string; messages: Message[] }
  | { type: 'bazi'; text: string; mode?: string; birthDate?: string; birthTime?: string; gender?: string; fullName?: string; birthPlace?: string; messages: Message[] }
  | { type: 'iching'; text: string; data?: { method: string; question?: string; hexagrams?: unknown[] }; messages: Message[] }
  | { type: 'daily'; text: string; sign: string; messages: Message[] }
  | { type: 'astrology'; text: string; zodiac?: string; mode?: string; messages: Message[] }
  | { type: 'face_reading'; text: string; imageType?: string; question?: string; messages: Message[] }
  | { type: 'shadow_work'; text: string; issue?: string; messages: Message[] }
  | { type: 'synastry'; text: string; partner?: any; question?: string; messages: Message[] }
  | { type: 'subconscious'; text: string; content?: string; messages: Message[] }
  | { type: 'time'; text: string; question?: string; messages: Message[] }
  | { type: 'mirror'; text: string; messages: Message[] }
  | { type: 'collective_mirror'; text: string; question?: string; messages: Message[] }
  | { type: 'unified'; text: string; bazi?: unknown; astrology?: unknown; tarot?: unknown; messages: Message[] };

export type JourneyEntry = {
  id: string;
  date: string;
  type: JourneyDetails['type'];
  title: string;
  summary: string;
  details?: JourneyDetails;
};

const LEGACY_KEY = 'akasha_journey_v3';

export function useJourney() {
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadJourney = async () => {
      try {
        // 1. Try atomic storage first
        const atomicEntries = await getAllFromStore('journey-entries');
        
        if (atomicEntries && atomicEntries.length > 0) {
          // Sort by date descending
          setEntries(atomicEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } else {
          // 2. Migration: Try legacy monolithic blob
          const legacy = await getFromStore('reports', LEGACY_KEY);
          if (legacy && typeof legacy === 'string') {
            const decompressed = LZString.decompress(legacy);
            if (decompressed) {
              const legacyEntries: JourneyEntry[] = JSON.parse(decompressed);
              setEntries(legacyEntries);
              
              // Migrate to atomic
              console.log('[MIGRATION] Moving legacy entries to atomic storage...');
              for (const entry of legacyEntries) {
                await saveToStore('journey-entries', entry.id, entry);
              }
              // Clear legacy after success
              await deleteFromStore('reports', LEGACY_KEY);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load journey:', e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadJourney();
  }, []);

  const addEntry = async (entry: Omit<JourneyEntry, 'id' | 'date'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newEntry: JourneyEntry = {
      ...entry,
      id,
      date: new Date().toISOString(),
    };
    
    // Optimistic update
    setEntries(prev => [newEntry, ...prev]);
    // Atomic save
    await saveToStore('journey-entries', id, newEntry);
    return id;
  };

  const updateEntry = async (id: string, updates: Partial<JourneyEntry>) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    const updatedEntry = { ...entry, ...updates };
    setEntries(prev => prev.map(e => e.id === id ? updatedEntry : e));
    await saveToStore('journey-entries', id, updatedEntry);
  };

  const deleteEntry = async (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    await deleteFromStore('journey-entries', id);
  };

  const clearJourney = async () => {
    setEntries([]);
    await clearStore('journey-entries');
  };

  return { entries, addEntry, updateEntry, deleteEntry, clearJourney, isLoaded };
}
