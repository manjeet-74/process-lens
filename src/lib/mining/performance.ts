import type { Dfg, PerformanceResult, Trace } from "./types";
import { median, percentile } from "./traces";

export function analyzePerformance(traces: Trace[], dfg: Dfg): PerformanceResult {
  const durations = traces.map((t) => t.durationMs);
  const avgCycleMs = durations.length ? durations.reduce((s, d) => s + d, 0) / durations.length : 0;

  // Bottleneck: activity with the largest average inbound wait time, weighted across incoming edges.
  const inbound = new Map<string, { totalWait: number; count: number }>();
  for (const e of dfg.edges) {
    const agg = inbound.get(e.to) ?? { totalWait: 0, count: 0 };
    agg.totalWait += e.avgDurationMs * e.frequency;
    agg.count += e.frequency;
    inbound.set(e.to, agg);
  }

  let bottleneck = { activity: "", avgWaitMs: 0 };
  for (const [activity, agg] of inbound) {
    const avgWait = agg.count ? agg.totalWait / agg.count : 0;
    if (avgWait > bottleneck.avgWaitMs) bottleneck = { activity, avgWaitMs: avgWait };
  }

  const slowestEdges = [...dfg.edges]
    .sort((a, b) => b.avgDurationMs - a.avgDurationMs)
    .slice(0, 5)
    .map((e) => ({ from: e.from, to: e.to, avgDurationMs: e.avgDurationMs }));

  return {
    avgCycleMs,
    medianCycleMs: median(durations),
    p95CycleMs: percentile(durations, 95),
    bottleneck,
    slowestEdges,
  };
}
