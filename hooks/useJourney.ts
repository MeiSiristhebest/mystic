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
import { useAppStore } from '@/lib/store';

const LEGACY_KEY = 'akasha_journey_v3';

export function useJourney() {
  const entries = useAppStore(state => state.entries);
  const setEntries = useAppStore(state => state.setEntries);
  const addStoreEntry = useAppStore(state => state.addStoreEntry);
  const updateStoreEntry = useAppStore(state => state.updateStoreEntry);
  const deleteStoreEntry = useAppStore(state => state.deleteStoreEntry);
  const clearStoreJourney = useAppStore(state => state.clearStoreJourney);
  
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
  }, [setEntries]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadJourney();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadJourney]);

  const addEntry = async (entry: Omit<JourneyEntry, 'id' | 'date'>) => {
    const id = crypto.randomUUID();
    const newEntry: JourneyEntry = {
      ...entry,
      id,
      date: new Date().toISOString(),
    };
    
    // Optimistic update
    addStoreEntry(newEntry);
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
    updateStoreEntry(id, updatedEntry);
    // 4. Update Database
    await saveToStore('journey-entries', id, updatedEntry);
  };

  const deleteEntry = async (id: string) => {
    deleteStoreEntry(id);
    await deleteFromStore('journey-entries', id);
  };

  const deleteMultipleEntries = async (ids: string[]) => {
    for (const id of ids) {
      deleteStoreEntry(id);
      await deleteFromStore('journey-entries', id);
    }
  };

  const updateMultipleEntries = async (ids: string[], updates: Partial<JourneyEntry>) => {
    for (const id of ids) {
      await updateEntry(id, updates);
    }
  };

  const clearJourney = async () => {
    clearStoreJourney();
    await clearStore('journey-entries');
  };

  return { 
    entries, 
    addEntry, 
    updateEntry, 
    deleteEntry, 
    deleteMultipleEntries,
    updateMultipleEntries,
    clearJourney, 
    isLoaded,
    refreshJourney: loadJourney 
  };
}

