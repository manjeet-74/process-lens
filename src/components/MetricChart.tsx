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

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#818cf8", "#c4b5fd"];

export function MetricChart({ factors }: MetricChartProps) {
  const data = factors.map((f) => ({
    name: f.name.charAt(0).toUpperCase() + f.name.slice(1),
    score: Math.round(f.value * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#e2e8f0",
            fontSize: "13px",
          }}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          formatter={(value) => [`${value}`, "Raw Score (0–100)"]}
        />
        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
