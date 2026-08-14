import { 
  VedicPlanetPosition, 
  VedicChart, 
  DashaPeriod, 
  SubDashaPeriod, 
  CurrentDashaHierarchy, 
  CharaKaraka, 
  VedicPlanetName, 
  VedicSignName 
} from './types';
import { getNakshatraByDegree, NAKSHATRAS } from './nakshatras';
import { validateVedicChart } from './validation';
import { CanonicalEvidenceNode } from '../contracts/types';

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

// Vimsottari Dasha planetary sequence and fixed years (Total: 120 years)
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

const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;

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
 * Calculate Chara Karakas (7-karaka scheme: AK, AmK, BK, MK, PK, GK, DK)
 */
export function calculateCharaKarakas(planets: VedicPlanetPosition[]): CharaKaraka[] {
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
 * Build 3-tier recursive Vimshottari Dasha timeline (MD -> AD -> PD)
 */
export function buildVimshottariTimeline(
  birthDateStr: string,
  moonSiderealDegree: number
): DashaPeriod[] {
  const nakInfo = getNakshatraByDegree(moonSiderealDegree);
  const rulerPlanet = nakInfo.nakshatra.ruler as VedicPlanetName;
  const startDashaIdx = DASHA_ORDER.findIndex(d => d.planet === rulerPlanet);
  const effectiveStartIdx = startDashaIdx >= 0 ? startDashaIdx : 0;

  // Fraction elapsed in the birth Nakshatra (0 ~ 1)
  const nakSpan = 360 / 27; // 13.3333333°
  const fractionElapsed = Math.min(Math.max(nakInfo.degreeInNakshatra / nakSpan, 0), 1);
  const firstDashaYears = DASHA_ORDER[effectiveStartIdx].years;
  const elapsedYears = fractionElapsed * firstDashaYears;

  const birthDate = new Date(birthDateStr);
  // Virtual start of the first full Mahadasha before birth
  const virtualCycleStartMs = birthDate.getTime() - elapsedYears * MS_PER_YEAR;

  const timeline: DashaPeriod[] = [];
  let currentMdStartMs = virtualCycleStartMs;

  for (let i = 0; i < 9; i++) {
    const mdIndex = (effectiveStartIdx + i) % 9;
    const mdLord = DASHA_ORDER[mdIndex];
    const mdDurationYears = mdLord.years;
    const mdDurationMs = mdDurationYears * MS_PER_YEAR;
    const currentMdEndMs = currentMdStartMs + mdDurationMs;

    // Calculate 9 Antar Dashas (AD) for this MD
    const antardashas: SubDashaPeriod[] = [];
    let currentAdStartMs = currentMdStartMs;

    for (let j = 0; j < 9; j++) {
      const adIndex = (mdIndex + j) % 9;
      const adLord = DASHA_ORDER[adIndex];
      // AD Duration = (MD_years * AD_years) / 120
      const adDurationYears = (mdDurationYears * adLord.years) / 120;
      const adDurationMs = adDurationYears * MS_PER_YEAR;
      const currentAdEndMs = currentAdStartMs + adDurationMs;

      // Calculate 9 Pratyantar Dashas (PD) for this AD
      const pratyantardashas: SubDashaPeriod[] = [];
      let currentPdStartMs = currentAdStartMs;

      for (let k = 0; k < 9; k++) {
        const pdIndex = (adIndex + k) % 9;
        const pdLord = DASHA_ORDER[pdIndex];
        // PD Duration = (MD_years * AD_years * PD_years) / (120 * 120)
        const pdDurationYears = (mdDurationYears * adLord.years * pdLord.years) / 14400;
        const pdDurationMs = pdDurationYears * MS_PER_YEAR;
        const currentPdEndMs = currentPdStartMs + pdDurationMs;

        pratyantardashas.push({
          planet: pdLord.planet,
          planetCn: PLANET_CN_MAP[pdLord.planet],
          startDate: new Date(currentPdStartMs).toISOString().split('T')[0],
          endDate: new Date(currentPdEndMs).toISOString().split('T')[0],
          durationYears: pdDurationYears,
        });

        currentPdStartMs = currentPdEndMs;
      }

      antardashas.push({
        planet: adLord.planet,
        planetCn: PLANET_CN_MAP[adLord.planet],
        startDate: new Date(currentAdStartMs).toISOString().split('T')[0],
        endDate: new Date(currentAdEndMs).toISOString().split('T')[0],
        durationYears: adDurationYears,
        subPeriods: pratyantardashas,
      });

      currentAdStartMs = currentAdEndMs;
    }

    timeline.push({
      planet: mdLord.planet,
      planetCn: PLANET_CN_MAP[mdLord.planet],
      startDate: new Date(Math.max(currentMdStartMs, birthDate.getTime())).toISOString().split('T')[0],
      endDate: new Date(currentMdEndMs).toISOString().split('T')[0],
      durationYears: i === 0 ? mdDurationYears - elapsedYears : mdDurationYears,
      subPeriods: antardashas,
    });

    currentMdStartMs = currentMdEndMs;
  }

  return timeline;
}

/**
 * Calculate Active Current Vimshottari Dasha Hierarchy (MD -> AD -> PD)
 */
export function getCurrentDashaHierarchy(
  timeline: DashaPeriod[],
  targetDate = new Date()
): CurrentDashaHierarchy {
  const targetMs = targetDate.getTime();

  // 1. Locate active Mahadasha
  let activeMd = timeline.find(md => {
    const s = new Date(md.startDate).getTime();
    const e = new Date(md.endDate).getTime();
    return targetMs >= s && targetMs <= e;
  });

  if (!activeMd) {
    // If target date is past all dashas or before birth, clamp to nearest
    activeMd = targetMs < new Date(timeline[0].startDate).getTime() ? timeline[0] : timeline[timeline.length - 1];
  }

  // 2. Locate active Antardasha
  const ads = activeMd.subPeriods || [];
  let activeAd = ads.find(ad => {
    const s = new Date(ad.startDate).getTime();
    const e = new Date(ad.endDate).getTime();
    return targetMs >= s && targetMs <= e;
  }) || ads[0] || {
    planet: activeMd.planet,
    planetCn: activeMd.planetCn,
    startDate: activeMd.startDate,
    endDate: activeMd.endDate,
    durationYears: activeMd.durationYears,
  };

  // 3. Locate active Pratyantardasha
  const pds = activeAd.subPeriods || [];
  let activePd = pds.find(pd => {
    const s = new Date(pd.startDate).getTime();
    const e = new Date(pd.endDate).getTime();
    return targetMs >= s && targetMs <= e;
  }) || pds[0] || {
    planet: activeAd.planet,
    planetCn: activeAd.planetCn,
    startDate: activeAd.startDate,
    endDate: activeAd.endDate,
    durationYears: activeAd.durationYears,
  };

  const formattedDisplay = `${activeMd.planet}-${activeAd.planet}-${activePd.planet} (${activeMd.planetCn.split(' ')[0]}大运·${activeAd.planetCn.split(' ')[0]}中运·${activePd.planetCn.split(' ')[0]}小运)`;

  return {
    mahaDasha: activeMd,
    antarDasha: activeAd,
    pratyantarDasha: activePd,
    formattedDisplay,
  };
}

/**
 * Extract Deterministic Evidence Nodes from Vedic Chart
 */
export function extractVedicEvidences(
  chart: {
    ascendant: VedicPlanetPosition;
    planets: VedicPlanetPosition[];
    moonNakshatra: any;
    charaKarakas: CharaKaraka[];
    currentDasha: CurrentDashaHierarchy;
    d9Chart: Record<number, any[]>;
    d10Chart: Record<number, any[]>;
  }
): CanonicalEvidenceNode[] {
  const evidences: CanonicalEvidenceNode[] = [];

  // 1. Moon Nakshatra Evidence
  const moon = chart.planets.find(p => p.name === 'Moon');
  if (moon && chart.moonNakshatra) {
    evidences.push({
      id: `vedic_moon_nakshatra_${chart.moonNakshatra.index}`,
      domain: 'vedic',
      ruleId: 'VEDIC_MOON_NAKSHATRA',
      ruleName: `月宿命格: ${chart.moonNakshatra.cnName}`,
      level: 'core',
      dimension: 'personality',
      polarity: 'neutral',
      confidence: 0.95,
      parameters: {
        nakshatra: chart.moonNakshatra.name,
        ruler: chart.moonNakshatra.ruler,
        deity: chart.moonNakshatra.deity,
        element: chart.moonNakshatra.element,
      },
      classicalSource: 'Brihat Parashara Hora Shastra (BPHS) Ch. 3',
      canonicalInterpretation: `月亮落入第${chart.moonNakshatra.index}宿${chart.moonNakshatra.cnName}，主宰星为${chart.moonNakshatra.rulerCn}，守护神为${chart.moonNakshatra.deityCn}。主心性特质：${chart.moonNakshatra.summary}`,
    });
  }

  // 2. Atmakaraka (AK) Evidence
  const ak = chart.charaKarakas.find(k => k.role === 'AK');
  if (ak) {
    evidences.push({
      id: `vedic_chara_karaka_ak_${ak.planet}`,
      domain: 'vedic',
      ruleId: 'VEDIC_CHARA_AK',
      ruleName: `灵魂指示星 (Atmakaraka): ${ak.planetCn}`,
      level: 'core',
      dimension: 'spiritual',
      polarity: 'transformative',
      confidence: 0.92,
      parameters: { planet: ak.planet, degree: ak.degree },
      classicalSource: 'Jaimini Sutras Upadesha Ch. 1',
      canonicalInterpretation: `命主在此生中最高度数行星为${ak.planetCn} (${ak.degree.toFixed(2)}°)。代表灵魂最核心的进化课题与必须克服的执念原型。`,
    });
  }

  // 3. Amatyakaraka (AmK) Evidence
  const amk = chart.charaKarakas.find(k => k.role === 'AmK');
  if (amk) {
    evidences.push({
      id: `vedic_chara_karaka_amk_${amk.planet}`,
      domain: 'vedic',
      ruleId: 'VEDIC_CHARA_AMK',
      ruleName: `事业谋略星 (Amatyakaraka): ${amk.planetCn}`,
      level: 'support',
      dimension: 'career',
      polarity: 'favorable',
      confidence: 0.88,
      parameters: { planet: amk.planet, degree: amk.degree },
      classicalSource: 'Jaimini Sutras Upadesha Ch. 1',
      canonicalInterpretation: `事业谋略与社会执行力由${amk.planetCn}主导，指示命主在现实社会竞争与资源运作中最擅长的策略路径。`,
    });
  }

  // 4. Current Vimshottari Dasha Hierarchy Evidence
  const md = chart.currentDasha.mahaDasha;
  const ad = chart.currentDasha.antarDasha;
  const pd = chart.currentDasha.pratyantarDasha;
  evidences.push({
    id: `vedic_current_dasha_${md.planet}_${ad.planet}`,
    domain: 'vedic',
    ruleId: 'VEDIC_VIMSHOTTARI_ACTIVE',
    ruleName: `当前时运大运: ${chart.currentDasha.formattedDisplay}`,
    level: 'core',
    dimension: 'timing',
    polarity: md.planet === 'Saturn' || md.planet === 'Rahu' || md.planet === 'Ketu' ? 'transformative' : 'favorable',
    confidence: 0.96,
    parameters: {
      mahaLord: md.planet,
      antarLord: ad.planet,
      pratyantarLord: pd.planet,
      startDate: ad.startDate,
      endDate: ad.endDate,
    },
    classicalSource: 'Brihat Parashara Hora Shastra (BPHS) Vimshottari Section',
    canonicalInterpretation: `当前正处于${md.planetCn}大运（${md.startDate} ~ ${md.endDate}）中的${ad.planetCn}中运与${pd.planetCn}小运。时间窗口焦点由${md.planet}与${ad.planet}的本垣及落宫主导。`,
  });

  // 5. Sade Sati Detection
  if (moon) {
    const saturn = chart.planets.find(p => p.name === 'Saturn');
    if (saturn) {
      const moonHouse = moon.house;
      const saturnHouse = saturn.house;
      const houseDiff = (saturnHouse - moonHouse + 12) % 12; // 0=conjunction, 1=2nd, 11=12th
      if (houseDiff === 11 || houseDiff === 0 || houseDiff === 1) {
        const phase = houseDiff === 11 ? '第一阶段 (12宫准备期)' : houseDiff === 0 ? '第二阶段 (本宫巅峰考验)' : '第三阶段 (2宫收尾转型)';
        evidences.push({
          id: 'vedic_sade_sati_active',
          domain: 'vedic',
          ruleId: 'VEDIC_SADE_SATI',
          ruleName: `土星回归照月 (Sade Sati 7.5年周期: ${phase})`,
          level: 'warning',
          dimension: 'timing',
          polarity: 'transformative',
          confidence: 0.85,
          parameters: { moonHouse, saturnHouse, phase },
          classicalSource: 'Phaladeepika & Classic Jyotish Transit Lore',
          canonicalInterpretation: `土星当前行运与本命月亮构成 7.5 年 Sade Sati 紧密周期，处于${phase}。主心智淬炼、责任担当与人生底层结构重构。`,
        });
      }
    }
  }

  return evidences;
}

/**
 * Full Vedic Chart Builder (Integrated with Validation, Evidence & Recursive Dasha)
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

  // Build Full 120-Year Vimshottari Dasha Timeline (MD -> AD -> PD)
  const dashaTimeline = buildVimshottariTimeline(birthDate, moon.longitude);

  // Calculate Current Active Dasha Hierarchy
  const currentDasha = getCurrentDashaHierarchy(dashaTimeline, new Date());

  // Extract Canonical Evidences
  const evidences = extractVedicEvidences({
    ascendant: ascendantPos,
    planets: vedicPlanets,
    moonNakshatra: moonNakInfo.nakshatra,
    charaKarakas,
    currentDasha,
    d9Chart,
    d10Chart,
  });

  // Summary Tags
  const ak = charaKarakas.find(k => k.role === 'AK');
  const summaryTags = [
    `月宿: ${moonNakInfo.nakshatra.cnName}`,
    `上升: ${ascendantPos.signCn}`,
    ak ? `灵魂星AK: ${ak.planetCn}` : '',
    `当前大运: ${currentDasha.formattedDisplay}`,
  ].filter(Boolean);

  const rawChart: Partial<VedicChart> = {
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
    dashaTimeline,
    evidences,
    summaryTags,
  };

  const validation = validateVedicChart(rawChart);

  return {
    ...rawChart,
    validation,
  } as VedicChart;
}
