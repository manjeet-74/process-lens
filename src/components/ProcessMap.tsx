"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Dfg } from "@/lib/mining/types";
import { layoutDfg } from "@/lib/mining/layout";

interface Props {
  dfg: Dfg;
  referencePath: string[];
  bottleneck: string;
}

function fmtDur(ms: number): string {
  const h = ms / 3_600_000;
  if (h < 1) return `${Math.round(ms / 60_000)}m`;
  if (h < 48) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

export function ProcessMap({ dfg, referencePath, bottleneck }: Props) {
  const { nodes, edges } = useMemo(() => {
    const layout = layoutDfg(dfg);
    const maxFreq = Math.max(...dfg.nodes.map((n) => n.frequency), 1);
    const refEdges = new Set<string>();
    for (let i = 0; i < referencePath.length - 1; i++) {
      refEdges.add(`${referencePath[i]}\u0000${referencePath[i + 1]}`);
    }

    const rfNodes: Node[] = layout.nodes.map((n) => {
      const intensity = 0.25 + 0.75 * (n.frequency / maxFreq);
      const isBottleneck = n.activity === bottleneck;
      return {
        id: n.activity,
        position: { x: n.x, y: n.y },
        data: { label: `${n.activity}\n${n.caseFrequency} cases` },
        type: "default",
        style: {
          background: isBottleneck ? "#3a1d1d" : `rgba(40,40,40,${intensity})`,
          color: "#ffffff",
          border: `1px solid ${isBottleneck ? "#ef4444" : n.isStart ? "#22c55e" : n.isEnd ? "#555" : "#333"}`,
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 500,
          width: 170,
          padding: 8,
          whiteSpace: "pre-line",
          textAlign: "center",
        },
      };
    });

    const maxEdge = Math.max(...dfg.edges.map((e) => e.frequency), 1);
    const rfEdges: Edge[] = dfg.edges.map((e) => {
      const key = `${e.from}\u0000${e.to}`;
      const onRef = refEdges.has(key);
      const w = 1 + 4 * (e.frequency / maxEdge);
      return {
        id: key,
        source: e.from,
        target: e.to,
        label: `${e.frequency} · ${fmtDur(e.avgDurationMs)}`,
        labelStyle: { fill: "#999", fontSize: 10 },
        labelBgStyle: { fill: "#0d0d0d" },
        style: { stroke: onRef ? "#e5e5e5" : "#3a3a3a", strokeWidth: w },
        markerEnd: { type: MarkerType.ArrowClosed, color: onRef ? "#e5e5e5" : "#3a3a3a" },
        animated: onRef,
      };
    });

    return { nodes: rfNodes, edges: rfEdges };
  }, [dfg, referencePath, bottleneck]);

  return (
    <div style={{ height: 460, background: "#0d0d0d", borderRadius: 16, border: "1px solid #262626" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="#1c1c1c" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
