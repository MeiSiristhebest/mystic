'use client';

import { useState, useEffect, useCallback } from 'react';
import LZString from 'lz-string';
import { 
  saveToStore, 
  getFromStore, 
  getAllFromStore, 
  deleteFromStore, 
  clearStore 
} from '@/lib/storage';
import { JourneyEntry, JourneyDetails } from '@/app/types/divination';

const LEGACY_KEY = 'akasha_journey_v3';

export function useJourney() {
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadJourney = useCallback(async () => {
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
            
            // Migrate to atomic
            console.log('[MIGRATION] Moving legacy entries to atomic storage...');
            for (const entry of legacyEntries) {
              await saveToStore('journey-entries', entry.id, entry);
            }
            
            setEntries(legacyEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            
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
  }, []);

  useEffect(() => {
    loadJourney();
  }, [loadJourney]);

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

  const updateEntry = async (id: string, updates: Partial<Omit<JourneyEntry, 'details'>> & { details?: any }) => {
    // 1. Get latest from DB to avoid state lag
    const existing = await getFromStore('journey-entries', id);
    if (!existing) return;

    // 2. Merge deep if it's details
    let updatedEntry: JourneyEntry;
    if (updates.details && existing.details) {
       updatedEntry = {
         ...existing,
         ...updates,
         details: { ...existing.details, ...updates.details } as JourneyDetails
       };
    } else {
       updatedEntry = { ...existing, ...updates };
    }

    // 3. Update Memory State
    setEntries(prev => prev.map(e => e.id === id ? updatedEntry : e));
    // 4. Update Database
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

  return { 
    entries, 
    addEntry, 
    updateEntry, 
    deleteEntry, 
    clearJourney, 
    isLoaded,
    refreshJourney: loadJourney 
  };
}
