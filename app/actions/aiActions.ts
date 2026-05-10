"use server";

import { GoogleGenAI } from "@google/genai";
import { Solar, Lunar } from 'lunar-javascript';
import { astro, util } from 'iztro';
import ephemeris from 'ephemeris';
import { adminDb } from "@/lib/firebase-admin";
import * as admin from 'firebase-admin';

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

export async function generateMysticImage(prompt: string, aspectRatio: any, docId: string) {
  // 1. Check server-side cache first to avoid duplicate generations
  try {
    const docRef = adminDb.collection("dailyImages").doc(docId);
    const cachedDoc = await docRef.get();
    if (cachedDoc.exists) {
      const data = cachedDoc.data();
      if (data?.imageUrl) {
        return data.imageUrl;
      }
    }
  } catch (error) {
    console.warn("Failed to read from server cache", error);
  }

  // 2. Generate with Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
  
  const ai = new GoogleGenAI({ apiKey });
  const fullPrompt = `In a high-end, mysterious, cosmic luxury style. Deep cosmic black background with mystic gold and nebula purple accents. Ethereal, dreamlike, sophisticated, professional digital art. Subject: ${prompt}. No text, no watermark.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
  let base64Data = "";
  if (part?.inlineData?.data) {
    base64Data = `data:image/png;base64,${part.inlineData.data}`;
  } else {
    throw new Error("No image data received");
  }

  // 3. Save to server-side cache
  try {
    const docRef = adminDb.collection("dailyImages").doc(docId);
    if (base64Data.length < 1000000) {
      await docRef.set({
        imageUrl: base64Data,
        prompt: prompt,
        date: docId.split('_')[0],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Failed to save to server cache", error);
  }

  return base64Data;
}
