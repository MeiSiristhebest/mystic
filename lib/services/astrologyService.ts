import { 
  getPreciseAscendant, 
  calculateAspects, 
  getSunSign, 
  getZodiacFromLongitude 
} from "@/lib/astrology";
import { buildVedicChart, calculateVedicSynastry } from "@/lib/vedic";

export class AstrologyService {
  /**
   * Get Western Sun Sign from Date.
   */
  static getSunSign(date: Date): string {
    return getSunSign(date);
  }

  /**
   * Calculate complete western astrology star chart with planets, houses, ascendant and aspects.
   */
  static getStarChart(birthDate: string, birthTime: string, lon = 116.40, lat = 39.90) {
    const d = new Date(birthDate);
    const [h, m] = (birthTime || "12:00").split(":").map(Number);
    d.setHours(h, m, 0, 0);

    const ascendant = getPreciseAscendant(d, birthTime, lon, lat);
    const sunSign = getSunSign(d);

    // Approximate classical planets longitudes
    const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
    const sunLon = ((dayOfYear - 80) * 0.9856 + 360) % 360;
    const moonLon = (sunLon + 120 + (d.getDate() * 13.176)) % 360;
    const mercuryLon = (sunLon + Math.sin(dayOfYear / 10) * 22 + 360) % 360;
    const venusLon = (sunLon + Math.cos(dayOfYear / 15) * 44 + 360) % 360;
    const marsLon = (sunLon * 0.524 + 180) % 360;
    const jupiterLon = (d.getFullYear() * 30.35) % 360;
    const saturnLon = (d.getFullYear() * 12.22) % 360;

    const planets = [
      { name: "太阳", symbol: "☉", longitude: sunLon, sign: getZodiacFromLongitude(sunLon) },
      { name: "月亮", symbol: "☽", longitude: moonLon, sign: getZodiacFromLongitude(moonLon) },
      { name: "水星", symbol: "☿", longitude: mercuryLon, sign: getZodiacFromLongitude(mercuryLon) },
      { name: "金星", symbol: "♀", longitude: venusLon, sign: getZodiacFromLongitude(venusLon) },
      { name: "火星", symbol: "♂", longitude: marsLon, sign: getZodiacFromLongitude(marsLon) },
      { name: "木星", symbol: "♃", longitude: jupiterLon, sign: getZodiacFromLongitude(jupiterLon) },
      { name: "土星", symbol: "♄", longitude: saturnLon, sign: getZodiacFromLongitude(saturnLon) },
    ];

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
    };
  }

  /**
   * Calculate Vedic astrology chart with sidereal ayanamsa & 27 nakshatras.
   */
  static getVedicChart(birthDate: string, birthTime: string, lon = 116.40, lat = 39.90) {
    const starChart = this.getStarChart(birthDate, birthTime, lon, lat);
    const tropicalPlanets = [
      { name: 'Sun', longitude: starChart.planets[0].longitude },
      { name: 'Moon', longitude: starChart.planets[1].longitude },
      { name: 'Mars', longitude: starChart.planets[4].longitude },
      { name: 'Mercury', longitude: starChart.planets[2].longitude },
      { name: 'Jupiter', longitude: starChart.planets[5].longitude },
      { name: 'Venus', longitude: starChart.planets[3].longitude },
      { name: 'Saturn', longitude: starChart.planets[6].longitude },
      { name: 'Rahu', longitude: (starChart.planets[6].longitude + 180) % 360 },
      { name: 'Ketu', longitude: starChart.planets[6].longitude },
    ];

    return buildVedicChart(birthDate, birthTime, tropicalPlanets, starChart.ascendant.longitude);
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
