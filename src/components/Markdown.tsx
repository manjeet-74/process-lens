import { Fragment, type ReactNode } from "react";

const INK = "#ffffff";
const MUTED = "#bdbdbd";

function renderInline(text: string): ReactNode {
  // split on **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} style={{ color: INK, fontWeight: 600 }}>
          {p.slice(2, -2)}
        </strong>
      );
    }
    if (p.startsWith("*") && p.endsWith("*")) {
      return (
        <em key={i} style={{ color: MUTED }}>
          {p.slice(1, -1)}
        </em>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length === 0) return;
    const items = [...list];
    blocks.push(
      <ul key={`ul-${key++}`} style={{ margin: "8px 0 16px", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((li, i) => (
          <li key={i} style={{ color: MUTED, fontSize: 14, lineHeight: 1.5 }}>
            {renderInline(li)}
          </li>
        ))}
      </ul>
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h3 key={`h-${key++}`} style={{ color: INK, fontSize: 15, fontWeight: 600, letterSpacing: "-0.3px", margin: "20px 0 4px", textTransform: "uppercase" }}>
          {renderInline(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith("- ")) {
      list.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      blocks.push(
        <p key={`p-${key++}`} style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>
          {renderInline(line)}
        </p>
      );
    }
  }
  flushList();
  return <div>{blocks}</div>;
}
