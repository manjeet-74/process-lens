"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Factor {
  name: string;
  value: number;
  weight: number;
  contribution: number;
}

interface MetricChartProps {
  factors: Factor[];
}

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

export function MetricChart({ factors }: MetricChartProps) {
  const data = factors.map((f) => ({
    name: f.name.charAt(0).toUpperCase() + f.name.slice(1),
    score: Math.round(f.value * 100),
    contribution: Math.round(f.contribution * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value, name) => [
            `${value ?? ""}`,
            name === "score" ? "Raw Score (0–100)" : "Weighted Contribution",
          ]}
        />
        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
