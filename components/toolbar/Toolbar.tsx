import type { ReactNode } from "react";
import { FolderTree } from "lucide-react";
import { ASPECT_RATIOS, type AspectRatio, type Settings, type WindowStyle } from "@/lib/settings";
import { THEMES, type ThemeId } from "@/lib/themes";
import { Segmented, Select } from "@/components/settings/controls";

type Props = {
  settings: Settings;
  onTheme: (theme: ThemeId) => void;
  update: (patch: Partial<Settings>) => void;
  exportControls: ReactNode;
};

export function Toolbar({ settings, onTheme, update, exportControls }: Props) {
  return (
    <header className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-white/[0.06] px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
        <FolderTree size={16} className="text-zinc-400" />
        treeshot
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Select<ThemeId>
          value={settings.theme}
          onChange={onTheme}
          options={(Object.keys(THEMES) as ThemeId[]).map((id) => ({ value: id, label: THEMES[id].label }))}
          className="w-[124px]"
        />
        <div className="w-[196px]">
          <Segmented<WindowStyle>
            label="Window style"
            value={settings.windowStyle}
            onChange={(windowStyle) => update({ windowStyle })}
            options={[
              { value: "mac", label: "macOS" },
              { value: "editor", label: "Editor" },
              { value: "minimal", label: "Minimal" },
            ]}
          />
        </div>
        <Select<AspectRatio>
          value={settings.aspect}
          onChange={(aspect) => update({ aspect })}
          options={(Object.keys(ASPECT_RATIOS) as AspectRatio[]).map((id) => ({
            value: id,
            label: id === "auto" ? "Auto size" : id,
          }))}
          className="w-[100px]"
        />
      </div>

      {exportControls}
    </header>
  );
}
