import type { ReactNode } from "react";
import { Folder } from "lucide-react";
import type { WindowStyle } from "@/lib/settings";

type Props = {
  windowStyle: WindowStyle;
  title: string;
  surface: string;
  titleBar: string;
  border: string;
  text: string;
  muted: string;
  /** Monochrome traffic lights for calm themes like Paper. */
  monoDots: string | null;
  radius: number;
  shadow: string | null;
  fontSize: number;
  children: ReactNode;
};

const DOTS = ["#ff5f57", "#febc2e", "#28c840"];
const DOTS_WIDTH = 52;

export function WindowFrame(p: Props) {
  const barFont = Math.round(p.fontSize * 0.82);

  return (
    <div
      style={{
        background: p.surface,
        borderRadius: p.radius,
        boxShadow: [p.shadow, `0 0 0 1px ${p.border}`].filter(Boolean).join(", "),
        overflow: "hidden",
        minWidth: 220,
      }}
    >
      {p.windowStyle === "mac" && (
        <div style={{ display: "flex", alignItems: "center", height: 40, padding: "0 16px", background: p.titleBar }}>
          <div style={{ display: "flex", gap: 8, width: DOTS_WIDTH, flexShrink: 0 }}>
            {DOTS.map((color) => (
              <span
                key={color}
                style={{ width: 12, height: 12, borderRadius: 999, background: p.monoDots ?? color }}
              />
            ))}
          </div>
          <span style={{ flex: 1, textAlign: "center", fontSize: barFont, color: p.muted, whiteSpace: "pre", padding: "0 12px" }}>
            {p.title}
          </span>
          {/* Mirrors the dots so the title stays optically centered. */}
          <div style={{ width: DOTS_WIDTH, flexShrink: 0 }} />
        </div>
      )}

      {p.windowStyle === "editor" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 40,
            padding: "0 16px",
            background: p.titleBar,
            borderBottom: `1px solid ${p.border}`,
            fontSize: barFont,
            color: p.text,
          }}
        >
          <Folder width={barFont + 2} height={barFont + 2} strokeWidth={1.75} style={{ color: p.muted }} />
          <span>{p.title || "untitled"}</span>
        </div>
      )}

      {p.children}
    </div>
  );
}
