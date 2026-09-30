"use client";

import { useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type RefObject } from "react";
import { Eraser, FilePlus, FolderPlus, Highlighter, Pencil, SunDim, Trash2 } from "lucide-react";
import type { TreeNode as TreeNodeData } from "@/types/tree";
import { ASPECT_RATIOS, FONTS, type Settings } from "@/lib/settings";
import { THEMES, backdropCss } from "@/lib/themes";
import { TreeNode, type TreeActions, type TreeStyle } from "./TreeNode";
import { WindowFrame } from "./WindowFrame";
import { ContextMenu, type MenuItem } from "./ContextMenu";

type Props = {
  nodes: TreeNodeData[];
  settings: Settings;
  actions: Omit<TreeActions, "onMenu">;
  /** `targetId` null = root. Inserts into folders, next to files. */
  onCreate: (targetId: string | null, type: TreeNodeData["type"]) => void;
  frameRef: RefObject<HTMLDivElement | null>;
};

type Menu = { id: string | null; x: number; y: number };

function findNode(nodes: TreeNodeData[], id: string): TreeNodeData | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = n.children && findNode(n.children, id);
    if (found) return found;
  }
}

const STAGE_GUTTER = 48;

export function TreePreview({ nodes, settings, actions, onCreate, frameRef }: Props) {
  const theme = THEMES[settings.theme];
  const [menu, setMenu] = useState<Menu | null>(null);
  const closeMenu = useCallback(() => setMenu(null), []);
  const treeActions: TreeActions = { ...actions, onMenu: (id, x, y) => setMenu({ id, x, y }) };
  const stageRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [win, setWin] = useState({ w: 0, h: 0 });
  const [stage, setStage] = useState({ w: 0, h: 0 });

  // offsetWidth/offsetHeight ignore CSS transforms, so the preview scaling doesn't feed back.
  useLayoutEffect(() => {
    const windowEl = windowRef.current!;
    const stageEl = stageRef.current!;
    const measure = () => {
      setWin({ w: windowEl.offsetWidth, h: windowEl.offsetHeight });
      setStage({ w: stageEl.clientWidth, h: stageEl.clientHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(windowEl);
    observer.observe(stageEl);
    return () => observer.disconnect();
  }, []);

  // Export area: window + padding, optionally grown to a fixed aspect ratio.
  const pad = settings.framePadding;
  let frameW = win.w + pad * 2;
  let frameH = win.h + pad * 2;
  const ratio = ASPECT_RATIOS[settings.aspect];
  if (ratio) {
    if (frameW / frameH > ratio) frameH = frameW / ratio;
    else frameW = frameH * ratio;
  }
  frameW = Math.ceil(frameW);
  frameH = Math.ceil(frameH);

  const fit =
    stage.w && frameW
      ? Math.min(1, (stage.w - STAGE_GUTTER * 2) / frameW, (stage.h - STAGE_GUTTER * 2) / frameH)
      : 1;
  const scale = Math.max(0.1, fit);

  const text = settings.textColor ?? theme.text;
  const fontSize = settings.fontSize;
  const iconSize = Math.round(fontSize * 1.1);
  const rowPadX = 6;
  const treeStyle: TreeStyle = {
    text,
    muted: theme.muted,
    guide: theme.guide,
    accent: theme.accent,
    highlight: theme.highlight,
    folder: theme.folder,
    iconColors: settings.iconColors,
    fontSize,
    rowHeight: Math.round(fontSize * settings.lineHeight + settings.itemSpacing),
    // Children must start right of the parent's guide line.
    indent: Math.max(settings.indent, Math.round(rowPadX + iconSize / 2) + 8),
    iconSize,
    rowPadX,
    showGuides: settings.showGuides,
    highlightStyle: settings.highlightStyle,
  };

  const handleBackgroundMenu = (e: MouseEvent) => {
    e.preventDefault();
    setMenu({ id: null, x: e.clientX, y: e.clientY });
  };

  const menuItems = (): MenuItem[] => {
    const target = menu?.id ? findNode(nodes, menu.id) : undefined;
    const create: MenuItem[] = [
      { label: "New file", icon: <FilePlus size={13} />, onSelect: () => onCreate(target?.id ?? null, "file") },
      { label: "New folder", icon: <FolderPlus size={13} />, onSelect: () => onCreate(target?.id ?? null, "folder") },
    ];
    if (!target) return create;
    const mark = actions.marks[target.id];
    return [
      ...create,
      "separator",
      { label: "Rename", icon: <Pencil size={13} />, shortcut: "F2", onSelect: () => actions.onStartRename(target.id) },
      { label: "Delete", icon: <Trash2 size={13} />, shortcut: "⌫", danger: true, onSelect: () => actions.onDelete(target.id) },
      "separator",
      ...(mark !== "highlight"
        ? [{ label: "Highlight", icon: <Highlighter size={13} />, onSelect: () => actions.onMark(target.id, "highlight") }]
        : []),
      ...(mark !== "dim"
        ? [{ label: "Dim", icon: <SunDim size={13} />, onSelect: () => actions.onMark(target.id, "dim") }]
        : []),
      ...(mark
        ? [{ label: "Clear mark", icon: <Eraser size={13} />, onSelect: () => actions.onMark(target.id, "clear") }]
        : []),
    ];
  };

  const handleArrows = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const rows = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-tree-row]"));
    const index = rows.indexOf(document.activeElement as HTMLElement);
    if (index === -1) return;
    e.preventDefault();
    rows[Math.min(rows.length - 1, Math.max(0, index + (e.key === "ArrowDown" ? 1 : -1)))]?.focus();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={stageRef} className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div
          className={settings.backdrop.type === "transparent" ? "checkerboard" : undefined}
          style={{ width: frameW * scale, height: frameH * scale, flexShrink: 0 }}
        >
          <div style={{ width: frameW, height: frameH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <div
              ref={frameRef}
              onKeyDown={handleArrows}
              onContextMenu={handleBackgroundMenu}
              style={{
                width: frameW,
                height: frameH,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: backdropCss(settings.backdrop),
                fontFamily: FONTS[settings.font].stack,
                fontSize,
                lineHeight: settings.lineHeight,
                color: text,
                WebkitFontSmoothing: "antialiased",
                fontFeatureSettings: '"liga" 0, "calt" 0',
              }}
            >
              <div ref={windowRef} style={{ flexShrink: 0 }}>
                <WindowFrame
                  windowStyle={settings.windowStyle}
                  title={settings.title}
                  surface={settings.surfaceColor ?? theme.surface}
                  titleBar={settings.surfaceColor ?? theme.titleBar}
                  border={theme.border}
                  text={text}
                  muted={theme.muted}
                  monoDots={settings.iconColors === "mono" ? theme.guide : null}
                  radius={settings.radius}
                  shadow={settings.shadow ? theme.shadow : null}
                  fontSize={fontSize}
                >
                  <div style={{ padding: `${settings.paddingY}px ${settings.paddingX}px` }}>
                    {nodes.length > 0 ? (
                      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                        {nodes.map((node, i) => (
                          <TreeNode
                            key={node.id}
                            node={node}
                            depth={0}
                            isLast={i === nodes.length - 1}
                            s={treeStyle}
                            actions={treeActions}
                          />
                        ))}
                      </ul>
                    ) : (
                      <div style={{ color: theme.muted, padding: "0 6px" }}>Right-click to add files</div>
                    )}
                  </div>
                </WindowFrame>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 px-5 pb-3 text-[11px] text-zinc-500">
        <span className="hidden sm:inline">
          Click to highlight · click again to dim · right-click to add, rename or delete · <kbd>F2</kbd> rename ·{" "}
          <kbd>⌘Z</kbd> undo
        </span>
        <span className="tabular-nums">
          {frameW} × {frameH}
          {scale < 1 && <span className="text-zinc-600"> · preview {Math.round(scale * 100)}%</span>}
          <span className="text-zinc-600">
            {" "}
            · export {frameW * settings.scale} × {frameH * settings.scale}
          </span>
        </span>
      </div>

      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems()} onClose={closeMenu} />}
    </div>
  );
}
