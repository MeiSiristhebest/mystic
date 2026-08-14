"use server";

import { AstrologyService } from "@/lib/services/astrologyService";
import { EasternService } from "@/lib/services/easternService";
import { TCMService } from "@/lib/services/tcmService";
import { OracleService } from "@/lib/services/oracleService";

/**
 * Server-side Western Star Chart calculation.
 */
export async function getStarChartData(
  birthDate: string,
  birthTime: string,
  lon = 116.40,
  lat = 39.90
) {
  return AstrologyService.getStarChart(birthDate, birthTime, lon, lat);
}

/**
 * Server-side Bazi calculation.
 */
export async function getBaziData(birthDate: string, birthTime: string) {
  return EasternService.getBazi(birthDate, birthTime);
}

/**
 * Server-side Ziwei Tianji calculation with 80+ patterns.
 */
export async function getZiweiServerData(birthDate: string, hour: number, gender: '男' | '女') {
  return EasternService.getZiwei(birthDate, hour, gender);
}

/**
 * Server-side Qi Men calculation.
 */
export async function getQiMenServerData(date: Date) {
  return EasternService.getQiMen(date);
}

/**
 * Server-side Vedic Chart calculation.
 */
export async function getVedicChartServerData(
  birthDate: string,
  birthTime: string,
  lon = 116.40,
  lat = 39.90
) {
  return AstrologyService.getVedicChart(birthDate, birthTime, lon, lat);
}

/**
 * Server-side Six-dimensional Vedic Synastry calculation.
 */
export async function getVedicSynastryServerData(
  birthDateA: string,
  birthTimeA: string,
  nameA = '命主 A',
  birthDateB: string,
  birthTimeB: string,
  nameB = '命主 B',
  lon = 116.40,
  lat = 39.90
) {
  return AstrologyService.getVedicSynastry(
    birthDateA,
    birthTimeA,
    nameA,
    birthDateB,
    birthTimeB,
    nameB,
    lon,
    lat
  );
}

/**
 * Server-side Wuyun Liuqi celestial constitution calculation.
 */
export async function getWuyunLiuqiServerData(birthYear: number) {
  return TCMService.getWuyunLiuqiData(birthYear);
}

/**
 * Server-side Ni Haixia 8 Gold Standards evaluation.
 */
export async function getRenjiHealthCheckData(scores: Record<string, number>) {
  return TCMService.evaluateHealthCheck(scores);
}

/**
 * Retrieve Ni Haixia formulas and clinical cases knowledge base.
 */
export async function getNihaixiaKnowledgeBase() {
  return TCMService.getKnowledgeBase();
}

/**
 * Server-side Image Generation Service with Cache & Fallback.
 */
export async function generateMysticImage(
  prompt: string,
  aspectRatio: any,
  docId: string,
  provider: "gemini" | "agnes" = "agnes"
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  return OracleService.generateOracleImage(prompt, aspectRatio, docId, provider);
}

/**
 * Cloud Firestore Daily Oracle integration.
 */
export async function getCloudDailyOracle(dateStr: string) {
  return OracleService.getCloudDailyOracle(dateStr);
}

export async function saveCloudDailyOracle(dateStr: string, data: any) {
  return OracleService.saveCloudDailyOracle(dateStr, data);
}
