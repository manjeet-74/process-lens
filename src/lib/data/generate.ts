import type { Event, ProcessLog } from "./types";

interface ProcessTemplate {
  id: string;
  name: string;
  steps: string[];
  exceptionActivity: string;
  reworkActivity: string;
  // per-case injection rates (0–1)
  reworkRate: number;
  exceptionRate: number;
  variantRate: number;
  // average step duration in hours
  avgStepHours: number;
  bottleneckStep: string;
  bottleneckMultiplier: number;
}

const TEMPLATES: ProcessTemplate[] = [
  {
    id: "order-to-cash",
    name: "Order to Cash",
    steps: ["Create Order", "Check Credit", "Confirm Order", "Ship Goods", "Create Invoice", "Receive Payment"],
    exceptionActivity: "Cancel Order",
    reworkActivity: "Check Credit",
    reworkRate: 0.12,
    exceptionRate: 0.08,
    variantRate: 0.15,
    avgStepHours: 4,
    bottleneckStep: "Receive Payment",
    bottleneckMultiplier: 6,
  },
  {
    id: "procure-to-pay",
    name: "Procure to Pay",
    steps: ["Create Requisition", "Approve Requisition", "Create PO", "Goods Receipt", "Receive Invoice", "Pay Invoice"],
    exceptionActivity: "Return to Requester",
    reworkActivity: "Approve Requisition",
    reworkRate: 0.22,
    exceptionRate: 0.15,
    variantRate: 0.25,
    avgStepHours: 8,
    bottleneckStep: "Goods Receipt",
    bottleneckMultiplier: 4,
  },
  {
    id: "invoice-approval",
    name: "Invoice Approval",
    steps: ["Submit Invoice", "Validate Invoice", "Approve Invoice", "Post to Ledger"],
    exceptionActivity: "Reject Invoice",
    reworkActivity: "Validate Invoice",
    reworkRate: 0.30,
    exceptionRate: 0.20,
    variantRate: 0.10,
    avgStepHours: 2,
    bottleneckStep: "Approve Invoice",
    bottleneckMultiplier: 5,
  },
  {
    id: "customer-onboarding",
    name: "Customer Onboarding",
    steps: ["Submit Application", "KYC Check", "Risk Review", "Activate Account"],
    exceptionActivity: "Reject Application",
    reworkActivity: "KYC Check",
    reworkRate: 0.08,
    exceptionRate: 0.05,
    variantRate: 0.05,
    avgStepHours: 24,
    bottleneckStep: "Risk Review",
    bottleneckMultiplier: 3,
  },
  {
    id: "expense-reimbursement",
    name: "Expense Reimbursement",
    steps: ["Submit Expense", "Manager Approval", "Finance Review", "Reimburse"],
    exceptionActivity: "Reject Expense",
    reworkActivity: "Finance Review",
    reworkRate: 0.35,
    exceptionRate: 0.18,
    variantRate: 0.20,
    avgStepHours: 3,
    bottleneckStep: "Finance Review",
    bottleneckMultiplier: 4,
  },
];

const RESOURCES = ["alice", "bob", "carol", "dave", "eve", "frank"];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff);
  };
}

function generateCase(
  tmpl: ProcessTemplate,
  caseId: string,
  startMs: number,
  rng: () => number
): Event[] {
  const events: Event[] = [];
  let t = startMs;
  const stepMs = tmpl.avgStepHours * 3_600_000;

  let steps = [...tmpl.steps];

  // inject variance: skip a random non-critical step
  if (rng() < tmpl.variantRate) {
    const skipIdx = 1 + Math.floor(rng() * (steps.length - 2));
    steps = steps.filter((_, i) => i !== skipIdx);
  }

  for (const step of steps) {
    const wait = tmpl.bottleneckStep === step
      ? stepMs * tmpl.bottleneckMultiplier * (0.8 + rng() * 0.4)
      : stepMs * (0.5 + rng());

    t += wait;

    events.push({
      caseId,
      activity: step,
      timestamp: new Date(t).toISOString(),
      resource: RESOURCES[Math.floor(rng() * RESOURCES.length)],
    });

    // inject rework: repeat this step once
    if (step === tmpl.reworkActivity && rng() < tmpl.reworkRate) {
      t += stepMs * (0.3 + rng() * 0.5);
      events.push({
        caseId,
        activity: step,
        timestamp: new Date(t).toISOString(),
        resource: RESOURCES[Math.floor(rng() * RESOURCES.length)],
      });
    }
  }

  // inject exception at the end (or after the last step)
  if (rng() < tmpl.exceptionRate) {
    t += stepMs * 0.2;
    events.push({
      caseId,
      activity: tmpl.exceptionActivity,
      timestamp: new Date(t).toISOString(),
      resource: RESOURCES[Math.floor(rng() * RESOURCES.length)],
    });
  }

  return events;
}

export function generateProcessLog(tmpl: ProcessTemplate, caseCount = 80): ProcessLog {
  const rng = seededRand(tmpl.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  const baseMs = new Date("2025-01-01T00:00:00Z").getTime();
  const events: Event[] = [];

  for (let i = 0; i < caseCount; i++) {
    const caseId = `${tmpl.id}-case-${String(i + 1).padStart(4, "0")}`;
    const startMs = baseMs + Math.floor(rng() * 90 * 24 * 3_600_000);
    events.push(...generateCase(tmpl, caseId, startMs, rng));
  }

  return { id: tmpl.id, name: tmpl.name, events };
}

export function generateFixture(): ProcessLog[] {
  return TEMPLATES.map((t) => generateProcessLog(t, 80));
}

export { TEMPLATES };
