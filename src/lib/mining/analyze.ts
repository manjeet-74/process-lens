import type { Analysis, EventLog } from "./types";
import { buildTraces } from "./traces";
import { discoverDfg } from "./dfg";
import { discoverVariants, reworkRate } from "./variants";
import { analyzePerformance } from "./performance";
import { checkConformance } from "./conformance";
import { computeScore, scoreInputsFrom } from "./score";

export function analyzeLog(log: EventLog, referencePath?: string[]): Analysis {
  const traces = buildTraces(log);
  const dfg = discoverDfg(traces);
  const variantResult = discoverVariants(traces);
  const performance = analyzePerformance(traces, dfg);
  const conformance = checkConformance(traces, variantResult, referencePath);
  const rework = reworkRate(traces);

  const score = computeScore(
    scoreInputsFrom(variantResult, conformance, performance, rework, traces.length)
  );

  const activities = new Set(log.events.map((e) => e.activity));

  return {
    name: log.name,
    caseCount: traces.length,
    eventCount: log.events.length,
    activityCount: activities.size,
    reworkRate: rework,
    dfg,
    variantResult,
    performance,
    conformance,
    score,
  };
}

export * from "./types";
