import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { AKASHA_PERSONA, DEFAULT_MODEL, MODELS, FALLBACK_CHAIN } from "@/lib/ai";
import { getCachedResponse, setCachedResponse, generateCacheKey } from "@/lib/ai-cache";

export const runtime = 'edge';
export const maxDuration = 300;

// --- Agnes AI helpers ---

async function callAgnesStream(
  messages: Array<{ role: string; content: string }>,
  systemInstruction: string,
  userConfig: any,
  signal?: AbortSignal,
  cacheKey?: string
): Promise<Response> {
  const apiKey = process.env.AGNES_API_KEY;
  if (!apiKey) {
    return new Response("AGNES_API_KEY is not configured", { status: 500 });
  }

  // Build full messages array with system prompt
  const fullMessages: any[] = [];
  // Always use the provided systemInstruction
  fullMessages.push({ role: "system", content: systemInstruction });
  fullMessages.push(...messages);

  const agnesConfig: Record<string, any> = {
    model: userConfig.model || DEFAULT_MODEL,
    messages: fullMessages,
    stream: true,
  };

  if (userConfig.temperature !== undefined) agnesConfig.temperature = userConfig.temperature;
  if (userConfig.maxOutputTokens !== undefined) agnesConfig.max_tokens = userConfig.maxOutputTokens;
  if (userConfig.response_format === "json_object") {
    agnesConfig.response_format = { type: "json_object" };
  }

  const agnesApiUrl = (process.env.AGNES_API_URL || "https://apihub.agnes-ai.com/v1").replace(/\/$/, "");
  
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort(new Error("Connection timed out"));
  }, 18000);

  // Link client abort signal to our controller to cancel the fetch and stream if client aborts
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

  // Decode SSE stream chunks and enqueue only text content
  const stream = new ReadableStream({
    async start(controller) {
      // Send an initial space to start the response immediately and prevent Vercel 25s timeout
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

            // Keep the last incomplete line in the buffer
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
                  // Ignore JSON parsing errors for malformed or incomplete stream chunks
                }
              }
            }
          }

          // Process remaining buffer
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

// --- Gemini AI (original logic) ---

async function callGemini(
  prompt: string | any[],
  systemInstruction: string,
  userConfig: any,
  cacheKey: string
): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("GEMINI_API_KEY is not configured", { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = userConfig.model || MODELS.LITE;

  const contents = Array.isArray(prompt)
    ? prompt.map((m: any) => {
        if (m.role && m.parts) return m;
        if (m.text) return { role: 'user', parts: [{ text: m.text }] };
        return { role: 'user', parts: [m] };
      })
    : [{ role: 'user', parts: [{ text: prompt }] }];

  // Check Cache
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // Prepare generation config for v2 SDK
  const generationConfig: any = {};
  if (userConfig.responseMimeType) generationConfig.responseMimeType = userConfig.responseMimeType;
  if (userConfig.responseSchema) generationConfig.responseSchema = userConfig.responseSchema;
  if (userConfig.temperature !== undefined) generationConfig.temperature = userConfig.temperature;
  if (userConfig.maxOutputTokens !== undefined) generationConfig.maxOutputTokens = userConfig.maxOutputTokens;

  // Execute with Systematic Fallback Logic (Prevent upward scaling to save quota)
  const currentRank = FALLBACK_CHAIN.indexOf(modelName);
  const fallbackChain = currentRank !== -1 
    ? FALLBACK_CHAIN.slice(currentRank)
    : [modelName, MODELS.LITE];
  let lastError: any = null;

  for (let i = 0; i < fallbackChain.length; i++) {
    const currentModel = fallbackChain[i];
    try {
      const tools: any[] = [];
      if (userConfig.useSearch) {
        tools.push({ google_search: {} });
      }

      const responseStream = await ai.models.generateContentStream({
        model: currentModel,
        contents,
        config: {
          systemInstruction,
          ...generationConfig,
          tools: tools.length > 0 ? tools : undefined,
        },
      });

      let fullContent = "";
      const stream = new ReadableStream({
        async start(controller) {
          try {
            controller.enqueue(new TextEncoder().encode(" "));
            for await (const chunk of responseStream) {
              const text = chunk.text || "";
              if (text) {
                fullContent += text;
                controller.enqueue(new TextEncoder().encode(text));
              }
            }
            if (fullContent) setCachedResponse(cacheKey, fullContent);
          } catch (e) {
            console.error(`[AI Stream Error] Model: ${currentModel}`, e);
            controller.error(e);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'X-AI-Model': currentModel,
        },
      });

    } catch (error: any) {
      lastError = error;
      const isRateLimit = error.message?.includes("429") || error.status === 429;

      if (isRateLimit && i < fallbackChain.length - 1) {
        const nextModel = fallbackChain[i + 1];
        console.warn(`[AI Rate Limit] Model ${currentModel} exhausted. Falling back to ${nextModel}...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      if (userConfig.useSearch && !isRateLimit) {
        console.warn(`[AI Search Error] Model ${currentModel} failed with search. Retrying without tools...`);
        userConfig.useSearch = false;
        i--;
        continue;
      }

      break;
    }
  }

  throw lastError;
}

// --- Main handler ---

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
        // Parse error, fallback to false
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
        // Parse error, fallback to false
      }
    } else {
      // Fallback for internal / local server invocations where headers are absent
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
    
    // Determine provider: only explicit 'gemini' switches to Gemini, everything else defaults to Agnes
    const provider = (body.provider as string) || (userConfig.provider as string) || "agnes";

    // Route to the appropriate provider
    if (provider === "agnes") {
      try {
        // Convert Gemini-style prompt to Agnes messages format (with role alignment & parts merging)
        const messages: Array<{ role: string; content: string }> = Array.isArray(prompt)
          ? prompt.map((m: any) => {
              const role = m.role === "model" ? "assistant" : (m.role || "user");
              
              // Handle parts format of multi-turn chat
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

        const cacheKey = generateCacheKey(prompt, userConfig.model || DEFAULT_MODEL, systemInstruction);
        const cached = getCachedResponse(cacheKey);
        if (cached) {
          return new Response(cached, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        }

        return await callAgnesStream(messages, systemInstruction, userConfig, req.signal, cacheKey);
      } catch (agnesError) {
        console.error("[AI Provider Agnes Failed]", agnesError);
        throw agnesError;
      }
    }

    // Default: Gemini (with Agnes recovery fallback)
    const cacheKey = generateCacheKey(prompt, userConfig.model || MODELS.LITE, systemInstruction);
    try {
      return await callGemini(prompt, systemInstruction, userConfig, cacheKey);
    } catch (geminiError) {
      console.warn("[AI Provider Gemini Failed] Attempting disaster recovery fallback to Agnes...", geminiError);
      if (!process.env.AGNES_API_KEY) {
        throw geminiError;
      }
      
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
  } catch (error: any) {
    console.error("AI API Final Error:", error);
    const status = error.status || 500;
    return new Response(error.message || "Internal Server Error", { status });
  }
}
