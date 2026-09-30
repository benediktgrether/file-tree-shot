import { Check, Copy, Download } from "lucide-react";
import type { Settings } from "@/lib/settings";
import { Segmented } from "./controls";

type Props = {
  scale: Settings["scale"];
  onScale: (scale: Settings["scale"]) => void;
  onPng: () => void;
  onSvg: () => void;
  onCopy: (() => void) | null;
  busy: boolean;
  copied: boolean;
};

export function ExportSettings({ scale, onScale, onPng, onSvg, onCopy, busy, copied }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[108px]">
        <Segmented
          label="PNG scale"
          value={String(scale) as "1" | "2" | "3"}
          onChange={(v) => onScale(Number(v) as Settings["scale"])}
          options={[
            { value: "1", label: "1x" },
            { value: "2", label: "2x" },
            { value: "3", label: "3x" },
          ]}
        />
      </div>
      {onCopy && (
        <button type="button" onClick={onCopy} disabled={busy} title="Copy PNG (⌘⇧C)" className="btn">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span className="hidden lg:inline">{copied ? "Copied" : "Copy"}</span>
        </button>
      )}
      <button type="button" onClick={onSvg} disabled={busy} title="Download SVG (⌘⇧S)" className="btn">
        SVG
      </button>
      <button type="button" onClick={onPng} disabled={busy} title="Download PNG (⌘S)" className="btn btn-primary">
        <Download size={14} />
        PNG
      </button>
    </div>
  );
}
