import Link from "next/link";
import fixture from "@/lib/data/fixture.json";
import { analyzeProcess } from "@/lib/engine";
import type { ProcessLog } from "@/lib/data/types";

const S = {
  canvas:      "#090909",
  surface1:    "#141414",
  surface2:    "#1c1c1c",
  hairline:    "#262626",
  ink:         "#ffffff",
  inkMuted:    "#999999",
  accentBlue:  "#0099ff",
  success:     "#22c55e",
};

export default function HomePage() {
  const ranked = (fixture as ProcessLog[])
    .map((log) => {
      const a = analyzeProcess(log);
      return {
        id: a.id, name: a.name,
        score: a.score.score,
        caseCount: a.caseCount,
        variantCount: a.variantCount,
        reworkRate: a.reworkRate,
        exceptionRate: a.exceptionRate,
        topVariantCoverage: a.topVariantCoverage,
        bottleneck: a.bottleneck.activity,
      };
    })
    .sort((a, b) => b.score - a.score);


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
      }}>
        <span style={{ fontWeight: 600, fontSize: "14px", letterSpacing: "-0.14px", color: S.ink, flex: 1 }}>
          Process Lens
        </span>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <a href="https://github.com/manjeet-74/process-lens"
            style={{ color: S.inkMuted, fontSize: "14px", letterSpacing: "-0.14px" }}>
            GitHub
          </a>
          <a href="/api/processes"
            style={{
              background: S.ink,
              color: S.canvas,
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "-0.14px",
              padding: "8px 15px",
              borderRadius: "100px",
              textDecoration: "none",
            }}>
            API
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: "96px 30px 80px", maxWidth: "1200px", margin: "0 auto" }}>
        <p style={{
          fontSize: "13px",
          fontWeight: 500,
          color: S.inkMuted,
          marginBottom: "24px",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}>
          ARIS Application · Portfolio Project
        </p>
        <h1 style={{
          fontSize: "clamp(52px, 8vw, 85px)",
          fontWeight: 500,
          lineHeight: 0.95,
          letterSpacing: "-4.25px",
          color: S.ink,
          marginBottom: "28px",
          maxWidth: "700px",
        }}>
          Score every process for AI readiness.
        </h1>
        <p style={{
          fontSize: "18px",
          fontWeight: 400,
          lineHeight: 1.3,
          letterSpacing: "-0.18px",
          color: S.inkMuted,
          maxWidth: "520px",
          marginBottom: "36px",
        }}>
          Ingests enterprise event logs, computes process-mining metrics, and ranks each
          process 0–100 for agent-automation suitability. Inspired by ARIS Process Lens.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a href="#rankings" style={{
            background: S.ink, color: S.canvas,
            fontSize: "14px", fontWeight: 500, letterSpacing: "-0.14px",
            padding: "10px 20px", borderRadius: "100px", textDecoration: "none",
          }}>
            View Rankings ↓
          </a>
          <a href="/api/processes" style={{
            background: S.surface1, color: S.ink,
            fontSize: "14px", fontWeight: 500, letterSpacing: "-0.14px",
            padding: "10px 20px", borderRadius: "100px", textDecoration: "none",
          }}>
            JSON API
          </a>
        </div>
      </section>

      {/* ── STAT CARDS ── */}
      <section style={{ padding: "0 30px 80px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1px", background: S.hairline, border: `1px solid ${S.hairline}`, borderRadius: "20px", overflow: "hidden" }}>

          <div style={{ background: S.surface1, padding: "32px" }}>
            <p style={{ fontSize: "12px", fontWeight: 500, color: S.inkMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>Approach</p>
            <p style={{ fontSize: "20px", fontWeight: 500, lineHeight: 1.25, letterSpacing: "-0.6px", color: S.ink }}>
              Process context is the missing layer of enterprise AI.
            </p>
          </div>

          <div style={{ background: S.surface1, padding: "32px" }}>
            <p style={{ fontSize: "12px", fontWeight: 500, color: S.inkMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>Signal</p>
            <p style={{ fontSize: "20px", fontWeight: 500, lineHeight: 1.25, letterSpacing: "-0.6px", color: S.ink }}>
              82% of Global 2000 execs say process context is required for AI agents.
            </p>
          </div>

          <div style={{ background: S.surface1, padding: "32px" }}>
            <p style={{ fontSize: "12px", fontWeight: 500, color: S.inkMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>Dataset</p>
            <p style={{ fontSize: "52px", fontWeight: 500, lineHeight: 0.95, letterSpacing: "-2px", color: S.ink, marginBottom: "6px" }}>400</p>
            <p style={{ fontSize: "14px", color: S.inkMuted, letterSpacing: "-0.14px" }}>synthetic cases across 5 enterprise process families</p>
          </div>

        </div>
      </section>

      {/* ── RANKINGS TABLE ── */}
      <section id="rankings" style={{ padding: "0 30px 96px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "13px", fontWeight: 500, color: S.inkMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>Rankings</p>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 500, letterSpacing: "-2.5px", lineHeight: 1, color: S.ink }}>
            AI-readiness by process
          </h2>
        </div>

        {/* Disclaimer */}
        <div style={{
          background: S.surface1,
          border: `1px solid ${S.hairline}`,
          borderRadius: "10px",
          padding: "12px 16px",
          color: S.inkMuted,
          fontSize: "13px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{ color: "#fbbf24" }}>⚠</span>
          <span><strong style={{ color: S.ink }}>Synthetic data — demo only.</strong> All event logs are generated. No real ARIS or client data is used.</span>
        </div>

        <div style={{
          background: S.surface1,
          border: `1px solid ${S.hairline}`,
          borderRadius: "20px",
          overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${S.hairline}` }}>
                {["#", "Process", "AI Score", "Cases", "Variants", "Rework", "Exceptions", "Bottleneck"].map((h, i) => (
                  <th key={h} style={{
                    padding: "14px 20px",
                    textAlign: i <= 1 ? "left" : i === 2 ? "center" : i === 7 ? "left" : "right",
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "-0.12px",
                    color: S.inkMuted,
                    whiteSpace: "nowrap",
                    background: S.surface2,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((p, i) => {
                const isTop = p.score >= 75;
                const isMid = p.score >= 55;
                const scoreColor = isTop ? S.success : isMid ? "#fbbf24" : "#ef4444";

                return (
                  <tr key={p.id} style={{
                    borderBottom: `1px solid ${S.hairline}`,
                    background: "transparent",
                    transition: "background 0.15s",
                  }}>
                    <td style={{ padding: "18px 20px", color: S.inkMuted, fontSize: "13px", fontVariantNumeric: "tabular-nums" }}>{i + 1}</td>
                    <td style={{ padding: "18px 20px" }}>
                      <Link href={`/process/${p.id}`} style={{
                        color: S.ink,
                        fontSize: "15px",
                        fontWeight: 500,
                        letterSpacing: "-0.15px",
                        textDecoration: "none",
                      }}>
                        {p.name}
                      </Link>
                    </td>
                    <td style={{ padding: "18px 20px", textAlign: "center" }}>
                      <span style={{
                        display: "inline-block",
                        color: scoreColor,
                        fontSize: "14px",
                        fontWeight: 500,
                        letterSpacing: "-0.14px",
                        background: `${scoreColor}18`,
                        border: `1px solid ${scoreColor}40`,
                        borderRadius: "100px",
                        padding: "4px 12px",
                        fontVariantNumeric: "tabular-nums",
                      }}>{p.score}</span>
                    </td>
                    <td style={{ padding: "18px 20px", textAlign: "right", color: S.inkMuted, fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>{p.caseCount}</td>
                    <td style={{ padding: "18px 20px", textAlign: "right", color: S.inkMuted, fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>{p.variantCount}</td>
                    <td style={{ padding: "18px 20px", textAlign: "right", color: S.inkMuted, fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>{(p.reworkRate * 100).toFixed(1)}%</td>
                    <td style={{ padding: "18px 20px", textAlign: "right", color: S.inkMuted, fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>{(p.exceptionRate * 100).toFixed(1)}%</td>
                    <td style={{ padding: "18px 20px", color: S.inkMuted, fontSize: "13px", letterSpacing: "-0.13px" }}>{p.bottleneck}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: S.canvas,
        borderTop: `1px solid ${S.hairline}`,
        padding: "48px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 500, color: S.inkMuted, letterSpacing: "-0.13px" }}>
            Built by <a href="https://linkedin.com/in/manjeet70" style={{ color: S.ink }}>Manjeet Roy</a> · MS Ramaiah Institute of Technology
          </p>
          <p style={{ fontSize: "12px", color: "#333", letterSpacing: "-0.12px", marginTop: "4px" }}>
            Synthetic data — not affiliated with ARIS or SAG Aris GmbH.
          </p>
        </div>
        <a href="https://github.com/manjeet-74/process-lens" style={{
          background: S.surface1, color: S.ink,
          fontSize: "14px", fontWeight: 500, letterSpacing: "-0.14px",
          padding: "10px 20px", borderRadius: "100px", textDecoration: "none",
          border: `1px solid ${S.hairline}`,
        }}>
          View on GitHub ↗
        </a>
      </footer>
    </div>
  );
}
