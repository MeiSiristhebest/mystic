/**
 * Mystic AI Architecture — Universal Multi-Provider AI Engine (Vercel AI SDK Core)
 * Decouples reasoning and symbolic inference from specific LLM providers.
 * Supported Providers: DeepSeek, OpenAI, Anthropic Claude, Google Gemini, Ollama, Agnes AI, Custom BYOK.
 */

export const PROVIDER_MODELS = {
  deepseek: {
    CHAT: process.env.DEEPSEEK_MODEL_CHAT || "deepseek-chat",
    REASONER: process.env.DEEPSEEK_MODEL_REASONER || "deepseek-reasoner",
  },
  openai: {
    GPT_4O: process.env.OPENAI_MODEL_GPT_4O || "gpt-4o",
    GPT_4O_MINI: process.env.OPENAI_MODEL_GPT_4O_MINI || "gpt-4o-mini",
    O3_MINI: process.env.OPENAI_MODEL_O3_MINI || "o3-mini",
  },
  anthropic: {
    CLAUDE_3_7_SONNET: process.env.ANTHROPIC_MODEL_CLAUDE_3_7 || "claude-3-7-sonnet-20250219",
    CLAUDE_3_5_SONNET: process.env.ANTHROPIC_MODEL_CLAUDE_3_5 || "claude-3-5-sonnet-20241022",
    CLAUDE_3_5_HAIKU: process.env.ANTHROPIC_MODEL_CLAUDE_HAIKU || "claude-3-5-haiku-20241022",
  },
  gemini: {
    FLASH: process.env.GEMINI_MODEL_FLASH || "gemini-2.0-flash",
    PRO: process.env.GEMINI_MODEL_PRO || "gemini-2.0-pro-exp-02-05",
    LITE: process.env.GEMINI_MODEL_LITE || "gemini-2.0-flash-lite-preview-02-05",
  },
  agnes: {
    FLASH: process.env.AGNES_MODEL_FLASH || "agnes-2.5-flash",
    IMAGE: process.env.AGNES_MODEL_IMAGE || "agnes-image-2.1-flash",
  },
} as const;

// Backward-compatible Gemini constants
export const MODELS = {
  PRO: PROVIDER_MODELS.gemini.PRO,
  FLASH: PROVIDER_MODELS.gemini.FLASH,
  LITE: PROVIDER_MODELS.gemini.LITE,
} as const;

export const FALLBACK_CHAIN = [
  MODELS.PRO,
  MODELS.FLASH,
  MODELS.LITE
];

// Backward-compatible Agnes constants
export const AGNES_MODELS = PROVIDER_MODELS.agnes;

export const DEFAULT_MODEL = AGNES_MODELS.FLASH;

export type AIProvider = 
  | "deepseek" 
  | "openai" 
  | "anthropic" 
  | "gemini" 
  | "ollama" 
  | "agnes" 
  | "custom";

export interface AIInvocationConfig {
  model?: string;
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
        model: config.model || AGNES_MODELS.FLASH,
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
  arg3?: AbortSignal | AIInvocationConfig,
  arg4?: any
): Promise<string> {
  let full = "";
  for await (const chunk of generateContentStream(prompt, systemInstruction, arg3, arg4)) {
    full += chunk;
  }
  return full.trim();
}
