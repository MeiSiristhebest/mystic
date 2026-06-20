import type { IDBPDatabase } from 'idb';

const DB_NAME = 'akasha-journey-db';
const VERSION = 2; // Incremented for new stores

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB() {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is not available on the server');
  }
  
  if (!dbPromise) {
    const { openDB } = await import('idb');
    dbPromise = openDB(DB_NAME, VERSION, {
      upgrade(db, oldVersion) {
        // Main Reports store
        if (!db.objectStoreNames.contains('reports')) {
          db.createObjectStore('reports');
        }
        // App State Store (For Zustand)
        if (!db.objectStoreNames.contains('app-state')) {
          db.createObjectStore('app-state');
        }
        // Atomic Journey Store
        if (!db.objectStoreNames.contains('journey-entries')) {
          db.createObjectStore('journey-entries', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// In-memory cache layer for instant O(1) cross-view access
const memoryCache = new Map<string, { value: any; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in memory

// Generic Store Operations
export async function saveToStore(storeName: string, key: string, value: any) {
  const fullKey = `${storeName}::${key}`;
  memoryCache.set(fullKey, { value, timestamp: Date.now() });

  const db = await getDB();
  if (storeName === 'journey-entries') {
    return db.put(storeName, value);
  }
  return db.put(storeName, value, key);
}

export async function getFromStore(storeName: string, key: string) {
  const fullKey = `${storeName}::${key}`;
  const cached = memoryCache.get(fullKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.value;
  }

  const db = await getDB();
  const val = await db.get(storeName, key);
  if (val !== undefined && val !== null) {
    memoryCache.set(fullKey, { value: val, timestamp: Date.now() });
  }
  return val;
}

export async function getAllFromStore(storeName: string) {
  const db = await getDB();
  return db.getAll(storeName);
}

export async function deleteFromStore(storeName: string, key: string) {
  const fullKey = `${storeName}::${key}`;
  memoryCache.delete(fullKey);

  const db = await getDB();
  return db.delete(storeName, key);
}

export async function clearStore(storeName: string) {
  for (const k of memoryCache.keys()) {
    if (k.startsWith(`${storeName}::`)) {
      memoryCache.delete(k);
    }
  }
  const db = await getDB();
  return db.clear(storeName);
}

// Legacy Aliases for compatibility during migration
export const saveToIndexedDB = (key: string, value: any) => saveToStore('reports', key, value);
export const getFromIndexedDB = (key: string) => getFromStore('reports', key);
export const deleteFromIndexedDB = (key: string) => deleteFromStore('reports', key);

/**
 * Custom Storage Adapter for Zustand
 */
export const zustandStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    return (await getFromStore('app-state', name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    await saveToStore('app-state', name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    await deleteFromStore('app-state', name);
  },
};
