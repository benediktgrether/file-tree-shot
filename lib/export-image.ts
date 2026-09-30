import { getFontEmbedCSS, toBlob, toPng, toSvg } from "html-to-image";

type Options = Parameters<typeof toPng>[1];

// Embedding fonts means fetching and inlining every font file, so cache it per font stack.
const fontCache = new Map<string, Promise<string>>();
let warmedUp = false;

async function buildOptions(node: HTMLElement, scale: number): Promise<Options> {
  // A focused row would otherwise show its focus ring in the export.
  (document.activeElement as HTMLElement | null)?.blur?.();

  const fontKey = getComputedStyle(node).fontFamily;
  if (!fontCache.has(fontKey)) fontCache.set(fontKey, getFontEmbedCSS(node));
  const fontEmbedCSS = onlyUsedSubsets(await fontCache.get(fontKey)!, node.textContent ?? "");

  const options: Options = {
    pixelRatio: scale,
    width: node.offsetWidth,
    height: node.offsetHeight,
    fontEmbedCSS,
  };

  // Safari sometimes paints the first foreignObject render before web fonts are decoded.
  if (!warmedUp) {
    await toPng(node, { ...options, pixelRatio: 1 });
    warmedUp = true;
  }
  return options;
}

/**
 * Google fonts are split into unicode-range subsets (latin, cyrillic, …).
 * Keep only the subsets the tree actually uses — this keeps SVGs small.
 */
function onlyUsedSubsets(css: string, text: string) {
  const codes = [...new Set([...text].map((c) => c.codePointAt(0)!))];
  return css
    .split(/(?=@font-face)/)
    .filter((block) => {
      const range = block.match(/unicode-range:\s*([^;}]+)/i)?.[1];
      if (!range) return true;
      return range.split(",").some((part) => {
        const [start, end] = part.trim().replace(/^U\+/i, "").split("-");
        const lo = parseInt(start.replace(/\?/g, "0"), 16);
        const hi = parseInt(end ?? start.replace(/\?/g, "F"), 16);
        return codes.some((c) => c >= lo && c <= hi);
      });
    })
    .join("");
}

function download(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

export function fileName(title: string, ext: string) {
  const base = title.trim().replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "file-tree";
  return `${base}.${ext}`;
}

export async function exportPng(node: HTMLElement, scale: number, title: string) {
  download(await toPng(node, await buildOptions(node, scale)), fileName(title, "png"));
}

/** SVG with the rendered HTML embedded as foreignObject — pixel-identical in browsers. */
export async function exportSvg(node: HTMLElement, title: string) {
  download(await toSvg(node, await buildOptions(node, 1)), fileName(title, "svg"));
}

export const canCopyImage = () =>
  typeof window !== "undefined" && typeof ClipboardItem !== "undefined" && !!navigator.clipboard?.write;

export async function copyPng(node: HTMLElement, scale: number) {
  // Safari requires ClipboardItem to be created synchronously in the click handler,
  // so we hand it a promise instead of awaiting the blob first.
  const blob = buildOptions(node, scale)
    .then((options) => toBlob(node, options))
    .then((b) => {
      if (!b) throw new Error("Could not render image");
      return b;
    });
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}
