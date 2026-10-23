# Resume Bullets — Process Lens

**Format:** formal, submission-ready. Replace `[X]` placeholders with real values if you deploy
or gather usage data. Do not invent metrics — the placeholders are intentional.

---

## Option A (concise, one bullet)

**Process Lens** | Next.js · TypeScript · React Flow · Google Gemini · Vitest
Built an interactive process-mining workbench that ingests any event-log CSV, discovers the
process model (Directly-Follows Graph), checks conformance to the discovered happy path via
sequence alignment, detects bottlenecks and cycle-time distribution, and scores the process 0–100
for AI-agent readiness; an LLM layer (Gemini) reads the computed metrics and generates a grounded
"what an agent must know / where it will fail" brief, with a deterministic fallback.

---

## Option B (two-part, STAR style)

**Process Lens** | Next.js · TypeScript · React Flow · Gemini · Vitest | [Month Year]

**Action:** Engineered a framework-free process-mining engine in TypeScript — trace construction,
Directly-Follows Graph discovery, variant analysis, sequence-alignment conformance checking,
bottleneck/cycle-time performance analysis, and a transparent 6-factor AI-readiness score — backed
by [12] known-answer unit tests, and wrapped it in a Next.js workbench that renders the discovered
process as an interactive graph (React Flow) and streams an LLM-generated, metrics-grounded
readiness brief.

**Impact:** Delivered a tool that mirrors how ARIS approaches "process context for AI" — turning a
raw event log into a discovered process model, a conformance verdict, and an agent-readiness
assessment — and that works on arbitrary uploaded logs, not just bundled samples.

---

## Option C (ATS-optimized, keyword-dense)

**Process Lens** — Process Intelligence Workbench | Next.js, TypeScript, React Flow, Gemini, Zod, Vitest

- Implemented a process-mining engine in pure TypeScript: event-log parsing with column
  auto-detection, Directly-Follows Graph discovery, trace-variant analysis, **conformance checking**
  via Levenshtein sequence alignment against the discovered happy path, and bottleneck/cycle-time
  performance analysis — [12] Vitest unit tests on hand-built known-answer logs.
- Built a transparent 6-factor AI-readiness score (standardization, conformance fitness, stability,
  cleanliness, volume, speed) with a per-factor contribution breakdown for full explainability.
- Rendered the discovered process model as an **interactive Directly-Follows Graph** (React Flow)
  with frequency-weighted nodes/edges, highlighted happy path, and bottleneck emphasis.
- Integrated **Google Gemini** to generate a process-context brief grounded strictly in the
  computed metrics (what an AI agent must know, where it will fail), with timeout-bounded calls and
  a deterministic local fallback so the feature degrades gracefully.
- Exposed REST endpoints (`POST /api/analyze` for CSV → analysis, `POST /api/insights` for the
  AI brief) and a client workbench supporting CSV upload and sample logs.
- Fluent in BPM vocabulary: process discovery, conformance checking, process context for AI agents,
  Object-Centric Process Mining (OCPM), governance-first AI.
