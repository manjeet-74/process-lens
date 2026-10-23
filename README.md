# Process Lens

> **AI-readiness scorer and ranking dashboard for enterprise business processes**  
> Inspired by [ARIS Process Lens](https://aris.com) — the product that scores processes for agentic AI suitability.

---

> **SYNTHETIC DATA — DEMO ONLY.**  
> All process event logs in this project are procedurally generated. No real ARIS data, client data,  
> or proprietary process models are used. This is an independent portfolio project.

---

## What it does

Process Lens ingests structured **event logs** (who did what, when, in which case) for five common
enterprise process families, computes process-mining metrics, and **scores each process 0–100 for
AI-agent readiness** — surfacing where automation delivers the most value.

**Processes analysed:**
| Process | Domain |
|---|---|
| Order to Cash | Finance / Supply Chain |
| Procure to Pay | Procurement |
| Invoice Approval | Finance |
| Customer Onboarding | Operations |
| Expense Reimbursement | HR / Finance |

**Metrics computed per process:**
- **Variants** — distinct execution paths and their frequency
- **Top-variant coverage** — % of cases following the most common path
- **Rework rate** — % of cases with repeated activities
- **Exception rate** — % of cases containing rejection/rollback events
- **Cycle time** — average and median case duration
- **Bottleneck** — activity with the largest average wait before it

**AI-readiness score (0–100):**

| Factor | What it measures | Weight |
|---|---|---|
| Standardization | Top-variant coverage | 30% |
| Stability | 1 − rework rate | 25% |
| Cleanliness | 1 − exception rate | 20% |
| Volume | Log-normalized case count | 15% |
| Speed | Normalized inverse median cycle time | 10% |

Each factor is normalized 0–1 and returned with its contribution, making the score **fully
explainable** — mirroring ARIS's governance-first approach to AI deployment.

---

## Architecture

```
process-lens/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                    # Ranking dashboard (home)
│  │  ├─ process/[id]/page.tsx       # Per-process drill-down
│  │  └─ api/
│  │     ├─ processes/route.ts       # GET /api/processes  → ranked list
│  │     └─ processes/[id]/route.ts  # GET /api/processes/:id → detail + factors
│  ├─ lib/
│  │  ├─ data/
│  │  │  ├─ types.ts        # Zod schemas: Event, ProcessLog
│  │  │  ├─ generate.ts     # Synthetic event-log generator (seeded RNG)
│  │  │  └─ fixture.json    # Pre-generated log (committed; regenerate with npm run seed)
│  │  └─ engine/
│  │     ├─ metrics.ts      # Pure functions: variants, rework, cycleTime, bottleneck…
│  │     ├─ score.ts        # Weighted AI-readiness score with factor breakdown
│  │     └─ index.ts        # analyzeProcess(log) → ProcessAnalysis
│  └─ components/
│     ├─ ScoreBadge.tsx     # Color-coded score pill
│     ├─ RankingTable.tsx
│     └─ MetricChart.tsx    # Recharts bar chart (client component)
├─ src/lib/engine/*.test.ts  # Vitest unit tests (17 tests)
└─ scripts/seed.ts           # Regenerates fixture.json
```

**Data flow:**
```
scripts/seed.ts
  → generate.ts (seeded RNG, 5 × 80 cases with injected rework/exceptions/variance)
  → fixture.json (committed)
      → engine/metrics.ts (pure TS, no deps)
      → engine/score.ts   (weighted formula)
          → API routes     (Next.js App Router)
          → UI pages       (server components + Recharts client chart)
```

---

## How this maps to ARIS

| This project | ARIS product / concept |
|---|---|
| Event log (caseId, activity, timestamp, resource) | Process event log / task mining feed |
| `variants()` + conformance checks | Process Mining → variant analysis |
| AI-readiness score per process | **Process Lens** — scores hundreds of processes for agent suitability |
| Explainable factor breakdown | ARIS governance-first design — nothing opaque |
| Bottleneck detection | Process intelligence → optimization signal |
| Human-readable process ranking | Foundation for ARIS Flows / agent deployment decisions |

---

## Quick start

```bash
# 1. Install
npm install

# 2. (Optional) Regenerate the synthetic event log
npm run seed

# 3. Run tests
npm test

# 4. Dev server
npm run dev
# → http://localhost:3000

# 5. Production build
npm run build
```

**API endpoints (running dev server):**
```bash
# Ranked list of all processes (sorted by AI score, descending)
curl http://localhost:3000/api/processes

# Full analysis + factor breakdown for one process
curl http://localhost:3000/api/processes/order-to-cash
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15, App Router, TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Validation | Zod |
| Tests | Vitest |

No database. All data is computed from the committed JSON fixture at build time.

---

## Built by

**Manjeet Roy** — Electronics & Telecommunication Engineering, MS Ramaiah Institute of Technology, Bengaluru (graduating 2027).  
Stack: Flutter · React.js · Next.js · Node.js · NestJS · MongoDB · PostgreSQL · Redis  
GitHub: [github.com/manjeet-74](https://github.com/manjeet-74) | LinkedIn: [linkedin.com/in/manjeet70](https://linkedin.com/in/manjeet70)
