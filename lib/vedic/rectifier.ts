import { VedicChart } from './types';
import { calculateHighPrecisionGrahas, parseCivilTimeToUtc } from './ephemeris';
import { buildVedicChart } from './engine';

export interface LifeEventInput {
  eventName: string;
  eventType: 'marriage' | 'career_promotion' | 'childbirth' | 'accident_surgery' | 'relocation' | 'spiritual_initiation';
  eventYear: number;
  eventMonth?: number;
  description?: string;
}

export interface RectificationCandidate {
  adjustedTime: string; // HH:mm:ss
  minuteOffset: number; // -120 ~ +120
  lagnaSign: string;
  lagnaDegree: number;
  d9LagnaSign: string;
  d10LagnaSign: string;
  matchScore: number; // 0 ~ 100
  eventCorrelations: Array<{
    eventName: string;
    eventType: string;
    matchedDasha: string;
    score: number;
    explanation: string;
  }>;
}

export interface RectificationResult {
  originalTime: string;
  recommendedTime: string;
  recommendedMinuteOffset: number;
  confidenceScore: number;
  scannedRangeMinutes: number;
  candidates: RectificationCandidate[];
  analysisSummary: string;
}

/**
 * 确定性生时校正引擎 (Birth Time Rectification Engine)
 */
export function rectifyBirthTime(
  birthDate: string,
  originalTime: string,
  events: LifeEventInput[],
  options?: {
    timeZone?: string;
    longitude?: number;
    latitude?: number;
    scanWindowMinutes?: number;
    stepMinutes?: number;
  }
): RectificationResult {
  const tz = options?.timeZone || 'Asia/Shanghai';
  const lon = options?.longitude ?? 116.4;
  const lat = options?.latitude ?? 39.9;
  const windowMins = options?.scanWindowMinutes ?? 30;
  const stepMins = options?.stepMinutes ?? 2;

  const [origHour, origMin] = originalTime.split(':').map(Number);
  const origTotalMins = origHour * 60 + origMin;

  const candidates: RectificationCandidate[] = [];

  for (let offset = -windowMins; offset <= windowMins; offset += stepMins) {
    const candidateMins = origTotalMins + offset;
    const cHour = Math.floor(((candidateMins % 1440) + 1440) % 1440 / 60);
    const cMin = Math.floor(((candidateMins % 1440) + 1440) % 1440 % 60);
    const timeStr = `${String(cHour).padStart(2, '0')}:${String(cMin).padStart(2, '0')}`;

    try {
      const { utcDate } = parseCivilTimeToUtc(birthDate, timeStr, tz);
      const grahas = calculateHighPrecisionGrahas(utcDate, { latitude: lat, longitude: lon, timeZone: tz });
      const chart = buildVedicChart(
        birthDate,
        timeStr,
        grahas.planets.map(p => ({ name: p.name, longitude: p.tropicalLongitude, isRetrograde: p.isRetrograde })),
        grahas.ascendant.tropical
      );

      const lagnaPos = chart.ascendant;
      const d9LagnaSign = chart.d9Chart[1]?.[0]?.signCn || '待定';
      const d10LagnaSign = chart.d10Chart[1]?.[0]?.signCn || '待定';

      let totalEventScore = 0;
      const eventCorrelations: RectificationCandidate['eventCorrelations'] = [];

      for (const ev of events) {
        const evDate = new Date(`${ev.eventYear}-${String(ev.eventMonth || 6).padStart(2, '0')}-15`);
        const matchingDasha = chart.dashaTimeline.find(d => {
          const s = new Date(d.startDate);
          const e = new Date(d.endDate);
          return evDate >= s && evDate <= e;
        });

        const activePlanet = matchingDasha?.planet || 'Sun';
        let evScore = 50;
        let explanation = '';

        if (ev.eventType === 'marriage') {
          const isVenusJupiter = activePlanet === 'Venus' || activePlanet === 'Jupiter';
          const is7thLord = chart.planets.find(p => p.name === activePlanet)?.house === 7;
          if (isVenusJupiter || is7thLord) {
            evScore += 40;
            explanation = `事件年份正逢${activePlanet}大运，与婚恋指示星/7宫主星高度共振。`;
          } else {
            evScore += 10;
            explanation = `事件年份处于${activePlanet}大运。`;
          }
        } else if (ev.eventType === 'career_promotion') {
          const isCareerLord = ['Sun', 'Mars', 'Jupiter', 'Saturn'].includes(activePlanet);
          const is10thLord = chart.planets.find(p => p.name === activePlanet)?.house === 10;
          if (isCareerLord || is10thLord) {
            evScore += 40;
            explanation = `事件年份正逢${activePlanet}大运，触发事业宫位与成就主星。`;
          } else {
            evScore += 10;
            explanation = `事件年份处于${activePlanet}大运。`;
          }
        } else if (ev.eventType === 'childbirth') {
          const isJupiter = activePlanet === 'Jupiter' || activePlanet === 'Moon';
          if (isJupiter) {
            evScore += 40;
            explanation = `事件年份逢${activePlanet}大运，触发子息生发吉兆。`;
          } else {
            evScore += 10;
            explanation = `事件年份处于${activePlanet}大运。`;
          }
        } else {
          evScore += 25;
          explanation = `事件年份处于${activePlanet}大运。`;
        }

        totalEventScore += evScore;
        eventCorrelations.push({
          eventName: ev.eventName,
          eventType: ev.eventType,
          matchedDasha: matchingDasha ? `${matchingDasha.planetCn}大运 (${matchingDasha.startDate.slice(0, 4)}~${matchingDasha.endDate.slice(0, 4)})` : '未知大运',
          score: evScore,
          explanation,
        });
      }

      const distancePenalty = Math.abs(offset) * 0.15;
      const normalizedScore = events.length > 0 
        ? Math.max(10, Math.min(100, Math.round((totalEventScore / events.length) - distancePenalty)))
        : 60;

      candidates.push({
        adjustedTime: `${timeStr}:00`,
        minuteOffset: offset,
        lagnaSign: lagnaPos.signCn,
        lagnaDegree: Math.round(lagnaPos.degreeInSign * 100) / 100,
        d9LagnaSign,
        d10LagnaSign,
        matchScore: normalizedScore,
        eventCorrelations,
      });
    } catch {
      // ignore
    }
  }

  candidates.sort((a, b) => b.matchScore - a.matchScore);

  const bestCandidate = candidates[0] || {
    adjustedTime: originalTime,
    minuteOffset: 0,
    lagnaSign: '未知',
    lagnaDegree: 0,
    d9LagnaSign: '未知',
    d10LagnaSign: '未知',
    matchScore: 50,
    eventCorrelations: [],
  };

  const summary = `经过在原出生时间【${originalTime}】前后 ±${windowMins} 分钟共 ${candidates.length} 个时间点的确定性扫描，结合 ${events.length} 项重大人生已知事件验证：推荐校正时间为【${bestCandidate.adjustedTime.slice(0, 5)}】（时差偏移 ${bestCandidate.minuteOffset > 0 ? `+${bestCandidate.minuteOffset}` : bestCandidate.minuteOffset} 分钟，匹配度 ${bestCandidate.matchScore}分）。`;

  return {
    originalTime,
    recommendedTime: bestCandidate.adjustedTime.slice(0, 5),
    recommendedMinuteOffset: bestCandidate.minuteOffset,
    confidenceScore: bestCandidate.matchScore,
    scannedRangeMinutes: windowMins,
    candidates: candidates.slice(0, 5),
    analysisSummary: summary,
  };
}
