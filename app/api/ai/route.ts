import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { AKASHA_PERSONA, DEFAULT_PROVIDER, DEFAULT_MODEL, AIProvider } from "@/lib/ai";
import { getCachedResponse, setCachedResponse, generateCacheKey } from "@/lib/ai-cache";

export const runtime = 'edge';
export const maxDuration = 300;

/**
 * Standard Provider Registry
 * Resolves the language model instance dynamically based on provider and model ID.
 * Zero hardcoded model names: completely data-driven.
 */
function getLanguageModel(providerName?: string, userConfig: any = {}) {
  const provider = (providerName || userConfig.provider || DEFAULT_PROVIDER).toLowerCase();
  const modelId = userConfig.model || DEFAULT_MODEL;

  if (!modelId) {
    throw new Error("No AI model ID provided. Please specify a model in request config or set DEFAULT_AI_MODEL.");
  }

  const apiKey = userConfig.customApiKey;
  const baseURL = userConfig.customBaseUrl;

  switch (provider) {
    case "google":
    case "gemini": {
      const key = apiKey || process.env.GEMINI_API_KEY;
      if (!key) throw new Error("GEMINI_API_KEY is not configured");
      const google = createGoogleGenerativeAI({
        apiKey: key,
        baseURL: baseURL || process.env.GEMINI_BASE_URL,
      });
      return { model: google(modelId), modelId, provider: "google" };
    }

    case "anthropic":
    case "claude": {
      const key = apiKey || process.env.ANTHROPIC_API_KEY;
      if (!key) throw new Error("ANTHROPIC_API_KEY is not configured");
      const anthropic = createAnthropic({
        apiKey: key,
        baseURL: baseURL || process.env.ANTHROPIC_BASE_URL,
      });
      return { model: anthropic(modelId), modelId, provider: "anthropic" };
    }

    case "deepseek": {
      const key = apiKey || process.env.DEEPSEEK_API_KEY;
      if (!key) throw new Error("DEEPSEEK_API_KEY is not configured");
      const deepseek = createOpenAI({
        apiKey: key,
        baseURL: baseURL || process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
      });
      return { model: deepseek(modelId), modelId, provider: "deepseek" };
    }

    case "openai": {
      const key = apiKey || process.env.OPENAI_API_KEY;
      if (!key) throw new Error("OPENAI_API_KEY is not configured");
      const openai = createOpenAI({
        apiKey: key,
        baseURL: baseURL || process.env.OPENAI_BASE_URL,
      });
      return { model: openai(modelId), modelId, provider: "openai" };
    }

    default: {
      // Universal OpenAI-compatible driver (Ollama, vLLM, OpenRouter, Grok, Qwen, SiliconFlow, Local, BYOK)
      const key = apiKey || process.env.CUSTOM_AI_API_KEY || process.env.OPENAI_API_KEY || "default";
      const custom = createOpenAI({
        apiKey: key,
        baseURL: baseURL || process.env.CUSTOM_AI_BASE_URL || "http://localhost:11434/v1",
      });
      return { model: custom(modelId), modelId, provider: provider || "custom" };
    }
  }
}

// --- Agnes AI Proxy Helper (Backward Compatibility) ---

async function callAgnesStream(
  messages: Array<{ role: string; content: string }>,
  systemInstruction: string,
  userConfig: any,
  signal?: AbortSignal,
  cacheKey?: string
): Promise<Response> {
  const apiKey = userConfig.customApiKey || process.env.AGNES_API_KEY;
  if (!apiKey) {
    return new Response("AGNES_API_KEY is not configured", { status: 500 });
  }

  const fullMessages: any[] = [];
  fullMessages.push({ role: "system", content: systemInstruction });
  fullMessages.push(...messages);

  const modelName = userConfig.model || process.env.AGNES_MODEL_FLASH || "default";
  const agnesConfig: Record<string, any> = {
    model: modelName,
    messages: fullMessages,
    stream: true,
  };

  if (userConfig.temperature !== undefined) agnesConfig.temperature = userConfig.temperature;
  if (userConfig.maxOutputTokens !== undefined) agnesConfig.max_tokens = userConfig.maxOutputTokens;
  if (userConfig.response_format === "json_object") {
    agnesConfig.response_format = { type: "json_object" };
  }

  const agnesApiUrl = (userConfig.customBaseUrl || process.env.AGNES_API_URL || "https://apihub.agnes-ai.com/v1").replace(/\/$/, "");
  
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort(new Error("Connection timed out"));
  }, 18000);

  let onAbort: (() => void) | null = null;
  if (signal) {
    if (signal.aborted) {
      abortController.abort();
    } else {
      onAbort = () => abortController.abort();
      signal.addEventListener("abort", onAbort);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${agnesApiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(agnesConfig),
      signal: abortController.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    if (signal && onAbort) {
      signal.removeEventListener("abort", onAbort);
    }
    const errorText = await response.text();
    return new Response(errorText || "Agnes API error", { status: response.status });
  }

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(new TextEncoder().encode(" "));
      
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      let fullContent = "";

      const cleanup = () => {
        if (signal && onAbort) {
          signal.removeEventListener("abort", onAbort);
        }
      };

      try {
        if (response.body) {
          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              if (trimmed === "data: [DONE]") continue;
              if (trimmed.startsWith("data: ")) {
                try {
                  const jsonStr = trimmed.slice(6).trim();
                  const parsed = JSON.parse(jsonStr);
                  const content = parsed.choices?.[0]?.delta?.content || "";
                  if (content) {
                    fullContent += content;
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Ignore parse error
                }
              }
            }
          }

          if (buffer) {
            const trimmed = buffer.trim();
            if (trimmed && trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
              try {
                const jsonStr = trimmed.slice(6).trim();
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  fullContent += content;
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                // Ignore
              }
            }
          }

          if (cacheKey && fullContent) {
            setCachedResponse(cacheKey, fullContent);
          }
        }
        controller.close();
      } catch (e) {
        console.error("[Agnes Stream Error]", e);
        controller.error(e);
      } finally {
        cleanup();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-AI-Model": agnesConfig.model,
    },
  });
}

// --- Main Route Handler ---

export async function POST(req: NextRequest) {
  try {
    // 1. Same-Origin Security Check
    const referer = req.headers.get("referer");
    const origin = req.headers.get("origin");
    const secFetchSite = req.headers.get("sec-fetch-site");
    const host = req.headers.get("host");

    let isSameOrigin = false;
    if (secFetchSite === "same-origin") {
      isSameOrigin = true;
    } else if (origin) {
      try {
        const originUrl = new URL(origin);
        const hostUrl = host ? (host.includes("://") ? host : `https://${host}`) : "";
        if (hostUrl && originUrl.host === new URL(hostUrl).host) {
          isSameOrigin = true;
        }
      } catch (e) {
        // Parse error
      }
    } else if (referer) {
      try {
        const refererUrl = new URL(referer);
        const hostUrl = host ? (host.includes("://") ? host : `https://${host}`) : "";
        if (hostUrl && refererUrl.host === new URL(hostUrl).host) {
          isSameOrigin = true;
        }
      } catch (e) {
        // Parse error
      }
    } else {
      isSameOrigin = true;
    }

    if (!isSameOrigin) {
      return new Response("Unauthorized: Cross-origin requests are forbidden.", { status: 403 });
    }

    const body = await req.json();
    const {
      prompt,
      systemInstruction = AKASHA_PERSONA,
      config: userConfig = {},
    } = body;
    
    const requestedProvider = body.provider || userConfig.provider;

    // Check Cache
    const cacheKey = generateCacheKey(prompt, userConfig.model || DEFAULT_MODEL || "default", systemInstruction);
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // A. Route to Agnes provider (if explicitly specified)
    if (requestedProvider === "agnes") {
      const messages: Array<{ role: string; content: string }> = Array.isArray(prompt)
        ? prompt.map((m: any) => {
            const role = m.role === "model" ? "assistant" : (m.role || "user");
            if (Array.isArray(m.parts)) {
              const textContent = m.parts.map((p: any) => p.text || "").join("");
              return { role, content: textContent };
            }
            if (typeof m === "string") return { role: "user", content: m };
            if (m.content) return { role, content: m.content };
            if (m.text) return { role, content: m.text };
            return { role, content: typeof m === "object" ? JSON.stringify(m) : String(m) };
          })
        : [{ role: "user", content: String(prompt) }];

      return await callAgnesStream(messages, systemInstruction, userConfig, req.signal, cacheKey);
    }

    // B. Route to Vercel AI SDK (Standard Provider Registry)
    try {
      const { model: modelInstance, modelId, provider } = getLanguageModel(requestedProvider, userConfig);

      // Normalize messages for Vercel AI SDK
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }

      if (Array.isArray(prompt)) {
        for (const m of prompt) {
          const role = m.role === "model" || m.role === "assistant" ? "assistant" : "user";
          let content = "";
          if (Array.isArray(m.parts)) {
            content = m.parts.map((p: any) => p.text || "").join("");
          } else if (m.content) {
            content = m.content;
          } else if (m.text) {
            content = m.text;
          } else {
            content = typeof m === "string" ? m : JSON.stringify(m);
          }
          messages.push({ role, content });
        }
      } else {
        messages.push({ role: "user", content: String(prompt) });
      }

      const result = streamText({
        model: modelInstance,
        messages,
        temperature: userConfig.temperature !== undefined ? userConfig.temperature : 0.7,
        abortSignal: req.signal,
      });

      // Stream text response directly to client
      let fullText = "";
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(new TextEncoder().encode(" "));
          try {
            for await (const chunk of result.textStream) {
              if (chunk) {
                fullText += chunk;
                controller.enqueue(new TextEncoder().encode(chunk));
              }
            }
            if (cacheKey && fullText) {
              setCachedResponse(cacheKey, fullText);
            }
          } catch (err) {
            console.error("[Vercel AI SDK Stream Error]", err);
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-AI-Provider": provider,
          "X-AI-Model": modelId,
        },
      });
    } catch (sdkError: any) {
      console.warn(`[Vercel AI SDK Error] Attempting Agnes fallback...`, sdkError);
      if (process.env.AGNES_API_KEY) {
        const messages: Array<{ role: string; content: string }> = Array.isArray(prompt)
          ? prompt.map((m: any) => {
              const role = m.role === "model" ? "assistant" : (m.role || "user");
              if (Array.isArray(m.parts)) {
                const textContent = m.parts.map((p: any) => p.text || "").join("");
                return { role, content: textContent };
              }
              if (typeof m === "string") return { role: "user", content: m };
              if (m.content) return { role, content: m.content };
              if (m.text) return { role, content: m.text };
              return { role, content: typeof m === "object" ? JSON.stringify(m) : String(m) };
            })
          : [{ role: "user", content: String(prompt) }];
        return await callAgnesStream(messages, systemInstruction, userConfig, req.signal, cacheKey);
      }
      throw sdkError;
    }
  } catch (error: any) {
    console.error("AI API Error:", error);
    const status = error.status || 500;
    return new Response(error.message || "Internal Server Error", { status });
  }
}
