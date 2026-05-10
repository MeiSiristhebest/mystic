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
    const { prompt, systemInstruction = AKASHA_PERSONA, config: userConfig = {} } = body;
    
    const contents = Array.isArray(prompt) 
      ? prompt.map((m: any) => {
          if (m.role && m.parts) return m; // Already in standard format
          if (m.text) return { role: 'user', parts: [{ text: m.text }] }; // Simple text object
          return { role: 'user', parts: [m] }; // Single part object
        })
      : [{ role: 'user', parts: [{ text: prompt }] }];

    const responseStream = await ai.models.generateContentStream({
      model: DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction,
        ...userConfig,
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of responseStream) {
          controller.enqueue(new TextEncoder().encode(chunk.text || ""));
        }
        controller.close();
      },
      cancel() {
        // Handle client disconnect if needed
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
