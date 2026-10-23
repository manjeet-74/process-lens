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
  const rank = new Map<string, number>();
  for (const n of dfg.nodes) rank.set(n.activity, 0);
  for (const s of dfg.startActivities) rank.set(s.activity, 0);

  const n = dfg.nodes.length;
  for (let iter = 0; iter < n; iter++) {
    let changed = false;
    for (const e of dfg.edges) {
      const next = (rank.get(e.from) ?? 0) + 1;
      if (next > (rank.get(e.to) ?? 0) && next < n) {
        rank.set(e.to, next);
        changed = true;
      }
    }
    if (!changed) break;
  }

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
