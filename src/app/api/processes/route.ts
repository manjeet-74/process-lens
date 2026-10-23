import { NextResponse } from "next/server";
import fixture from "@/lib/data/fixture.json";
import { analyzeProcess } from "@/lib/engine";
import type { ProcessLog } from "@/lib/data/types";

export function GET() {
  const ranked = (fixture as ProcessLog[])
    .map((log) => {
      const analysis = analyzeProcess(log);
      return {
        id: analysis.id,
        name: analysis.name,
        score: analysis.score.score,
        caseCount: analysis.caseCount,
        eventCount: analysis.eventCount,
        variantCount: analysis.variantCount,
        topVariantCoverage: analysis.topVariantCoverage,
        reworkRate: analysis.reworkRate,
        exceptionRate: analysis.exceptionRate,
        bottleneck: analysis.bottleneck.activity,
      };
    })
    .sort((a, b) => b.score - a.score);

  return NextResponse.json(ranked);
}
