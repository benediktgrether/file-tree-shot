import type { HighlightStyle, Settings } from "@/lib/settings";
import { Section, Segmented } from "./controls";

type Props = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  markCount: number;
  onClearMarks: () => void;
};

const STYLES: { value: HighlightStyle; label: string }[] = [
  { value: "background", label: "Fill" },
  { value: "bold", label: "Bold" },
  { value: "accent", label: "Accent" },
  { value: "outline", label: "Outline" },
];

export function HighlightSettings({ settings, update, markCount, onClearMarks }: Props) {
  return (
    <Section
      title="Highlight"
      action={
        markCount > 0 && (
          <button type="button" onClick={onClearMarks} className="text-[11px] text-zinc-500 hover:text-zinc-200">
            Clear {markCount}
          </button>
        )
      }
    >
      <Segmented label="Highlight style" value={settings.highlightStyle} onChange={(highlightStyle) => update({ highlightStyle })} options={STYLES} />
      <p className="text-[11px] leading-relaxed text-zinc-500">
        Click entries in the preview to highlight them, click again to dim. Dimming a folder dims its contents.
      </p>
    </Section>
  );
}
