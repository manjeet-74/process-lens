import type { Analysis } from "@/lib/mining/types";

export interface InsightSummary {
  name: string;
  score: number;
  caseCount: number;
  variantCount: number;
  topVariantCoverage: number;
  reworkRate: number;
  conformingRate: number;
  avgFitness: number;
  referencePath: string[];
  bottleneck: string;
  bottleneckWaitHours: number;
  medianCycleHours: number;
  topDeviations: { kind: string; activity: string; cases: number }[];
  factors: { name: string; value: number; weight: number }[];
}

export function summarize(a: Analysis): InsightSummary {
  return {
    name: a.name,
    score: a.score.score,
    caseCount: a.caseCount,
    variantCount: a.variantResult.variantCount,
    topVariantCoverage: a.variantResult.topVariantCoverage,
    reworkRate: a.reworkRate,
    conformingRate: a.conformance.conformingRate,
    avgFitness: a.conformance.avgFitness,
    referencePath: a.conformance.referencePath,
    bottleneck: a.performance.bottleneck.activity,
    bottleneckWaitHours: a.performance.bottleneck.avgWaitMs / 3_600_000,
    medianCycleHours: a.performance.medianCycleMs / 3_600_000,
    topDeviations: a.conformance.topDeviations.map((d) => ({ kind: d.kind, activity: d.activity, cases: d.cases })),
    factors: a.score.factors.map((f) => ({ name: f.name, value: f.value, weight: f.weight })),
  };
}

export function buildPrompt(s: InsightSummary): string {
  const pct = (x: number) => `${(x * 100).toFixed(0)}%`;
  const devs = s.topDeviations
    .map((d) => `- ${d.activity} (${d.kind}) in ${d.cases} cases`)
    .join("\n") || "- none significant";

  return `You are a process-intelligence analyst. You assess whether a business process is ready to be automated by AI agents. Use ONLY the metrics below — do not invent numbers.

PROCESS: ${s.name}
AI-readiness score: ${s.score}/100
Cases analysed: ${s.caseCount}
Distinct variants: ${s.variantCount}
Happy-path coverage (most common variant): ${pct(s.topVariantCoverage)}
Conformance to happy path: ${pct(s.conformingRate)} of cases conform exactly; average fitness ${pct(s.avgFitness)}
Rework rate (cases with a repeated step): ${pct(s.reworkRate)}
Median cycle time: ${s.medianCycleHours.toFixed(1)} hours
Bottleneck (longest wait to start): ${s.bottleneck} (~${s.bottleneckWaitHours.toFixed(1)}h)
Reference (discovered happy path): ${s.referencePath.join(" -> ")}
Top deviations from the happy path:
${devs}

Write a concise brief in GitHub-flavoured Markdown with EXACTLY these four sections and headers:

## Verdict
One or two sentences: is this process ready for AI-agent automation? Anchor it to the score and conformance.

## What an agent must know
2-4 bullets. The process context an AI agent needs before acting (the happy path, the decision points, the bottleneck).

## Where an agent will fail
2-4 bullets. The specific failure modes implied by the rework, deviations, and exceptions above. Reference the actual activity names.

## Recommendation
1-2 sentences. The single highest-leverage step to make this process agent-ready.

Be specific and grounded. No preamble, no closing remarks.`;
}

export function fallbackNarrative(s: InsightSummary): string {
  const pct = (x: number) => `${(x * 100).toFixed(0)}%`;
  const readiness =
    s.score >= 75 ? "largely ready" : s.score >= 55 ? "partially ready, with clear gaps" : "not yet ready";
  const inserted = s.topDeviations.filter((d) => d.kind === "inserted").map((d) => d.activity);
  const failLines = [
    s.reworkRate > 0.1
      ? `- Rework loops: ${pct(s.reworkRate)} of cases repeat a step, so an agent assuming linear flow will act on stale state.`
      : null,
    inserted.length
      ? `- Exception paths like **${inserted.slice(0, 2).join("**, **")}** divert cases off the happy path; an agent must detect and hand these off.`
      : null,
    `- The **${s.bottleneck}** step is the bottleneck (~${s.bottleneckWaitHours.toFixed(1)}h wait); automating around it without addressing it just moves the queue.`,
  ].filter(Boolean);

  return `## Verdict
With an AI-readiness score of ${s.score}/100 and ${pct(s.conformingRate)} of cases conforming to the happy path, **${s.name}** is ${readiness} for agent automation.

## What an agent must know
- The reference happy path is: ${s.referencePath.join(" → ")}.
- Only ${pct(s.topVariantCoverage)} of cases follow the single most common variant (${s.variantCount} variants total).
- The decision/bottleneck point to watch is **${s.bottleneck}**.

## Where an agent will fail
${failLines.join("\n")}

## Recommendation
Raise happy-path conformance (currently ${pct(s.conformingRate)}) by standardising the steps around **${s.bottleneck}** before handing this process to an autonomous agent.

*(Generated locally from the computed metrics — the live AI narrative was unavailable.)*`;
}
