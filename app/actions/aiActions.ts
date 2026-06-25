"use server";

import { GoogleGenAI } from "@google/genai";
import { Solar, Lunar } from 'lunar-javascript';
import { astro, util } from 'iztro';
import ephemeris from 'ephemeris';
import { adminDb } from "@/lib/firebase-admin";
import * as admin from 'firebase-admin';
import sharp from 'sharp';

/**
 * Server-side image compression using sharp.
 * Reduces image to JPEG/WebP within Firestore's 1MB document limit.
 */
async function compressImageServerSide(base64DataUrl: string, maxWidthPx = 1280, quality = 60): Promise<string> {
  // Strip the data URL prefix to get the raw base64
  const matches = base64DataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (!matches) return base64DataUrl;

  const inputBuffer = Buffer.from(matches[2], 'base64');
  const compressedBuffer = await sharp(inputBuffer)
    .resize({ width: maxWidthPx, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
}

/**
 * Server-side Star Chart calculation using ephemeris.
 */
export async function getStarChartData(birthDate: string, birthTime: string, lon: number, lat: number) {
  const dateObj = new Date(`${birthDate}T${birthTime}:00.000+08:00`);
  const planets = ephemeris.getAllPlanets(dateObj, lon, lat, 0);
  return planets;
}

/**
 * Server-side Bazi calculation to reduce client-side bundle size.
 */
export async function getBaziData(birthDate: string, birthTime: string) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const bazi = lunar.getEightChar();
  bazi.setSect(2); 
  
  return {
    baziString: `${bazi.getYear()} ${bazi.getMonth()} ${bazi.getDay()} ${bazi.getTime()}`,
    lunarDateString: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月 ${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`
  };
}

/**
 * Server-side Ziwei calculation.
 */
export async function getZiweiServerData(dateStr: string, hour: number, gender: '男' | '女') {
  const timeIndex = util.timeToIndex(hour);
  return astro.bySolar(dateStr, timeIndex, gender, true, 'zh-CN');
}

/**
 * Server-side Qi Men calculation.
 */
export async function getQiMenServerData(date: Date) {
  const lunar = Lunar.fromDate(date);
  return {
    jieQi: lunar.getJieQi(),
    baZi: [
      lunar.getYearInGanZhi(),
      lunar.getMonthInChinese(),
      lunar.getDayInChinese(),
      lunar.getTimeZhi()
    ],
    isDaylight: date.getHours() >= 6 && date.getHours() < 18,
  };
}

export async function generateMysticImage(prompt: string, aspectRatio: any, docId: string, provider: "gemini" | "agnes" = "agnes") {
  // Check server-side Firebase cache first
  try {
    const docRef = adminDb.collection("daily-images").doc(docId);
    const cachedDoc = await docRef.get();
    if (cachedDoc.exists) {
      const data = cachedDoc.data();
      if (data?.imageUrl) {
        console.log(`[FIREBASE] Cache HIT for ${docId}`);
        return data.imageUrl;
      }
    }
  } catch (error) {
    console.warn("[FIREBASE] Cache read failed:", error);
  }

  let base64Data = "";

  try {
    if (provider === "agnes") {
      // Agnes image generation via OpenAI-compatible API
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
          model: "agnes-image-2.0-flash",
          prompt: `In a high-end, mysterious, cosmic luxury style. Deep cosmic black background with mystic gold and nebula purple accents. Ethereal, dreamlike, sophisticated, professional digital art. Subject: ${prompt}. No text, no watermark.`,
          size,
          extra_body: {
            response_format: "url",
          },
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Agnes image generation failed: ${errorText}`);
      }

      const result = await response.json();
      const imageUrl = result.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error("No image URL received from Agnes");
      }

      // Fetch the image URL and convert to base64 for Firestore storage with a timeout
      const imgResp = await fetch(imageUrl, {
        signal: AbortSignal.timeout(15000),
      });
      if (!imgResp.ok) {
        throw new Error(`Failed to download image from Agnes URL: ${imgResp.statusText}`);
      }
      const imgBuffer = Buffer.from(await imgResp.arrayBuffer());
      base64Data = `data:image/png;base64,${imgBuffer.toString("base64")}`;
    } else {
      // Original Gemini image generation
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
      
      const ai = new GoogleGenAI({ apiKey });
      const fullPrompt = `In a high-end, mysterious, cosmic luxury style. Deep cosmic black background with mystic gold and nebula purple accents. Ethereal, dreamlike, sophisticated, professional digital art. Subject: ${prompt}. No text, no watermark.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio,
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (!part?.inlineData?.data) {
        throw new Error("No image data received");
      }
      const mimeType = part.inlineData.mimeType || "image/png";
      base64Data = `data:${mimeType};base64,${part.inlineData.data}`;
    }
  } catch (error: any) {
    console.error(`[IMAGE GENERATION] Failed for provider ${provider}:`, error.message || error);
    // Throw a clean, handled error message instead of letting a raw DOMException/TimeoutError bubble up
    throw new Error(`Failed to generate image via ${provider}: ${error.message || error}`);
  }

  // 3. Compress server-side if needed, then ALWAYS save to Firebase.
  // This guarantees that every device that generates an image stores it in the global cloud cache,
  // so subsequent users on any device fetch the exact same image.
  try {
    let dataToStore = base64Data;
    const sizeInBytes = Buffer.byteLength(base64Data, 'utf8');
    const FIRESTORE_LIMIT = 1040000;

    if (sizeInBytes > FIRESTORE_LIMIT) {
      console.log(`[FIREBASE] Image large (${sizeInBytes} bytes), compressing server-side...`);
      dataToStore = await compressImageServerSide(base64Data);
      const compressedSize = Buffer.byteLength(dataToStore, 'utf8');
      console.log(`[FIREBASE] Compressed to ${compressedSize} bytes.`);
    }

    const docRef = adminDb.collection("daily-images").doc(docId);
    await docRef.set({
      imageUrl: dataToStore,
      prompt: prompt,
      date: docId.split('_')[0],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    });
    console.log(`[FIREBASE] SUCCESS: Document ${docId} saved.`);
  } catch (error: any) {
    // Log but don't throw — client still gets the raw image even if cloud save failed
    console.error(`[FIREBASE] FAILED to save ${docId}:`, error.message);
  }

  return base64Data;
}

/**
 * Syncs a (potentially client-side compressed) image back to Firestore.
 */
export async function syncImageToCloud(docId: string, base64Data: string, prompt: string) {
  try {
    const docRef = adminDb.collection("daily-images").doc(docId);
    const sizeInBytes = Buffer.byteLength(base64Data, 'utf8');
    
    if (sizeInBytes > 1048000) {
      console.warn(`[SYNC] Image still too large (${sizeInBytes} bytes). Rejected.`);
      return { success: false, error: "Size limit exceeded" };
    }

    await docRef.set({
      imageUrl: base64Data,
      prompt: prompt,
      date: docId.split('_')[0],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    });
    console.log(`[SYNC] Successfully synced image ${docId} to Firestore.`);
    return { success: true };
  } catch (error: any) {
    console.error(`[SYNC] Failed to save ${docId}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Retrieves the global daily oracle from cloud Firestore cache.
 */
export async function getCloudDailyOracle(dateStr: string) {
  try {
    const docRef = adminDb.collection("daily-oracles").doc(dateStr);
    const doc = await docRef.get();
    if (doc.exists) {
      console.log(`[FIREBASE] Daily Oracle Cache HIT for ${dateStr}`);
      return doc.data();
    }
  } catch (err) {
    console.warn("[FIREBASE] Daily Oracle read failed:", err);
  }
  return null;
}

/**
 * Saves the global daily oracle to cloud Firestore cache.
 */
export async function saveCloudDailyOracle(dateStr: string, dailyData: any) {
  try {
    const docRef = adminDb.collection("daily-oracles").doc(dateStr);
    await docRef.set({
      ...dailyData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    });
    console.log(`[FIREBASE] Saved global daily oracle for ${dateStr}`);
    return true;
  } catch (err) {
    console.warn("[FIREBASE] Daily Oracle save failed:", err);
    return false;
  }
}
