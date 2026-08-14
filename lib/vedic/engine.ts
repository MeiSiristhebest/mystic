import { VedicPlanetPosition, VedicChart, DashaPeriod, CharaKaraka, VedicPlanetName, VedicSignName } from './types';
import { getNakshatraByDegree, NAKSHATRAS } from './nakshatras';

export const VEDIC_SIGNS: { name: VedicSignName; cnName: string; element: string; ruler: VedicPlanetName }[] = [
  { name: 'Aries', cnName: '白羊宫 (Mesha)', element: 'Fire', ruler: 'Mars' },
  { name: 'Taurus', cnName: '金牛宫 (Vrishabha)', element: 'Earth', ruler: 'Venus' },
  { name: 'Gemini', cnName: '双子宫 (Mithuna)', element: 'Air', ruler: 'Mercury' },
  { name: 'Cancer', cnName: '巨蟹宫 (Karka)', element: 'Water', ruler: 'Moon' },
  { name: 'Leo', cnName: '狮子宫 (Simha)', element: 'Fire', ruler: 'Sun' },
  { name: 'Virgo', cnName: '处女宫 (Kanya)', element: 'Earth', ruler: 'Mercury' },
  { name: 'Libra', cnName: '天秤宫 (Tula)', element: 'Air', ruler: 'Venus' },
  { name: 'Scorpio', cnName: '天蝎宫 (Vrishchika)', element: 'Water', ruler: 'Mars' },
  { name: 'Sagittarius', cnName: '射手宫 (Dhanu)', element: 'Fire', ruler: 'Jupiter' },
  { name: 'Capricorn', cnName: '摩羯宫 (Makara)', element: 'Earth', ruler: 'Saturn' },
  { name: 'Aquarius', cnName: '水瓶宫 (Kumbha)', element: 'Air', ruler: 'Saturn' },
  { name: 'Pisces', cnName: '双鱼宫 (Meena)', element: 'Water', ruler: 'Jupiter' },
];

export const PLANET_CN_MAP: Record<VedicPlanetName, string> = {
  Sun: '太阳 (Surya)',
  Moon: '月亮 (Chandra)',
  Mars: '火星 (Mangala)',
  Mercury: '水星 (Budha)',
  Jupiter: '木星 (Guru)',
  Venus: '金星 (Shukra)',
  Saturn: '土星 (Shani)',
  Rahu: '罗睺 (Rahu)',
  Ketu: '计都 (Ketu)',
  Ascendant: '上升命度 (Lagna)',
};

// Vimsottari Dasha planetary sequence and years (total 120 years)
export const DASHA_ORDER: { planet: VedicPlanetName; years: number }[] = [
  { planet: 'Ketu', years: 7 },
  { planet: 'Venus', years: 20 },
  { planet: 'Sun', years: 6 },
  { planet: 'Moon', years: 10 },
  { planet: 'Mars', years: 7 },
  { planet: 'Rahu', years: 18 },
  { planet: 'Jupiter', years: 16 },
  { planet: 'Saturn', years: 19 },
  { planet: 'Mercury', years: 17 },
];

/**
 * Approximate Lahiri Ayanamsa (True Citra)
 * Epoch 2000.0 Lahiri value ~ 23°51'25.53" (~23.857°)
 * Annual precession ~ 50.29" (0.013969°/year)
 */
export function getLahiriAyanamsa(year: number, month = 1, day = 1): number {
  const decimalYear = year + (month - 1) / 12 + day / 365.25;
  return 23.857 + (decimalYear - 2000) * 0.013969;
}

/**
 * Calculate D9 Navamsa Sign Index (0-11)
 */
export function getNavamsaSignIndex(siderealDegree: number): number {
  const normDeg = ((siderealDegree % 360) + 360) % 360;
  const d1SignIndex = Math.floor(normDeg / 30);
  const degreeInSign = normDeg % 30;
  const navamsaIndexInSign = Math.floor(degreeInSign / (30 / 9)); // 0-8

  // Fire signs (Aries 0, Leo 4, Sag 8) start at Aries (0)
  // Earth signs (Taurus 1, Virgo 5, Cap 9) start at Capricorn (9)
  // Air signs (Gemini 2, Libra 6, Aqua 10) start at Libra (6)
  // Water signs (Cancer 3, Scorpio 7, Pisces 11) start at Cancer (3)
  const elementGroup = d1SignIndex % 4;
  const startSignMap = [0, 9, 6, 3];
  const startSign = startSignMap[elementGroup];

  return (startSign + navamsaIndexInSign) % 12;
}

/**
 * Calculate D10 Dasamsa Sign Index (0-11)
 */
export function getDasamsaSignIndex(siderealDegree: number): number {
  const normDeg = ((siderealDegree % 360) + 360) % 360;
  const d1SignIndex = Math.floor(normDeg / 30);
  const degreeInSign = normDeg % 30;
  const dasamsaIndexInSign = Math.floor(degreeInSign / 3.0); // 0-9

  // Odd signs: count from same sign; Even signs: count from 9th sign
  const isOddSign = d1SignIndex % 2 === 0; // 0=Aries (odd 1st)
  const startSign = isOddSign ? d1SignIndex : (d1SignIndex + 8) % 12;

  return (startSign + dasamsaIndexInSign) % 12;
}

/**
 * Calculate Chara Karakas (AK, AmK, BK, MK, PK, GK, DK) based on degree within sign
 */
export function calculateCharaKarakas(planets: VedicPlanetPosition[]): CharaKaraka[] {
  // 7 planets considered for 7-karaka scheme: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn
  const eligible = planets.filter(p => 
    ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(p.name)
  );

  const sorted = [...eligible].sort((a, b) => b.degreeInSign - a.degreeInSign);

  const roles: Array<{ role: CharaKaraka['role']; name: string; desc: string }> = [
    { role: 'AK', name: 'Atmakaraka (灵魂指示星)', desc: '代表此生最高灵魂进化课题与终极潜能' },
    { role: 'AmK', name: 'Amatyakaraka (事业谋略星)', desc: '代表社会成就、职业执行力与关键助手' },
    { role: 'BK', name: 'Bhratrikaraka (同修手足星)', desc: '代表导师、志同道合的同伴与成长助力' },
    { role: 'MK', name: 'Matrikaraka (庇护母亲星)', desc: '代表内心安全感、居所根基与母性能量' },
    { role: 'PK', name: 'Putrakaraka (创造子息星)', desc: '代表创造力、洞察智谋与未来作品/子嗣' },
    { role: 'GK', name: 'Gnatikaraka (磨砺竞争星)', desc: '代表内在冲突、外部竞争对手与磨练之源' },
    { role: 'DK', name: 'Darakaraka (配偶伴侣星)', desc: '代表命中伴侣的核心特质与亲密关系模式' },
  ];

  return sorted.slice(0, 7).map((p, idx) => ({
    role: roles[idx].role,
    roleName: roles[idx].name,
    roleDescription: roles[idx].desc,
    planet: p.name,
    planetCn: PLANET_CN_MAP[p.name],
    degree: p.degreeInSign,
  }));
}

/**
 * Calculate Current Vimsottari Dasha based on Moon's Nakshatra
 */
export function calculateVimsottariDasha(
  birthDateStr: string,
  moonSiderealDegree: number,
  targetDate = new Date()
): {
  mahaDasha: DashaPeriod;
  antarDasha: { planet: VedicPlanetName; planetCn: string; startDate: string; endDate: string };
} {
  const nakInfo = getNakshatraByDegree(moonSiderealDegree);
  const rulerPlanet = nakInfo.nakshatra.ruler as VedicPlanetName;
  const startDashaIdx = DASHA_ORDER.findIndex(d => d.planet === rulerPlanet);
  const effectiveStartIdx = startDashaIdx >= 0 ? startDashaIdx : 0;

  // Fraction elapsed of current nakshatra
  const fractionElapsed = nakInfo.degreeInNakshatra / (360 / 27);
  const birthDate = new Date(birthDateStr);

  let curStart = new Date(birthDate);
  // Subtract the already elapsed portion of the birth dasha
  const firstDashaYears = DASHA_ORDER[effectiveStartIdx].years;
  const elapsedYears = fractionElapsed * firstDashaYears;
  const remainingFirstYears = firstDashaYears - elapsedYears;

  let allDashas: DashaPeriod[] = [];
  let pointerDate = new Date(curStart.getTime());
  
  // First dasha end
  const firstEnd = new Date(pointerDate.getTime() + remainingFirstYears * 365.25 * 24 * 3600 * 1000);
  allDashas.push({
    planet: DASHA_ORDER[effectiveStartIdx].planet,
    planetCn: PLANET_CN_MAP[DASHA_ORDER[effectiveStartIdx].planet],
    startDate: curStart.toISOString().split('T')[0],
    endDate: firstEnd.toISOString().split('T')[0],
    durationYears: remainingFirstYears,
  });
  pointerDate = firstEnd;

  // Subsequent dashas (cycling through 120 years)
  for (let i = 1; i < 9; i++) {
    const idx = (effectiveStartIdx + i) % 9;
    const dObj = DASHA_ORDER[idx];
    const nextEnd = new Date(pointerDate.getTime() + dObj.years * 365.25 * 24 * 3600 * 1000);
    allDashas.push({
      planet: dObj.planet,
      planetCn: PLANET_CN_MAP[dObj.planet],
      startDate: pointerDate.toISOString().split('T')[0],
      endDate: nextEnd.toISOString().split('T')[0],
      durationYears: dObj.years,
    });
    pointerDate = nextEnd;
  }

  // Find active Maha Dasha for targetDate
  const targetTime = targetDate.getTime();
  let activeMaha = allDashas.find(d => {
    const s = new Date(d.startDate).getTime();
    const e = new Date(d.endDate).getTime();
    return targetTime >= s && targetTime <= e;
  }) || allDashas[0];

  // Antar Dasha estimation
  return {
    mahaDasha: activeMaha,
    antarDasha: {
      planet: activeMaha.planet,
      planetCn: activeMaha.planetCn,
      startDate: activeMaha.startDate,
      endDate: activeMaha.endDate,
    }
  };
}

/**
 * Full Vedic Chart Builder
 */
export function buildVedicChart(
  birthDate: string,
  birthTime: string,
  tropicalPlanets: Array<{ name: string; longitude: number; isRetrograde?: boolean }>,
  tropicalAscendantLongitude: number
): VedicChart {
  const [year, month, day] = birthDate.split('-').map(Number);
  const ayanamsa = getLahiriAyanamsa(year, month || 1, day || 1);

  // Convert Tropical Longitudes to Sidereal
  const siderealAscDegree = ((tropicalAscendantLongitude - ayanamsa) % 360 + 360) % 360;
  const ascSignIdx = Math.floor(siderealAscDegree / 30);
  const ascDegreeInSign = siderealAscDegree % 30;
  const ascNak = getNakshatraByDegree(siderealAscDegree);

  const ascendantPos: VedicPlanetPosition = {
    name: 'Ascendant',
    cnName: '上升 (Lagna)',
    longitude: siderealAscDegree,
    sign: VEDIC_SIGNS[ascSignIdx].name,
    signCn: VEDIC_SIGNS[ascSignIdx].cnName,
    degreeInSign: ascDegreeInSign,
    house: 1,
    nakshatra: ascNak.nakshatra.name,
    nakshatraCn: ascNak.nakshatra.cnName,
    pada: ascNak.pada,
  };

  const vedicPlanets: VedicPlanetPosition[] = tropicalPlanets.map(p => {
    const sidDeg = ((p.longitude - ayanamsa) % 360 + 360) % 360;
    const signIdx = Math.floor(sidDeg / 30);
    const degInSign = sidDeg % 30;
    const nak = getNakshatraByDegree(sidDeg);
    // House calculation using Whole Sign (Lagna Sign = 1st House)
    const house = ((signIdx - ascSignIdx + 12) % 12) + 1;

    const pName = p.name as VedicPlanetName;
    return {
      name: pName,
      cnName: PLANET_CN_MAP[pName] || p.name,
      longitude: sidDeg,
      sign: VEDIC_SIGNS[signIdx].name,
      signCn: VEDIC_SIGNS[signIdx].cnName,
      degreeInSign: degInSign,
      house,
      nakshatra: nak.nakshatra.name,
      nakshatraCn: nak.nakshatra.cnName,
      pada: nak.pada,
      isRetrograde: p.isRetrograde,
    };
  });

  // Moon Position & Nakshatra
  const moon = vedicPlanets.find(p => p.name === 'Moon') || vedicPlanets[0];
  const moonNakInfo = getNakshatraByDegree(moon.longitude);

  // Group into D1 Chart
  const d1Chart: Record<number, VedicPlanetPosition[]> = {};
  for (let h = 1; h <= 12; h++) d1Chart[h] = [];
  vedicPlanets.forEach(p => {
    d1Chart[p.house].push(p);
  });

  // D9 Navamsa Mapping
  const d9Chart: Record<number, { name: string; cnName: string; sign: string; signCn: string }[]> = {};
  for (let h = 1; h <= 12; h++) d9Chart[h] = [];
  vedicPlanets.forEach(p => {
    const navSignIdx = getNavamsaSignIndex(p.longitude);
    const navHouse = ((navSignIdx - getNavamsaSignIndex(siderealAscDegree) + 12) % 12) + 1;
    d9Chart[navHouse].push({
      name: p.name,
      cnName: p.cnName,
      sign: VEDIC_SIGNS[navSignIdx].name,
      signCn: VEDIC_SIGNS[navSignIdx].cnName,
    });
  });

  // D10 Dasamsa Mapping
  const d10Chart: Record<number, { name: string; cnName: string; sign: string; signCn: string }[]> = {};
  for (let h = 1; h <= 12; h++) d10Chart[h] = [];
  vedicPlanets.forEach(p => {
    const dasSignIdx = getDasamsaSignIndex(p.longitude);
    const dasHouse = ((dasSignIdx - getDasamsaSignIndex(siderealAscDegree) + 12) % 12) + 1;
    d10Chart[dasHouse].push({
      name: p.name,
      cnName: p.cnName,
      sign: VEDIC_SIGNS[dasSignIdx].name,
      signCn: VEDIC_SIGNS[dasSignIdx].cnName,
    });
  });

  // Chara Karakas
  const charaKarakas = calculateCharaKarakas(vedicPlanets);

  // Dasha
  const currentDasha = calculateVimsottariDasha(birthDate, moon.longitude);

  // Summary Tags
  const ak = charaKarakas.find(k => k.role === 'AK');
  const summaryTags = [
    `月宿: ${moonNakInfo.nakshatra.cnName}`,
    `上升: ${ascendantPos.signCn}`,
    ak ? `灵魂星AK: ${ak.planetCn}` : '',
    `当前大运: ${currentDasha.mahaDasha.planetCn}期`,
  ].filter(Boolean);

  return {
    birthDate,
    birthTime,
    ayanamsa,
    ascendant: ascendantPos,
    planets: vedicPlanets,
    d1Chart,
    d9Chart,
    d10Chart,
    moonNakshatra: moonNakInfo.nakshatra,
    charaKarakas,
    currentDasha,
    summaryTags,
  };
}
