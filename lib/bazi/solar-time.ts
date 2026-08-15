/**
 * True Solar Time (真太阳时) & Equation of Time (均时差) Engine.
 * 
 * Computes astronomical True Solar Time from civil wall-clock time and IANA timezone,
 * using pure UTC Instants to eliminate host machine runtime timezone pollution.
 * 
 * Features:
 * 1. Full IANA Timezone Resolution via Intl.DateTimeFormat (Accounts for DST and standard offset).
 * 2. Spencer Equation of Time (EoT) calculation based on Earth's orbital eccentricity and obliquity.
 * 3. Geographic Longitude Time-Angle offset relative to the standard timezone meridian (4 min / deg).
 */

import { parseCivilTimeToUtc } from '../vedic/ephemeris';

export function calculateSpencerEquationOfTime(utcDate: Date): number {
  // Day of the year (1 - 366) in UTC
  const startOfYear = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((utcDate.getTime() - startOfYear.getTime()) / (86400000)) + 1;

  // Spencer fractional day angle B in radians
  const bDeg = (360.0 / 365.2422) * (dayOfYear - 81);
  const bRad = (bDeg * Math.PI) / 180.0;

  // Spencer formula for Equation of Time (in minutes)
  const eotMinutes = 9.87 * Math.sin(2 * bRad) - 7.53 * Math.cos(bRad) - 1.5 * Math.sin(bRad);
  return Math.round(eotMinutes * 100) / 100;
}

/**
 * Determine Standard Timezone Meridian and DST status for an IANA Timezone at a specific UTC Instant.
 */
export function resolveTimezoneDetails(utcDate: Date, timeZone: string): {
  totalOffsetMinutes: number;
  standardOffsetMinutes: number;
  dstOffsetMinutes: number;
  standardMeridian: number;
} {
  // 1. Current offset at this instant
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(utcDate);
  const pMap: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== 'literal') pMap[p.type] = parseInt(p.value, 10);
  }
  if (pMap.hour === 24) pMap.hour = 0;

  const localMs = Date.UTC(pMap.year, (pMap.month || 1) - 1, pMap.day || 1, pMap.hour || 0, pMap.minute || 0, pMap.second || 0);
  const totalOffsetMinutes = Math.round((localMs - utcDate.getTime()) / 60000);

  // 2. Sample January and July to find standard baseline offset (non-DST)
  const probeDateJan = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 15, 12, 0, 0));
  const probeDateJul = new Date(Date.UTC(utcDate.getUTCFullYear(), 6, 15, 12, 0, 0));

  const getOffset = (d: Date) => {
    const pts = formatter.formatToParts(d);
    const m: Record<string, number> = {};
    for (const p of pts) if (p.type !== 'literal') m[p.type] = parseInt(p.value, 10);
    if (m.hour === 24) m.hour = 0;
    const l = Date.UTC(m.year, (m.month || 1) - 1, m.day || 1, m.hour || 0, m.minute || 0, m.second || 0);
    return Math.round((l - d.getTime()) / 60000);
  };

  const janOffset = getOffset(probeDateJan);
  const julOffset = getOffset(probeDateJul);

  // In Northern hemisphere, standard is Jan offset (smaller). In Southern, standard is Jul offset.
  const standardOffsetMinutes = Math.min(janOffset, julOffset);
  const dstOffsetMinutes = totalOffsetMinutes - standardOffsetMinutes;

  // Standard Meridian = standardOffset in minutes / 4.0 degrees
  const standardMeridian = standardOffsetMinutes / 4.0;

  return {
    totalOffsetMinutes,
    standardOffsetMinutes,
    dstOffsetMinutes,
    standardMeridian,
  };
}

export interface TrueSolarTimeResult {
  utcInstant: string;
  civilLocalTime: string;
  trueSolarDate: Date; // Expressed in local calendar coordinates
  trueSolarTime: string;
  eotMinutes: number;
  longitudeOffsetMinutes: number;
  totalShiftMinutes: number;
  standardOffsetMinutes: number;
  dstOffsetMinutes: number;
  totalTimezoneOffsetMinutes: number;
  trueSolarComponents: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
}

export function calculateAstronomicalTrueSolarTime(
  birthDate: string,
  birthTime: string = '12:00',
  timeZone: string = 'Asia/Shanghai',
  longitude: number = 116.40
): TrueSolarTimeResult {
  // 1. Resolve pure UTC Instant
  const { utcDate } = parseCivilTimeToUtc(birthDate, birthTime, timeZone);

  // 2. Resolve IANA timezone standard meridian & DST
  const tzDetails = resolveTimezoneDetails(utcDate, timeZone);

  // 3. Compute Longitude Offset relative to standard meridian
  // Standard timezone meridian: standardMeridian (degrees)
  const longitudeOffsetMinutes = (longitude - tzDetails.standardMeridian) * 4.0;

  // 4. Compute Spencer Equation of Time (EoT)
  const eotMinutes = calculateSpencerEquationOfTime(utcDate);

  // 5. Total Solar Correction Shift = Longitude Offset + EoT - DST Offset (DST artificial wall-clock advance)
  // If DST is active (+60 min), wall clock is 1h ahead of standard solar position
  const totalShiftMinutes = longitudeOffsetMinutes + eotMinutes - tzDetails.dstOffsetMinutes;

  // 6. Compute True Solar Date from civil local time without host machine timezone pollution
  const [y, m, d] = birthDate.split('-').map(Number);
  const [h, min] = (birthTime || '12:00').split(':').map(Number);

  // Use UTC millisecond arithmetic for clean shift
  const civilLocalMs = Date.UTC(y, m - 1, d, h || 0, min || 0, 0);
  const trueSolarMs = civilLocalMs + Math.round(totalShiftMinutes * 60000);
  const trueSolarUtcObj = new Date(trueSolarMs);

  const tYear = trueSolarUtcObj.getUTCFullYear();
  const tMonth = trueSolarUtcObj.getUTCMonth() + 1;
  const tDay = trueSolarUtcObj.getUTCDate();
  const tHour = trueSolarUtcObj.getUTCHours();
  const tMinute = trueSolarUtcObj.getUTCMinutes();
  const tSecond = trueSolarUtcObj.getUTCSeconds();

  const pad = (n: number) => n.toString().padStart(2, '0');
  const civilLocalTime = `${pad(h || 0)}:${pad(min || 0)}`;
  const trueSolarTime = `${pad(tHour)}:${pad(tMinute)}`;

  return {
    utcInstant: utcDate.toISOString(),
    civilLocalTime,
    trueSolarDate: trueSolarUtcObj,
    trueSolarTime,
    eotMinutes,
    longitudeOffsetMinutes: Math.round(longitudeOffsetMinutes * 100) / 100,
    totalShiftMinutes: Math.round(totalShiftMinutes * 100) / 100,
    standardOffsetMinutes: tzDetails.standardOffsetMinutes,
    dstOffsetMinutes: tzDetails.dstOffsetMinutes,
    totalTimezoneOffsetMinutes: tzDetails.totalOffsetMinutes,
    trueSolarComponents: {
      year: tYear,
      month: tMonth,
      day: tDay,
      hour: tHour,
      minute: tMinute,
      second: tSecond,
    },
  };
}
