import { NextResponse } from "next/server";
import fixture from "@/lib/data/fixture.json";
import { analyzeProcess } from "@/lib/engine";
import type { ProcessLog } from "@/lib/data/types";

export function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return params.then(({ id }) => {
    const log = (fixture as ProcessLog[]).find((p) => p.id === id);
    if (!log) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const analysis = analyzeProcess(log);
    return NextResponse.json(analysis);
  });
}
