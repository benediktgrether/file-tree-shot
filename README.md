# treeshot

Turn file trees into clean images for blog posts, docs and social media. Think [Carbon](https://carbon.now.sh), but for project structures.

Paste an ASCII tree (e.g. the output of `tree`) or a plain indented list. treeshot parses it and renders a real HTML tree with file icons, themes and highlights, then exports it as PNG or SVG. Everything runs in the browser: no backend, no login, no external API.

```bash
tree -L 3 --gitignore | pbcopy   # then paste into treeshot
```

## Installation

Requires Node.js 20+.

```bash
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
npm start
```

The app prerenders as a single static page, so you can deploy it to any static or Next.js host.

## Features

- **Input:** ASCII trees (`├──`, `└──`, `│`, also `tree --charset=ascii` with `|--` / `` `-- ``), raw `tree` output (non-breaking spaces, the `N directories, M files` summary and the `.` root are handled) and indented lists
- **Edit in the preview:** right-click an entry for New file / New folder (inside folders, next to files), Rename (`F2`) and Delete (`⌫`), or right-click the background to add at the root. New entries are named inline (`Enter` confirms, `Esc` cancels). Edits are written back into the text input in its current format (ASCII or indented), and `⌘Z` undoes them.
- **Annotations:** `render.php  # template` or `index.js ← entry` renders a muted note next to the entry
- **Highlight / dim:** click an entry to highlight it, click again to dim it, click a third time to reset. Shift/Alt+click dims directly. Highlight styles are Fill, Bold, Accent and Outline. Dimming a folder dims everything inside it.
- **Themes:** Dark, Light, GitHub Dark, Minimal and Paper, with custom backdrop, tree background and text colors
- **Window styles:** macOS, Editor (a tab with a custom title) and Minimal
- **Size:** auto-sized, or fixed to 16:9, 4:3, 1:1 or 3:2 (e.g. for blog covers)
- **Export:** PNG at 1x/2x/3x, SVG, and copy to clipboard (where the browser supports `ClipboardItem`)
- **Keyboard:** `⌘S` saves a PNG, `⌘⇧S` an SVG and `⌘⇧C` copies. `↑`/`↓` move between tree rows and `Enter` toggles a mark. In the editor, `Tab`/`⇧Tab` indent and outdent, and `Esc` leaves the editor.
- Input, settings and marks are kept in `localStorage`

## Libraries

| Library | Purpose |
| --- | --- |
| [Next.js](https://nextjs.org) (App Router) + React | App shell |
| [Tailwind CSS](https://tailwindcss.com) v4 | UI styling |
| [lucide-react](https://lucide.dev) | UI icons and generic file/folder icons |
| [react-icons](https://react-icons.github.io/react-icons/) (Simple Icons set, tree-shaken) | Language and tool logos (TS, PHP, Sass, …) |
| [html-to-image](https://github.com/bubkoo/html-to-image) | PNG/SVG export from the rendered DOM |
| `next/font` | Self-hosted Geist Mono, JetBrains Mono, Fira Code and IBM Plex Mono |

## Architecture

```
app/
├── layout.tsx              fonts (CSS variables) + global styles
├── page.tsx                renders the client-only studio
└── globals.css             UI control styles
components/
├── Studio.tsx              all state (input, settings, marks), persistence, shortcuts
├── StudioLoader.tsx        loads Studio with ssr: false (localStorage, no theme flash)
├── editor/TreeEditor.tsx   textarea input
├── preview/
│   ├── TreePreview.tsx     export frame, aspect ratio, fit-to-screen scaling
│   ├── WindowFrame.tsx     macOS / editor / minimal window chrome
│   └── TreeNode.tsx        recursive row with icon, guide lines and highlight/dim
├── settings/               sidebar sections and small form controls
└── toolbar/Toolbar.tsx     theme, window style, aspect ratio and export actions
lib/
├── tree-parser.ts          text → TreeNode[]
├── tree-edit.ts            TreeNode[] → text, plus insert / rename / remove
├── file-icons.ts           file name → icon + color
├── themes.ts               theme tokens and gradient presets
├── settings.ts             settings type, defaults, fonts, aspect ratios
└── export-image.ts         PNG / SVG / clipboard export
types/tree.ts               TreeNode type
```

**Parsing.** Both input formats go through the same rule: the column where a line's *name* starts is its depth. The parser strips the drawing prefix (box characters, ASCII connectors and whitespace), then pops a stack until it finds the closest previous line whose name starts further left. That line is the parent. So it doesn't matter whether a tree uses 4-character (`├── `), 3-character (`├─ `) or 2-space indentation. An entry is a folder if it ends in `/` or has children. Every node gets a path-based `id` (`/custom-block/src/index.js`), which is how marks survive edits.

**Editing.** The text input is always the single source of truth. A context-menu action parses the current text, changes the `TreeNode[]` and writes the result back as text. New entries get a predictable, unique name (`new-file`, `new-file-2`, …), so their id is known right away and they can open straight into rename mode. Marks on a renamed or deleted entry move with it or are removed.

**Rendering.** The tree is nested `<ul>`/`<li>` elements with inline styles computed from the settings. Guide lines are absolutely positioned 1px spans, not pseudo-elements, so every exporter sees them. All sizes are whole pixels derived from font size, line height and spacing.

**Export.** The export frame is the same DOM node you see in the preview. The preview is scaled down with a CSS transform on a *wrapper*, so the node itself keeps its real size. `html-to-image` clones that node with computed styles into an SVG `foreignObject` and rasterizes it, which is why exports match the preview exactly. The used web font is inlined, limited to the unicode subsets the tree actually uses. Frame dimensions are measured with `offsetWidth`/`offsetHeight`, which ignore transforms, and a fixed aspect ratio grows the frame around the window. It never crops.

**SVG caveat.** The SVG export embeds HTML via `foreignObject`. It looks identical in browsers and anything that renders SVG like a browser (blogs, GitHub, Notion), but design tools such as Figma or Illustrator can't edit or display foreignObject content. Use PNG for those. The SVG files are also relatively large (several hundred KB) because every element carries its full computed style for fidelity. The "SF Mono (system)" font can't be embedded, so SVGs using it fall back to another monospace font on machines without SF Mono.
