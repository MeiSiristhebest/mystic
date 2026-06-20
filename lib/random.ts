/**
 * Cryptographically Secure Pseudo-Random Number Generator (CSPRNG) utilities
 * Replaces standard Math.random() with window.crypto.getRandomValues for absolute sacred divination purity.
 */

export function getCryptoRandom(): number {
  const globalCrypto = typeof crypto !== 'undefined' ? crypto : (typeof window !== 'undefined' ? window.crypto : null);
  if (globalCrypto && globalCrypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    globalCrypto.getRandomValues(buffer);
    return buffer[0] / (0xffffffff + 1);
  }
  return Math.random();
}

export function cryptoShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(getCryptoRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function cryptoCoinToss(): 'heads' | 'tails' {
  return getCryptoRandom() > 0.5 ? 'heads' : 'tails';
}

export function cryptoRoll(min: number, max: number): number {
  return Math.floor(getCryptoRandom() * (max - min + 1)) + min;
}
