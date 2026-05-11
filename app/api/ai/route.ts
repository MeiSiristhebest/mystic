import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { AKASHA_PERSONA } from "@/lib/ai";

const DEFAULT_MODEL = "gemini-3-flash-preview";

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
    
    const contents = Array.isArray(prompt) 
      ? prompt.map((m: any) => {
          if (m.role && m.parts) return m;
          if (m.text) return { role: 'user', parts: [{ text: m.text }] };
          return { role: 'user', parts: [m] };
        })
      : [{ role: 'user', parts: [{ text: prompt }] }];

    // Prepare generation config for v2 SDK
    const generationConfig: any = {};
    if (userConfig.responseMimeType) generationConfig.responseMimeType = userConfig.responseMimeType;
    if (userConfig.responseSchema) generationConfig.responseSchema = userConfig.responseSchema;
    if (userConfig.temperature !== undefined) generationConfig.temperature = userConfig.temperature;
    if (userConfig.maxOutputTokens !== undefined) generationConfig.maxOutputTokens = userConfig.maxOutputTokens;

    const responseStream = await ai.models.generateContentStream({
      model: userConfig.model || DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction,
        ...generationConfig,
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text || "";
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
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
