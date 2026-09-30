export type ThemeId = "dark" | "light" | "github-dark" | "minimal" | "paper";

export type Theme = {
  id: ThemeId;
  label: string;
  /** Window / tree surface */
  surface: string;
  text: string;
  muted: string;
  guide: string;
  border: string;
  titleBar: string;
  accent: string;
  highlight: string;
  folder: string;
  /** "color" uses per-language colors, "mono" tints icons with the text color. */
  icons: "color" | "mono";
  shadow: string;
  /** Suggested backdrop applied when the theme is picked. */
  backdrop: Backdrop;
};

export type Backdrop =
  | { type: "transparent" }
  | { type: "solid"; color: string }
  | { type: "gradient"; preset: GradientId };

export type GradientId = keyof typeof GRADIENTS;

export const GRADIENTS = {
  dusk: { label: "Dusk", css: "linear-gradient(135deg, #3b2667 0%, #bc78ec 100%)" },
  ocean: { label: "Ocean", css: "linear-gradient(135deg, #0f2027 0%, #2c5364 100%)" },
  sunset: { label: "Sunset", css: "linear-gradient(135deg, #ff9a8b 0%, #ff6a88 55%, #ff99ac 100%)" },
  mint: { label: "Mint", css: "linear-gradient(135deg, #a8e6cf 0%, #56c596 100%)" },
  sand: { label: "Sand", css: "linear-gradient(160deg, #efe7da 0%, #d9ccb6 100%)" },
  slate: { label: "Slate", css: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" },
  candy: { label: "Candy", css: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)" },
} as const;

export const THEMES: Record<ThemeId, Theme> = {
  dark: {
    id: "dark",
    label: "Dark",
    surface: "#18181b",
    text: "#e4e4e7",
    muted: "#71717a",
    guide: "#3f3f46",
    border: "rgba(255,255,255,0.08)",
    titleBar: "#18181b",
    accent: "#a78bfa",
    highlight: "rgba(167,139,250,0.16)",
    folder: "#a1a1aa",
    icons: "color",
    shadow: "0 20px 68px rgba(0,0,0,0.55)",
    backdrop: { type: "gradient", preset: "dusk" },
  },
  light: {
    id: "light",
    label: "Light",
    surface: "#ffffff",
    text: "#27272a",
    muted: "#a1a1aa",
    guide: "#e4e4e7",
    border: "rgba(0,0,0,0.08)",
    titleBar: "#ffffff",
    accent: "#2563eb",
    highlight: "rgba(37,99,235,0.1)",
    folder: "#71717a",
    icons: "color",
    shadow: "0 20px 60px rgba(0,0,0,0.18)",
    backdrop: { type: "gradient", preset: "candy" },
  },
  "github-dark": {
    id: "github-dark",
    label: "GitHub Dark",
    surface: "#0d1117",
    text: "#e6edf3",
    muted: "#7d8590",
    guide: "#30363d",
    border: "#30363d",
    titleBar: "#161b22",
    accent: "#58a6ff",
    highlight: "rgba(56,139,253,0.15)",
    folder: "#7d8590",
    icons: "color",
    shadow: "0 20px 68px rgba(1,4,9,0.6)",
    backdrop: { type: "gradient", preset: "slate" },
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    surface: "#fafafa",
    text: "#171717",
    muted: "#a3a3a3",
    guide: "#e5e5e5",
    border: "rgba(0,0,0,0.06)",
    titleBar: "#fafafa",
    accent: "#171717",
    highlight: "rgba(0,0,0,0.05)",
    folder: "#525252",
    icons: "mono",
    shadow: "0 8px 30px rgba(0,0,0,0.08)",
    backdrop: { type: "solid", color: "#e5e5e5" },
  },
  paper: {
    id: "paper",
    label: "Paper",
    surface: "#f7f4ee",
    text: "#1f1d1a",
    muted: "#9a9387",
    guide: "#dcd6ca",
    border: "#e6e0d4",
    titleBar: "#f7f4ee",
    accent: "#c2410c",
    highlight: "rgba(194,65,12,0.08)",
    folder: "#57534e",
    icons: "mono",
    shadow: "0 1px 2px rgba(60,50,30,0.06)",
    backdrop: { type: "solid", color: "#ebe5d9" },
  },
};

export function backdropCss(backdrop: Backdrop): string {
  if (backdrop.type === "transparent") return "transparent";
  if (backdrop.type === "solid") return backdrop.color;
  return GRADIENTS[backdrop.preset].css;
}
