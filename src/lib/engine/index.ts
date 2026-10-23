import type { ProcessLog } from "@/lib/data/types";
import { caseCount, eventCount, variants, reworkRate, exceptionRate, cycleTime, bottleneck } from "./metrics";
import { scoreProcess } from "./score";
import type { ScoreResult } from "./score";
import type { VariantResult, CycleTimeResult, BottleneckResult } from "./metrics";

export interface ProcessAnalysis {
  id: string;
  name: string;
  caseCount: number;
  eventCount: number;
  variantCount: number;
  topVariantCoverage: number;
  reworkRate: number;
  exceptionRate: number;
  cycleTime: CycleTimeResult;
  bottleneck: BottleneckResult;
  variants: VariantResult["variants"];
  score: ScoreResult;
}

export function analyzeProcess(log: ProcessLog): ProcessAnalysis {
  const v = variants(log.events);
  const ct = cycleTime(log.events);
  const bn = bottleneck(log.events);
  const sc = scoreProcess(log.events);

  return {
    id: log.id,
    name: log.name,
    caseCount: caseCount(log.events),
    eventCount: eventCount(log.events),
    variantCount: v.variantCount,
    topVariantCoverage: v.topVariantCoverage,
    reworkRate: reworkRate(log.events),
    exceptionRate: exceptionRate(log.events),
    cycleTime: ct,
    bottleneck: bn,
    variants: v.variants,
    score: sc,
  };
}

export { scoreProcess } from "./score";
export * from "./metrics";
