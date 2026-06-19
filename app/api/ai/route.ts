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
  userConfig: any
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
    model: userConfig.model || "agnes-2.0-flash",
    messages: fullMessages,
    stream: true,
  };

  if (userConfig.temperature !== undefined) agnesConfig.temperature = userConfig.temperature;
  if (userConfig.maxOutputTokens !== undefined) agnesConfig.max_tokens = userConfig.maxOutputTokens;
  if (userConfig.response_format === "json_object") {
    agnesConfig.response_format = { type: "json_object" };
  }

  const response = await fetch("https://apihub.agnes-ai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(agnesConfig),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(errorText || "Agnes API error", { status: response.status });
  }

  // Forward the SSE stream directly
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (response.body) {
          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        }
        controller.close();
      } catch (e) {
        console.error("[Agnes Stream Error]", e);
        controller.error(e);
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
): Promise<Response | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("GEMINI_API_KEY is not configured", { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = userConfig.model || DEFAULT_MODEL;

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

  // Execute with Systematic Fallback Logic
  const fallbackChain = [modelName, ...FALLBACK_CHAIN.filter(m => m !== modelName)];
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
    const body = await req.json();
    const {
      prompt,
      systemInstruction = AKASHA_PERSONA,
      config: userConfig = {},
    } = body;
    
    // Determine provider: top-level 'provider' field, or from config.provider
    const provider = (body.provider as string) || (userConfig.provider as string) || "gemini";

    // Route to the appropriate provider
    if (provider === "agnes") {
      // Convert Gemini-style prompt to Agnes messages format
      const messages: Array<{ role: string; content: string }> = Array.isArray(prompt)
        ? prompt.map((m: any) => {
            if (typeof m === "string") return { role: "user", content: m };
            if (m.content) return { role: m.role || "user", content: m.content };
            if (m.text) return { role: m.role || "user", content: m.text };
            return { role: "user", content: JSON.stringify(m) };
          })
        : [{ role: "user", content: prompt }];

      return callAgnesStream(messages, systemInstruction, userConfig);
    }

    // Default: Gemini (original logic)
    const cacheKey = generateCacheKey(prompt, userConfig.model || DEFAULT_MODEL, systemInstruction);
    const result = await callGemini(prompt, systemInstruction, userConfig, cacheKey);
    if (result) return result;

    return new Response(JSON.stringify({ error: "Unexpected state" }), { status: 500 });
  } catch (error: any) {
    console.error("AI API Final Error:", error);
    const status = error.status || 500;
    return new Response(error.message || "Internal Server Error", { status });
  }
}
