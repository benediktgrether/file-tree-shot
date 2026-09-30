import type { Settings } from "@/lib/settings";
import { GRADIENTS, THEMES, type GradientId } from "@/lib/themes";
import { ColorInput, Row, Section, Segmented, Slider, Toggle } from "./controls";

type Props = { settings: Settings; update: (patch: Partial<Settings>) => void };

export function AppearanceSettings({ settings, update }: Props) {
  const theme = THEMES[settings.theme];
  const { backdrop } = settings;

  return (
    <Section title="Appearance">
      <Row label="Background">
        <Segmented
          label="Background type"
          value={backdrop.type}
          onChange={(type) =>
            update({
              backdrop:
                type === "solid"
                  ? { type, color: theme.backdrop.type === "solid" ? theme.backdrop.color : "#e5e5e5" }
                  : type === "gradient"
                    ? { type, preset: "dusk" }
                    : { type },
            })
          }
          options={[
            { value: "transparent", label: "None" },
            { value: "solid", label: "Solid" },
            { value: "gradient", label: "Gradient" },
          ]}
        />
      </Row>

      {backdrop.type === "solid" && (
        <Row label="Color" htmlFor="bg-color">
          <ColorInput id="bg-color" value={backdrop.color} onChange={(color) => update({ backdrop: { type: "solid", color } })} />
        </Row>
      )}

      {backdrop.type === "gradient" && (
        <div className="flex flex-wrap justify-end gap-1.5 pl-[96px]">
          {(Object.keys(GRADIENTS) as GradientId[]).map((id) => (
            <button
              key={id}
              type="button"
              title={GRADIENTS[id].label}
              aria-label={`${GRADIENTS[id].label} gradient`}
              aria-pressed={backdrop.preset === id}
              onClick={() => update({ backdrop: { type: "gradient", preset: id } })}
              className={`size-6 rounded-md ring-offset-2 ring-offset-[#111113] transition ${
                backdrop.preset === id ? "ring-2 ring-zinc-200" : "ring-1 ring-white/10 hover:ring-white/30"
              }`}
              style={{ background: GRADIENTS[id].css }}
            />
          ))}
        </div>
      )}

      <Row label="Frame padding" htmlFor="frame-padding">
        <Slider id="frame-padding" value={settings.framePadding} min={0} max={160} step={4} onChange={(framePadding) => update({ framePadding })} />
      </Row>

      <Row label="Tree bg" htmlFor="surface-color">
        <ColorInput
          id="surface-color"
          value={settings.surfaceColor ?? theme.surface}
          onChange={(surfaceColor) => update({ surfaceColor })}
          onReset={settings.surfaceColor ? () => update({ surfaceColor: null }) : undefined}
        />
      </Row>

      <Row label="Text" htmlFor="text-color">
        <ColorInput
          id="text-color"
          value={settings.textColor ?? theme.text}
          onChange={(textColor) => update({ textColor })}
          onReset={settings.textColor ? () => update({ textColor: null }) : undefined}
        />
      </Row>

      <Row label="Icons">
        <Segmented
          label="Icon colors"
          value={settings.iconColors}
          onChange={(iconColors) => update({ iconColors })}
          options={[
            { value: "color", label: "Color" },
            { value: "mono", label: "Mono" },
          ]}
        />
      </Row>

      <Row label="Radius" htmlFor="radius">
        <Slider id="radius" value={settings.radius} min={0} max={28} onChange={(radius) => update({ radius })} />
      </Row>

      <Row label="Title" htmlFor="title">
        <input
          id="title"
          value={settings.title}
          disabled={settings.windowStyle === "minimal"}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Window title"
          className="control h-7 w-full min-w-0 rounded-md px-2 text-xs disabled:opacity-40"
        />
      </Row>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <label className="flex items-center justify-between text-xs text-zinc-400">
          Shadow
          <Toggle checked={settings.shadow} onChange={(shadow) => update({ shadow })} />
        </label>
        <label className="flex items-center justify-between text-xs text-zinc-400">
          Guides
          <Toggle checked={settings.showGuides} onChange={(showGuides) => update({ showGuides })} />
        </label>
      </div>
    </Section>
  );
}
