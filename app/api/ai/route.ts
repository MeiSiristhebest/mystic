import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { AKASHA_PERSONA, DEFAULT_MODEL, MODELS, FALLBACK_CHAIN } from "@/lib/ai";
import { getCachedResponse, setCachedResponse, generateCacheKey } from "@/lib/ai-cache";

export const runtime = 'edge';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response("GEMINI_API_KEY is not configured", { status: 500 });
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const body = await req.json();
    const { 
      prompt, 
      systemInstruction = AKASHA_PERSONA, 
      config: userConfig = {} 
    } = body;
    
    const modelName = userConfig.model || DEFAULT_MODEL;
    
    const contents = Array.isArray(prompt) 
      ? prompt.map((m: any) => {
          if (m.role && m.parts) return m;
          if (m.text) return { role: 'user', parts: [{ text: m.text }] };
          return { role: 'user', parts: [m] };
        })
      : [{ role: 'user', parts: [{ text: prompt }] }];

    // 1. Check Cache
    const cacheKey = generateCacheKey(contents, modelName, systemInstruction);
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

    // 2. Execute with Systematic Fallback Logic
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

        // If we reach here, request started successfully
        let fullContent = "";
        const stream = new ReadableStream({
          async start(controller) {
            try {
              // Send a hidden space to keep the connection alive during initial model thinking
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
            'X-AI-Model': currentModel, // Inform client which model actually responded
          },
        });

      } catch (error: any) {
        lastError = error;
        const isRateLimit = error.message?.includes("429") || error.status === 429;
        
        if (isRateLimit && i < fallbackChain.length - 1) {
          const nextModel = fallbackChain[i + 1];
          console.warn(`[AI Rate Limit] Model ${currentModel} exhausted. Falling back to ${nextModel}...`);
          // Brief pause before fallback
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
        
        // If it's a search error but not rate limit, try one more time without search (same model)
        if (userConfig.useSearch && !isRateLimit) {
          console.warn(`[AI Search Error] Model ${currentModel} failed with search. Retrying without tools...`);
          userConfig.useSearch = false; 
          i--; // Retry same model without search
          continue;
        }

        break; // Non-retryable error or end of chain
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error("AI API Final Error:", error);
    const status = error.status || 500;
    return new Response(error.message || "Internal Server Error", { status });
  }
}
