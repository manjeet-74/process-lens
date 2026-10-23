import { z } from "zod";

export const MiningEventSchema = z.object({
  caseId: z.string().min(1),
  activity: z.string().min(1),
  timestamp: z.string().min(1),
  resource: z.string().optional(),
});
export type MiningEvent = z.infer<typeof MiningEventSchema>;

export interface Trace {
  caseId: string;
  events: MiningEvent[];
  activities: string[];
  startMs: number;
  endMs: number;
  durationMs: number;
}

export interface EventLog {
  name: string;
  events: MiningEvent[];
}

export interface DfgNode {
  activity: string;
  frequency: number;
  caseFrequency: number;
  isStart: boolean;
  isEnd: boolean;
}

export interface DfgEdge {
  from: string;
  to: string;
  frequency: number;
  avgDurationMs: number;
  medianDurationMs: number;
}

export interface Dfg {
  nodes: DfgNode[];
  edges: DfgEdge[];
  startActivities: { activity: string; frequency: number }[];
  endActivities: { activity: string; frequency: number }[];
}

export interface VariantResult {
  variants: { path: string[]; count: number; coverage: number }[];
  variantCount: number;
  topVariantCoverage: number;
}

export interface PerformanceResult {
  avgCycleMs: number;
  medianCycleMs: number;
  p95CycleMs: number;
  bottleneck: { activity: string; avgWaitMs: number };
  slowestEdges: { from: string; to: string; avgDurationMs: number }[];
}

export interface ConformanceResult {
  referencePath: string[];
  avgFitness: number;
  conformingRate: number;
  deviationRate: number;
  topDeviations: { kind: "inserted" | "skipped"; activity: string; cases: number }[];
  nonConformingVariants: { path: string[]; count: number; fitness: number }[];
}

export interface ScoreFactor {
  name: string;
  value: number;
  weight: number;
  contribution: number;
}

export interface ScoreResult {
  score: number;
  factors: ScoreFactor[];
}

export interface Analysis {
  name: string;
  caseCount: number;
  eventCount: number;
  activityCount: number;
  reworkRate: number;
  dfg: Dfg;
  variantResult: VariantResult;
  performance: PerformanceResult;
  conformance: ConformanceResult;
  score: ScoreResult;
}
