/**
 * Simple in-memory cache for AI responses to save costs and reduce latency.
 * In a production environment, this should be replaced with Redis.
 */

type CacheEntry = {
  content: string;
  expiry: number;
};

const cache = new Map<string, CacheEntry>();

export function getCachedResponse(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  
  return entry.content;
}

export function setCachedResponse(key: string, content: string, ttlMs: number = 3600000): void {
  cache.set(key, {
    content,
    expiry: Date.now() + ttlMs,
  });
}

export function generateCacheKey(prompt: any, model: string, systemInstruction: string): string {
  const payload = JSON.stringify({ prompt, model, systemInstruction });
  // Simple hash or just the stringified payload
  return payload;
}
