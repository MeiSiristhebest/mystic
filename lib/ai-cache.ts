/**
 * Simple in-memory LRU cache for AI responses to save costs and reduce latency.
 * Eliminates memory leaks and reduces key comparison complexity.
 */

type CacheEntry = {
  content: string;
  expiry: number;
};

const MAX_CACHE_SIZE = 200;
const cache = new Map<string, CacheEntry>();

/**
 * 32-bit FNV-1a non-cryptographic hash function.
 * Compresses super large prompt payloads into a tiny 8-character hex string.
 */
function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // imul mimics C-style 32-bit integer multiplication overflow
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

export function getCachedResponse(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  
  // LRU Refresh: delete and re-insert to keep it fresh
  cache.delete(key);
  cache.set(key, entry);
  
  return entry.content;
}

export function setCachedResponse(key: string, content: string, ttlMs: number = 3600000): void {
  if (cache.has(key)) {
    cache.delete(key);
  } else if (cache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry (the first key in the map iterator)
    const oldestKey = cache.keys().next().value;
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }
  
  cache.set(key, {
    content,
    expiry: Date.now() + ttlMs,
  });
}

export function generateCacheKey(prompt: any, model: string, systemInstruction: string): string {
  const payload = JSON.stringify({ prompt, model, systemInstruction });
  return fnv1a(payload);
}
