export const MODELS = {
  PRO: process.env.GEMINI_MODEL_PRO || "gemini-3.1-pro-preview",
  FLASH: process.env.GEMINI_MODEL_FLASH || "gemini-3-flash-preview",
  LITE: process.env.GEMINI_MODEL_LITE || "gemini-3.1-flash-lite",
} as const;

export const FALLBACK_CHAIN = [
  MODELS.PRO,
  MODELS.FLASH,
  MODELS.LITE
];

export const AGNES_MODELS = {
  FLASH: process.env.AGNES_MODEL_FLASH || "agnes-2.5-flash",
  IMAGE: process.env.AGNES_MODEL_IMAGE || "agnes-image-2.1-flash",
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
 * Unified streaming content generation using the secure /api/ai route.
 * Intelligently handles both (prompt, systemInstruction, signal, config) and (prompt, systemInstruction, config, signal).
 */
export async function* generateContentStream(
  prompt: string | any[],
  systemInstruction: string = AKASHA_PERSONA,
  arg3?: AbortSignal | any,
  arg4?: any
): AsyncIterable<string> {
  let signal: AbortSignal | undefined;
  let config: any = {};

  if (arg3 instanceof AbortSignal || (arg3 && typeof arg3 === 'object' && 'aborted' in arg3)) {
    signal = arg3;
    config = arg4 || {};
  } else {
    config = arg3 || {};
    if (arg4 instanceof AbortSignal || (arg4 && typeof arg4 === 'object' && 'aborted' in arg4)) {
      signal = arg4;
    }
  }

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      prompt, 
      systemInstruction, 
      config: {
        model: AGNES_MODELS.FLASH,
        ...config,
      }, 
      provider: config.provider || "agnes" 
    }),
    signal
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to stream content');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No reader available');
  
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) yield chunk;
  }
}

/**
 * Unified non-streaming content generation.
 */
export async function generateContent(
  prompt: string | any[],
  systemInstruction: string = AKASHA_PERSONA,
  arg3?: AbortSignal | any,
  arg4?: any
): Promise<string> {
  let full = "";
  for await (const chunk of generateContentStream(prompt, systemInstruction, arg3, arg4)) {
    full += chunk;
  }
  return full.trim();
}
