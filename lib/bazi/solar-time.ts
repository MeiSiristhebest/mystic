/**
 * True Solar Time (真太阳时) & Astronomical Equation of Time (均时差) Engine.
 * 
 * Computes exact astronomical True Solar Time directly from celestial coordinates and IANA timezones:
 * 1. Full IANA Timezone Resolution via Intl.DateTimeFormat (Accounts for DST and standard offset).
 * 2. Pure UTC Instant conversion eliminating host machine runtime timezone pollution.
 * 3. Astronomical Equation of Time (EoT) derived from Mean Solar Longitude (L0) and True Solar Right Ascension (Alpha).
 * 4. Geographic Longitude Time-Angle offset relative to the standard timezone meridian (4 min / deg).
 */

import { parseCivilTimeToUtc, calculateJulianDay } from '../vedic/ephemeris';

/**
 * Compute true astronomical Equation of Time (EoT) using Sun's true geocentric right ascension.
 * Definition: EoT = (L0 - Alpha_sun) * 4 minutes/degree
 * Reference: Astronomical Algorithms (Jean Meeus, 2nd ed, Chap 28)
 */
export function calculateAstronomicalEquationOfTime(utcDate: Date): number {
  const jd = calculateJulianDay(utcDate);
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries since J2000.0

  // Geometric Mean Longitude of the Sun (in degrees)
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  L0 = ((L0 % 360) + 360) % 360;

  // Mean Anomaly of the Sun (in degrees)
  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  M = ((M % 360) + 360) % 360;
  const mRad = (M * Math.PI) / 180.0;

  // Sun's Equation of the Center C
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(mRad) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * mRad) +
            0.000289 * Math.sin(3 * mRad);

  // Sun's True Tropical Longitude (lambda)
  let lambda = L0 + C;
  lambda = ((lambda % 360) + 360) % 360;

  // True Obliquity of the Ecliptic (epsilon)
  const eps0 = 23.4392911 - 0.013004167 * T - 0.000000164 * T * T + 0.0000005036 * T * T * T;
  const epsRad = (eps0 * Math.PI) / 180.0;
  const lamRad = (lambda * Math.PI) / 180.0;

  // Sun's Right Ascension (Alpha) in degrees
  let alpha = (Math.atan2(Math.cos(epsRad) * Math.sin(lamRad), Math.cos(lamRad)) * 180.0) / Math.PI;
  alpha = ((alpha % 360) + 360) % 360;

  // Equation of Time in minutes: (L0 - Alpha) * 4 min/deg
  let diffDeg = L0 - alpha;
  // Normalize difference to [-180, +180]
  if (diffDeg > 180) diffDeg -= 360;
  if (diffDeg < -180) diffDeg += 360;

  const eotMinutes = diffDeg * 4.0;
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

  // Scan all 12 mid-month UTC instants and take Math.min() as the standard offset.
  //
  // Why Math.min() is always correct:
  //   DST always ADDS to the base offset (e.g. UTC+10 → UTC+11, UTC-5 → UTC-4).
  //   Therefore standard offset = minimum observed offset across all months of the year.
  //   This handles: Northern Hemisphere, Southern Hemisphere, historical transitions,
  //   and fixed-offset zones (all 12 values identical → min = that value, DST = 0).
  //
  // Why 12 months instead of Jan+Jul:
  //   Historical timezone rules may not follow a Jan=winter / Jul=summer pattern.
  //   Scanning all 12 mid-month points is cheap and robust.
  const yearOffsets: number[] = [];
  for (let mo = 0; mo < 12; mo++) {
    const probe = new Date(Date.UTC(utcDate.getUTCFullYear(), mo, 15, 12, 0, 0));
    const pts = formatter.formatToParts(probe);
    const mp: Record<string, number> = {};
    for (const p of pts) if (p.type !== 'literal') mp[p.type] = parseInt(p.value, 10);
    if (mp.hour === 24) mp.hour = 0;
    const lms = Date.UTC(mp.year, (mp.month || 1) - 1, mp.day || 1, mp.hour || 0, mp.minute || 0, mp.second || 0);
    yearOffsets.push(Math.round((lms - probe.getTime()) / 60000));
  }

  const standardOffsetMinutes = Math.min(...yearOffsets);
  const dstOffsetMinutes = totalOffsetMinutes - standardOffsetMinutes;
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
  trueSolarDate: Date;
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
  const longitudeOffsetMinutes = (longitude - tzDetails.standardMeridian) * 4.0;

  // 4. Compute Astronomical Equation of Time (EoT) via true solar right ascension
  const eotMinutes = calculateAstronomicalEquationOfTime(utcDate);

  // 5. Total Solar Correction Shift = Longitude Offset + EoT - DST Offset
  const totalShiftMinutes = longitudeOffsetMinutes + eotMinutes - tzDetails.dstOffsetMinutes;

  // 6. Compute True Solar Date from civil local time without host machine timezone pollution
  const [y, m, d] = birthDate.split('-').map(Number);
  const [h, min] = (birthTime || '12:00').split(':').map(Number);

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
