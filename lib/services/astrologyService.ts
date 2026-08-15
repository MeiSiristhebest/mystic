import { 
  getPreciseAscendant, 
  calculateAspects, 
  getSunSign, 
  getZodiacFromLongitude 
} from "@/lib/astrology";
import { 
  buildVedicChart, 
  calculateVedicSynastry, 
  VedicChart,
  calculateHighPrecisionGrahas 
} from "@/lib/vedic";
import { DomainEvaluationResult } from "@/lib/contracts/types";

export class AstrologyService {
  /**
   * Get Western Sun Sign from Date.
   */
  static getSunSign(date: Date): string {
    return getSunSign(date);
  }

  /**
   * Calculate complete western astrology star chart with high-precision astronomical ephemeris.
   */
  static getStarChart(birthDate: string, birthTime: string, lon = 116.40, lat = 39.90) {
    const d = new Date(birthDate);
    const [h, m] = (birthTime || "12:00").split(":").map(Number);
    d.setHours(h, m, 0, 0);

    const ascendant = getPreciseAscendant(d, birthTime, lon, lat);
    const sunSign = getSunSign(d);

    // Compute High Precision Planetary Positions via Ephemeris / VSOP87
    const grahaData = calculateHighPrecisionGrahas(d, {
      longitude: lon,
      latitude: lat,
      timezoneOffsetHours: 8,
    });

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

    // Placidus / Equal 12 Houses from Ascendant
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
      },
    };
  }

  /**
   * Calculate Vedic astrology chart with high precision sidereal ayanamsa & 27 nakshatras.
   */
  static getVedicChart(birthDate: string, birthTime: string, lon = 116.40, lat = 39.90): VedicChart {
    const d = new Date(birthDate);
    const [h, m] = (birthTime || "12:00").split(":").map(Number);
    d.setHours(h, m, 0, 0);

    const grahaData = calculateHighPrecisionGrahas(d, {
      longitude: lon,
      latitude: lat,
      timezoneOffsetHours: 8,
    });

    const tropicalPlanets = grahaData.planets.map(p => ({
      name: p.name,
      longitude: p.tropicalLongitude,
    }));

    return buildVedicChart(
      birthDate, 
      birthTime, 
      tropicalPlanets, 
      grahaData.ascendant.tropical,
      grahaData.ayanamsa
    );
  }

  /**
   * Complete Domain Evaluation Package for Vedic Jyotish
   */
  static getVedicDomainEvaluation(birthDate: string, birthTime: string, lon = 116.40, lat = 39.90): DomainEvaluationResult<VedicChart> {
    const chart = this.getVedicChart(birthDate, birthTime, lon, lat);
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
    lon = 116.40, lat = 39.90
  ) {
    const chartA = this.getVedicChart(birthDateA, birthTimeA, lon, lat);
    const chartB = this.getVedicChart(birthDateB, birthTimeB, lon, lat);
    const matrix = calculateVedicSynastry(chartA, chartB, nameA, nameB);
    return { chartA, chartB, matrix };
  }
}
