export const ZODIAC_SIGNS = [
  "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
  "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"
];

export function getZodiacFromLongitude(longitude: number) {
  const norm = ((longitude % 360) + 360) % 360;
  const index = Math.floor(norm / 30) % 12;
  const degrees = Math.floor(norm % 30);
  const minutes = Math.floor((norm % 1) * 60);
  return `${ZODIAC_SIGNS[index]} ${degrees}°${minutes}'`;
}

/**
 * Get Sun Sign from Solar Tropical Ecliptic Longitude (Astronomical)
 */
export function getSunSignFromDegree(tropicalLongitude: number): string {
  const norm = ((tropicalLongitude % 360) + 360) % 360;
  const index = Math.floor(norm / 30) % 12;
  return ZODIAC_SIGNS[index] || "白羊座";
}

/**
 * Approximate Western Sun Sign from Calendar Date (Fallback only)
 */
export function getSunSign(date: Date): string {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "白羊座";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "金牛座";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "双子座";
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "巨蟹座";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "狮子座";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "处女座";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return "天秤座";
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return "天蝎座";
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return "射手座";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "摩羯座";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "水瓶座";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "双鱼座";
  
  return "白羊座";
}

export function getRulingPlanet(sign: string): string {
  const mapping: Record<string, string> = {
    "白羊座": "火星",
    "金牛座": "金星",
    "双子座": "水星",
    "巨蟹座": "月亮",
    "狮子座": "太阳",
    "处女座": "水星",
    "天秤座": "金星",
    "天蝎座": "冥王星/火星",
    "射手座": "木星",
    "摩羯座": "土星",
    "水瓶座": "天王星/土星",
    "双鱼座": "海王星/木星"
  };
  return mapping[sign] || "未知";
}

/**
 * 高精度计算格林威治平恒星时 (GMST) 及本地恒星时 (LST)
 * 严格接受 UTC Instant Date
 */
export function calculateLocalSiderealTime(utcDate: Date, longitude: number): number {
  // Julian Date calculation for UTC Instant
  const jd = (utcDate.getTime() / 86400000) + 2440587.5;
  const d = jd - 2451545.0;
  
  // GMST in degrees
  let gmst = 280.46061837 + 360.98564736629 * d;
  gmst = ((gmst % 360) + 360) % 360;
  
  // Local Sidereal Time (LST)
  const lst = ((gmst + longitude) % 360 + 360) % 360;
  return lst;
}

/**
 * 高精度上升星座 (Ascendant) 与上升度数计算 (严格基于 UTC Instant 与球面三角反切)
 */
export function getPreciseAscendantFromUtc(
  utcDate: Date,
  longitude = 116.40,
  latitude = 39.90
): { sign: string; degree: number; formatted: string; longitude: number } {
  // Obliquity of the Ecliptic (黄赤交角, J2000 ~ 23.4393°)
  const eps = (23.4392911 * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;

  // Local Sidereal Time (RAMC in radians)
  const ramcDeg = calculateLocalSiderealTime(utcDate, longitude);
  const ramc = (ramcDeg * Math.PI) / 180;

  // Ascendant formula: tan(Asc) = cos(RAMC) / -(sin(eps)*tan(lat) + cos(eps)*sin(RAMC))
  const y = Math.cos(ramc);
  const x = -(Math.sin(eps) * Math.tan(latRad) + Math.cos(eps) * Math.sin(ramc));
  let ascRad = Math.atan2(y, x);
  let ascDeg = (ascRad * 180) / Math.PI;
  ascDeg = ((ascDeg % 360) + 360) % 360;

  const signIndex = Math.floor(ascDeg / 30) % 12;
  const degInSign = Math.floor(ascDeg % 30);
  const minInSign = Math.floor((ascDeg % 1) * 60);
  const sign = ZODIAC_SIGNS[signIndex];

  return {
    sign,
    degree: ascDeg % 30,
    longitude: ascDeg,
    formatted: `${sign} ${degInSign}°${minInSign}'`
  };
}

/**
 * Backward compatibility wrapper
 */
export function getPreciseAscendant(
  birthDate: Date,
  birthTime?: string,
  longitude = 116.40,
  latitude = 39.90
): { sign: string; degree: number; formatted: string; longitude: number } {
  return getPreciseAscendantFromUtc(birthDate, longitude, latitude);
}

export function getAscendant(birthDate: Date, birthTime?: string, longitude = 116.40, latitude = 39.90): string {
  return getPreciseAscendantFromUtc(birthDate, longitude, latitude).sign;
}

export function getDescendant(ascendant: string): string {
  const index = ZODIAC_SIGNS.indexOf(ascendant);
  if (index === -1) return "未知";
  return ZODIAC_SIGNS[(index + 6) % 12];
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  typeCn: string;
  angle: number;
  orb: number;
  meaning: string;
}

export function calculateAspects(planets: Array<{ name: string; longitude: number; symbol?: string }>): Aspect[] {
  const aspects: Aspect[] = [];
  const MAJOR_ASPECTS = [
    { angle: 0, orb: 8, name: "Conjunction", nameCn: "合相 (0°)", meaning: "能量融合与强力共振" },
    { angle: 60, orb: 6, name: "Sextile", nameCn: "六分相 (60°)", meaning: "顺畅协作与机遇萌发" },
    { angle: 90, orb: 7, name: "Square", nameCn: "四分相 (90°)", meaning: "动能张力与成长磨砺" },
    { angle: 120, orb: 8, name: "Trine", nameCn: "三分相 (120°)", meaning: "天赋流淌与和谐顺遂" },
    { angle: 180, orb: 8, name: "Opposition", nameCn: "对分相 (180°)", meaning: "二元对立与关系整合" },
  ];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const diff = Math.abs(p1.longitude - p2.longitude);
      const angle = diff > 180 ? 360 - diff : diff;

      for (const asp of MAJOR_ASPECTS) {
        const orb = Math.abs(angle - asp.angle);
        if (orb <= asp.orb) {
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type: asp.name,
            typeCn: asp.nameCn,
            angle,
            orb: Math.round(orb * 10) / 10,
            meaning: asp.meaning,
          });
        }
      }
    }
  }

  return aspects;
}
