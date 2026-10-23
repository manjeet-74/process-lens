import type { ConformanceResult, PerformanceResult, ScoreResult, VariantResult } from "./types";

export interface ScoreInputs {
  topVariantCoverage: number;
  avgFitness: number;
  reworkRate: number;
  deviationRate: number;
  caseCount: number;
  medianCycleMs: number;
}

const WEIGHTS = {
  standardization: 0.25,
  conformance: 0.25,
  stability: 0.2,
  cleanliness: 0.15,
  volume: 0.1,
  speed: 0.05,
};

// log-normalize case volume: 0 at 1 case, ~1 at 10k cases
function volumeScore(caseCount: number): number {
  if (caseCount <= 1) return 0;
  return Math.min(1, Math.log10(caseCount) / 4);
}

// faster = higher; 1h median -> ~1, 1 week median -> near 0
function speedScore(medianCycleMs: number): number {
  if (medianCycleMs <= 0) return 1;
  const hours = medianCycleMs / 3_600_000;
  return Math.max(0, Math.min(1, 1 - Math.log10(hours + 1) / Math.log10(24 * 14 + 1)));
}

export function computeScore(inputs: ScoreInputs): ScoreResult {
  const values = {
    standardization: clamp01(inputs.topVariantCoverage),
    conformance: clamp01(inputs.avgFitness),
    stability: clamp01(1 - inputs.reworkRate),
    cleanliness: clamp01(1 - inputs.deviationRate),
    volume: volumeScore(inputs.caseCount),
    speed: speedScore(inputs.medianCycleMs),
  };

  const factors = (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).map((name) => {
    const weight = WEIGHTS[name];
    const value = values[name];
    return { name, value, weight, contribution: value * weight };
  });

  const score = Math.round(100 * factors.reduce((s, f) => s + f.contribution, 0));
  return { score, factors };
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function scoreInputsFrom(
  variants: VariantResult,
  conformance: ConformanceResult,
  performance: PerformanceResult,
  reworkRate: number,
  caseCount: number
): ScoreInputs {
  return {
    topVariantCoverage: variants.topVariantCoverage,
    avgFitness: conformance.avgFitness,
    reworkRate,
    deviationRate: conformance.deviationRate,
    caseCount,
    medianCycleMs: performance.medianCycleMs,
  };
}
