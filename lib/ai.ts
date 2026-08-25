/**
 * Mystic AI Architecture — Universal Multi-Model Engine (Vercel AI SDK Core)
 * Completely decouples reasoning and domain logic from specific model names and vendors.
 * Zero hardcoded models: 100% data-driven and environment/request-configurable.
 */

export const DEFAULT_PROVIDER = process.env.DEFAULT_AI_PROVIDER || "gemini";
export const DEFAULT_MODEL = process.env.DEFAULT_AI_MODEL || process.env.AI_MODEL || "";

export type AIProvider = 
  | "gemini" 
  | "anthropic" 
  | "openai" 
  | "deepseek" 
  | "custom" 
  | (string & {});

export interface AIInvocationConfig {
  /** Dynamic model identifier (passed directly to provider) */
  model?: string;
  /** Provider identifier */
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
      config, 
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
