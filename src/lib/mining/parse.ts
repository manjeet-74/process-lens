import Papa from "papaparse";
import { MiningEventSchema, type EventLog, type MiningEvent } from "./types";

const CASE_KEYS = ["caseid", "case", "case_id", "caseconceptname", "case:concept:name", "traceid", "trace"];
const ACT_KEYS = ["activity", "action", "task", "event", "conceptname", "concept:name", "activityname"];
const TIME_KEYS = ["timestamp", "time", "datetime", "date", "starttime", "time:timestamp", "completetime"];
const RES_KEYS = ["resource", "user", "agent", "org:resource", "performer", "owner"];

function norm(s: string): string {
  return s.toLowerCase().replace(/[\s_:]/g, "");
}

function pick(headers: string[], candidates: string[]): string | null {
  const normalized = headers.map((h) => ({ raw: h, n: norm(h) }));
  for (const c of candidates) {
    const hit = normalized.find((h) => h.n === norm(c));
    if (hit) return hit.raw;
  }
  // fallback: substring contains
  for (const c of candidates) {
    const hit = normalized.find((h) => h.n.includes(norm(c)));
    if (hit) return hit.raw;
  }
  return null;
}

export interface ParseResult {
  log: EventLog;
  mapping: { caseId: string; activity: string; timestamp: string; resource: string | null };
}

export function parseEventLogCsv(csv: string, name = "Uploaded Log"): ParseResult {
  const parsed = Papa.parse<Record<string, string>>(csv.trim(), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (parsed.errors.length > 0) {
    const first = parsed.errors[0];
    throw new Error(`CSV parse error (row ${first.row}): ${first.message}`);
  }
  const rows = parsed.data;
  if (rows.length === 0) throw new Error("CSV has no data rows.");

  const headers = parsed.meta.fields ?? [];
  const caseCol = pick(headers, CASE_KEYS);
  const actCol = pick(headers, ACT_KEYS);
  const timeCol = pick(headers, TIME_KEYS);
  const resCol = pick(headers, RES_KEYS);

  if (!caseCol || !actCol || !timeCol) {
    throw new Error(
      `Could not detect required columns. Found headers: [${headers.join(", ")}]. ` +
        `Need a case id, an activity, and a timestamp column.`
    );
  }

  const events: MiningEvent[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const caseId = (r[caseCol] ?? "").trim();
    const activity = (r[actCol] ?? "").trim();
    const timestamp = (r[timeCol] ?? "").trim();
    const resource = resCol ? (r[resCol] ?? "").trim() : undefined;
    if (!caseId || !activity || !timestamp) continue;
    if (Number.isNaN(Date.parse(timestamp))) {
      throw new Error(`Row ${i + 2}: unparseable timestamp "${timestamp}".`);
    }
    const ev = MiningEventSchema.parse({ caseId, activity, timestamp, resource: resource || undefined });
    events.push(ev);
  }

  if (events.length === 0) throw new Error("No valid events after parsing.");

  return {
    log: { name, events },
    mapping: { caseId: caseCol, activity: actCol, timestamp: timeCol, resource: resCol },
  };
}
