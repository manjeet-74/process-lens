import Link from "next/link";
import fixture from "@/lib/data/fixture.json";
import { analyzeProcess } from "@/lib/engine";
import type { ProcessLog } from "@/lib/data/types";

export default function HomePage() {
  const ranked = (fixture as ProcessLog[])
    .map((log) => {
      const a = analyzeProcess(log);
      return {
        id: a.id,
        name: a.name,
        score: a.score.score,
        caseCount: a.caseCount,
        variantCount: a.variantCount,
        reworkRate: a.reworkRate,
        exceptionRate: a.exceptionRate,
        bottleneck: a.bottleneck.activity,
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <main style={{ minHeight: "100vh", background: "#0f0f1a", padding: "0 16px 60px" }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0f0f1a 0%, #1e1b4b 50%, #0f172a 100%)",
        borderBottom: "1px solid #312e81",
        padding: "60px 24px 48px",
        textAlign: "center",
        marginBottom: "40px",
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.4)",
          color: "#a5b4fc",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          padding: "6px 16px",
          borderRadius: "999px",
          marginBottom: "20px",
        }}>
          Portfolio Project · ARIS Application
        </div>
        <h1 style={{
          fontSize: "clamp(36px, 6vw, 56px)",
          fontWeight: 800,
          letterSpacing: "-1.5px",
          background: "linear-gradient(135deg, #fff 30%, #a5b4fc 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          margin: "0 0 12px",
          lineHeight: 1.1,
        }}>
          Process Lens
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "18px", margin: "0 auto", maxWidth: "520px" }}>
          AI-readiness scoring and ranking for enterprise business processes — inspired by ARIS Process Lens
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "28px" }}>
          {["5 Processes", "400 Cases", "17 Tests Passing", "TypeScript"].map(t => (
            <span key={t} style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#cbd5e1",
              fontSize: "13px",
              padding: "5px 14px",
              borderRadius: "999px",
            }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

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
          ⚠️ <strong>Synthetic data — demo only.</strong> All process logs are procedurally generated. No real ARIS or client data is used.
        </div>

        {/* Table card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          overflow: "hidden",
        }}>
          <div style={{ padding: "24px 28px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ color: "#f1f5f9", fontSize: "20px", fontWeight: 700, margin: 0 }}>
              AI-Readiness Rankings
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "4px 0 0" }}>
              Processes ranked by agent-automation suitability. Click any process to see the full breakdown.
            </p>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["#", "Process", "AI Score", "Cases", "Variants", "Rework %", "Exception %", "Bottleneck"].map((h, i) => (
                  <th key={h} style={{
                    padding: "12px 16px",
                    textAlign: i <= 1 ? "left" : i === 2 ? "center" : i === 7 ? "left" : "right",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "#475569",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((p, i) => {
                const scoreColor = p.score >= 75 ? { bg: "rgba(22,163,74,0.15)", text: "#4ade80", border: "rgba(22,163,74,0.3)" }
                  : p.score >= 55 ? { bg: "rgba(217,119,6,0.15)", text: "#fbbf24", border: "rgba(217,119,6,0.3)" }
                  : { bg: "rgba(220,38,38,0.15)", text: "#f87171", border: "rgba(220,38,38,0.3)" };
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "16px", color: "#334155", fontFamily: "monospace", fontSize: "14px" }}>{i + 1}</td>
                    <td style={{ padding: "16px" }}>
                      <Link href={`/process/${p.id}`} style={{
                        color: "#818cf8",
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: "15px",
                      }}>
                        {p.name}
                      </Link>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{
                        display: "inline-block",
                        background: scoreColor.bg,
                        color: scoreColor.text,
                        border: `1px solid ${scoreColor.border}`,
                        borderRadius: "999px",
                        padding: "3px 12px",
                        fontSize: "13px",
                        fontWeight: 700,
                      }}>{p.score}</span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right", color: "#94a3b8", fontSize: "14px" }}>{p.caseCount}</td>
                    <td style={{ padding: "16px", textAlign: "right", color: "#94a3b8", fontSize: "14px" }}>{p.variantCount}</td>
                    <td style={{ padding: "16px", textAlign: "right", color: "#94a3b8", fontSize: "14px" }}>{(p.reworkRate * 100).toFixed(1)}%</td>
                    <td style={{ padding: "16px", textAlign: "right", color: "#94a3b8", fontSize: "14px" }}>{(p.exceptionRate * 100).toFixed(1)}%</td>
                    <td style={{ padding: "16px", color: "#64748b", fontSize: "13px" }}>{p.bottleneck}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: "center", color: "#1e293b", fontSize: "13px", marginTop: "32px" }}>
          Built by <strong style={{ color: "#475569" }}>Manjeet Roy</strong> · MS Ramaiah Institute of Technology · github.com/manjeet-74
        </p>
      </div>
    </main>
  );
}
