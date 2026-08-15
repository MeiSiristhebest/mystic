import { 
  getPreciseAscendantFromUtc, 
  calculateAspects, 
  getSunSign,
  getSunSignFromDegree, 
  getZodiacFromLongitude 
} from "@/lib/astrology";
import { 
  buildVedicChart, 
  calculateVedicSynastry, 
  VedicChart,
  calculateHighPrecisionGrahas,
  parseCivilTimeToUtc 
} from "@/lib/vedic";
import { BirthContext, DomainEvaluationResult } from "@/lib/contracts/types";

export class AstrologyService {
  /**
   * Helper to normalize arguments into unified BirthContext
   */
  static toBirthContext(
    birthDateOrContext: string | BirthContext,
    birthTime = "12:00",
    lon = 116.40,
    lat = 39.90,
    timeZone?: string
  ): BirthContext {
    if (typeof birthDateOrContext === 'object') {
      return birthDateOrContext;
    }
    const tz = this.resolveTimezone(lon, timeZone);
    return {
      birthDate: birthDateOrContext,
      birthTime,
      longitude: lon,
      latitude: lat,
      timeZone: tz,
    };
  }

  /**
   * Approximate Sun Sign from Date (For fast UI hints)
   */
  static getSunSign(date: Date): string {
    return getSunSign(date);
  }

  /**
   * Resolve IANA timezone or numeric offset string
   */
  static resolveTimezone(lon: number, explicitTimeZone?: string): string {
    if (explicitTimeZone && typeof explicitTimeZone === 'string') {
      return explicitTimeZone;
    }
    // Standard longitude approximation to IANA timezone if not supplied
    if (lon >= 100 && lon <= 135) return 'Asia/Shanghai';
    if (lon >= 65 && lon < 100) return 'Asia/Kolkata';
    if (lon >= -10 && lon < 40) return 'Europe/London';
    if (lon >= -85 && lon < -60) return 'America/New_York';
    if (lon >= -125 && lon < -85) return 'America/Los_Angeles';
    return 'UTC';
  }

  /**
   * Calculate complete western astrology star chart with high-precision astronomical ephemeris.
   */
  static getStarChart(
    birthDateOrContext: string | BirthContext, 
    birthTime = "12:00", 
    lon = 116.40, 
    lat = 39.90,
    timeZone?: string
  ) {
    const ctx = this.toBirthContext(birthDateOrContext, birthTime, lon, lat, timeZone);
    const { utcDate, offsetMinutes } = parseCivilTimeToUtc(ctx.birthDate, ctx.birthTime, ctx.timeZone);

    // Compute Planetary Positions via Moshier Ephemeris
    const grahaData = calculateHighPrecisionGrahas(utcDate, {
      longitude: ctx.longitude,
      latitude: ctx.latitude,
      timeZone: ctx.timeZone,
    });

    // Compute Local Ascendant directly from UTC Instant
    const ascendant = getPreciseAscendantFromUtc(utcDate, ctx.longitude, ctx.latitude);

    // Extract true Sun tropical longitude for accurate Sun Sign
    const sunGraha = grahaData.planets.find(p => p.name === 'Sun');
    const sunTropicalDeg = sunGraha ? sunGraha.tropicalLongitude : 0;
    const sunSign = getSunSignFromDegree(sunTropicalDeg);

    const planetNameMap: Record<string, { name: string; symbol: string }> = {
      Sun: { name: "太阳", symbol: "☉" },
      Moon: { name: "月亮", symbol: "☽" },
      Mercury: { name: "水星", symbol: "☿" },
      Venus: { name: "金星", symbol: "♀" },
      Mars: { name: "火星", symbol: "♂" },
      Jupiter: { name: "木星", symbol: "♃" },
      Saturn: { name: "土星", symbol: "♄" },
    };

    const planets = grahaData.planets
      .filter(p => planetNameMap[p.name])
      .map(p => ({
        name: planetNameMap[p.name].name,
        symbol: planetNameMap[p.name].symbol,
        longitude: p.tropicalLongitude,
        sign: getZodiacFromLongitude(p.tropicalLongitude),
      }));

    const aspects = calculateAspects(planets);

    // Equal 12 Houses from Ascendant
    const houses = Array.from({ length: 12 }, (_, i) => {
      const houseLon = (ascendant.longitude + i * 30) % 360;
      return {
        house: i + 1,
        longitude: houseLon,
        sign: getZodiacFromLongitude(houseLon),
      };
    });

    return {
      sunSign,
      ascendant,
      planets,
      houses,
      aspects,
      ephemerisInfo: {
        jd: grahaData.jd,
        ayanamsa: grahaData.ayanamsa,
        utcDate: grahaData.utcDate.toISOString(),
        timeZone: ctx.timeZone,
        offsetMinutes,
        calculationMethod: grahaData.calculationMethod,
      },
    };
  }

  /**
   * Calculate Vedic astrology chart with high precision sidereal ayanamsa & 27 nakshatras.
   */
  static getVedicChart(
    birthDateOrContext: string | BirthContext, 
    birthTime = "12:00", 
    lon = 116.40, 
    lat = 39.90,
    timeZone?: string
  ): VedicChart {
    const ctx = this.toBirthContext(birthDateOrContext, birthTime, lon, lat, timeZone);
    const { utcDate } = parseCivilTimeToUtc(ctx.birthDate, ctx.birthTime, ctx.timeZone);

    const grahaData = calculateHighPrecisionGrahas(utcDate, {
      longitude: ctx.longitude,
      latitude: ctx.latitude,
      timeZone: ctx.timeZone,
    });

    const tropicalPlanets = grahaData.planets.map(p => ({
      name: p.name,
      longitude: p.tropicalLongitude,
    }));

    return buildVedicChart(
      ctx.birthDate, 
      ctx.birthTime, 
      tropicalPlanets, 
      grahaData.ascendant.tropical,
      grahaData.ayanamsa
    );
  }

  /**
   * Complete Domain Evaluation Package for Vedic Jyotish
   */
  static getVedicDomainEvaluation(
    birthDateOrContext: string | BirthContext, 
    birthTime = "12:00", 
    lon = 116.40, 
    lat = 39.90,
    timeZone?: string
  ): DomainEvaluationResult<VedicChart> {
    const chart = this.getVedicChart(birthDateOrContext, birthTime, lon, lat, timeZone);
    return {
      domain: 'vedic',
      chart,
      validation: chart.validation,
      evidences: chart.evidences,
      summaryTags: chart.summaryTags,
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Calculate Six-dimensional Vedic Synastry between two charts.
   */
  static getVedicSynastry(
    birthDateA: string, birthTimeA: string, nameA = '命主 A',
    birthDateB: string, birthTimeB: string, nameB = '命主 B',
    lon = 116.40, lat = 39.90,
    timeZone?: string
  ) {
    const chartA = this.getVedicChart(birthDateA, birthTimeA, lon, lat, timeZone);
    const chartB = this.getVedicChart(birthDateB, birthTimeB, lon, lat, timeZone);
    const matrix = calculateVedicSynastry(chartA, chartB, nameA, nameB);
    return { chartA, chartB, matrix };
  }
}
