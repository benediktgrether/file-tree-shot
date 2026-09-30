import type { Settings } from "@/lib/settings";
import { Row, Section, Slider } from "./controls";

type Props = { settings: Settings; update: (patch: Partial<Settings>) => void };

export function SpacingSettings({ settings, update }: Props) {
  return (
    <Section title="Spacing">
      <Row label="Padding X" htmlFor="padding-x">
        <Slider id="padding-x" value={settings.paddingX} min={0} max={96} step={2} onChange={(paddingX) => update({ paddingX })} />
      </Row>
      <Row label="Padding Y" htmlFor="padding-y">
        <Slider id="padding-y" value={settings.paddingY} min={0} max={96} step={2} onChange={(paddingY) => update({ paddingY })} />
      </Row>
      <Row label="Indent" htmlFor="indent">
        <Slider id="indent" value={settings.indent} min={16} max={56} onChange={(indent) => update({ indent })} />
      </Row>
      <Row label="Item spacing" htmlFor="item-spacing">
        <Slider id="item-spacing" value={settings.itemSpacing} min={0} max={20} onChange={(itemSpacing) => update({ itemSpacing })} />
      </Row>
    </Section>
  );
}
