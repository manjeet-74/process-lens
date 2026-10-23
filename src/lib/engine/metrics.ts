import type { Event } from "@/lib/data/types";

export const EXCEPTION_ACTIVITIES = [
  "Cancel Order",
  "Return to Requester",
  "Reject Invoice",
  "Reject Application",
  "Reject Expense",
];

/** Group events by caseId, preserving insertion order within each case. */
function groupByCases(events: Event[]): Map<string, Event[]> {
  const map = new Map<string, Event[]>();
  for (const e of events) {
    if (!map.has(e.caseId)) map.set(e.caseId, []);
    map.get(e.caseId)!.push(e);
  }
  // sort events within each case by timestamp
  for (const [, evts] of map) {
    evts.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
  return map;
}

export function caseCount(events: Event[]): number {
  return new Set(events.map((e) => e.caseId)).size;
}

export function eventCount(events: Event[]): number {
  return events.length;
}

export interface VariantResult {
  variantCount: number;
  topVariantCoverage: number; // 0–1: fraction of cases on the most common path
  variants: Array<{ path: string[]; count: number }>;
}

export function variants(events: Event[]): VariantResult {
  const cases = groupByCases(events);
  const variantMap = new Map<string, number>();

  for (const evts of cases.values()) {
    const path = evts.map((e) => e.activity).join(" → ");
    variantMap.set(path, (variantMap.get(path) ?? 0) + 1);
  }

  const total = cases.size;
  const sorted = [...variantMap.entries()]
    .map(([path, count]) => ({ path: path.split(" → "), count }))
    .sort((a, b) => b.count - a.count);

  const topCount = sorted[0]?.count ?? 0;
  return {
    variantCount: variantMap.size,
    topVariantCoverage: total > 0 ? topCount / total : 0,
    variants: sorted,
  };
}

export function reworkRate(events: Event[]): number {
  const cases = groupByCases(events);
  let reworkCount = 0;
  for (const evts of cases.values()) {
    const activities = evts.map((e) => e.activity);
    const unique = new Set(activities);
    if (activities.length > unique.size) reworkCount++;
  }
  return cases.size > 0 ? reworkCount / cases.size : 0;
}

export function exceptionRate(events: Event[]): number {
  const cases = groupByCases(events);
  let exceptionCount = 0;
  for (const evts of cases.values()) {
    if (evts.some((e) => EXCEPTION_ACTIVITIES.includes(e.activity))) {
      exceptionCount++;
    }
  }
  return cases.size > 0 ? exceptionCount / cases.size : 0;
}

export interface CycleTimeResult {
  avgMs: number;
  medianMs: number;
}

export function cycleTime(events: Event[]): CycleTimeResult {
  const cases = groupByCases(events);
  const durations: number[] = [];

  for (const evts of cases.values()) {
    if (evts.length < 2) continue;
    const start = new Date(evts[0].timestamp).getTime();
    const end = new Date(evts[evts.length - 1].timestamp).getTime();
    durations.push(end - start);
  }

  if (durations.length === 0) return { avgMs: 0, medianMs: 0 };

  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const sorted = [...durations].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];

  return { avgMs: avg, medianMs: median };
}

export interface BottleneckResult {
  activity: string;
  avgWaitMs: number;
}

export function bottleneck(events: Event[]): BottleneckResult {
  const cases = groupByCases(events);
  const waitTotals = new Map<string, number>();
  const waitCounts = new Map<string, number>();

  for (const evts of cases.values()) {
    for (let i = 1; i < evts.length; i++) {
      const prev = new Date(evts[i - 1].timestamp).getTime();
      const curr = new Date(evts[i].timestamp).getTime();
      const wait = curr - prev;
      const act = evts[i].activity;
      waitTotals.set(act, (waitTotals.get(act) ?? 0) + wait);
      waitCounts.set(act, (waitCounts.get(act) ?? 0) + 1);
    }
  }

  let maxActivity = "";
  let maxAvg = 0;
  for (const [act, total] of waitTotals.entries()) {
    const avg = total / waitCounts.get(act)!;
    if (avg > maxAvg) { maxAvg = avg; maxActivity = act; }
  }

  return { activity: maxActivity, avgWaitMs: maxAvg };
}
