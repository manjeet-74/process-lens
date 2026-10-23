import { describe, it, expect } from "vitest";
import {
  caseCount,
  eventCount,
  variants,
  reworkRate,
  exceptionRate,
  cycleTime,
  bottleneck,
} from "./metrics";
import type { Event } from "@/lib/data/types";

// Minimal hand-built log: 3 cases
const T = (caseId: string, activity: string, ts: string, resource = "alice"): Event => ({
  caseId, activity, timestamp: ts, resource,
});

const SIMPLE_EVENTS: Event[] = [
  // case-1: happy path A → B → C
  T("c1", "A", "2025-01-01T01:00:00Z"),
  T("c1", "B", "2025-01-01T03:00:00Z"),
  T("c1", "C", "2025-01-01T07:00:00Z"),
  // case-2: happy path A → B → C (same variant)
  T("c2", "A", "2025-01-02T01:00:00Z"),
  T("c2", "B", "2025-01-02T04:00:00Z"),
  T("c2", "C", "2025-01-02T06:00:00Z"),
  // case-3: rework (B repeated) + exception
  T("c3", "A", "2025-01-03T01:00:00Z"),
  T("c3", "B", "2025-01-03T03:00:00Z"),
  T("c3", "B", "2025-01-03T04:00:00Z"),  // rework
  T("c3", "C", "2025-01-03T05:00:00Z"),
  T("c3", "Cancel Order", "2025-01-03T06:00:00Z"), // exception
];

describe("caseCount", () => {
  it("counts distinct caseIds", () => {
    expect(caseCount(SIMPLE_EVENTS)).toBe(3);
  });
  it("returns 0 for empty log", () => {
    expect(caseCount([])).toBe(0);
  });
});

describe("eventCount", () => {
  it("returns total event count", () => {
    expect(eventCount(SIMPLE_EVENTS)).toBe(11);
  });
});

describe("variants", () => {
  it("identifies 2 distinct variants", () => {
    const r = variants(SIMPLE_EVENTS);
    expect(r.variantCount).toBe(2);
  });
  it("top variant covers 2 of 3 cases", () => {
    const r = variants(SIMPLE_EVENTS);
    expect(r.topVariantCoverage).toBeCloseTo(2 / 3, 5);
  });
  it("returns variants sorted by count descending", () => {
    const r = variants(SIMPLE_EVENTS);
    expect(r.variants[0].count).toBeGreaterThanOrEqual(r.variants[1].count);
  });
});

describe("reworkRate", () => {
  it("1 of 3 cases has rework → ~0.333", () => {
    expect(reworkRate(SIMPLE_EVENTS)).toBeCloseTo(1 / 3, 5);
  });
  it("returns 0 for single-event cases with no repeats", () => {
    const noRework: Event[] = [T("x", "A", "2025-01-01T00:00:00Z")];
    expect(reworkRate(noRework)).toBe(0);
  });
});

describe("exceptionRate", () => {
  it("1 of 3 cases has an exception → ~0.333", () => {
    expect(exceptionRate(SIMPLE_EVENTS)).toBeCloseTo(1 / 3, 5);
  });
  it("returns 0 when no exception activities present", () => {
    const clean = SIMPLE_EVENTS.filter(e => e.activity !== "Cancel Order");
    expect(exceptionRate(clean)).toBe(0);
  });
});

describe("cycleTime", () => {
  it("computes avg and median durations", () => {
    const r = cycleTime(SIMPLE_EVENTS);
    // c1: 6h, c2: 5h, c3: 5h in ms
    const c1 = 6 * 3_600_000;
    const c2 = 5 * 3_600_000;
    const c3 = 5 * 3_600_000;
    expect(r.avgMs).toBeCloseTo((c1 + c2 + c3) / 3, -3);
    expect(r.medianMs).toBeCloseTo(c2, -3);
  });
});

describe("bottleneck", () => {
  it("identifies the activity with the largest average wait", () => {
    const r = bottleneck(SIMPLE_EVENTS);
    // C has larger avg wait (4h+2h+1h)/3=2.33h vs B's (2h+3h+2h+1h)/4=2h
    expect(r.activity).toBe("C");
    expect(r.avgWaitMs).toBeGreaterThan(0);
  });
});
