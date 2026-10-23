# Interview Talking Points — ARIS

Use this sheet to connect Process Lens to ARIS's exact language and product vision.

---

## Core narrative (30-second pitch)

"I built Process Lens as a working implementation of what ARIS calls 'scoring processes for AI
readiness.' The product scores five enterprise processes — Order-to-Cash, Procure-to-Pay, Invoice
Approval, Customer Onboarding, Expense Reimbursement — on five weighted factors: standardization,
stability, cleanliness, volume, and speed. Each score comes with a per-factor breakdown so it's
fully explainable, which is exactly ARIS's governance-first position on agentic AI."

---

## Connection to ARIS product language

| What you built | ARIS term | Where to use it |
|---|---|---|
| Event log (caseId, activity, timestamp, resource) | Process event / task mining data | "I worked with the same event model ARIS Process Mining ingests." |
| Variant analysis | Process Mining → variant analysis | "My engine computes the same variant coverage that ARIS surfaces as a conformance signal." |
| AI-readiness score | **Process Lens** | "This is the same output ARIS Process Lens produces — a ranked list of processes by agent suitability." |
| Explainable factor breakdown | ARIS's 'governed AI' / transparency principle | "The score isn't a black box — every factor is visible, which reflects ARIS's position that AI agents need governed process context." |
| Bottleneck detection | Process intelligence → optimization | "Bottleneck identification is the first signal you need before deciding where an agent adds value." |
| Rework + exception rates | Conformance checking / deviation detection | "Rework and exception rates map to conformance deviations — processes with high rates score lower because agents struggle with unpredictable flows." |
| The whole dashboard | Digital Twin of the Organization — Create → Discover loop | "The Create step is the designed process model; the Discover step is what my mining engine exposes — the gap between design and reality." |

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

**"Why did you pick these five metrics?"**  
> "They map directly to the signals that make a process automatable: standardization (an agent
> needs a predictable path), stability (rework means the agent encounters unexpected states),
> cleanliness (exceptions require human judgment), volume (ROI only materializes at scale), and
> speed (faster processes have shorter feedback loops for the agent). ARIS's own Process Lens
> talks about 'hundreds of processes evaluated in hours' — that's exactly what a weighted scoring
> model enables."

**"How is this different from a BI dashboard?"**  
> "The metrics are process-mining metrics, not just aggregates. Variant analysis, rework
> detection, cycle-time distribution, and bottleneck identification all require reasoning about
> the order of events within a case — you can't compute them with a GROUP BY. The engine
> processes the event sequence per case before any aggregation, which is the core of process
> mining."

**"The data is synthetic — why should we care?"**  
> "The synthetic data was designed to produce meaningful results: each process family has
> deliberately different rework rates, exception rates, and variant distributions, so the ranking
> is non-trivial. The architecture — event log → metrics engine → scoring model → API → dashboard
> — is identical to a production system. Swapping `fixture.json` for a real ARIS event export
> would require no code changes."

**"What would you add next?"**  
> "An MCP server layer on top of the analysis engine, so an LLM agent could query 'which
> processes are ready for automation?' at runtime before acting — which is exactly what ARIS
> launched on October 26th. That's idea #1 from my research: a Process Context MCP server."

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
