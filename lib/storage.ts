import type { IDBPDatabase } from 'idb';

const DB_NAME = 'akasha-journey-db';
const STORE_NAME = 'reports';
const VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB() {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is not available on the server');
  }
  
  if (!dbPromise) {
    const { openDB } = await import('idb');
    dbPromise = openDB(DB_NAME, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function saveToIndexedDB(key: string, value: unknown) {
  const db = await getDB();
  await db.put(STORE_NAME, value, key);
}

export async function getFromIndexedDB(key: string) {
  const db = await getDB();
  return db.get(STORE_NAME, key);
}

export async function deleteFromIndexedDB(key: string) {
  const db = await getDB();
  await db.delete(STORE_NAME, key);
}

export async function clearIndexedDB() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

/**
 * Cleanup localStorage if it's getting too full
 */
export function cleanupLocalStorage() {
  try {
    const keys = Object.keys(localStorage);
    let totalSize = 0;
    for (const key of keys) {
      totalSize += (localStorage.getItem(key) || '').length;
    }

    // If over 4MB (approximate), clear old entries
    if (totalSize > 4 * 1024 * 1024) {
      console.warn('LocalStorage is full, cleaning up...');
      // Simple strategy: clear all and let the app rebuild what it needs
      // or selectively delete based on prefix
      const journeyKeys = keys.filter(k => k.startsWith('akasha-journey-'));
      journeyKeys.sort(); // Sort by key (which might include timestamp)
      
      // Delete oldest 50% of journey entries
      const toDelete = journeyKeys.slice(0, Math.floor(journeyKeys.length / 2));
      toDelete.forEach(k => localStorage.removeItem(k));
    }
  } catch (e) {
    console.error('Failed to cleanup localStorage', e);
  }
}

/**
 * Compress Base64 image data (placeholder for real compression if needed)
 * For now, we just suggest using IndexedDB for large files.
 */
export async function saveLargeData(key: string, data: string) {
  if (data.length > 100 * 1024) { // > 100KB
    await saveToIndexedDB(key, data);
    return { type: 'indexeddb', key };
  }
  return { type: 'inline', data };
}
