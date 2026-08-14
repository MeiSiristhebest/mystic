/**
 * Validation Layer for Ziwei Doushu Chart Structure and Star Placements.
 */

import { ZiweiChart } from './types';
import { ValidationReport, ValidationIssue } from '../contracts/types';

export const MAJOR_14_STARS = [
  '紫微', '天机', '太阳', '武曲', '天同', '廉贞',
  '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'
];

export function validateZiweiChart(chart: Partial<ZiweiChart>): ValidationReport {
  const issues: ValidationIssue[] = [];

  // 1. Check Palaces Count
  if (!chart.palaces || chart.palaces.length !== 12) {
    issues.push({
      field: 'palaces',
      severity: 'error',
      message: `Ziwei chart palaces count is ${chart.palaces?.length ?? 0}, expected exactly 12.`,
      code: 'ZIWEI_INVALID_PALACE_COUNT',
    });
  } else {
    // Check branch indexing 0-11 coverage
    const branchSet = new Set(chart.palaces.map(p => p.branch));
    if (branchSet.size !== 12) {
      issues.push({
        field: 'palaces.branches',
        severity: 'error',
        message: 'Ziwei palaces do not cover all 12 Earthly Branches (0-11).',
        code: 'ZIWEI_BRANCH_COVERAGE_ERROR',
      });
    }
  }

  // 2. Check Ming Gong & Shen Gong
  if (chart.mingGongBranch === undefined || chart.mingGongBranch < 0 || chart.mingGongBranch > 11) {
    issues.push({
      field: 'mingGongBranch',
      severity: 'error',
      message: `Invalid Ming Gong branch index: ${chart.mingGongBranch}.`,
      code: 'ZIWEI_INVALID_MING_GONG',
    });
  }

  if (chart.shenGongBranch === undefined || chart.shenGongBranch < 0 || chart.shenGongBranch > 11) {
    issues.push({
      field: 'shenGongBranch',
      severity: 'error',
      message: `Invalid Shen Gong branch index: ${chart.shenGongBranch}.`,
      code: 'ZIWEI_INVALID_SHEN_GONG',
    });
  }

  // 3. Check 14 Major Stars Distribution
  if (chart.palaces) {
    const starDistribution = new Map<string, number>();
    MAJOR_14_STARS.forEach(s => starDistribution.set(s, 0));

    chart.palaces.forEach(p => {
      p.stars.forEach(s => {
        if (s.type === 'major' && starDistribution.has(s.name)) {
          starDistribution.set(s.name, (starDistribution.get(s.name) || 0) + 1);
        }
      });
    });

    for (const [starName, count] of starDistribution.entries()) {
      if (count === 0) {
        issues.push({
          field: `stars.${starName}`,
          severity: 'error',
          message: `Major star '${starName}' is missing from the chart.`,
          code: 'ZIWEI_MISSING_MAJOR_STAR',
        });
      } else if (count > 1) {
        issues.push({
          field: `stars.${starName}`,
          severity: 'error',
          message: `Major star '${starName}' appears multiple times (${count}) in the chart.`,
          code: 'ZIWEI_DUPLICATE_MAJOR_STAR',
        });
      }
    }
  }

  // 4. Check Da Xian Age Spans
  if (chart.daXians && chart.daXians.length > 0) {
    for (let i = 0; i < chart.daXians.length - 1; i++) {
      const current = chart.daXians[i];
      const next = chart.daXians[i + 1];
      if (current.endAge >= next.startAge) {
        issues.push({
          field: `daXians[${i}]`,
          severity: 'warning',
          message: `DaXian ${current.palaceName} (${current.startAge}-${current.endAge}) overlaps with next DaXian (${next.startAge}-${next.endAge}).`,
          code: 'ZIWEI_DAXIAN_OVERLAP',
        });
      }
    }
  }

  return {
    isValid: !issues.some(i => i.severity === 'error'),
    issues,
  };
}
