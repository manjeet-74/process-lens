"use client";

import { useEffect, useRef, useState } from "react";
import type { Analysis } from "@/lib/mining/types";
import { ProcessMap } from "@/components/ProcessMap";
import { Markdown } from "@/components/Markdown";

const S = {
  canvas: "#090909",
  surface1: "#141414",
  surface2: "#1c1c1c",
  hairline: "#262626",
  ink: "#ffffff",
  inkMuted: "#999999",
  success: "#22c55e",
  warn: "#fbbf24",
  bad: "#ef4444",
};

interface SampleMeta {
  file: string;
  name: string;
  cases: number;
}

const pct = (x: number) => `${(x * 100).toFixed(0)}%`;
const hrs = (ms: number) => {
  const h = ms / 3_600_000;
  if (h < 1) return `${Math.round(ms / 60_000)}m`;
  if (h < 48) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
};
const scoreColor = (s: number) => (s >= 75 ? S.success : s >= 55 ? S.warn : S.bad);

export default function Workbench() {
  const [samples, setSamples] = useState<SampleMeta[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [activeName, setActiveName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [narrative, setNarrative] = useState<string>("");
  const [narrativeSource, setNarrativeSource] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/samples/manifest.json")
      .then((r) => r.json())
      .then(setSamples)
      .catch(() => setSamples([]));
  }, []);

  async function runAnalyze(csv: string, name: string) {
    setLoading(true);
    setError("");
    setNarrative("");
    setNarrativeSource("");
    setActiveName(name);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed.");
      setAnalysis(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadSample(s: SampleMeta) {
    const csv = await fetch(`/samples/${s.file}`).then((r) => r.text());
    runAnalyze(csv, s.name);
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => runAnalyze(String(reader.result), file.name.replace(/\.csv$/i, ""));
    reader.readAsText(file);
  }

  async function generateInsights() {
    if (!analysis) return;
    setAiLoading(true);
    setNarrative("");
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis }),
      });
      const data = await res.json();
      setNarrative(data.narrative ?? "No narrative returned.");
      setNarrativeSource(data.source ?? "");
    } catch {
      setNarrative("Could not reach the insight service.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div style={{ background: S.canvas, minHeight: "100vh", color: S.ink }}>
      <nav style={{ borderBottom: `1px solid ${S.hairline}`, height: 56, display: "flex", alignItems: "center", padding: "0 30px", position: "sticky", top: 0, background: S.canvas, zIndex: 50 }}>
        <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.14px", flex: 1 }}>Process Lens</span>
        <a href="https://github.com/manjeet-74/process-lens" style={{ color: S.inkMuted, fontSize: 14, textDecoration: "none" }}>GitHub</a>
      </nav>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 30px 32px" }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: S.inkMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 20 }}>
          Process Intelligence Workbench
        </p>
        <h1 style={{ fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 500, lineHeight: 0.98, letterSpacing: "-3px", maxWidth: 760, marginBottom: 20 }}>
          Mine any event log. Score it for AI-agent readiness.
        </h1>
        <p style={{ fontSize: 17, color: S.inkMuted, lineHeight: 1.4, maxWidth: 560, letterSpacing: "-0.17px" }}>
          Upload a real event log or pick a sample. Process Lens discovers the process graph, checks conformance to the happy path, finds the bottleneck, and asks an LLM what an AI agent would need (and where it would break).
        </p>
      </section>

      {/* Control bar */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 30px 20px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {samples.map((s) => (
          <button key={s.file} onClick={() => loadSample(s)} disabled={loading}
            style={{ background: activeName === s.name ? S.ink : S.surface1, color: activeName === s.name ? S.canvas : S.ink, border: `1px solid ${S.hairline}`, borderRadius: 100, padding: "9px 16px", fontSize: 14, fontWeight: 500, cursor: loading ? "default" : "pointer" }}>
            {s.name} <span style={{ opacity: 0.6 }}>· {s.cases}</span>
          </button>
        ))}
        <button onClick={() => fileRef.current?.click()} disabled={loading}
          style={{ background: "transparent", color: S.inkMuted, border: `1px dashed ${S.hairline}`, borderRadius: 100, padding: "9px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Upload CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onUpload} style={{ display: "none" }} />
      </section>

      {/* Disclaimer */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 30px 24px" }}>
        <div style={{ background: S.surface1, border: `1px solid ${S.hairline}`, borderRadius: 10, padding: "12px 16px", color: S.inkMuted, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: S.warn }}>⚠</span>
          <span><strong style={{ color: S.ink }}>Synthetic samples, demo only.</strong> Sample logs are generated. Upload your own CSV (case id, activity, timestamp columns) to mine real data. Not affiliated with ARIS.</span>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 30px 96px" }}>
        {loading && <Panel><p style={{ color: S.inkMuted }}>Mining {activeName}…</p></Panel>}
        {error && <Panel><p style={{ color: S.bad }}>{error}</p></Panel>}
        {!loading && !error && !analysis && (
          <Panel><p style={{ color: S.inkMuted }}>Pick a sample above to discover its process, or upload your own event log.</p></Panel>
        )}

        {analysis && !loading && (
          <>
            {/* Stat tiles */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: S.hairline, border: `1px solid ${S.hairline}`, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
              <Tile label="AI Readiness" value={String(analysis.score.score)} color={scoreColor(analysis.score.score)} big />
              <Tile label="Cases" value={String(analysis.caseCount)} />
              <Tile label="Activities" value={String(analysis.activityCount)} />
              <Tile label="Variants" value={String(analysis.variantResult.variantCount)} />
              <Tile label="Conformance" value={pct(analysis.conformance.conformingRate)} />
              <Tile label="Rework" value={pct(analysis.reworkRate)} />
              <Tile label="Median Cycle" value={hrs(analysis.performance.medianCycleMs)} />
            </div>

            {/* Process map */}
            <SectionLabel>Discovered Process Map</SectionLabel>
            <p style={{ color: S.inkMuted, fontSize: 13, margin: "0 0 12px" }}>
              Node size = case frequency · edge thickness = transition frequency · <span style={{ color: S.ink }}>white animated path</span> = discovered happy path · <span style={{ color: S.bad }}>red</span> = bottleneck
            </p>
            <div style={{ marginBottom: 32 }}>
              <ProcessMap dfg={analysis.dfg} referencePath={analysis.conformance.referencePath} bottleneck={analysis.performance.bottleneck.activity} />
            </div>

            {/* AI insights */}
            <SectionLabel>AI-Readiness Brief</SectionLabel>
            <div style={{ background: S.surface1, border: `1px solid ${S.hairline}`, borderRadius: 16, padding: 24, marginBottom: 32 }}>
              {!narrative && !aiLoading && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <p style={{ color: S.inkMuted, fontSize: 14, margin: 0, maxWidth: 560 }}>
                    Ask Gemini to read the computed metrics and write a grounded brief: what an AI agent must know about this process, and where it would fail.
                  </p>
                  <button onClick={generateInsights}
                    style={{ background: S.ink, color: S.canvas, border: "none", borderRadius: 100, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                    Generate brief
                  </button>
                </div>
              )}
              {aiLoading && <p style={{ color: S.inkMuted, margin: 0 }}>Reading the metrics and writing the brief…</p>}
              {narrative && (
                <>
                  <Markdown text={narrative} />
                  <p style={{ color: "#555", fontSize: 11, marginTop: 12 }}>
                    {narrativeSource === "gemini" ? "Generated live by Gemini from the computed metrics." : "Local fallback (live model unavailable)."}
                  </p>
                </>
              )}
            </div>

            {/* Conformance + Variants */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 32 }}>
              <div style={{ background: S.surface1, border: `1px solid ${S.hairline}`, borderRadius: 16, padding: 24 }}>
                <SectionLabel inline>Conformance</SectionLabel>
                <p style={{ color: S.inkMuted, fontSize: 13, margin: "8px 0 16px" }}>
                  Reference happy path: <span style={{ color: S.ink }}>{analysis.conformance.referencePath.join(" → ")}</span>
                </p>
                <Row label="Avg fitness" value={pct(analysis.conformance.avgFitness)} />
                <Row label="Conforming cases" value={pct(analysis.conformance.conformingRate)} />
                <Row label="Deviation rate" value={pct(analysis.conformance.deviationRate)} />
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 12, color: S.inkMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Top deviations</p>
                  {analysis.conformance.topDeviations.length === 0 && <p style={{ color: S.inkMuted, fontSize: 13 }}>None — fully conforming.</p>}
                  {analysis.conformance.topDeviations.slice(0, 6).map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: `1px solid ${S.hairline}` }}>
                      <span><span style={{ color: d.kind === "inserted" ? S.bad : S.warn }}>{d.kind}</span> <span style={{ color: S.ink }}>{d.activity}</span></span>
                      <span style={{ color: S.inkMuted }}>{d.cases} cases</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: S.surface1, border: `1px solid ${S.hairline}`, borderRadius: 16, padding: 24 }}>
                <SectionLabel inline>Top Variants</SectionLabel>
                <div style={{ marginTop: 12 }}>
                  {analysis.variantResult.variants.slice(0, 6).map((v, i) => (
                    <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${S.hairline}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: S.inkMuted }}>#{i + 1}</span>
                        <span style={{ fontSize: 12, color: S.inkMuted }}>{v.count} cases · {pct(v.coverage)}</span>
                      </div>
                      <p style={{ fontSize: 12.5, color: i === 0 ? S.ink : S.inkMuted, margin: 0, lineHeight: 1.4 }}>{v.path.join(" → ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance */}
            <div style={{ background: S.surface1, border: `1px solid ${S.hairline}`, borderRadius: 16, padding: 24 }}>
              <SectionLabel inline>Performance & Bottleneck</SectionLabel>
              <p style={{ color: S.inkMuted, fontSize: 13, margin: "8px 0 16px" }}>
                Bottleneck: <span style={{ color: S.bad }}>{analysis.performance.bottleneck.activity}</span> — longest wait to start (~{hrs(analysis.performance.bottleneck.avgWaitMs)}).
              </p>
              <Row label="Median cycle time" value={hrs(analysis.performance.medianCycleMs)} />
              <Row label="Average cycle time" value={hrs(analysis.performance.avgCycleMs)} />
              <Row label="95th percentile cycle" value={hrs(analysis.performance.p95CycleMs)} />
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 12, color: S.inkMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Slowest transitions</p>
                {analysis.performance.slowestEdges.map((e, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: `1px solid ${S.hairline}` }}>
                    <span style={{ color: S.ink }}>{e.from} → {e.to}</span>
                    <span style={{ color: S.inkMuted }}>{hrs(e.avgDurationMs)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <footer style={{ borderTop: `1px solid ${S.hairline}`, padding: "40px 30px", maxWidth: 1180, margin: "0 auto" }}>
        <p style={{ fontSize: 13, color: S.inkMuted }}>
          Built by <a href="https://linkedin.com/in/manjeet70" style={{ color: S.ink }}>Manjeet Roy</a> · MS Ramaiah Institute of Technology
        </p>
        <p style={{ fontSize: 12, color: "#444", marginTop: 4 }}>Synthetic data. Not affiliated with ARIS or SAG Aris GmbH.</p>
      </footer>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div style={{ background: S.surface1, border: `1px solid ${S.hairline}`, borderRadius: 16, padding: 40, textAlign: "center" }}>{children}</div>;
}

function Tile({ label, value, color, big }: { label: string; value: string; color?: string; big?: boolean }) {
  return (
    <div style={{ background: S.surface1, padding: "20px 18px" }}>
      <p style={{ fontSize: 11, color: S.inkMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: big ? 34 : 24, fontWeight: 500, letterSpacing: "-1px", color: color ?? S.ink, lineHeight: 1 }}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "7px 0", borderBottom: `1px solid ${S.hairline}` }}>
      <span style={{ color: S.inkMuted }}>{label}</span>
      <span style={{ color: S.ink, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function SectionLabel({ children, inline }: { children: React.ReactNode; inline?: boolean }) {
  return (
    <p style={{ fontSize: 12, fontWeight: 600, color: S.ink, textTransform: "uppercase", letterSpacing: "1px", margin: inline ? "0" : "0 0 10px" }}>
      {children}
    </p>
  );
}
