import { variants, reworkRate, exceptionRate, cycleTime, caseCount } from "./metrics";
import type { Event } from "@/lib/data/types";

export interface ScoreFactor {
  name: string;
  value: number;   // 0–1 normalized
  weight: number;
  contribution: number; // value * weight
}

export interface ScoreResult {
  score: number; // 0–100
  factors: ScoreFactor[];
}

const WEIGHTS = {
  standardization: 0.30,
  stability: 0.25,
  cleanliness: 0.20,
  volume: 0.15,
  speed: 0.10,
} as const;

/** Normalize case count log-scale between 0 and 1, assuming typical range 10–500. */
function normalizeVolume(n: number): number {
  const min = Math.log(10);
  const max = Math.log(500);
  return Math.min(1, Math.max(0, (Math.log(Math.max(1, n)) - min) / (max - min)));
}

/**
 * Normalize inverse cycle time. Faster = higher score.
 * Reference range: 1 hour (3_600_000 ms) → best, 30 days (2_592_000_000 ms) → worst.
 */
function normalizeSpeed(medianMs: number): number {
  const best = Math.log(3_600_000);
  const worst = Math.log(2_592_000_000);
  if (medianMs <= 0) return 0;
  const val = Math.log(Math.max(3_600_000, Math.min(2_592_000_000, medianMs)));
  return 1 - (val - best) / (worst - best);
}

export function scoreProcess(events: Event[]): ScoreResult {
  const v = variants(events);
  const rw = reworkRate(events);
  const ex = exceptionRate(events);
  const ct = cycleTime(events);
  const cc = caseCount(events);

  const factorValues: Record<keyof typeof WEIGHTS, number> = {
    standardization: v.topVariantCoverage,
    stability: 1 - rw,
    cleanliness: 1 - ex,
    volume: normalizeVolume(cc),
    speed: normalizeSpeed(ct.medianMs),
  };

  const factors: ScoreFactor[] = (Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>).map((name) => ({
    name,
    value: factorValues[name],
    weight: WEIGHTS[name],
    contribution: factorValues[name] * WEIGHTS[name],
  }));

  const score = Math.round(100 * factors.reduce((sum, f) => sum + f.contribution, 0));

  return { score, factors };
}
