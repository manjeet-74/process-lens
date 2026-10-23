import { NextResponse } from "next/server";
import { parseEventLogCsv } from "@/lib/mining/parse";
import { analyzeLog } from "@/lib/mining/analyze";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let csv: string;
    let name = "Uploaded Log";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      csv = typeof body.csv === "string" ? body.csv : "";
      if (typeof body.name === "string" && body.name.trim()) name = body.name.trim();
    } else {
      csv = await req.text();
    }

    if (!csv || csv.length === 0) {
      return NextResponse.json({ error: "Empty request body. Send CSV text or { csv }." }, { status: 400 });
    }
    if (csv.length > MAX_BYTES) {
      return NextResponse.json({ error: "Log too large (max 8 MB)." }, { status: 413 });
    }

    const { log, mapping } = parseEventLogCsv(csv, name);
    const analysis = analyzeLog(log);
    return NextResponse.json({ mapping, analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to analyze log.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
