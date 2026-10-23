import type { Dfg } from "./types";

export interface LaidOutNode {
  activity: string;
  x: number;
  y: number;
  frequency: number;
  caseFrequency: number;
  isStart: boolean;
  isEnd: boolean;
  rank: number;
}

export interface LayoutResult {
  nodes: LaidOutNode[];
  width: number;
  height: number;
}

const COL_W = 240;
const ROW_H = 110;

/**
 * Layered left-to-right layout. Ranks are assigned by longest forward path from
 * a start activity; relaxation is bounded by node count so rework cycles can't loop forever.
 */
export function layoutDfg(dfg: Dfg): LayoutResult {
  // Shortest-path (BFS) layering from the start activities, ignoring self-loops.
  // BFS depth avoids the rank inflation that rework/back-edges cause in longest-path relaxation.
  const adj = new Map<string, string[]>();
  for (const e of dfg.edges) {
    if (e.from === e.to) continue;
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }

  const rank = new Map<string, number>();
  const queue: string[] = [];
  const seeds = dfg.startActivities.length ? dfg.startActivities.map((s) => s.activity) : dfg.nodes.slice(0, 1).map((n) => n.activity);
  for (const s of seeds) {
    if (!rank.has(s)) {
      rank.set(s, 0);
      queue.push(s);
    }
  }
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head];
    const d = rank.get(cur)!;
    for (const nx of adj.get(cur) ?? []) {
      if (!rank.has(nx)) {
        rank.set(nx, d + 1);
        queue.push(nx);
      }
    }
  }
  for (const node of dfg.nodes) if (!rank.has(node.activity)) rank.set(node.activity, 0);

  // group by rank, order within rank by frequency desc
  const byRank = new Map<number, string[]>();
  for (const node of dfg.nodes) {
    const r = rank.get(node.activity) ?? 0;
    if (!byRank.has(r)) byRank.set(r, []);
    byRank.get(r)!.push(node.activity);
  }

  const freq = new Map(dfg.nodes.map((nd) => [nd.activity, nd.frequency]));
  const nodes: LaidOutNode[] = [];
  let maxRank = 0;
  let maxCol = 0;
  for (const [r, acts] of byRank) {
    acts.sort((a, b) => (freq.get(b) ?? 0) - (freq.get(a) ?? 0));
    maxRank = Math.max(maxRank, r);
    maxCol = Math.max(maxCol, acts.length);
    acts.forEach((activity, i) => {
      const nd = dfg.nodes.find((x) => x.activity === activity)!;
      nodes.push({
        activity,
        x: r * COL_W,
        y: i * ROW_H,
        frequency: nd.frequency,
        caseFrequency: nd.caseFrequency,
        isStart: nd.isStart,
        isEnd: nd.isEnd,
        rank: r,
      });
    });
  }

  return { nodes, width: (maxRank + 1) * COL_W, height: Math.max(1, maxCol) * ROW_H };
}
