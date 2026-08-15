/**
 * High-Precision Astronomical Ephemeris & Sidereal Vedic Mathematics Engine.
 * 
 * Implements:
 * 1. IANA Timezone & Civil Time to UTC Instant normalization (Intl.DateTimeFormat engine).
 * 2. Julian Day (JD) calculation.
 * 3. Chitrapaksha (Lahiri) linear precession model (23°51'25.53" at J2000 epoch, 50.27"/yr).
 * 4. Geocentric planetary longitudes via Moshier astronomical ephemeris (npm `ephemeris`).
 * 5. Mean Lunar Nodes (Rahu & Ketu) astronomical calculations (Meeus Ch. 47).
 * 6. Accurate Ascendant (Lagna) computation using Greenwich Mean Sidereal Time (GMST),
 *    Local Sidereal Time (LST), geographic coordinates, and true obliquity of the ecliptic.
 * 7. Extended Varga Divisional Sign Mapping: D1, D7 (Saptamsa), D9 (Navamsa), D10 (Dasamsa),
 *    D12 (Dwadasamsa), D60 (Shashtiamsa).
 */

import ephem from 'ephemeris';
import { VedicPlanetName, VedicPlanetPosition } from './types';
import { VEDIC_SIGNS } from './constants';

export class EphemerisCalculationError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'EphemerisCalculationError';
  }
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  timezoneOffsetHours?: number; // Optional numerical fallback
  timeZone?: string;           // Standard IANA timezone (e.g. "Asia/Shanghai", "America/New_York")
}

export const DEFAULT_GEO: GeoLocation = {
  latitude: 39.9042, // Beijing
  longitude: 116.4074,
  altitude: 50,
  timezoneOffsetHours: 8,
  timeZone: 'Asia/Shanghai',
};

/**
 * Robust IANA Timezone & Civil DateTime to UTC Instant Parser
 * Accurately accounts for Daylight Saving Time (DST) and historical timezone shifts.
 */
export function parseCivilTimeToUtc(
  birthDate: string,
  birthTime = '12:00',
  timeZone = 'Asia/Shanghai'
): { utcDate: Date; offsetMinutes: number; timeZone: string } {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = (birthTime || '12:00').split(':').map(Number);

  // Initial candidate UTC time using civil wall-clock numbers
  const guessUtcMs = Date.UTC(year, (month || 1) - 1, day || 1, hour || 0, minute || 0, 0, 0);

  try {
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

    const parts = formatter.formatToParts(new Date(guessUtcMs));
    const partMap: Record<string, number> = {};
    for (const p of parts) {
      if (p.type !== 'literal') {
        partMap[p.type] = parseInt(p.value, 10);
      }
    }

    if (partMap.hour === 24) partMap.hour = 0;

    const localInTzMs = Date.UTC(
      partMap.year,
      (partMap.month || 1) - 1,
      partMap.day || 1,
      partMap.hour || 0,
      partMap.minute || 0,
      partMap.second || 0
    );

    // offset = local - UTC
    const offsetMs = localInTzMs - guessUtcMs;
    const exactUtcMs = guessUtcMs - offsetMs;
    const offsetMinutes = Math.round(offsetMs / (60 * 1000));

    return {
      utcDate: new Date(exactUtcMs),
      offsetMinutes,
      timeZone,
    };
  } catch (err) {
    // Fallback for numeric offset string (e.g. "+8", "-5", "5.5")
    let offsetHours = 8;
    const num = parseFloat(timeZone);
    if (!isNaN(num)) {
      offsetHours = num;
    }
    const offsetMs = offsetHours * 3600 * 1000;
    return {
      utcDate: new Date(guessUtcMs - offsetMs),
      offsetMinutes: Math.round(offsetHours * 60),
      timeZone,
    };
  }
}

/**
 * Backward-compatible helper to convert local birth date and time into a precise UTC Instant
 */
export function normalizeToUtcInstant(birthDate: string, birthTime: string, tzOffsetHours = 8): Date {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = (birthTime || '12:00').split(':').map(Number);
  
  const offsetMinutes = Math.round(tzOffsetHours * 60);
  const localEpochMs = Date.UTC(year, (month || 1) - 1, day || 1, hour || 0, minute || 0, 0, 0);
  const utcInstantMs = localEpochMs - (offsetMinutes * 60 * 1000);
  
  return new Date(utcInstantMs);
}

/**
 * Calculate Julian Day (JD) for a given UTC Date
 */
export function calculateJulianDay(utcDate: Date): number {
  const utcMs = utcDate.getTime();
  // Julian Day 2440587.5 is 1970-01-01 00:00:00 UTC
  return (utcMs / 86400000.0) + 2440587.5;
}

/**
 * Calculate Lahiri (Chitrapaksha) linear Ayanamsa model for a Julian Day
 * Standard epoch: J2000.0 (JD 2451545.0) -> Ayanamsa = 23° 51' 25.53" (23.8570916667°)
 * Annual precession rate: 50.27" / year
 */
export function calculateLahiriAyanamsa(jd: number): number {
  const yearsSince2000 = (jd - 2451545.0) / 365.25;
  const ayanamsa = 23.8570916667 + (50.27 / 3600.0) * yearsSince2000;
  return ayanamsa;
}

/**
 * Calculate Obliquity of the Ecliptic (epsilon in degrees)
 */
export function calculateObliquity(jd: number): number {
  const t = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000
  return 23.43929111 - 0.013004167 * t - 0.000000164 * t * t + 0.000000504 * t * t * t;
}

/**
 * Calculate Greenwich Mean Sidereal Time (GMST in degrees)
 */
export function calculateGMST(jd: number): number {
  const t = (jd - 2451545.0) / 36525.0;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t - (t * t * t) / 38710000.0;
  gmst = ((gmst % 360) + 360) % 360;
  return gmst;
}

/**
 * Calculate Ascendant (Lagna) Tropical & Sidereal Longitude directly from UTC Date
 */
export function calculateAscendant(
  jd: number,
  geo: GeoLocation = DEFAULT_GEO,
  ayanamsa: number
): { tropicalLongitude: number; siderealLongitude: number; signIndex: number; signName: string } {
  const gmst = calculateGMST(jd);
  const lst = ((gmst + geo.longitude) % 360 + 360) % 360; // Local Sidereal Time (degrees)
  const lstRad = (lst * Math.PI) / 180.0;
  const eps = calculateObliquity(jd);
  const epsRad = (eps * Math.PI) / 180.0;
  const phiRad = (geo.latitude * Math.PI) / 180.0;

  // Formula: tan(lambda) = cos(LST) / (-sin(LST)*cos(eps) - tan(phi)*sin(eps))
  const y = Math.cos(lstRad);
  const x = -Math.sin(lstRad) * Math.cos(epsRad) - Math.tan(phiRad) * Math.sin(epsRad);
  
  let ascTropical = (Math.atan2(y, x) * 180.0) / Math.PI;
  ascTropical = ((ascTropical % 360) + 360) % 360;

  const ascSidereal = ((ascTropical - ayanamsa) % 360 + 360) % 360;
  const signIndex = Math.floor(ascSidereal / 30);

  return {
    tropicalLongitude: ascTropical,
    siderealLongitude: ascSidereal,
    signIndex,
    signName: VEDIC_SIGNS[signIndex]?.name || 'Aries',
  };
}

/**
 * Calculate Mean Lunar Node (Rahu & Ketu) Tropical & Sidereal Longitude
 */
export function calculateLunarNodes(
  jd: number,
  ayanamsa: number
): {
  rahu: { tropical: number; sidereal: number; isRetrograde: boolean };
  ketu: { tropical: number; sidereal: number; isRetrograde: boolean };
} {
  const t = (jd - 2451545.0) / 36525.0;
  // Meeus Ch. 47 formula for Mean Ascending Node
  let omega = 125.04452 - 1934.136261 * t + 0.0020708 * t * t + (t * t * t) / 450000.0;
  omega = ((omega % 360) + 360) % 360;

  const rahuSidereal = ((omega - ayanamsa) % 360 + 360) % 360;
  const ketuTropical = (omega + 180.0) % 360;
  const ketuSidereal = ((rahuSidereal + 180.0) % 360 + 360) % 360;

  return {
    rahu: {
      tropical: omega,
      sidereal: rahuSidereal,
      isRetrograde: true, // Nodes are always retrograde in mean motion
    },
    ketu: {
      tropical: ketuTropical,
      sidereal: ketuSidereal,
      isRetrograde: true,
    },
  };
}

/**
 * Extract High Precision 9 Grahas using Moshier-based Ephemeris and Sidereal Correction
 * Implements strict Fail-Fast validation without fake static approximations.
 */
export function calculateHighPrecisionGrahas(
  utcDate: Date,
  geo: GeoLocation = DEFAULT_GEO
): {
  ayanamsa: number;
  jd: number;
  utcDate: Date;
  calculationMethod: 'ephemeris_moshier';
  ascendant: { tropical: number; sidereal: number; signIndex: number; signName: string };
  planets: Array<{
    name: VedicPlanetName;
    tropicalLongitude: number;
    siderealLongitude: number;
    degreeInSign: number;
    signIndex: number;
    signName: string;
    isRetrograde: boolean;
  }>;
} {
  const jd = calculateJulianDay(utcDate);
  const ayanamsa = calculateLahiriAyanamsa(jd);
  const asc = calculateAscendant(jd, geo, ayanamsa);

  // Call ephemeris library with UTC date
  let rawEphem: any = null;
  try {
    rawEphem = ephem.getAllPlanets(utcDate, geo.longitude, geo.latitude, geo.altitude || 0);
  } catch (err) {
    throw new EphemerisCalculationError(`Failed to compute planetary positions via Moshier ephemeris for date ${utcDate.toISOString()}`, err);
  }

  if (!rawEphem?.observed) {
    throw new EphemerisCalculationError(`Moshier ephemeris returned empty observed planetary dataset for date ${utcDate.toISOString()}`);
  }

  const planetMap: Record<string, { deg: number; retro: boolean }> = {};
  const obs = rawEphem.observed;

  const extractDeg = (key: string): { deg: number; retro: boolean } => {
    const p = obs[key];
    if (!p) {
      throw new EphemerisCalculationError(`Missing celestial body '${key}' in ephemeris observations.`);
    }
    let deg = 0;
    const dLong = p.raw?.position?.equinoxEclipticLonLat?.dLongitude || p.raw?.equinoxEclipticLonLat?.dLongitude;
    if (dLong) {
      deg = (dLong.degree || 0) + (dLong.minutes || 0) / 60.0 + (dLong.seconds || 0) / 3600.0;
    } else if (p.apparentLongitudeDd !== undefined) {
      deg = p.apparentLongitudeDd;
    } else if (p.raw?.position?.apparentLongitude !== undefined) {
      deg = p.raw.position.apparentLongitude;
    }
    return {
      deg: ((deg % 360) + 360) % 360,
      retro: Boolean(p.is_retrograde),
    };
  };

  planetMap['Sun'] = extractDeg('sun');
  planetMap['Moon'] = extractDeg('moon');
  planetMap['Mercury'] = extractDeg('mercury');
  planetMap['Venus'] = extractDeg('venus');
  planetMap['Mars'] = extractDeg('mars');
  planetMap['Jupiter'] = extractDeg('jupiter');
  planetMap['Saturn'] = extractDeg('saturn');

  // Lunar nodes
  const nodes = calculateLunarNodes(jd, ayanamsa);
  planetMap['Rahu'] = { deg: nodes.rahu.tropical, retro: nodes.rahu.isRetrograde };
  planetMap['Ketu'] = { deg: nodes.ketu.tropical, retro: nodes.ketu.isRetrograde };

  const orderedNames: VedicPlanetName[] = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
  ];

  const planets = orderedNames.map(name => {
    const raw = planetMap[name] || { deg: 0, retro: false };
    const tropicalLongitude = raw.deg;
    const siderealLongitude = ((tropicalLongitude - ayanamsa) % 360 + 360) % 360;
    const signIndex = Math.floor(siderealLongitude / 30) % 12;
    const degreeInSign = siderealLongitude % 30;

    return {
      name,
      tropicalLongitude,
      siderealLongitude,
      degreeInSign,
      signIndex,
      signName: VEDIC_SIGNS[signIndex]?.name || 'Aries',
      isRetrograde: raw.retro,
    };
  });

  return {
    ayanamsa,
    jd,
    utcDate,
    calculationMethod: 'ephemeris_moshier',
    ascendant: {
      tropical: asc.tropicalLongitude,
      sidereal: asc.siderealLongitude,
      signIndex: asc.signIndex,
      signName: asc.signName,
    },
    planets,
  };
}

/**
 * Get Western Tropical Sun Sign directly from astronomical solar tropical longitude
 */
export function getSunTropicalZodiac(tropicalLongitude: number): string {
  const normDeg = ((tropicalLongitude % 360) + 360) % 360;
  const signs = [
    '白羊座', '金牛座', '双子座', '巨蟹座',
    '狮子座', '处女座', '天秤座', '天蝎座',
    '射手座', '摩羯座', '水瓶座', '双鱼座'
  ];
  const signIndex = Math.floor(normDeg / 30);
  return signs[signIndex] || '白羊座';
}

/**
 * Extended Varga Divisional Sign Mapping:
 * D1: Rasi (1)
 * D7: Saptamsa (7) - Children & Progeny
 * D9: Navamsa (9) - Dharma & Marriage
 * D10: Dasamsa (10) - Career & Profession
 * D12: Dwadasamsa (12) - Parents & Lineage
 * D60: Shashtiamsa (60) - Karmic Root
 */
export function getVargaSignIndex(siderealDegree: number, vargaDivision: 1 | 7 | 9 | 10 | 12 | 60): number {
  const normDeg = ((siderealDegree % 360) + 360) % 360;
  const d1SignIndex = Math.floor(normDeg / 30); // 0 = Aries
  const degreeInSign = normDeg % 30;
  const span = 30.0 / vargaDivision;
  const segment = Math.floor(degreeInSign / span);

  switch (vargaDivision) {
    case 1:
      return d1SignIndex;
    case 7: {
      // D7: Odd signs start from same sign; Even signs start from 7th sign
      const isOdd = d1SignIndex % 2 === 0; // 0=Aries (odd)
      const startSign = isOdd ? d1SignIndex : (d1SignIndex + 6) % 12;
      return (startSign + segment) % 12;
    }
    case 9: {
      // D9: Fire (Aries 0), Earth (Capricorn 9), Air (Libra 6), Water (Cancer 3)
      const element = d1SignIndex % 4;
      const startSign = element === 0 ? 0 : element === 1 ? 9 : element === 2 ? 6 : 3;
      return (startSign + segment) % 12;
    }
    case 10: {
      // D10: Odd signs start from same sign; Even signs start from 9th sign
      const isOdd = d1SignIndex % 2 === 0;
      const startSign = isOdd ? d1SignIndex : (d1SignIndex + 8) % 12;
      return (startSign + segment) % 12;
    }
    case 12: {
      // D12: Always starts from same sign and counts segment signs
      return (d1SignIndex + segment) % 12;
    }
    case 60: {
      // D60: Starts from same sign and adds segment
      return (d1SignIndex + segment) % 12;
    }
    default:
      return d1SignIndex;
  }
}
