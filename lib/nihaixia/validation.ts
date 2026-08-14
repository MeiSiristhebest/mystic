/**
 * Validation Layer for TCM / Ni Haixia Diagnostic Inputs and Standards.
 */

import { ValidationReport, ValidationIssue } from '../contracts/types';

export function validateHealthAnswers(answers: Record<string, number>): ValidationReport {
  const issues: ValidationIssue[] = [];
  const expectedDimensions = [
    'sleep', 'appetite', 'thirst', 'bowel', 'urine', 'temperature', 'sweat', 'vitality'
  ];

  for (const dim of expectedDimensions) {
    const val = answers[dim];
    if (val === undefined) {
      issues.push({
        field: `answers.${dim}`,
        severity: 'info',
        message: `Health standard dimension '${dim}' is not explicitly provided; defaulting to baseline.`,
        code: 'TCM_DIMENSION_DEFAULTED',
      });
    } else if (typeof val !== 'number' || isNaN(val) || val < 0 || val > 100) {
      issues.push({
        field: `answers.${dim}`,
        severity: 'error',
        message: `Health standard dimension '${dim}' score ${val} must be a number between 0 and 100.`,
        code: 'TCM_INVALID_DIMENSION_SCORE',
      });
    }
  }

  return {
    isValid: !issues.some(i => i.severity === 'error'),
    issues,
  };
}
