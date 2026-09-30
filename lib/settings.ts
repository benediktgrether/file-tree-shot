import { THEMES, type Backdrop, type ThemeId } from "@/lib/themes";

export type WindowStyle = "mac" | "editor" | "minimal";
export type AspectRatio = "auto" | "16:9" | "4:3" | "1:1" | "3:2";
export type HighlightStyle = "background" | "bold" | "accent" | "outline";
export type FontId = "geist" | "jetbrains" | "fira" | "plex" | "sf";

export type Settings = {
  theme: ThemeId;
  backdrop: Backdrop;
  /** null = use the theme's value */
  surfaceColor: string | null;
  textColor: string | null;
  iconColors: "color" | "mono";
  radius: number;
  shadow: boolean;
  windowStyle: WindowStyle;
  title: string;
  showGuides: boolean;

  font: FontId;
  fontSize: number;
  lineHeight: number;

  framePadding: number;
  paddingX: number;
  paddingY: number;
  indent: number;
  itemSpacing: number;

  aspect: AspectRatio;
  highlightStyle: HighlightStyle;
  scale: 1 | 2 | 3;
};

export const FONTS: Record<FontId, { label: string; stack: string }> = {
  geist: { label: "Geist Mono", stack: 'var(--font-geist-mono), "SF Mono", ui-monospace, monospace' },
  jetbrains: { label: "JetBrains Mono", stack: 'var(--font-jetbrains-mono), "SF Mono", ui-monospace, monospace' },
  fira: { label: "Fira Code", stack: 'var(--font-fira-code), "SF Mono", ui-monospace, monospace' },
  plex: { label: "IBM Plex Mono", stack: 'var(--font-plex-mono), "SF Mono", ui-monospace, monospace' },
  sf: { label: "SF Mono (system)", stack: '"SF Mono", SFMono-Regular, ui-monospace, Menlo, monospace' },
};

export const ASPECT_RATIOS: Record<AspectRatio, number | null> = {
  auto: null,
  "16:9": 16 / 9,
  "4:3": 4 / 3,
  "1:1": 1,
  "3:2": 3 / 2,
};

export const DEFAULT_SETTINGS: Settings = {
  theme: "paper",
  backdrop: THEMES.paper.backdrop,
  surfaceColor: null,
  textColor: null,
  iconColors: THEMES.paper.icons,
  radius: 12,
  shadow: true,
  windowStyle: "mac",
  title: "custom-block",
  showGuides: true,

  font: "geist",
  fontSize: 15,
  lineHeight: 1.6,

  framePadding: 56,
  paddingX: 28,
  paddingY: 24,
  indent: 24,
  itemSpacing: 2,

  aspect: "auto",
  highlightStyle: "background",
  scale: 2,
};

export const DEFAULT_INPUT = `custom-block/
├── block.json
├── src/
│   ├── index.js
│   ├── edit.js
│   └── style.scss
├── render.php
└── package.json`;

/** Applies a theme and resets per-color overrides, like picking a preset in Carbon. */
export function withTheme(settings: Settings, theme: ThemeId): Settings {
  return {
    ...settings,
    theme,
    backdrop: THEMES[theme].backdrop,
    iconColors: THEMES[theme].icons,
    surfaceColor: null,
    textColor: null,
  };
}
