import { describe, it, expect } from "vitest";
import { scoreProcess } from "./score";
import type { Event } from "@/lib/data/types";
import fixture from "@/lib/data/fixture.json";
import type { ProcessLog } from "@/lib/data/types";

const T = (caseId: string, activity: string, ts: string): Event => ({
  caseId, activity, timestamp: ts, resource: "alice",
});

describe("scoreProcess", () => {
  it("returns a score between 0 and 100", () => {
    const events: Event[] = [
      T("c1", "A", "2025-01-01T01:00:00Z"),
      T("c1", "B", "2025-01-01T02:00:00Z"),
      T("c2", "A", "2025-01-02T01:00:00Z"),
      T("c2", "B", "2025-01-02T03:00:00Z"),
    ];
    const r = scoreProcess(events);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("factor contributions sum to the score (±1 rounding)", () => {
    const events: Event[] = [
      T("c1", "A", "2025-01-01T01:00:00Z"),
      T("c1", "B", "2025-01-01T03:00:00Z"),
      T("c2", "A", "2025-01-02T01:00:00Z"),
      T("c2", "B", "2025-01-02T04:00:00Z"),
    ];
    const r = scoreProcess(events);
    const sumContributions = r.factors.reduce((s, f) => s + f.contribution, 0);
    expect(r.score).toBeCloseTo(Math.round(100 * sumContributions), 0);
  });

  it("returns 5 named factors", () => {
    const events: Event[] = [T("c1", "A", "2025-01-01T01:00:00Z")];
    const r = scoreProcess(events);
    expect(r.factors).toHaveLength(5);
    const names = r.factors.map(f => f.name);
    expect(names).toContain("standardization");
    expect(names).toContain("stability");
    expect(names).toContain("cleanliness");
    expect(names).toContain("volume");
    expect(names).toContain("speed");
  });

  it("all factors have value 0–1 and weight 0–1", () => {
    const events: Event[] = [
      T("c1", "A", "2025-01-01T01:00:00Z"),
      T("c1", "B", "2025-01-01T02:00:00Z"),
    ];
    const r = scoreProcess(events);
    for (const f of r.factors) {
      expect(f.value).toBeGreaterThanOrEqual(0);
      expect(f.value).toBeLessThanOrEqual(1);
      expect(f.weight).toBeGreaterThan(0);
      expect(f.weight).toBeLessThanOrEqual(1);
    }
  });

  it("all 5 fixture processes return valid scores 0–100", () => {
    for (const log of fixture as ProcessLog[]) {
      const r = scoreProcess(log.events);
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
      const sumContributions = r.factors.reduce((s, f) => s + f.contribution, 0);
      expect(Math.abs(r.score - Math.round(100 * sumContributions))).toBeLessThanOrEqual(1);
    }
  });
});
