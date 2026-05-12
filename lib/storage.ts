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

// Generic Store Operations
export async function saveToStore(storeName: string, key: string, value: any) {
  const db = await getDB();
  // If the store has a keyPath, we don't need to provide the key separately in put()
  if (storeName === 'journey-entries') {
    return db.put(storeName, value);
  }
  return db.put(storeName, value, key);
}

export async function getFromStore(storeName: string, key: string) {
  const db = await getDB();
  return db.get(storeName, key);
}

export async function getAllFromStore(storeName: string) {
  const db = await getDB();
  return db.getAll(storeName);
}

export async function deleteFromStore(storeName: string, key: string) {
  const db = await getDB();
  return db.delete(storeName, key);
}

export async function clearStore(storeName: string) {
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
    return (await getFromStore('app-state', name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await saveToStore('app-state', name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await deleteFromStore('app-state', name);
  },
};
