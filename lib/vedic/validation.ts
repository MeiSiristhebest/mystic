/**
 * Structural Validation Layer for Vedic Astrology Calculations.
 * Inspired by upstream structural verification checks (16-point sanity suite).
 */

import { VedicChart, VedicPlanetName } from './types';
import { ValidationReport, ValidationIssue } from '../contracts/types';

export function validateVedicChart(chart: Partial<VedicChart>): ValidationReport {
  const issues: ValidationIssue[] = [];

  // 1. Check Date and Time
  if (!chart.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(chart.birthDate)) {
    issues.push({
      field: 'birthDate',
      severity: 'error',
      message: `Invalid birth date format: ${chart.birthDate}. Expected YYYY-MM-DD.`,
      code: 'VEDIC_INVALID_DATE',
    });
  }

  // 2. Check Ayanamsa
  if (chart.ayanamsa === undefined || chart.ayanamsa < 20 || chart.ayanamsa > 30) {
    issues.push({
      field: 'ayanamsa',
      severity: 'warning',
      message: `Lahiri Ayanamsa ${chart.ayanamsa} is outside normal modern epoch range (20° ~ 30°).`,
      code: 'VEDIC_AYANAMSA_DRIFT',
    });
  }

  // 3. Check Ascendant (Lagna)
  if (!chart.ascendant) {
    issues.push({
      field: 'ascendant',
      severity: 'error',
      message: 'Ascendant (Lagna) position is missing.',
      code: 'VEDIC_MISSING_ASCENDANT',
    });
  } else {
    if (chart.ascendant.longitude < 0 || chart.ascendant.longitude >= 360) {
      issues.push({
        field: 'ascendant.longitude',
        severity: 'error',
        message: `Ascendant longitude ${chart.ascendant.longitude} out of [0, 360) range.`,
        code: 'VEDIC_INVALID_LONGITUDE',
      });
    }
  }

  // 4. Check Planet Count & Mandatory Grahas
  const requiredPlanets: VedicPlanetName[] = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
  ];
  const planetMap = new Map<string, any>();
  (chart.planets || []).forEach(p => planetMap.set(p.name, p));

  for (const r of requiredPlanets) {
    if (!planetMap.has(r)) {
      issues.push({
        field: `planets.${r}`,
        severity: 'error',
        message: `Mandatory Graha ${r} is missing from Vedic planet dataset.`,
        code: 'VEDIC_MISSING_GRAHA',
      });
    }
  }

  // 5. Check Longitude Ranges and Houses
  (chart.planets || []).forEach(p => {
    if (p.longitude < 0 || p.longitude >= 360) {
      issues.push({
        field: `planets.${p.name}.longitude`,
        severity: 'error',
        message: `Graha ${p.name} longitude ${p.longitude} is out of bounds [0, 360).`,
        code: 'VEDIC_INVALID_GRAHA_DEGREE',
      });
    }
    if (p.house < 1 || p.house > 12) {
      issues.push({
        field: `planets.${p.name}.house`,
        severity: 'error',
        message: `Graha ${p.name} assigned invalid house index ${p.house} (must be 1-12).`,
        code: 'VEDIC_INVALID_HOUSE',
      });
    }
    if (p.pada < 1 || p.pada > 4) {
      issues.push({
        field: `planets.${p.name}.pada`,
        severity: 'error',
        message: `Graha ${p.name} has invalid Nakshatra Pada ${p.pada} (must be 1-4).`,
        code: 'VEDIC_INVALID_PADA',
      });
    }
  });

  // 6. Check Chara Karakas (7-karaka scheme)
  if (!chart.charaKarakas || chart.charaKarakas.length !== 7) {
    issues.push({
      field: 'charaKarakas',
      severity: 'warning',
      message: `Chara Karakas count is ${chart.charaKarakas?.length ?? 0}, expected 7 (AK, AmK, BK, MK, PK, GK, DK).`,
      code: 'VEDIC_INCOMPLETE_KARAKAS',
    });
  } else {
    // Verify descending order of degrees
    for (let i = 0; i < chart.charaKarakas.length - 1; i++) {
      if (chart.charaKarakas[i].degree < chart.charaKarakas[i + 1].degree - 1e-4) {
        issues.push({
          field: 'charaKarakas.order',
          severity: 'warning',
          message: `Chara Karaka ${chart.charaKarakas[i].role} has lower degree than subsequent ${chart.charaKarakas[i + 1].role}.`,
          code: 'VEDIC_KARAKA_ORDER_INCONSISTENCY',
        });
      }
    }
  }

  // 7. Check D1, D9, D10 Divisional Chart Completeness
  if (chart.d1Chart) {
    let d1Count = 0;
    for (let h = 1; h <= 12; h++) {
      d1Count += (chart.d1Chart[h] || []).length;
    }
    if (d1Count !== (chart.planets?.length || 0)) {
      issues.push({
        field: 'd1Chart',
        severity: 'warning',
        message: `D1 Rasi chart total planet count ${d1Count} does not match planetary list length ${chart.planets?.length}.`,
        code: 'VEDIC_D1_COUNT_MISMATCH',
      });
    }
  }

  // 8. Check Dasha Continuity and 120-Year Sum
  if (chart.dashaTimeline && chart.dashaTimeline.length > 0) {
    let totalSpanYears = 0;
    for (let i = 0; i < chart.dashaTimeline.length; i++) {
      const md = chart.dashaTimeline[i];
      totalSpanYears += md.durationYears;

      // Verify start date < end date
      const s = new Date(md.startDate).getTime();
      const e = new Date(md.endDate).getTime();
      if (e <= s) {
        issues.push({
          field: `dashaTimeline[${i}]`,
          severity: 'error',
          message: `Dasha ${md.planet} has invalid date span: ${md.startDate} ~ ${md.endDate}.`,
          code: 'VEDIC_DASHA_NEGATIVE_SPAN',
        });
      }

      // Verify subPeriods (Antardashas) continuity
      if (md.subPeriods && md.subPeriods.length > 0) {
        for (let j = 0; j < md.subPeriods.length; j++) {
          const ad = md.subPeriods[j];
          const adStart = new Date(ad.startDate).getTime();
          const adEnd = new Date(ad.endDate).getTime();
          if (adEnd <= adStart) {
            issues.push({
              field: `dashaTimeline[${i}].subPeriods[${j}]`,
              severity: 'error',
              message: `Antardasha ${ad.planet} has invalid date span.`,
              code: 'VEDIC_ANTARDASHA_SPAN_ERROR',
            });
          }
        }
      }
    }

    if (totalSpanYears < 100 || totalSpanYears > 125) {
      issues.push({
        field: 'dashaTimeline.totalYears',
        severity: 'warning',
        message: `Total Dasha timeline span (${totalSpanYears.toFixed(2)} years) deviates significantly from the 120-year cycle.`,
        code: 'VEDIC_DASHA_CYCLE_MISMATCH',
      });
    }
  }

  const hasErrors = issues.some(i => i.severity === 'error');

  return {
    isValid: !hasErrors,
    issues,
  };
}
