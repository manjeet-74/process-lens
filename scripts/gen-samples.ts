import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Seeded RNG (mulberry32) for reproducible sample logs.
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Row {
  caseId: string;
  activity: string;
  timestamp: string;
  resource: string;
}

interface Family {
  file: string;
  name: string;
  seed: number;
  cases: number;
  happyPath: string[];
  resources: string[];
  reworkAt: string; // activity that sometimes repeats
  reworkRate: number;
  exception: { after: string; activity: string; rate: number; terminal: boolean };
  // per-activity nominal processing hours [min,max]
  durations: Record<string, [number, number]>;
  bottleneck: { activity: string; extraHours: [number, number] };
}

const FAMILIES: Family[] = [
  {
    file: "order-to-cash.csv",
    name: "Order to Cash",
    seed: 101,
    cases: 220,
    happyPath: ["Create Order", "Check Credit", "Confirm Order", "Ship Goods", "Create Invoice", "Receive Payment"],
    resources: ["sales-01", "sales-02", "finance-01", "warehouse-01", "finance-02"],
    reworkAt: "Check Credit",
    reworkRate: 0.12,
    exception: { after: "Check Credit", activity: "Cancel Order", rate: 0.06, terminal: true },
    durations: {
      "Create Order": [0.2, 1],
      "Check Credit": [1, 4],
      "Confirm Order": [0.5, 2],
      "Ship Goods": [4, 12],
      "Create Invoice": [0.5, 2],
      "Receive Payment": [24, 120],
      "Cancel Order": [0.5, 1],
    },
    bottleneck: { activity: "Receive Payment", extraHours: [0, 240] },
  },
  {
    file: "procure-to-pay.csv",
    name: "Procure to Pay",
    seed: 202,
    cases: 180,
    happyPath: ["Create Requisition", "Approve Requisition", "Create PO", "Goods Receipt", "Receive Invoice", "Pay Invoice"],
    resources: ["proc-01", "proc-02", "mgr-01", "warehouse-02", "finance-03"],
    reworkAt: "Approve Requisition",
    reworkRate: 0.22,
    exception: { after: "Approve Requisition", activity: "Return to Requester", rate: 0.14, terminal: false },
    durations: {
      "Create Requisition": [0.5, 2],
      "Approve Requisition": [2, 16],
      "Create PO": [0.5, 3],
      "Goods Receipt": [24, 96],
      "Receive Invoice": [1, 8],
      "Pay Invoice": [12, 72],
      "Return to Requester": [4, 24],
    },
    bottleneck: { activity: "Goods Receipt", extraHours: [0, 120] },
  },
  {
    file: "insurance-claim.csv",
    name: "Insurance Claim",
    seed: 303,
    cases: 160,
    happyPath: ["Register Claim", "Assess Damage", "Approve Claim", "Pay Out", "Close Claim"],
    resources: ["agent-01", "agent-02", "assessor-01", "mgr-02", "finance-04"],
    reworkAt: "Assess Damage",
    reworkRate: 0.3,
    exception: { after: "Assess Damage", activity: "Reject Claim", rate: 0.2, terminal: true },
    durations: {
      "Register Claim": [0.2, 1],
      "Assess Damage": [8, 72],
      "Approve Claim": [2, 24],
      "Pay Out": [24, 96],
      "Close Claim": [0.5, 2],
      "Reject Claim": [1, 4],
    },
    bottleneck: { activity: "Assess Damage", extraHours: [0, 160] },
  },
];

function genFamily(f: Family): string {
  const rand = rng(f.seed);
  const rows: Row[] = [];
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const hrs = (range: [number, number]) => range[0] + rand() * (range[1] - range[0]);

  for (let c = 0; c < f.cases; c++) {
    const caseId = `${f.name.split(" ")[0].toLowerCase()}-${String(c + 1).padStart(4, "0")}`;
    // start time spread across ~90 days
    let t = Date.UTC(2024, 0, 1) + Math.floor(rand() * 90 * 24) * 3_600_000 + Math.floor(rand() * 3_600_000);

    const emit = (activity: string) => {
      rows.push({
        caseId,
        activity,
        timestamp: new Date(t).toISOString(),
        resource: pick(f.resources),
      });
      let dur = hrs(f.durations[activity] ?? [0.5, 2]);
      if (activity === f.bottleneck.activity) dur += hrs(f.bottleneck.extraHours);
      t += Math.max(60_000, Math.floor(dur * 3_600_000));
    };

    for (const act of f.happyPath) {
      emit(act);
      if (act === f.reworkAt && rand() < f.reworkRate) emit(act); // rework loop
      if (act === f.exception.after && rand() < f.exception.rate) {
        emit(f.exception.activity);
        if (f.exception.terminal) break;
      }
    }
  }

  const header = "case_id,activity,timestamp,resource";
  const body = rows.map((r) => `${r.caseId},${r.activity},${r.timestamp},${r.resource}`).join("\n");
  return `${header}\n${body}\n`;
}

const outDir = join(process.cwd(), "public", "samples");
mkdirSync(outDir, { recursive: true });
const manifest: { file: string; name: string; cases: number }[] = [];
for (const f of FAMILIES) {
  const csv = genFamily(f);
  writeFileSync(join(outDir, f.file), csv);
  manifest.push({ file: f.file, name: f.name, cases: f.cases });
  console.log(`wrote ${f.file} (${f.cases} cases)`);
}
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("wrote manifest.json");
