import type { Dfg, DfgEdge, DfgNode, Trace } from "./types";
import { median } from "./traces";

export function discoverDfg(traces: Trace[]): Dfg {
  const nodeFreq = new Map<string, number>();
  const nodeCaseFreq = new Map<string, Set<string>>();
  const startFreq = new Map<string, number>();
  const endFreq = new Map<string, number>();

  // edgeKey -> { freq, durations[] }
  const edges = new Map<string, { from: string; to: string; freq: number; durations: number[] }>();

  for (const t of traces) {
    const acts = t.activities;
    for (const a of acts) {
      nodeFreq.set(a, (nodeFreq.get(a) ?? 0) + 1);
      if (!nodeCaseFreq.has(a)) nodeCaseFreq.set(a, new Set());
      nodeCaseFreq.get(a)!.add(t.caseId);
    }
    if (acts.length > 0) {
      startFreq.set(acts[0], (startFreq.get(acts[0]) ?? 0) + 1);
      endFreq.set(acts[acts.length - 1], (endFreq.get(acts[acts.length - 1]) ?? 0) + 1);
    }
    for (let i = 0; i < t.events.length - 1; i++) {
      const from = t.events[i].activity;
      const to = t.events[i + 1].activity;
      const key = `${from}\u0000${to}`;
      const dur = Date.parse(t.events[i + 1].timestamp) - Date.parse(t.events[i].timestamp);
      const existing = edges.get(key);
      if (existing) {
        existing.freq += 1;
        existing.durations.push(dur);
      } else {
        edges.set(key, { from, to, freq: 1, durations: [dur] });
      }
    }
  }

  const nodes: DfgNode[] = [...nodeFreq.keys()].map((activity) => ({
    activity,
    frequency: nodeFreq.get(activity)!,
    caseFrequency: nodeCaseFreq.get(activity)!.size,
    isStart: startFreq.has(activity),
    isEnd: endFreq.has(activity),
  }));

  const dfgEdges: DfgEdge[] = [...edges.values()].map((e) => {
    const avg = e.durations.reduce((s, d) => s + d, 0) / e.durations.length;
    return {
      from: e.from,
      to: e.to,
      frequency: e.freq,
      avgDurationMs: avg,
      medianDurationMs: median(e.durations),
    };
  });

  const sortDesc = (m: Map<string, number>) =>
    [...m.entries()].map(([activity, frequency]) => ({ activity, frequency })).sort((a, b) => b.frequency - a.frequency);

  return {
    nodes: nodes.sort((a, b) => b.frequency - a.frequency),
    edges: dfgEdges.sort((a, b) => b.frequency - a.frequency),
    startActivities: sortDesc(startFreq),
    endActivities: sortDesc(endFreq),
  };
}
