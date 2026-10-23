import type { ConformanceResult, Trace, VariantResult } from "./types";

function levenshtein(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

export function traceFitness(trace: string[], reference: string[]): number {
  const maxLen = Math.max(trace.length, reference.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein(trace, reference);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Sequence-alignment-based conformance against a reference path.
 * By default the reference is the most frequent variant (the discovered "happy path").
 */
export function checkConformance(
  traces: Trace[],
  variants: VariantResult,
  referenceOverride?: string[]
): ConformanceResult {
  const reference = referenceOverride ?? variants.variants[0]?.path ?? [];
  const refSet = new Set(reference);

  let fitnessSum = 0;
  let conforming = 0;
  const inserted = new Map<string, number>();
  const skipped = new Map<string, number>();

  for (const t of traces) {
    const fitness = traceFitness(t.activities, reference);
    fitnessSum += fitness;
    const exact = fitness === 1;
    if (exact) {
      conforming += 1;
      continue;
    }
    const traceSet = new Set(t.activities);
    for (const a of traceSet) {
      if (!refSet.has(a)) inserted.set(a, (inserted.get(a) ?? 0) + 1);
    }
    for (const a of refSet) {
      if (!traceSet.has(a)) skipped.set(a, (skipped.get(a) ?? 0) + 1);
    }
  }

  const total = traces.length || 1;
  const topDeviations = [
    ...[...inserted.entries()].map(([activity, cases]) => ({ kind: "inserted" as const, activity, cases })),
    ...[...skipped.entries()].map(([activity, cases]) => ({ kind: "skipped" as const, activity, cases })),
  ]
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 8);

  const nonConformingVariants = variants.variants
    .filter((v) => traceFitness(v.path, reference) < 1)
    .slice(0, 5)
    .map((v) => ({ path: v.path, count: v.count, fitness: traceFitness(v.path, reference) }));

  return {
    referencePath: reference,
    avgFitness: fitnessSum / total,
    conformingRate: conforming / total,
    deviationRate: 1 - conforming / total,
    topDeviations,
    nonConformingVariants,
  };
}
