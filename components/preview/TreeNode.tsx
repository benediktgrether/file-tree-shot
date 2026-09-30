import { useLayoutEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";
import type { NodeMark, TreeNode as TreeNodeData } from "@/types/tree";
import type { HighlightStyle } from "@/lib/settings";
import { FOLDER_ICON, getFileIcon } from "@/lib/file-icons";

/** Fully resolved visual values, computed once in TreePreview. */
export type TreeStyle = {
  text: string;
  muted: string;
  guide: string;
  accent: string;
  highlight: string;
  folder: string;
  iconColors: "color" | "mono";
  fontSize: number;
  rowHeight: number;
  indent: number;
  iconSize: number;
  rowPadX: number;
  showGuides: boolean;
  highlightStyle: HighlightStyle;
};

/** Marks, editing state and callbacks shared by every row. */
export type TreeActions = {
  marks: Record<string, NodeMark>;
  editingId: string | null;
  /** "cycle": none → highlight → dim → none. "dim" toggles dim. */
  onMark: (id: string, mode: "cycle" | "dim" | "highlight" | "clear") => void;
  onMenu: (id: string, x: number, y: number) => void;
  onStartRename: (id: string) => void;
  /** `null` cancels the rename. */
  onRename: (id: string, name: string | null) => void;
  onDelete: (id: string) => void;
};

type Props = {
  node: TreeNodeData;
  depth: number;
  isLast: boolean;
  s: TreeStyle;
  actions: TreeActions;
  parentDimmed?: boolean;
};

export function TreeNode({ node, depth, isLast, s, actions, parentDimmed }: Props) {
  const { onMark } = actions;
  const mark = actions.marks[node.id];
  const editing = actions.editingId === node.id;
  const highlighted = mark === "highlight";
  // Dimming a folder dims its whole subtree, unless a child is explicitly highlighted.
  const dimmed = mark === "dim" || (parentDimmed && !highlighted);

  const icon = node.type === "folder" ? FOLDER_ICON : getFileIcon(node.name);
  const iconColor = node.type === "folder" || s.iconColors === "mono" ? s.folder : icon.color;
  const glyphSize = Math.round(s.iconSize * (icon.kind === "glyph" ? 0.78 : 1));
  const guideX = Math.round(s.rowPadX + s.iconSize / 2);

  const handleClick = (e: MouseEvent) => onMark(node.id, e.altKey || e.shiftKey ? "dim" : "cycle");
  const handleKey = (e: KeyboardEvent) => {
    if (e.target !== e.currentTarget) return; // typing in the rename input
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onMark(node.id, e.altKey || e.shiftKey ? "dim" : "cycle");
    } else if (e.key === "F2") {
      e.preventDefault();
      actions.onStartRename(node.id);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      actions.onDelete(node.id);
    }
  };
  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Menu key / Shift+F10 report 0,0 — anchor the menu to the row instead.
    const rect = e.currentTarget.getBoundingClientRect();
    const fromKeyboard = e.clientX === 0 && e.clientY === 0;
    actions.onMenu(node.id, fromKeyboard ? rect.left + 16 : e.clientX, fromKeyboard ? rect.bottom : e.clientY);
  };

  return (
    <li style={{ position: "relative", paddingLeft: depth > 0 ? s.indent : 0 }}>
      {depth > 0 && s.showGuides && (
        <>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: guideX,
              top: 0,
              width: 1,
              height: isLast ? Math.round(s.rowHeight / 2) : "100%",
              background: s.guide,
            }}
          />
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: guideX,
              top: Math.round(s.rowHeight / 2),
              width: Math.max(0, s.indent - guideX - 2),
              height: 1,
              background: s.guide,
            }}
          />
        </>
      )}

      <div
        role="button"
        tabIndex={0}
        data-tree-row
        aria-pressed={highlighted}
        onClick={editing ? undefined : handleClick}
        onKeyDown={handleKey}
        onContextMenu={handleContextMenu}
        className="cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
        style={{
          display: "flex",
          alignItems: "center",
          width: "fit-content",
          height: s.rowHeight,
          padding: `0 ${s.rowPadX}px`,
          gap: Math.round(s.fontSize * 0.55),
          borderRadius: Math.round(s.fontSize * 0.35),
          whiteSpace: "pre",
          opacity: dimmed ? 0.32 : 1,
          ...(highlighted ? highlightCss(s) : null),
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: s.iconSize,
            height: s.iconSize,
            flexShrink: 0,
            color: iconColor,
          }}
        >
          <icon.Icon
            width={glyphSize}
            height={glyphSize}
            {...(icon.kind === "outline"
              ? { strokeWidth: 1.75, fill: node.type === "folder" ? "currentColor" : "none", fillOpacity: 0.18 }
              : null)}
          />
        </span>
        {editing ? <RenameInput node={node} onDone={(name) => actions.onRename(node.id, name)} /> : <span>{node.name}</span>}
        {node.comment && (
          <span style={{ color: s.muted, marginLeft: `${s.fontSize}px`, fontWeight: 400 }}>{node.comment}</span>
        )}
      </div>

      {node.children && node.children.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {node.children.map((child, i) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isLast={i === node.children!.length - 1}
              s={s}
              actions={actions}
              parentDimmed={dimmed}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function RenameInput({ node, onDone }: { node: TreeNodeData; onDone: (name: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const done = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current!;
    el.focus();
    // Like VS Code: select the name without its extension.
    const dot = node.type === "file" ? node.name.lastIndexOf(".") : -1;
    el.setSelectionRange(0, dot > 0 ? dot : node.name.length);
  }, [node.name, node.type]);

  const finish = (name: string | null) => {
    if (done.current) return;
    done.current = true;
    onDone(name);
  };

  return (
    <input
      ref={ref}
      defaultValue={node.name}
      aria-label={`Rename ${node.name}`}
      spellCheck={false}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") finish(e.currentTarget.value);
        else if (e.key === "Escape") finish(null);
      }}
      onBlur={(e) => finish(e.currentTarget.value)}
      onInput={(e) => (e.currentTarget.style.width = `${Math.max(e.currentTarget.value.length, 1) + 1}ch`)}
      style={{
        font: "inherit",
        color: "inherit",
        background: "transparent",
        border: 0,
        padding: 0,
        margin: 0,
        width: `${Math.max(node.name.length, 1) + 1}ch`,
        outline: "none",
        boxShadow: "0 1px 0 currentColor",
        userSelect: "text",
        WebkitUserSelect: "text",
      }}
    />
  );
}

function highlightCss(s: TreeStyle) {
  switch (s.highlightStyle) {
    case "background":
      return { background: s.highlight };
    case "bold":
      return { fontWeight: 650 };
    case "accent":
      return { color: s.accent, fontWeight: 550 };
    case "outline":
      return { boxShadow: `inset 0 0 0 1px ${s.accent}` };
  }
}
