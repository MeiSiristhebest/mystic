import { adminDb } from "@/lib/firebase-admin";
import { GoogleGenAI } from "@google/genai";

export class OracleService {
  /**
   * Fetch cached daily oracle from Cloud Firestore.
   */
  static async getCloudDailyOracle(dateStr: string) {
    if (!adminDb) return null;
    try {
      const docRef = adminDb.collection("daily-oracle").doc(dateStr);
      const snap = await docRef.get();
      if (snap.exists) {
        return snap.data();
      }
      return null;
    } catch (e) {
      console.warn("[ORACLE_SERVICE] Firestore daily oracle read failed:", e);
      return null;
    }
  }

  /**
   * Save generated daily oracle to Cloud Firestore.
   */
  static async saveCloudDailyOracle(dateStr: string, data: any) {
    if (!adminDb) return false;
    try {
      const docRef = adminDb.collection("daily-oracle").doc(dateStr);
      await docRef.set({
        ...data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      return true;
    } catch (e) {
      console.warn("[ORACLE_SERVICE] Firestore daily oracle write failed:", e);
      return false;
    }
  }

  /**
   * Generate daily oracle card image with Firebase cache & provider fallback.
   */
  static async generateOracleImage(
    prompt: string,
    aspectRatio: string = "3:4",
    docId: string,
    provider: "gemini" | "agnes" = "agnes"
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    // 1. Check server-side Firebase cache first
    if (adminDb) {
      try {
        const docRef = adminDb.collection("daily-images").doc(docId);
        const cachedDoc = await docRef.get();
        if (cachedDoc.exists) {
          const data = cachedDoc.data();
          if (data?.imageUrl) {
            return { success: true, imageUrl: data.imageUrl };
          }
        }
      } catch (error) {
        console.warn("[ORACLE_SERVICE] Cache read failed:", error);
      }
    }

    let base64Data = "";

    try {
      if (provider === "agnes") {
        const apiKey = process.env.AGNES_API_KEY;
        if (!apiKey) throw new Error("AGNES_API_KEY is not defined");

        const sizeMap: Record<string, string> = {
          "1:1": "1024x1024",
          "16:9": "1536x1024",
          "9:16": "1024x1536",
          "4:3": "1152x896",
          "3:4": "896x1152",
        };
        const size = sizeMap[aspectRatio] || "1024x1024";
        const agnesApiUrl = (process.env.AGNES_API_URL || "https://apihub.agnes-ai.com/v1").replace(/\/$/, "");

        const response = await fetch(`${agnesApiUrl}/images/generations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "agnes-image-2.1-flash",
            prompt: `Masterpiece digital art, cinematic lighting, 8k resolution, dark luxury cosmic aesthetic. Deep obsidian black background with rich gold and mystical violet accents. Subject: ${prompt}. No text, no watermark.`,
            size,
            extra_body: {
              response_format: "url",
            },
          }),
          signal: AbortSignal.timeout(35000),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Agnes image generation failed: ${errorText}`);
        }

        const data = await response.json();
        const imageUrl = data.data?.[0]?.url || data.imageUrl;
        if (!imageUrl) {
          throw new Error("No image URL returned from Agnes API");
        }

        // Fetch image as Base64 for persistent rendering
        const imgFetch = await fetch(imageUrl);
        if (!imgFetch.ok) {
          throw new Error("Failed to fetch generated image from URL");
        }
        const arrayBuffer = await imgFetch.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = imgFetch.headers.get("content-type") || "image/png";
        base64Data = `data:${contentType};base64,${buffer.toString("base64")}`;
      } else {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");

        const ai = new GoogleGenAI({ apiKey });
        const fullPrompt = `Masterpiece digital art, cinematic lighting, 8k resolution, dark luxury cosmic aesthetic. Deep obsidian black background with rich gold and mystical violet accents. Subject: ${prompt}. No text, no watermark.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-image-preview",
          contents: { parts: [{ text: fullPrompt }] },
          config: { imageConfig: { aspectRatio: aspectRatio as any } },
        });

        const part = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
        if (!part?.inlineData?.data) {
          throw new Error("No image data received from Gemini");
        }
        const mimeType = part.inlineData.mimeType || "image/png";
        base64Data = `data:${mimeType};base64,${part.inlineData.data}`;
      }

      // Save to Firebase Cache if adminDb is available
      if (adminDb) {
        try {
          const docRef = adminDb.collection("daily-images").doc(docId);
          await docRef.set({
            imageUrl: base64Data,
            prompt,
            aspectRatio,
            createdAt: new Date().toISOString(),
          }, { merge: true });
        } catch (cacheError) {
          console.warn("[ORACLE_SERVICE] Cache write failed:", cacheError);
        }
      }

      return { success: true, imageUrl: base64Data };
    } catch (error: any) {
      console.error(`[IMAGE_GENERATION] Failed for provider ${provider}:`, error.message || error);
      return { success: false, error: error.message || String(error) };
    }
  }
}
