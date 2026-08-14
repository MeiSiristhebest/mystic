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

export function getSunSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
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
 */
export function calculateLocalSiderealTime(date: Date, longitude: number): number {
  // Julian Date calculation
  const jd = (date.getTime() / 86400000) + 2440587.5;
  const d = jd - 2451545.0;
  
  // GMST in degrees
  let gmst = 280.46061837 + 360.98564736629 * d;
  gmst = ((gmst % 360) + 360) % 360;
  
  // Local Sidereal Time (LST)
  const lst = ((gmst + longitude) % 360 + 360) % 360;
  return lst;
}

/**
 * 高精度上升星座 (Ascendant) 与上升度数计算 (球面三角升交点模型)
 */
export function getPreciseAscendant(
  birthDate: Date,
  birthTime: string,
  longitude = 116.40,
  latitude = 39.90
): { sign: string; degree: number; formatted: string; longitude: number } {
  if (!birthTime) {
    const defaultSign = getSunSign(birthDate);
    return { sign: defaultSign, degree: 0, formatted: `${defaultSign} 0°0'`, longitude: ZODIAC_SIGNS.indexOf(defaultSign) * 30 };
  }

  const [hours, minutes] = birthTime.split(':').map(Number);
  const localDate = new Date(birthDate);
  localDate.setHours(hours, minutes, 0, 0);

  // Obliquity of the Ecliptic (黄赤交角, J2000 ~ 23.4393°)
  const eps = (23.4392911 * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;

  // Local Sidereal Time (RAMC in radians)
  const ramcDeg = calculateLocalSiderealTime(localDate, longitude);
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

export function getAscendant(birthDate: Date, birthTime: string, longitude = 116.40, latitude = 39.90): string {
  return getPreciseAscendant(birthDate, birthTime, longitude, latitude).sign;
}

export function getDescendant(ascendant: string): string {
  const index = ZODIAC_SIGNS.indexOf(ascendant);
  if (index === -1) return "未知";
  return ZODIAC_SIGNS[(index + 6) % 12];
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'Conjunction' | 'Opposition' | 'Trine' | 'Square' | 'Sextile';
  typeCn: '合相 (0°)' | '对冲 (180°)' | '拱相 (120°)' | '刑相 (90°)' | '六合 (60°)';
  angle: number;
  orb: number;
  nature: '和谐' | '张力' | '强力重合';
}

export function calculateAspects(planets: Array<{ name: string; longitude: number }>): Aspect[] {
  const aspects: Aspect[] = [];
  const definitions: Array<{ type: Aspect['type']; typeCn: Aspect['typeCn']; angle: number; orb: number; nature: Aspect['nature'] }> = [
    { type: 'Conjunction', typeCn: '合相 (0°)', angle: 0, orb: 8, nature: '强力重合' },
    { type: 'Opposition', typeCn: '对冲 (180°)', angle: 180, orb: 8, nature: '张力' },
    { type: 'Trine', typeCn: '拱相 (120°)', angle: 120, orb: 7, nature: '和谐' },
    { type: 'Square', typeCn: '刑相 (90°)', angle: 90, orb: 7, nature: '张力' },
    { type: 'Sextile', typeCn: '六合 (60°)', angle: 60, orb: 5, nature: '和谐' },
  ];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const diff = Math.abs(p1.longitude - p2.longitude);
      const angle = diff > 180 ? 360 - diff : diff;

      for (const def of definitions) {
        const orb = Math.abs(angle - def.angle);
        if (orb <= def.orb) {
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type: def.type,
            typeCn: def.typeCn,
            angle,
            orb: Math.round(orb * 10) / 10,
            nature: def.nature,
          });
          break;
        }
      }
    }
  }

  return aspects;
}
