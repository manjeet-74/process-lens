# Process Lens

> **A process-mining workbench that scores any event log for AI-agent readiness.**
> Inspired by [ARIS](https://aris.com) process intelligence and its "process context for AI" thesis.

---

> **SYNTHETIC SAMPLES — DEMO ONLY.**
> The bundled sample logs are procedurally generated. No real ARIS data, client data, or
> proprietary process models are used. This is an independent portfolio project, not affiliated
> with ARIS or SAG Aris GmbH. Upload your own CSV to mine real data.

---

## What it does

Upload an event log (or pick a sample) and Process Lens runs a real process-mining pipeline in the
browser/server and returns:

- **Process discovery** — builds a **Directly-Follows Graph** from the log and renders it as an
  interactive process map (node size = case frequency, edge thickness = transition frequency).
- **Conformance checking** — discovers the happy path (most frequent variant) and measures, via
  sequence alignment, what fraction of cases conform and exactly where they deviate (inserted vs.
  skipped activities).
- **Performance analysis** — median/average/p95 cycle time, the bottleneck activity (longest wait
  to start), and the slowest transitions.
- **Variant analysis** — distinct execution paths and their coverage.
- **AI-readiness score (0–100)** — a transparent weighted score, grounded in the metrics above.
- **AI-readiness brief** — an LLM (Google Gemini) reads the *computed metrics* and writes a
  grounded brief: what an AI agent must know about the process and where it would fail. Falls back
  to a deterministic local narrative when the model is unavailable.

### AI-readiness score

| Factor | What it measures | Weight |
|---|---|---|
| Standardization | Top-variant (happy-path) coverage | 25% |
| Conformance | Average trace fitness to the happy path | 25% |
| Stability | 1 − rework rate | 20% |
| Cleanliness | 1 − deviation rate | 15% |
| Volume | Log-normalized case count | 10% |
| Speed | Normalized inverse median cycle time | 5% |

Each factor is normalized 0–1 and returned with its contribution, so the score is **fully
explainable** — mirroring ARIS's governance-first approach.

---

## Why these features map to ARIS

| This project | ARIS concept |
|---|---|
| CSV → normalized event log (case, activity, timestamp, resource) | Process event log / task-mining feed |
| Directly-Follows Graph + process map | Process discovery / process model |
| Sequence-alignment conformance to the happy path | Conformance checking |
| Bottleneck + cycle-time analysis | Process performance / optimization |
| AI-readiness score + "what an agent must know" brief | **Process context for AI agents** |
| Explainable factor breakdown | Governance-first, nothing opaque |

---

## Architecture

```
process-lens/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                     # Workbench UI (client): upload/sample → map + panels + brief
│  │  └─ api/
│  │     ├─ analyze/route.ts          # POST: CSV → full Analysis JSON
│  │     └─ insights/route.ts         # POST: Analysis → Gemini brief (+ local fallback)
│  ├─ lib/
│  │  ├─ mining/                      # Pure, framework-free process-mining engine
│  │  │  ├─ types.ts                  # Zod schemas + domain types
│  │  │  ├─ parse.ts                  # CSV parsing + column auto-detection (Papa Parse)
│  │  │  ├─ traces.ts                 # Case grouping + stats helpers
│  │  │  ├─ dfg.ts                    # Directly-Follows Graph discovery
│  │  │  ├─ variants.ts               # Variant + rework analysis
│  │  │  ├─ conformance.ts            # Sequence-alignment fitness + deviations
│  │  │  ├─ performance.ts            # Cycle time + bottleneck
│  │  │  ├─ score.ts                  # Weighted AI-readiness score
│  │  │  ├─ layout.ts                 # BFS layering for the process map
│  │  │  └─ analyze.ts                # Orchestrator: EventLog → Analysis
│  │  └─ ai/
│  │     ├─ gemini.ts                 # Gemini REST client (timeout + retry)
│  │     └─ insights.ts               # Prompt builder + deterministic fallback
│  └─ components/
│     ├─ ProcessMap.tsx               # React Flow process graph (client)
│     └─ Markdown.tsx                 # Minimal Markdown renderer for the brief
├─ src/lib/mining/mining.test.ts      # Vitest unit tests (12 tests, known-answer logs)
├─ scripts/gen-samples.ts             # Seeded sample-log generator
└─ public/samples/                    # order-to-cash, procure-to-pay, insurance-claim CSVs
```

---

## Quick start

```bash
npm install
npm test                 # engine unit tests (12)
npm run seed             # (optional) regenerate sample CSVs in public/samples
npm run dev              # http://localhost:3000
npm run build            # type-check + production build
```

### AI brief (optional)

The `/api/insights` route uses Google Gemini. Add a key to `.env.local` (gitignored):

```bash
GEMINI_API_KEY=your_key_here
# optional overrides:
# GEMINI_MODEL=gemini-3.8-flash
# GEMINI_TIMEOUT_MS=18000
```

Without a key (or when the model is busy) the brief gracefully falls back to a deterministic
narrative computed from the metrics, so the app always works.

### API

```bash
# Analyze a CSV event log
curl -X POST http://localhost:3000/api/analyze \
  -H 'Content-Type: text/csv' --data-binary @public/samples/order-to-cash.csv

# Generate an AI-readiness brief from an analysis
curl -X POST http://localhost:3000/api/insights \
  -H 'Content-Type: application/json' -d '{"analysis": <analysis object>}'
```

**Upload format:** any CSV with a case id, an activity, and a timestamp column (header names are
auto-detected: `case_id`/`case`/`case:concept:name`, `activity`/`concept:name`, `timestamp`/`time`,
optional `resource`).

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16, App Router, TypeScript |
| Process map | React Flow (`@xyflow/react`) |
| CSV parsing | Papa Parse |
| AI brief | Google Gemini (REST) |
| Validation | Zod |
| Tests | Vitest |

No database. The engine is pure TypeScript; logs are parsed and mined per request.

---

## Built by

**Manjeet Roy** — Electronics & Telecommunication Engineering, MS Ramaiah Institute of Technology,
Bengaluru (graduating 2027).
GitHub: [github.com/manjeet-74](https://github.com/manjeet-74) · LinkedIn: [linkedin.com/in/manjeet70](https://linkedin.com/in/manjeet70)
