import type { ComponentType, SVGProps } from "react";
import { Braces, Database, File, FileCode, FileImage, FileText, Folder, Lock } from "lucide-react";
import {
  SiAstro, SiC, SiComposer, SiCplusplus, SiCss, SiDart, SiDocker, SiDotenv, SiEslint, SiGit,
  SiGnubash, SiGo, SiGraphql, SiHtml5, SiJavascript, SiKotlin, SiLess, SiLua, SiMarkdown, SiMdx,
  SiNextdotjs, SiNpm, SiPhp, SiPnpm, SiPrettier, SiPrisma, SiPython, SiReact, SiRuby, SiRust,
  SiSass, SiSvelte, SiSvg, SiSwift, SiTailwindcss, SiToml, SiTypescript, SiVite, SiVuedotjs,
  SiWordpress, SiYaml, SiYarn,
} from "react-icons/si";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

export type FileIcon = {
  Icon: IconComponent;
  color: string;
  /** Brand glyphs fill their box, outline icons have built-in padding. */
  kind: "glyph" | "outline";
};

const glyph = (Icon: IconComponent, color: string): FileIcon => ({ Icon, color, kind: "glyph" });
const outline = (Icon: IconComponent, color: string): FileIcon => ({ Icon, color, kind: "outline" });

const JS = glyph(SiJavascript, "#e5c33a");
const TS = glyph(SiTypescript, "#3178c6");
const REACT = glyph(SiReact, "#149eca");
const JSON_ = outline(Braces, "#d9a520");
const IMAGE = outline(FileImage, "#a074c4");
const SHELL = glyph(SiGnubash, "#4eaa25");

// Exact file names win over extensions.
const BY_NAME: Record<string, FileIcon> = {
  "package.json": glyph(SiNpm, "#cb3837"),
  "package-lock.json": glyph(SiNpm, "#cb3837"),
  "yarn.lock": glyph(SiYarn, "#2c8ebb"),
  "pnpm-lock.yaml": glyph(SiPnpm, "#f69220"),
  "composer.json": glyph(SiComposer, "#885630"),
  "composer.lock": glyph(SiComposer, "#885630"),
  "block.json": glyph(SiWordpress, "#3858e9"),
  "tsconfig.json": TS,
  dockerfile: glyph(SiDocker, "#2496ed"),
  "docker-compose.yml": glyph(SiDocker, "#2496ed"),
  "docker-compose.yaml": glyph(SiDocker, "#2496ed"),
  ".gitignore": glyph(SiGit, "#f05032"),
  ".gitattributes": glyph(SiGit, "#f05032"),
  ".gitmodules": glyph(SiGit, "#f05032"),
  ".prettierrc": glyph(SiPrettier, "#c596c7"),
  ".eslintrc": glyph(SiEslint, "#4b32c3"),
  license: outline(FileText, "#9ca3af"),
  "license.md": outline(FileText, "#9ca3af"),
};

// Prefix matches for config files like `next.config.ts` or `.env.local`.
const BY_PREFIX: [string, FileIcon][] = [
  [".env", glyph(SiDotenv, "#d4b830")],
  ["next.config.", glyph(SiNextdotjs, "#888888")],
  ["vite.config.", glyph(SiVite, "#9269fe")],
  ["tailwind.config.", glyph(SiTailwindcss, "#06b6d4")],
  ["eslint.config.", glyph(SiEslint, "#4b32c3")],
  [".eslintrc.", glyph(SiEslint, "#4b32c3")],
  [".prettierrc.", glyph(SiPrettier, "#c596c7")],
  ["prettier.config.", glyph(SiPrettier, "#c596c7")],
];

const BY_EXT: Record<string, FileIcon> = {
  js: JS, mjs: JS, cjs: JS,
  ts: TS, mts: TS, cts: TS,
  jsx: REACT, tsx: REACT,
  php: glyph(SiPhp, "#777bb4"),
  json: JSON_, jsonc: JSON_, json5: JSON_,
  yaml: glyph(SiYaml, "#cb171e"), yml: glyph(SiYaml, "#cb171e"),
  toml: glyph(SiToml, "#9c4121"),
  css: glyph(SiCss, "#2965f1"),
  scss: glyph(SiSass, "#cc6699"), sass: glyph(SiSass, "#cc6699"),
  less: glyph(SiLess, "#1d365d"),
  html: glyph(SiHtml5, "#e34f26"), htm: glyph(SiHtml5, "#e34f26"),
  md: glyph(SiMarkdown, "#519aba"), markdown: glyph(SiMarkdown, "#519aba"),
  mdx: glyph(SiMdx, "#f9ac00"),
  svg: glyph(SiSvg, "#ffb13b"),
  png: IMAGE, jpg: IMAGE, jpeg: IMAGE, gif: IMAGE, webp: IMAGE, avif: IMAGE, ico: IMAGE, bmp: IMAGE,
  vue: glyph(SiVuedotjs, "#41b883"),
  svelte: glyph(SiSvelte, "#ff3e00"),
  astro: glyph(SiAstro, "#ff5d01"),
  py: glyph(SiPython, "#3776ab"),
  go: glyph(SiGo, "#00add8"),
  rs: glyph(SiRust, "#dea584"),
  rb: glyph(SiRuby, "#cc342d"),
  swift: glyph(SiSwift, "#f05138"),
  kt: glyph(SiKotlin, "#7f52ff"),
  dart: glyph(SiDart, "#0175c2"),
  lua: glyph(SiLua, "#2c2d72"),
  c: glyph(SiC, "#a8b9cc"), h: glyph(SiC, "#a8b9cc"),
  cpp: glyph(SiCplusplus, "#00599c"), hpp: glyph(SiCplusplus, "#00599c"),
  sh: SHELL, bash: SHELL, zsh: SHELL,
  graphql: glyph(SiGraphql, "#e10098"), gql: glyph(SiGraphql, "#e10098"),
  prisma: glyph(SiPrisma, "#5a67d8"),
  sql: outline(Database, "#e38c00"), sqlite: outline(Database, "#e38c00"), db: outline(Database, "#e38c00"),
  lock: outline(Lock, "#9ca3af"),
  txt: outline(FileText, "#9ca3af"),
  twig: outline(FileCode, "#8fbc48"),
  xml: outline(FileCode, "#e37933"),
};

const DEFAULT_FILE = outline(File, "#9ca3af");
export const FOLDER_ICON = outline(Folder, "#9ca3af");

export function getFileIcon(name: string): FileIcon {
  const lower = name.toLowerCase();
  if (BY_NAME[lower]) return BY_NAME[lower];
  for (const [prefix, icon] of BY_PREFIX) if (lower.startsWith(prefix)) return icon;
  const dot = lower.lastIndexOf(".");
  if (dot > 0) return BY_EXT[lower.slice(dot + 1)] ?? DEFAULT_FILE;
  return DEFAULT_FILE;
}
