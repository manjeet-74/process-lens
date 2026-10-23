import { describe, it, expect } from "vitest";
import type { EventLog, MiningEvent } from "./types";
import { buildTraces } from "./traces";
import { discoverDfg } from "./dfg";
import { discoverVariants, reworkRate } from "./variants";
import { analyzePerformance } from "./performance";
import { checkConformance, traceFitness } from "./conformance";
import { computeScore } from "./score";
import { analyzeLog } from "./analyze";
import { parseEventLogCsv } from "./parse";

const HOUR = 3_600_000;

function ev(caseId: string, activity: string, hourOffset: number): MiningEvent {
  return {
    caseId,
    activity,
    timestamp: new Date(Date.UTC(2024, 0, 1, hourOffset)).toISOString(),
    resource: "r1",
  };
}

// Two happy-path cases (A->B->C) and one with rework + deviation (A->B->B->X->C)
const log: EventLog = {
  name: "Test",
  events: [
    ev("1", "A", 0), ev("1", "B", 1), ev("1", "C", 2),
    ev("2", "A", 0), ev("2", "B", 3), ev("2", "C", 4),
    ev("3", "A", 0), ev("3", "B", 1), ev("3", "B", 2), ev("3", "X", 3), ev("3", "C", 10),
  ],
};

describe("buildTraces", () => {
  it("groups events by case and sorts by time", () => {
    const traces = buildTraces(log);
    expect(traces).toHaveLength(3);
    const t1 = traces.find((t) => t.caseId === "1")!;
    expect(t1.activities).toEqual(["A", "B", "C"]);
    expect(t1.durationMs).toBe(2 * HOUR);
  });
});

describe("discoverDfg", () => {
  it("counts directly-follows relations and node frequencies", () => {
    const dfg = discoverDfg(buildTraces(log));
    const ab = dfg.edges.find((e) => e.from === "A" && e.to === "B")!;
    expect(ab.frequency).toBe(3);
    const bc = dfg.edges.find((e) => e.from === "B" && e.to === "C")!;
    expect(bc.frequency).toBe(2); // only cases 1 and 2 go B->C directly
    const nodeB = dfg.nodes.find((n) => n.activity === "B")!;
    expect(nodeB.frequency).toBe(4); // B occurs 4 times total (incl. rework)
    expect(nodeB.caseFrequency).toBe(3);
    expect(dfg.startActivities[0].activity).toBe("A");
    expect(dfg.endActivities[0].activity).toBe("C");
  });

  it("computes edge durations", () => {
    const dfg = discoverDfg(buildTraces(log));
    const ab = dfg.edges.find((e) => e.from === "A" && e.to === "B")!;
    // case1: 1h, case2: 3h, case3: 1h => avg (1+3+1)/3 h
    expect(ab.avgDurationMs).toBeCloseTo((5 / 3) * HOUR);
  });
});

describe("discoverVariants", () => {
  it("finds distinct variants with coverage", () => {
    const v = discoverVariants(buildTraces(log));
    expect(v.variantCount).toBe(2);
    expect(v.variants[0].path).toEqual(["A", "B", "C"]);
    expect(v.variants[0].count).toBe(2);
    expect(v.topVariantCoverage).toBeCloseTo(2 / 3);
  });
});

describe("reworkRate", () => {
  it("flags cases with repeated activities", () => {
    expect(reworkRate(buildTraces(log))).toBeCloseTo(1 / 3);
  });
});

describe("analyzePerformance", () => {
  it("finds the slowest transition as part of the bottleneck", () => {
    const traces = buildTraces(log);
    const perf = analyzePerformance(traces, discoverDfg(traces));
    // case3 has X->C of 7h, the slowest edge
    expect(perf.slowestEdges[0].from).toBe("X");
    expect(perf.slowestEdges[0].to).toBe("C");
    expect(perf.medianCycleMs).toBe(4 * HOUR); // case durations 2h,4h,10h -> median 4h
  });
});

describe("checkConformance", () => {
  it("measures fitness against the most frequent variant", () => {
    const traces = buildTraces(log);
    const v = discoverVariants(traces);
    const c = checkConformance(traces, v);
    expect(c.referencePath).toEqual(["A", "B", "C"]);
    expect(c.conformingRate).toBeCloseTo(2 / 3);
    expect(c.deviationRate).toBeCloseTo(1 / 3);
    const insertedX = c.topDeviations.find((d) => d.activity === "X" && d.kind === "inserted");
    expect(insertedX?.cases).toBe(1);
  });

  it("traceFitness is 1 for identical sequences", () => {
    expect(traceFitness(["A", "B"], ["A", "B"])).toBe(1);
    expect(traceFitness(["A", "C"], ["A", "B", "C"])).toBeCloseTo(1 - 1 / 3);
  });
});

describe("computeScore", () => {
  it("returns 0-100 with factors summing to the score", () => {
    const r = computeScore({
      topVariantCoverage: 0.8,
      avgFitness: 0.9,
      reworkRate: 0.1,
      deviationRate: 0.2,
      caseCount: 100,
      medianCycleMs: HOUR,
    });
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    const sum = Math.round(100 * r.factors.reduce((s, f) => s + f.contribution, 0));
    expect(Math.abs(sum - r.score)).toBeLessThanOrEqual(1);
    const weightSum = r.factors.reduce((s, f) => s + f.weight, 0);
    expect(weightSum).toBeCloseTo(1);
  });
});

describe("analyzeLog", () => {
  it("produces a full analysis", () => {
    const a = analyzeLog(log);
    expect(a.caseCount).toBe(3);
    expect(a.eventCount).toBe(11);
    expect(a.activityCount).toBe(4);
    expect(a.score.score).toBeGreaterThanOrEqual(0);
    expect(a.dfg.nodes.length).toBe(4);
  });
});

describe("parseEventLogCsv", () => {
  it("auto-detects columns and parses events", () => {
    const csv = [
      "Case ID,Activity,Timestamp,Resource",
      "1,Create Order,2024-01-01T00:00:00Z,alice",
      "1,Ship,2024-01-01T02:00:00Z,bob",
      "2,Create Order,2024-01-02T00:00:00Z,alice",
    ].join("\n");
    const { log: parsed, mapping } = parseEventLogCsv(csv);
    expect(parsed.events).toHaveLength(3);
    expect(mapping.caseId).toBe("Case ID");
    expect(mapping.resource).toBe("Resource");
  });

  it("throws when required columns are missing", () => {
    expect(() => parseEventLogCsv("foo,bar\n1,2")).toThrow();
  });
});
