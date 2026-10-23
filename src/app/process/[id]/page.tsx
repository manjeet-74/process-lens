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

const S = {
  canvas:      "#090909",
  surface1:    "#141414",
  surface2:    "#1c1c1c",
  hairline:    "#262626",
  ink:         "#ffffff",
  inkMuted:    "#999999",
  accentBlue:  "#0099ff",
  gradViolet:  "#6a4cf5",
  gradMagenta: "#d44df0",
  gradOrange:  "#ff7a3d",
  success:     "#22c55e",
};

const PROCESS_GRADIENTS: Record<string, [string, string]> = {
  "order-to-cash":          [S.gradViolet, "#4338ca"],
  "procure-to-pay":         [S.gradMagenta, "#a21caf"],
  "invoice-approval":       [S.gradOrange, "#c2410c"],
  "customer-onboarding":    ["#22c55e", "#15803d"],
  "expense-reimbursement":  ["#ff5577", "#be185d"],
};

export default async function ProcessDetailPage({ params }: Props) {
  const { id } = await params;
  const log = (fixture as ProcessLog[]).find((p) => p.id === id);
  if (!log) notFound();

  const a = analyzeProcess(log);
  const avgHours  = (a.cycleTime.avgMs    / 3_600_000).toFixed(1);
  const medianHours = (a.cycleTime.medianMs / 3_600_000).toFixed(1);

  const isTop = a.score.score >= 75;
  const isMid = a.score.score >= 55;
  const scoreColor = isTop ? S.success : isMid ? "#fbbf24" : "#ef4444";

  const [gradA, gradB] = PROCESS_GRADIENTS[id] ?? [S.gradViolet, "#4338ca"];

  const stats = [
    { label: "Cases",               value: String(a.caseCount) },
    { label: "Variants",            value: String(a.variantCount) },
    { label: "Rework Rate",         value: `${(a.reworkRate * 100).toFixed(1)}%` },
    { label: "Exception Rate",      value: `${(a.exceptionRate * 100).toFixed(1)}%` },
    { label: "Avg Cycle Time",      value: `${avgHours}h` },
    { label: "Median Cycle Time",   value: `${medianHours}h` },
    { label: "Top Variant",         value: `${(a.topVariantCoverage * 100).toFixed(0)}%` },
    { label: "Bottleneck",          value: a.bottleneck.activity },
  ];

  return (
    <div style={{ background: S.canvas, minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <nav style={{
        background: S.canvas,
        borderBottom: `1px solid ${S.hairline}`,
        height: "56px",
        display: "flex",
        alignItems: "center",
        padding: "0 30px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        gap: "20px",
      }}>
        <Link href="/" style={{ color: S.inkMuted, fontSize: "14px", letterSpacing: "-0.14px" }}>← Process Lens</Link>
        <span style={{ color: S.hairline }}>|</span>
        <span style={{ color: S.ink, fontSize: "14px", fontWeight: 500, letterSpacing: "-0.14px" }}>{a.name}</span>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: "80px 30px 60px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "40px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 500, color: S.inkMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
              Process Analysis
            </p>
            <h1 style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 500,
              lineHeight: 0.95,
              letterSpacing: "-3.5px",
              color: S.ink,
              marginBottom: "20px",
            }}>
              {a.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span style={{
                background: `${scoreColor}18`,
                color: scoreColor,
                border: `1px solid ${scoreColor}40`,
                borderRadius: "100px",
                padding: "6px 16px",
                fontSize: "15px",
                fontWeight: 500,
                letterSpacing: "-0.15px",
              }}>
                AI Score: {a.score.score}
              </span>
              <span style={{ color: S.inkMuted, fontSize: "14px" }}>{a.caseCount} cases · {a.eventCount} events</span>
            </div>
          </div>

          {/* Mini gradient spotlight — score visualization */}
          <div style={{
            background: `linear-gradient(135deg, ${gradA}, ${gradB})`,
            borderRadius: "20px",
            padding: "28px 32px",
            minWidth: "180px",
            textAlign: "center",
            flexShrink: 0,
          }}>
            <p style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.6)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
              AI Score
            </p>
            <p style={{ fontSize: "64px", fontWeight: 500, lineHeight: 1, letterSpacing: "-3px", color: S.ink }}>
              {a.score.score}
            </p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>out of 100</p>
          </div>
        </div>
      </section>

      <div style={{ padding: "0 30px 96px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* ── STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: "1px", background: S.hairline, border: `1px solid ${S.hairline}`, borderRadius: "20px", overflow: "hidden", marginBottom: "20px" }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: S.surface1, padding: "24px 20px" }}>
              <p style={{ fontSize: "12px", fontWeight: 500, color: S.inkMuted, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "8px" }}>{s.label}</p>
              <p style={{ fontSize: "22px", fontWeight: 500, letterSpacing: "-1px", color: S.ink, lineHeight: 1 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── FACTOR BREAKDOWN ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>

          {/* Chart card */}
          <div style={{
            background: S.surface1,
            border: `1px solid ${S.hairline}`,
            borderRadius: "20px",
            padding: "28px",
          }}>
            <p style={{ fontSize: "12px", fontWeight: 500, color: S.inkMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Factor Chart</p>
            <h2 style={{ fontSize: "22px", fontWeight: 500, letterSpacing: "-0.8px", color: S.ink, marginBottom: "24px" }}>
              AI-Readiness Breakdown
            </h2>
            <MetricChart factors={a.score.factors} />
          </div>

          {/* Factor detail card */}
          <div style={{
            background: S.surface1,
            border: `1px solid ${S.hairline}`,
            borderRadius: "20px",
            padding: "28px",
          }}>
            <p style={{ fontSize: "12px", fontWeight: 500, color: S.inkMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Scoring Factors</p>
            <h2 style={{ fontSize: "22px", fontWeight: 500, letterSpacing: "-0.8px", color: S.ink, marginBottom: "24px" }}>
              Explainable Score
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {a.score.factors.map((f, i) => {
                const barColors = [S.gradViolet, S.gradMagenta, S.gradOrange, "#22c55e", "#0099ff"];
                return (
                  <div key={f.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: S.ink, letterSpacing: "-0.13px", textTransform: "capitalize" }}>{f.name}</span>
                      <span style={{ fontSize: "13px", color: S.inkMuted }}>{(f.weight * 100).toFixed(0)}% weight · <strong style={{ color: S.ink }}>{(f.value * 100).toFixed(0)}</strong></span>
                    </div>
                    <div style={{ background: S.surface2, borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                      <div style={{ width: `${f.value * 100}%`, height: "100%", background: barColors[i], borderRadius: "4px", transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "24px", padding: "16px", background: S.surface2, borderRadius: "10px" }}>
              <p style={{ fontSize: "12px", color: S.inkMuted, marginBottom: "4px" }}>Total Score</p>
              <p style={{ fontSize: "32px", fontWeight: 500, letterSpacing: "-1.5px", color: scoreColor }}>{a.score.score} / 100</p>
            </div>
          </div>
        </div>

        {/* ── VARIANTS ── */}
        <div style={{
          background: S.surface1,
          border: `1px solid ${S.hairline}`,
          borderRadius: "20px",
          overflow: "hidden",
        }}>
          <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${S.hairline}` }}>
            <p style={{ fontSize: "12px", fontWeight: 500, color: S.inkMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Variants</p>
            <h2 style={{ fontSize: "22px", fontWeight: 500, letterSpacing: "-0.8px", color: S.ink }}>Top 10 Execution Paths</h2>
          </div>
          <div>
            {a.variants.slice(0, 10).map((v, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px 28px",
                borderBottom: i < 9 ? `1px solid ${S.hairline}` : "none",
              }}>
                <span style={{
                  flexShrink: 0,
                  width: "24px",
                  height: "24px",
                  background: i === 0 ? `linear-gradient(135deg, ${gradA}, ${gradB})` : S.surface2,
                  color: S.ink,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                }}>{i + 1}</span>
                <p style={{ flex: 1, fontSize: "14px", fontWeight: 400, color: i === 0 ? S.ink : S.inkMuted, letterSpacing: "-0.14px", margin: 0 }}>
                  {v.path.join(" → ")}
                </p>
                <span style={{ flexShrink: 0, fontSize: "13px", color: S.inkMuted, fontVariantNumeric: "tabular-nums" }}>{v.count} cases</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: "12px", color: "#333", letterSpacing: "-0.12px", marginTop: "24px", textAlign: "center" }}>
          ⚠ Synthetic data, demo only. No real ARIS or client data is used.
        </p>
      </div>
    </div>
  );
}
