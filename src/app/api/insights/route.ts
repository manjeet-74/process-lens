import { NextResponse } from "next/server";
import type { Analysis } from "@/lib/mining/types";
import { buildPrompt, fallbackNarrative, summarize } from "@/lib/ai/insights";
import { generateText } from "@/lib/ai/gemini";

export const maxDuration = 60;

export async function POST(req: Request) {
  let summary;
  try {
    const body = await req.json();
    const analysis = body.analysis as Analysis | undefined;
    if (!analysis || !analysis.score) {
      return NextResponse.json({ error: "Missing analysis in request body." }, { status: 400 });
    }
    summary = summarize(analysis);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const { text, model } = await generateText(buildPrompt(summary));
    return NextResponse.json({ narrative: text, source: "gemini", model });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ narrative: fallbackNarrative(summary), source: "fallback", reason });
  }
}
