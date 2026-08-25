/**
 * Mystic AI Architecture — Zero-Hardcoding Dynamic Multi-Model Engine (Vercel AI SDK Core)
 * Decouples reasoning and symbolic inference completely from static model strings.
 * All models and providers are 100% dynamically configurable via environment variables or request parameters.
 */

// Dynamically resolved default provider and model from environment
export const DEFAULT_PROVIDER: AIProvider = (process.env.DEFAULT_AI_PROVIDER as AIProvider) || "gemini";
export const DEFAULT_MODEL: string = 
  process.env.DEFAULT_AI_MODEL || 
  process.env.AI_MODEL || 
  process.env.GEMINI_MODEL || 
  process.env.OPENAI_MODEL || 
  process.env.DEEPSEEK_MODEL || 
  process.env.ANTHROPIC_MODEL || 
  "gemini-2.5-flash";

// Backward-compatible reference objects pointing to dynamic environment variables
export const MODELS = {
  get PRO() { return process.env.GEMINI_MODEL_PRO || process.env.AI_MODEL_PRO || DEFAULT_MODEL; },
  get FLASH() { return process.env.GEMINI_MODEL_FLASH || process.env.AI_MODEL_FLASH || DEFAULT_MODEL; },
  get LITE() { return process.env.GEMINI_MODEL_LITE || process.env.AI_MODEL_LITE || DEFAULT_MODEL; },
} as const;

export const AGNES_MODELS = {
  get FLASH() { return process.env.AGNES_MODEL_FLASH || DEFAULT_MODEL; },
  get IMAGE() { return process.env.AGNES_MODEL_IMAGE || "agnes-image"; },
} as const;

export const FALLBACK_CHAIN = [
  MODELS.PRO,
  MODELS.FLASH,
  MODELS.LITE,
];

export type AIProvider = 
  | "gemini" 
  | "anthropic" 
  | "openai" 
  | "deepseek" 
  | "grok" 
  | "qwen" 
  | "ollama" 
  | "agnes" 
  | "custom" 
  | (string & {});

export interface AIInvocationConfig {
  /** Any dynamic model string (e.g. gpt-4.5, claude-3-7-sonnet, deepseek-reasoner, gemini-2.5-pro, custom-id) */
  model?: string;
  /** Any dynamic provider identifier */
  provider?: AIProvider;
  temperature?: number;
  maxOutputTokens?: number;
  customApiKey?: string;
  customBaseUrl?: string;
  response_format?: "json_object" | "text";
  [key: string]: any;
}

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
  arg3?: AbortSignal | AIInvocationConfig,
  arg4?: any
): AsyncIterable<string> {
  let signal: AbortSignal | undefined;
  let config: AIInvocationConfig = {};

  if (arg3 instanceof AbortSignal || (arg3 && typeof arg3 === 'object' && 'aborted' in arg3)) {
    signal = arg3 as AbortSignal;
    config = arg4 || {};
  } else {
    config = (arg3 as AIInvocationConfig) || {};
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
        model: config.model,
        ...config,
      }, 
      provider: config.provider || DEFAULT_PROVIDER
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
  arg3?: AbortSignal | AIInvocationConfig,
  arg4?: any
): Promise<string> {
  let full = "";
  for await (const chunk of generateContentStream(prompt, systemInstruction, arg3, arg4)) {
    full += chunk;
  }
  return full.trim();
}
