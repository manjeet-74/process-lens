import type { Trace, VariantResult } from "./types";

const SEP = " → ";

export function variantSignature(activities: string[]): string {
  return activities.join(SEP);
}

export function discoverVariants(traces: Trace[]): VariantResult {
  const total = traces.length;
  const counts = new Map<string, { path: string[]; count: number }>();
  for (const t of traces) {
    const sig = variantSignature(t.activities);
    const existing = counts.get(sig);
    if (existing) existing.count += 1;
    else counts.set(sig, { path: t.activities, count: 1 });
  }

  const variants = [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .map((v) => ({ path: v.path, count: v.count, coverage: total === 0 ? 0 : v.count / total }));

  return {
    variants,
    variantCount: variants.length,
    topVariantCoverage: variants.length === 0 ? 0 : variants[0].coverage,
  };
}

export function reworkRate(traces: Trace[]): number {
  if (traces.length === 0) return 0;
  let withRework = 0;
  for (const t of traces) {
    const seen = new Set<string>();
    let rework = false;
    for (const a of t.activities) {
      if (seen.has(a)) {
        rework = true;
        break;
      }
      seen.add(a);
    }
    if (rework) withRework += 1;
  }
  return withRework / traces.length;
}
