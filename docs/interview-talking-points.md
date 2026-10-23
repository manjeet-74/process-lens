# Interview Talking Points — ARIS

Use this sheet to connect Process Lens to ARIS's exact language and product vision.

---

## Core narrative (30-second pitch)

"I built Process Lens as a working process-mining tool around ARIS's 'process context for AI'
thesis. You upload an event log — any CSV — and it discovers the process as a Directly-Follows
Graph, checks conformance to the discovered happy path, finds the bottleneck, and scores the
process 0–100 for AI-agent readiness. Then an LLM reads those computed metrics and writes a
grounded brief: what an agent must know before automating the process, and exactly where it would
break. Every number is explainable, which is ARIS's governance-first position on agentic AI."

---

## Connection to ARIS product language

| What you built | ARIS term | Where to use it |
|---|---|---|
| CSV → normalized event log (case, activity, timestamp, resource) | Process event / task-mining data | "I ingest the same event model ARIS Process Mining works with, with column auto-detection." |
| Directly-Follows Graph + interactive process map | Process discovery / process model | "I discover the process model from the log and render it the way ARIS renders a process map." |
| Sequence-alignment conformance to the discovered happy path | Conformance checking | "I measure trace fitness against the discovered happy path and show exactly which activities are inserted or skipped." |
| AI-readiness score + explainable factors | **Process context for AI** / governed AI | "The score isn't a black box — every factor is visible, which reflects ARIS's position that AI agents need governed process context." |
| Bottleneck + cycle-time analysis | Process intelligence → optimization | "Bottleneck identification is the first signal you need before deciding where an agent adds value." |
| LLM brief grounded in the computed metrics | Process context handed to an agent | "This is the actual thesis — I feed the mined metrics to an LLM so it reasons about the process with real context, not guesses." |
| Upload any log → discover → assess | Digital Twin of the Organization — Create → Discover loop | "The Discover step is what my mining engine exposes: the gap between the designed process and reality." |

---

## Questions to ask ARIS (shows deep research)

1. **"How does Process Lens weight factors internally? My implementation uses a fixed weighted
   formula — does the real product use ML to learn weights from historical ROI data?"**
   *(Shows you thought about the scoring model deeply, not just the surface output.)*

2. **"When an MCP agent queries a process model at runtime, how is the query permissioned and
   audited? Is that handled at the Process Core layer or at the MCP server boundary?"**
   *(Ties to MCP, governance, and their Oct 2026 launch — very current.)*

3. **"Object-Centric Process Mining (OCPM) handles multiple object types in a single log — how
   does ARIS deal with cases where the same event touches an Order, an Invoice, and an Item
   simultaneously? Is the OCEL 2.0 graph model used internally?"**
   *(Demonstrates you read past the press release into the methodology.)*

4. **"For simulation — when ARIS tests an agent's proposed decisions before deployment, is that
   a replay over historical event logs or a forward-simulation using the process model as a
   constraint? What's the granularity of the risk report?"**
   *(Shows you understand the 'test before deploy' promise and want to know the mechanism.)*

---

## Likely interview questions and how to answer

**"Why these six factors?"**  
> "They map to the signals that make a process automatable: standardization (an agent needs a
> predictable path), conformance fitness (how closely cases follow that path), stability (rework
> means the agent hits unexpected states), cleanliness (deviations require human judgment), volume
> (ROI only materializes at scale), and speed (shorter cycles mean tighter feedback loops). Each
> is normalized 0–1 and weighted, and I return the contribution of each so the score is auditable."

**"How is this different from a BI dashboard?"**  
> "The core is process discovery and conformance, not aggregation. I build a Directly-Follows Graph
> from the event order within each case, then run sequence alignment against the discovered happy
> path to find where cases deviate. None of that is a GROUP BY — it requires reasoning about the
> order of events per case, which is the heart of process mining."

**"How does conformance checking actually work here?"**  
> "I take the most frequent variant as the discovered happy path, then compute each trace's fitness
> as a normalized Levenshtein distance against it. Cases with fitness 1 conform exactly; for the
> rest I attribute deviations as inserted activities (present but not in the happy path, e.g. a
> 'Cancel Order') or skipped activities (in the happy path but missing). It's an approximation of
> alignment-based conformance, but it's explainable and fast."

**"How do you keep the LLM from hallucinating?"**  
> "The model never sees the raw log — it only sees the computed metrics, and the prompt tells it to
> use only those numbers. The output is a fixed four-section brief. The call is timeout-bounded, and
> if the model is unavailable it falls back to a deterministic narrative generated from the same
> metrics, so the feature never breaks and never invents data."

**"The samples are synthetic — why should we care?"**  
> "The samples are only defaults — you can upload any real event-log CSV and it mines it live. The
> samples are deliberately differentiated (different rework, deviation, and bottleneck profiles) so
> they score distinctly, which proves the pipeline discriminates. The path from upload → discover →
> conformance → score → brief is identical whether the log is synthetic or a real ARIS export."

**"What would you add next?"**  
> "An MCP server exposing this analysis, so an agent could ask 'is this process ready to automate,
> and what should I watch for?' at runtime before acting — the LLM brief I already generate, but
> served over MCP as governed process context. After that, object-centric mining (OCEL 2.0) so one
> event can touch an Order, an Invoice, and an Item instead of a single case id."

---

## Vocabulary cheat sheet

- **Process context** — the fifth layer of AI context (after task, data, knowledge, operational): how work flows across people, systems, rules, risks, and controls.
- **Digital Twin of the Organization** — the governed model that mirrors how the business actually runs; updated by the Create → Discover → Transform loop.
- **Object-Centric Process Mining (OCPM)** — process mining over OCEL 2.0 logs where multiple object types (orders, items, invoices) are linked in a single event; avoids the "convergence/divergence" problem of case-centric mining.
- **Conformance checking** — comparing a designed process model against actual execution to find deviations, skips, and workarounds.
- **MCP (Model Context Protocol)** — the protocol ARIS uses to expose process models, rules, roles, risks, and controls to LLM agents at runtime.
- **ARIS Flows** — governance workflow builder that turns process steps into executable workflows (approvals, handoffs, reviews).
- **Process Lens** — ARIS product that scores and ranks processes for AI-agent suitability in hours rather than weeks.
- **Human-in-the-loop handoff** — the moment an agent escalates to a human because the process context says the case is outside the agent's defined authority.
- **Governed AI** — agents that act only within explicitly modelled rules, controls, and escalation paths — not autonomously.
