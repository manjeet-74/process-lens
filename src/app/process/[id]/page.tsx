import Link from "next/link";
import { notFound } from "next/navigation";
import fixture from "@/lib/data/fixture.json";
import { analyzeProcess } from "@/lib/engine";
import type { ProcessLog } from "@/lib/data/types";
import { ScoreBadge } from "@/components/ScoreBadge";
import { MetricChart } from "@/components/MetricChart";

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

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto mb-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <strong>Synthetic data — demo only.</strong> All process logs are generated; no real ARIS or client data is used.
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-2">
          <Link href="/" className="text-sm text-indigo-600 hover:underline">← All Processes</Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{a.name}</h1>
          <ScoreBadge score={a.score.score} />
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Cases", value: a.caseCount },
            { label: "Variants", value: a.variantCount },
            { label: "Rework Rate", value: `${(a.reworkRate * 100).toFixed(1)}%` },
            { label: "Exception Rate", value: `${(a.exceptionRate * 100).toFixed(1)}%` },
            { label: "Avg Cycle Time", value: `${avgHours}h` },
            { label: "Median Cycle Time", value: `${medianHours}h` },
            { label: "Bottleneck Step", value: a.bottleneck.activity },
            { label: "Top Variant Coverage", value: `${(a.topVariantCoverage * 100).toFixed(1)}%` },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="font-semibold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* AI Readiness factor chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">AI-Readiness Factor Breakdown</h2>
          <MetricChart factors={a.score.factors} />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            {a.score.factors.map((f) => (
              <div key={f.name} className="bg-gray-50 rounded p-2">
                <p className="font-medium text-gray-700 capitalize">{f.name}</p>
                <p className="text-gray-500">Raw: {(f.value * 100).toFixed(0)}</p>
                <p className="text-gray-500">Weight: {(f.weight * 100).toFixed(0)}%</p>
                <p className="text-indigo-700 font-semibold">+{(f.contribution * 100).toFixed(1)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top variants */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Process Variants (top 10)</h2>
          <div className="space-y-2">
            {a.variants.slice(0, 10).map((v, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex-none w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 break-words">{v.path.join(" → ")}</p>
                </div>
                <span className="flex-none text-gray-500">{v.count} cases</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
