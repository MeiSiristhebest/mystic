export const MODELS = {
  PRO: process.env.GEMINI_MODEL_PRO || "gemini-3.1-pro-preview",       // 25 RPM / 2M TPM / 250 RPD
  FLASH: process.env.GEMINI_MODEL_FLASH || "gemini-3-flash-preview",   // 1K RPM / 2M TPM / 10K RPD
  LITE: process.env.GEMINI_MODEL_LITE || "gemini-3.1-flash-lite",     // 4K RPM / 4M TPM / 150K RPD
} as const;

export const FALLBACK_CHAIN = [
  MODELS.PRO,
  MODELS.FLASH,
  MODELS.LITE
];

export const AGNES_MODELS = {
  FLASH: process.env.AGNES_MODEL_FLASH || "agnes-2.0-flash",
  IMAGE: process.env.AGNES_MODEL_IMAGE || "agnes-image-2.0-flash",
} as const;

export const DEFAULT_MODEL = AGNES_MODELS.FLASH;

export type AIProvider = "gemini" | "agnes";

export function sanitizePrompt(input: string): string {
  if (!input) return "";
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/System Instruction:|Ignore previous instructions/gi, "[REDACTED]");
}

// Re-export all personas from the modular persona registry
export * from './prompts/personas';

import { AKASHA_PERSONA } from './prompts/personas';

/**
 * Unified non-streaming content generation using the secure /api/ai route.
 * Replaces the insecure direct client SDK usage.
 */
export async function generateContent(
  prompt: string | any[],
  systemInstruction: string = AKASHA_PERSONA,
  config: any = {},
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction, config, provider: config.provider }),
    signal
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to generate content');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No reader available');
  
  const decoder = new TextDecoder();
  let result = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  return result;
}

export async function* generateContentStream(
  prompt: string | any[],
  systemInstruction: string = AKASHA_PERSONA,
  signal?: AbortSignal,
  config: any = {}
) {
  const maxRetries = 2;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction, config, provider: config.provider }),
        signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate content');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');
      
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield decoder.decode(value, { stream: true });
      }
      return;
    } catch (err: any) {
      lastError = err;
      if (err.name === 'AbortError') throw err;
      
      console.warn(`[AI Stream Attempt ${attempt + 1}] failed:`, err);
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError;
}
