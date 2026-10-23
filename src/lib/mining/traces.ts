import type { EventLog, MiningEvent, Trace } from "./types";

function toMs(ts: string): number {
  const ms = Date.parse(ts);
  if (Number.isNaN(ms)) throw new Error(`Unparseable timestamp: ${ts}`);
  return ms;
}

export function buildTraces(log: EventLog): Trace[] {
  const byCase = new Map<string, MiningEvent[]>();
  for (const e of log.events) {
    const arr = byCase.get(e.caseId);
    if (arr) arr.push(e);
    else byCase.set(e.caseId, [e]);
  }

  const traces: Trace[] = [];
  for (const [caseId, events] of byCase) {
    const sorted = [...events].sort((a, b) => toMs(a.timestamp) - toMs(b.timestamp));
    const startMs = toMs(sorted[0].timestamp);
    const endMs = toMs(sorted[sorted.length - 1].timestamp);
    traces.push({
      caseId,
      events: sorted,
      activities: sorted.map((e) => e.activity),
      startMs,
      endMs,
      durationMs: endMs - startMs,
    });
  }
  return traces;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const idx = Math.min(s.length - 1, Math.max(0, Math.ceil((p / 100) * s.length) - 1));
  return s[idx];
}
