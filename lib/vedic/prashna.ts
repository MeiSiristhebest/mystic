import { calculateHighPrecisionGrahas, parseCivilTimeToUtc } from './ephemeris';
import { buildVedicChart } from './engine';
import { VedicChart } from './types';

export type PrashnaCategory = 
  | 'career_job'
  | 'love_marriage'
  | 'wealth_finance'
  | 'health_recovery'
  | 'lawsuit_conflict'
  | 'general_query';

export interface PrashnaQueryInput {
  questionText: string;
  category: PrashnaCategory;
  queryDateTime: string;
  timeZone?: string;
  longitude?: number;
  latitude?: number;
}

export interface PrashnaAnalysisResult {
  chart: VedicChart;
  question: string;
  category: PrashnaCategory;
  karyaBhava: number;
  karyeshPlanet: string;
  lagnaLordPlanet: string;
  moonHouse: number;
  verdict: 'highly_auspicious' | 'favorable' | 'challenging' | 'delayed_success';
  verdictTitle: string;
  timingWindow: string;
  detailedInterpretation: string;
  factors: {
    lagnaLordStrength: string;
    karyeshStatus: string;
    moonDisposition: string;
    aspectHarmony: string;
  };
}

const CATEGORY_BHAVA_MAP: Record<PrashnaCategory, { bhava: number; name: string }> = {
  career_job: { bhava: 10, name: '事业官禄宫 (10宫)' },
  love_marriage: { bhava: 7, name: '婚恋配偶宫 (7宫)' },
  wealth_finance: { bhava: 11, name: '福德收益宫 (11宫)' },
  health_recovery: { bhava: 1, name: '命主健康宫 (1宫)' },
  lawsuit_conflict: { bhava: 6, name: '竞争疾厄宫 (6宫)' },
  general_query: { bhava: 9, name: '吉庆福德宫 (9宫)' },
};

const SIGN_LORD_MAP: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
};

/**
 * 确定性吠陀时事卜卦引擎 (Vedic Prashna Horary Engine)
 */
export function evaluatePrashna(input: PrashnaQueryInput): PrashnaAnalysisResult {
  const tz = input.timeZone || 'Asia/Shanghai';
  const lon = input.longitude ?? 116.4;
  const lat = input.latitude ?? 39.9;

  const dt = new Date(input.queryDateTime);
  const dateStr = dt.toISOString().slice(0, 10);
  const timeStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;

  const { utcDate } = parseCivilTimeToUtc(dateStr, timeStr, tz);
  const grahas = calculateHighPrecisionGrahas(utcDate, { latitude: lat, longitude: lon, timeZone: tz });
  const chart = buildVedicChart(
    dateStr,
    timeStr,
    grahas.planets.map(p => ({ name: p.name, longitude: p.tropicalLongitude, isRetrograde: p.isRetrograde })),
    grahas.ascendant.tropical
  );

  const lagnaSign = chart.ascendant.sign;
  const lagnaLord = SIGN_LORD_MAP[lagnaSign] || 'Mars';

  const categoryInfo = CATEGORY_BHAVA_MAP[input.category] || CATEGORY_BHAVA_MAP.general_query;
  const karyaBhava = categoryInfo.bhava;

  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const ascSignIdx = signs.indexOf(lagnaSign);
  const karyaSignIdx = (ascSignIdx + karyaBhava - 1) % 12;
  const karyaSign = signs[karyaSignIdx];
  const karyeshPlanet = SIGN_LORD_MAP[karyaSign] || 'Jupiter';

  const moon = chart.planets.find(p => p.name === 'Moon') || chart.planets[0];
  const lagnaLordPos = chart.planets.find(p => p.name === lagnaLord);
  const karyeshPos = chart.planets.find(p => p.name === karyeshPlanet);

  const isKaryeshKendraTrikona = karyeshPos && [1, 4, 5, 7, 9, 10, 11].includes(karyeshPos.house);
  const isMoonAuspicious = [1, 4, 5, 9, 10, 11].includes(moon.house);
  const isDirectConnection = lagnaLordPos && karyeshPos && (
    lagnaLordPos.house === karyeshPos.house || 
    Math.abs(lagnaLordPos.house - karyeshPos.house) === 6 ||
    Math.abs(lagnaLordPos.house - karyeshPos.house) === 4
  );

  let verdict: PrashnaAnalysisResult['verdict'] = 'favorable';
  let verdictTitle = '事有顺景·渐入佳境';
  let timingWindow = '预估将在 2~4 个周期内（日/周/月）显现明确动向';

  if (isDirectConnection && isKaryeshKendraTrikona && isMoonAuspicious) {
    verdict = 'highly_auspicious';
    verdictTitle = '大吉圆融·迅速成事';
    timingWindow = '短期内（1~2 周内）即有积极突破与明确回报';
  } else if (!isKaryeshKendraTrikona && [6, 8, 12].includes(moon.house)) {
    verdict = 'challenging';
    verdictTitle = '阻滞考验·宜守不宜进';
    timingWindow = '当前处于阻力期，建议等待下个节气或时运转换（约 1~3 个月后）';
  } else if (!isDirectConnection) {
    verdict = 'delayed_success';
    verdictTitle = '曲折后成·静待时机';
    timingWindow = '需经历一定中间周折，中长线（3~6 个月）可见成效';
  }

  const detailedInterpretation = `【时事卜卦解析】依据起卦时刻（${dateStr} ${timeStr}）天星格局：问事焦点落于【${categoryInfo.name}】。命主星【${lagnaLord}】与问事征象星【${karyeshPlanet}】落宫分别为第 ${lagnaLordPos?.house || 1} 宫与第 ${karyeshPos?.house || karyaBhava} 宫。月亮落入第 ${moon.house} 宫反映求问者当前心绪与环境支撑。卦象综合判定为【${verdictTitle}】。`;

  return {
    chart,
    question: input.questionText,
    category: input.category,
    karyaBhava,
    karyeshPlanet,
    lagnaLordPlanet: lagnaLord,
    moonHouse: moon.house,
    verdict,
    verdictTitle,
    timingWindow,
    detailedInterpretation,
    factors: {
      lagnaLordStrength: `命主星【${lagnaLord}】位于第 ${lagnaLordPos?.house} 宫 (${lagnaLordPos?.signCn})`,
      karyeshStatus: `问事星【${karyeshPlanet}】位于第 ${karyeshPos?.house} 宫 (${karyeshPos?.signCn})`,
      moonDisposition: `月亮位于第 ${moon.house} 宫 (${moon.signCn} ${chart.moonNakshatra.cnName})`,
      aspectHarmony: isDirectConnection ? '命主星与问事星形成直接关联吉相' : '两星暂未形成直接紧密相位，主节奏平缓',
    },
  };
}
