import Link from "next/link";
import { notFound } from "next/navigation";
import fixture from "@/lib/data/fixture.json";
import { analyzeProcess } from "@/lib/engine";
import type { ProcessLog } from "@/lib/data/types";
import { MetricChart } from "@/components/MetricChart";

export const instant = false;

export function generateStaticParams() {
  return (fixture as ProcessLog[]).map((p) => ({ id: p.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProcessDetailPage({ params }: Props) {
  const { id } = await params;
  const log = (fixture as ProcessLog[]).find((p) => p.id === id);
  if (!log) notFound();

  const a = analyzeProcess(log);
  const avgHours = (a.cycleTime.avgMs / 3_600_000).toFixed(1);
  const medianHours = (a.cycleTime.medianMs / 3_600_000).toFixed(1);

  const scoreColor = a.score.score >= 75
    ? { bg: "rgba(22,163,74,0.15)", text: "#4ade80", border: "rgba(22,163,74,0.3)" }
    : a.score.score >= 55
    ? { bg: "rgba(217,119,6,0.15)", text: "#fbbf24", border: "rgba(217,119,6,0.3)" }
    : { bg: "rgba(220,38,38,0.15)", text: "#f87171", border: "rgba(220,38,38,0.3)" };

  const stats = [
    { label: "Cases", value: String(a.caseCount) },
    { label: "Variants", value: String(a.variantCount) },
    { label: "Rework Rate", value: `${(a.reworkRate * 100).toFixed(1)}%` },
    { label: "Exception Rate", value: `${(a.exceptionRate * 100).toFixed(1)}%` },
    { label: "Avg Cycle Time", value: `${avgHours}h` },
    { label: "Median Cycle Time", value: `${medianHours}h` },
    { label: "Bottleneck Step", value: a.bottleneck.activity },
    { label: "Top Variant Coverage", value: `${(a.topVariantCoverage * 100).toFixed(1)}%` },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "#0f0f1a", padding: "0 16px 60px" }}>

      {/* Top nav */}
      <div style={{
        background: "linear-gradient(135deg, #0f0f1a 0%, #1e1b4b 40%, #0f172a 100%)",
        borderBottom: "1px solid #312e81",
        padding: "24px 28px",
        marginBottom: "40px",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Link href="/" style={{ color: "#818cf8", fontSize: "14px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            ← All Processes
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "16px", flexWrap: "wrap" }}>
            <h1 style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #fff 30%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: 0,
            }}>
              {a.name}
            </h1>
            <span style={{
              background: scoreColor.bg,
              color: scoreColor.text,
              border: `1px solid ${scoreColor.border}`,
              borderRadius: "999px",
              padding: "4px 14px",
              fontSize: "16px",
              fontWeight: 800,
            }}>{a.score.score}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Disclaimer */}
        <div style={{
          background: "rgba(251,191,36,0.08)",
          border: "1px solid rgba(251,191,36,0.25)",
          borderRadius: "10px",
          padding: "12px 18px",
          color: "#fbbf24",
          fontSize: "13px",
          marginBottom: "32px",
        }}>
          ⚠️ <strong>Synthetic data — demo only.</strong> No real ARIS or client data is used.
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "20px",
            }}>
              <p style={{ fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, margin: "0 0 6px" }}>{s.label}</p>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#e2e8f0", margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Factor chart */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "28px",
          marginBottom: "28px",
        }}>
          <h2 style={{ color: "#f1f5f9", fontSize: "18px", fontWeight: 700, margin: "0 0 6px" }}>AI-Readiness Factor Breakdown</h2>
          <p style={{ color: "#475569", fontSize: "13px", margin: "0 0 24px" }}>Each factor is fully explainable — no black boxes.</p>
          <MetricChart factors={a.score.factors} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginTop: "20px" }}>
            {a.score.factors.map((f) => (
              <div key={f.name} style={{
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: "8px",
                padding: "12px",
              }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#818cf8", textTransform: "capitalize", margin: "0 0 6px" }}>{f.name}</p>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 2px" }}>Raw: {(f.value * 100).toFixed(0)}</p>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 2px" }}>Weight: {(f.weight * 100).toFixed(0)}%</p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#a5b4fc", margin: 0 }}>+{(f.contribution * 100).toFixed(1)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "28px",
        }}>
          <h2 style={{ color: "#f1f5f9", fontSize: "18px", fontWeight: 700, margin: "0 0 6px" }}>Process Variants (top 10)</h2>
          <p style={{ color: "#475569", fontSize: "13px", margin: "0 0 20px" }}>Distinct execution paths ordered by frequency.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {a.variants.slice(0, 10).map((v, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{
                  flexShrink: 0,
                  width: "22px", height: "22px",
                  background: "rgba(99,102,241,0.2)",
                  color: "#818cf8",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 800,
                  marginTop: "1px",
                }}>{i + 1}</span>
                <p style={{ flex: 1, color: "#94a3b8", fontSize: "13px", margin: 0, wordBreak: "break-word", lineHeight: "1.5" }}>
                  {v.path.join(" → ")}
                </p>
                <span style={{ flexShrink: 0, color: "#475569", fontSize: "12px", whiteSpace: "nowrap" }}>{v.count} cases</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
