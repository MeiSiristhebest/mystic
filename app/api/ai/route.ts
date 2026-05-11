import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { AKASHA_PERSONA, DEFAULT_MODEL } from "@/lib/ai";
import { getCachedResponse, setCachedResponse, generateCacheKey } from "@/lib/ai-cache";

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

    // 2. Execute with Search Grounding & Robustness Fallback
    let responseStream;
    try {
      responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          ...generationConfig,
          tools: [{ google_search: {} }],
        },
      });
    } catch (searchError) {
      console.warn("[Search Fallback] Google Search failed, retrying without tools:", searchError);
      responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          ...generationConfig,
        },
      });
    }

    let fullContent = "";
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text || "";
            if (text) {
              fullContent += text;
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          
          // 3. Store in Cache
          if (fullContent) {
            setCachedResponse(cacheKey, fullContent);
          }
        } catch (e) {
          console.error("Stream processing error:", e);
          controller.error(e);
        } finally {
          controller.close();
        }
      },
      cancel() {
        // Optional: handle abort
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error: any) {
    console.error("AI API Error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
