import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { 
  AKASHA_PERSONA, 
  DEFAULT_MODEL, 
  DEFAULT_PROVIDER,
  AIProvider 
} from "@/lib/ai";
import { getCachedResponse, setCachedResponse, generateCacheKey } from "@/lib/ai-cache";

export const runtime = 'edge';
export const maxDuration = 300;

/**
 * Dynamically resolves provider and model instance without any hardcoding.
 * Accepts any model name string from request or environment variables.
 */
function resolveVercelAiModel(requestedProvider?: string, userConfig: any = {}) {
  let modelName = userConfig.model || process.env.DEFAULT_AI_MODEL || process.env.AI_MODEL;
  let provider = (requestedProvider || userConfig.provider || process.env.DEFAULT_AI_PROVIDER || "").toLowerCase();

  // If provider not explicitly specified, auto-infer from model name prefix
  if (!provider && modelName) {
    if (modelName.startsWith("gemini")) provider = "gemini";
    else if (modelName.startsWith("claude")) provider = "anthropic";
    else if (modelName.startsWith("deepseek")) provider = "deepseek";
    else if (modelName.startsWith("gpt") || modelName.startsWith("o1") || modelName.startsWith("o3")) provider = "openai";
    else if (modelName.startsWith("grok")) provider = "grok";
    else if (modelName.startsWith("qwen")) provider = "qwen";
    else if (modelName.startsWith("llama") || modelName.startsWith("mistral")) provider = "ollama";
  }

  // Fallback to default provider
  if (!provider) {
    provider = DEFAULT_PROVIDER;
  }

  // 1. Google Gemini Provider (Accepts any gemini model string)
  if (provider === "gemini") {
    const apiKey = userConfig.customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
    const baseURL = userConfig.customBaseUrl || process.env.GEMINI_BASE_URL;
    const resolvedModel = modelName || process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const google = createGoogleGenerativeAI({ apiKey, baseURL });
    return { model: google(resolvedModel), resolvedModel, provider };
  }

  // 2. Anthropic Claude Provider (Accepts any claude model string)
  if (provider === "anthropic" || provider === "claude") {
    const apiKey = userConfig.customApiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
    const baseURL = userConfig.customBaseUrl || process.env.ANTHROPIC_BASE_URL;
    const resolvedModel = modelName || process.env.ANTHROPIC_MODEL || "claude-3-7-sonnet-20250219";
    const anthropic = createAnthropic({ apiKey, baseURL });
    return { model: anthropic(resolvedModel), resolvedModel, provider: "anthropic" };
  }

  // 3. DeepSeek Provider (OpenAI compatible)
  if (provider === "deepseek") {
    const apiKey = userConfig.customApiKey || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not configured");
    const baseURL = userConfig.customBaseUrl || process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
    const resolvedModel = modelName || process.env.DEEPSEEK_MODEL || "deepseek-reasoner";
    const deepseek = createOpenAI({ baseURL, apiKey });
    return { model: deepseek(resolvedModel), resolvedModel, provider: "deepseek" };
  }

  // 4. xAI Grok Provider (OpenAI compatible)
  if (provider === "grok" || provider === "xai") {
    const apiKey = userConfig.customApiKey || process.env.XAI_API_KEY || process.env.GROK_API_KEY;
    if (!apiKey) throw new Error("XAI_API_KEY is not configured");
    const baseURL = userConfig.customBaseUrl || process.env.XAI_BASE_URL || "https://api.x.ai/v1";
    const resolvedModel = modelName || process.env.GROK_MODEL || "grok-3";
    const grok = createOpenAI({ baseURL, apiKey });
    return { model: grok(resolvedModel), resolvedModel, provider: "grok" };
  }

  // 5. Qwen / Dashscope Provider (OpenAI compatible)
  if (provider === "qwen" || provider === "dashscope") {
    const apiKey = userConfig.customApiKey || process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY;
    if (!apiKey) throw new Error("DASHSCOPE_API_KEY is not configured");
    const baseURL = userConfig.customBaseUrl || process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
    const resolvedModel = modelName || process.env.QWEN_MODEL || "qwen-2.5-max";
    const qwen = createOpenAI({ baseURL, apiKey });
    return { model: qwen(resolvedModel), resolvedModel, provider: "qwen" };
  }

  // 6. OpenAI Provider (Accepts any openai model string)
  if (provider === "openai") {
    const apiKey = userConfig.customApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
    const baseURL = userConfig.customBaseUrl || process.env.OPENAI_BASE_URL;
    const resolvedModel = modelName || process.env.OPENAI_MODEL || "gpt-4.5-preview";
    const openai = createOpenAI({ apiKey, baseURL });
    return { model: openai(resolvedModel), resolvedModel, provider: "openai" };
  }

  // 7. Universal Custom / Ollama / OpenRouter / OneAPI (BYOK)
  const apiKey = userConfig.customApiKey || process.env.CUSTOM_AI_API_KEY || process.env.OPENAI_API_KEY || "ollama";
  const baseURL = userConfig.customBaseUrl || process.env.CUSTOM_AI_BASE_URL || "http://localhost:11434/v1";
  const resolvedModel = modelName || process.env.CUSTOM_AI_MODEL || "llama3.3";
  const custom = createOpenAI({ baseURL, apiKey });
  return { model: custom(resolvedModel), resolvedModel, provider: provider || "custom" };
}

// --- Agnes AI helpers (Legacy Compatibility) ---

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

  const modelName = userConfig.model || process.env.AGNES_MODEL_FLASH || "agnes-2.5-flash";
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

// --- Main Handler ---

export async function POST(req: NextRequest) {
  try {
    // 1. Same-Origin Check (Security defense against external theft)
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
        if (hostUrl) {
          const hostParsed = new URL(hostUrl);
          if (originUrl.host === hostParsed.host) {
            isSameOrigin = true;
          }
        }
      } catch (e) {
        // Parse error
      }
    } else if (referer) {
      try {
        const refererUrl = new URL(referer);
        const hostUrl = host ? (host.includes("://") ? host : `https://${host}`) : "";
        if (hostUrl) {
          const hostParsed = new URL(hostUrl);
          if (refererUrl.host === hostParsed.host) {
            isSameOrigin = true;
          }
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
    
    const requestedProvider = (body.provider as string) || (userConfig.provider as string);

    // Check Cache
    const cacheKey = generateCacheKey(prompt, userConfig.model || DEFAULT_MODEL, systemInstruction);
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // A. Route to Agnes provider (if explicitly requested)
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

    // B. Route to Dynamic Vercel AI SDK Provider
    try {
      const { model: modelInstance, resolvedModel, provider } = resolveVercelAiModel(requestedProvider, userConfig);

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
          "X-AI-Model": resolvedModel,
        },
      });
    } catch (sdkError: any) {
      console.warn(`[Vercel AI SDK ${requestedProvider || 'default'} Error] Attempting Agnes fallback...`, sdkError);
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
