import { FONTS, type FontId, type Settings } from "@/lib/settings";
import { Row, Section, Select, Slider } from "./controls";

type Props = { settings: Settings; update: (patch: Partial<Settings>) => void };

export function TypographySettings({ settings, update }: Props) {
  return (
    <Section title="Typography">
      <Row label="Font" htmlFor="font">
        <Select
          id="font"
          value={settings.font}
          onChange={(font) => update({ font })}
          options={(Object.keys(FONTS) as FontId[]).map((id) => ({ value: id, label: FONTS[id].label }))}
          className="w-full"
        />
      </Row>
      <Row label="Size" htmlFor="font-size">
        <Slider id="font-size" value={settings.fontSize} min={10} max={28} unit="px" onChange={(fontSize) => update({ fontSize })} />
      </Row>
      <Row label="Line height" htmlFor="line-height">
        <Slider id="line-height" value={settings.lineHeight} min={1.1} max={2.4} step={0.05} onChange={(lineHeight) => update({ lineHeight })} />
      </Row>
    </Section>
  );
}
