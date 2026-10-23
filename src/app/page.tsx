import Link from "next/link";
import fixture from "@/lib/data/fixture.json";
import { analyzeProcess } from "@/lib/engine";
import type { ProcessLog } from "@/lib/data/types";
import { ScoreBadge } from "@/components/ScoreBadge";

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
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto mb-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <strong>Synthetic data — demo only.</strong> All process logs are generated; no real ARIS or client data is used.
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Process Lens</h1>
          <p className="mt-1 text-gray-500">AI-readiness ranking for enterprise processes — inspired by ARIS Process Lens</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-600 w-10">#</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Process</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">AI Score</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Cases</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Variants</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Rework %</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Exception %</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Bottleneck</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((p, i) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/process/${p.id}`} className="font-medium text-indigo-700 hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ScoreBadge score={p.score} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{p.caseCount}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{p.variantCount}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{(p.reworkRate * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right text-gray-700">{(p.exceptionRate * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.bottleneck}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
