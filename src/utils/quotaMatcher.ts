export type AdmissionChance = 'HIGH_CHANCE' | 'MODERATE_CHANCE' | 'DREAM_AMBITIOUS' | 'LOW_CHANCE';

export interface PredictionMatchResult {
  candidatePercentile: number;
  branchCutoff: number;
  difference: number;
  chance: AdmissionChance;
  isHomeUniversityEligible: boolean;
  recommendationNote: string;
}

/**
 * Evaluates candidate diploma/engineering percentile against historical cutoffs
 * to assign risk tiers and university quota eligibility.
 */
export function evaluateAdmissionChance(
  candidatePercentile: number,
  branchCutoff: number,
  candidateUniversity: string,
  instituteUniversity: string
): PredictionMatchResult {
  if (candidatePercentile < 0 || candidatePercentile > 100) {
    raiseInvalidPercentile(candidatePercentile);
  }
  if (branchCutoff < 0 || branchCutoff > 100) {
    raiseInvalidPercentile(branchCutoff);
  }

  const diff = Math.round((candidatePercentile - branchCutoff) * 100) / 100;
  const isHomeUniversity = candidateUniversity.trim().toLowerCase() === instituteUniversity.trim().toLowerCase();

  let chance: AdmissionChance;
  let note: string;

  if (diff >= 1.5) {
    chance = 'HIGH_CHANCE';
    note = 'Safe choice. Candidate percentile comfortably exceeds historical cutoff.';
  } else if (diff >= -1.0) {
    chance = 'MODERATE_CHANCE';
    note = 'Competitive target. High probability in Round 2 or Spot rounds.';
  } else if (diff >= -4.0) {
    chance = 'DREAM_AMBITIOUS';
    note = 'Ambitious reach. Recommended as top option form preference.';
  } else {
    chance = 'LOW_CHANCE';
    note = 'Unlikely based on previous year closing rank cutoffs.';
  }

  return {
    candidatePercentile,
    branchCutoff,
    difference: diff,
    chance,
    isHomeUniversityEligible: isHomeUniversity,
    recommendationNote: note,
  };
}

function raiseInvalidPercentile(val: number): never {
  throw new RangeError(`Percentile value ${val} must be between 0.0 and 100.0`);
}
