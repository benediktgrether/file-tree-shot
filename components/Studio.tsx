"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NodeMark, TreeNode } from "@/types/tree";
import { parseTree } from "@/lib/tree-parser";
import { detectFormat, insertNode, parentIdOf, removeNode, renameNode, serializeTree } from "@/lib/tree-edit";
import { DEFAULT_INPUT, DEFAULT_SETTINGS, withTheme, type Settings } from "@/lib/settings";
import { canCopyImage, copyPng, exportPng, exportSvg } from "@/lib/export-image";
import type { ThemeId } from "@/lib/themes";
import { Toolbar } from "./toolbar/Toolbar";
import { TreeEditor } from "./editor/TreeEditor";
import { TreePreview } from "./preview/TreePreview";
import { AppearanceSettings } from "./settings/AppearanceSettings";
import { TypographySettings } from "./settings/TypographySettings";
import { SpacingSettings } from "./settings/SpacingSettings";
import { HighlightSettings } from "./settings/HighlightSettings";
import { ExportSettings } from "./settings/ExportSettings";

const STORAGE_KEY = "treeshot:v1";

type Stored = { input: string; settings: Settings; marks: Record<string, NodeMark> };

function loadStored(): Stored {
  const fallback: Stored = { input: DEFAULT_INPUT, settings: DEFAULT_SETTINGS, marks: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Partial<Stored>;
    return {
      input: data.input ?? fallback.input,
      settings: { ...DEFAULT_SETTINGS, ...data.settings },
      marks: data.marks ?? {},
    };
  } catch {
    return fallback;
  }
}

/** Moves marks of `from` (and everything below it) to `to`, or drops them when `to` is null. */
function moveMarks(marks: Record<string, NodeMark>, from: string, to: string | null) {
  const next: Record<string, NodeMark> = {};
  for (const [id, mark] of Object.entries(marks)) {
    const inside = id === from || id.startsWith(`${from}/`);
    if (!inside) next[id] = mark;
    else if (to !== null) next[to + id.slice(from.length)] = mark;
  }
  return next;
}

const collectIds = (nodes: TreeNode[], ids: string[] = []): string[] => {
  for (const n of nodes) {
    ids.push(n.id);
    if (n.children) collectIds(n.children, ids);
  }
  return ids;
};

export default function Studio() {
  const [initial] = useState(loadStored);
  const [input, setInput] = useState(initial.input);
  const [settings, setSettings] = useState(initial.settings);
  const [marks, setMarks] = useState(initial.marks);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; isNew: boolean } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  // Structural edits from the preview replace the textarea value, which breaks its native undo.
  const history = useRef<string[]>([]);

  const nodes = useMemo(() => parseTree(input), [input]);
  const ids = useMemo(() => collectIds(nodes), [nodes]);
  // Marks are kept by path, so they survive edits; only count the ones still in the tree.
  const markCount = ids.filter((id) => marks[id]).length;
  const format = detectFormat(input);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ input, settings, marks }));
      } catch {
        // Storage can be unavailable (private mode); persistence is a nice-to-have.
      }
    }, 200);
    return () => clearTimeout(id);
  }, [input, settings, marks]);

  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), []);

  const handleMark = useCallback((id: string, mode: "cycle" | "dim" | "highlight" | "clear") => {
    setMarks((prev) => {
      const next = { ...prev };
      const current = prev[id];
      const targets: Record<typeof mode, NodeMark | undefined> = {
        cycle: !current ? "highlight" : current === "highlight" ? "dim" : undefined,
        dim: current === "dim" ? undefined : "dim",
        highlight: "highlight",
        clear: undefined,
      };
      const target = targets[mode];
      if (target) next[id] = target;
      else delete next[id];
      return next;
    });
  }, []);

  const commitNodes = (next: TreeNode[]) => {
    history.current = [...history.current.slice(-49), input];
    // An empty input has no format yet; ASCII looks best.
    setInput(serializeTree(next, input.trim() ? format : "ascii"));
  };

  const handleCreate = (targetId: string | null, type: TreeNode["type"]) => {
    const result = insertNode(nodes, targetId, type);
    commitNodes(result.nodes);
    setEditing({ id: result.id, isNew: true });
  };

  const handleDelete = (id: string) => {
    commitNodes(removeNode(nodes, id));
    setMarks((m) => moveMarks(m, id, null));
  };

  const handleRename = (id: string, rawName: string | null) => {
    const wasNew = editing?.isNew;
    setEditing(null);
    const name = rawName?.replace(/\//g, "").trim();
    if (!name) {
      // Cancelling a freshly created entry removes it again — without an extra undo step.
      if (wasNew) setInput(history.current.pop() ?? input);
      return;
    }
    if (name === id.slice(id.lastIndexOf("/") + 1)) return;
    const before = wasNew ? history.current.pop() : undefined; // creating + naming is one undo step
    commitNodes(renameNode(nodes, id, name));
    if (before !== undefined) history.current[history.current.length - 1] = before;
    setMarks((m) => moveMarks(m, id, `${parentIdOf(id)}/${name}`));
  };

  const undo = useCallback(() => {
    const previous = history.current.pop();
    if (previous !== undefined) setInput(previous);
  }, []);

  const run = useCallback(async (task: (node: HTMLElement) => Promise<void>) => {
    const node = frameRef.current;
    if (!node) return;
    setBusy(true);
    setError(null);
    try {
      await task(node);
    } catch (e) {
      console.error(e);
      setError("Export failed");
      setTimeout(() => setError(null), 3000);
    } finally {
      setBusy(false);
    }
  }, []);

  const handlePng = useCallback(() => run((n) => exportPng(n, settings.scale, settings.title)), [run, settings.scale, settings.title]);
  const handleSvg = useCallback(() => run((n) => exportSvg(n, settings.title)), [run, settings.title]);
  const handleCopy = useCallback(
    () =>
      run(async (n) => {
        await copyPng(n, settings.scale);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }),
    [run, settings.scale],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const key = e.key.toLowerCase();
      const inTextField = (e.target as HTMLElement).closest("input, textarea");
      if (key === "z" && !e.shiftKey && !inTextField && history.current.length) {
        e.preventDefault();
        undo();
      } else if (key === "s") {
        e.preventDefault();
        if (e.shiftKey) handleSvg();
        else handlePng();
      } else if (key === "c" && e.shiftKey && canCopyImage()) {
        e.preventDefault();
        handleCopy();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlePng, handleSvg, handleCopy, undo]);

  return (
    <div className="flex h-dvh flex-col bg-[#0b0b0c] text-zinc-200 max-lg:h-auto max-lg:min-h-dvh">
      <Toolbar
        settings={settings}
        onTheme={(theme: ThemeId) => setSettings((s) => withTheme(s, theme))}
        update={update}
        exportControls={
          <div className="flex items-center gap-3">
            {error && <span className="text-xs text-red-400">{error}</span>}
            <ExportSettings
              scale={settings.scale}
              onScale={(scale) => update({ scale })}
              onPng={handlePng}
              onSvg={handleSvg}
              onCopy={canCopyImage() ? handleCopy : null}
              busy={busy}
              copied={copied}
            />
          </div>
        }
      />

      <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)_272px] max-lg:grid-cols-1">
        <aside className="min-h-0 border-r border-white/[0.06] bg-[#0f0f11] max-lg:order-2 max-lg:border-r-0 max-lg:border-t">
          <TreeEditor
            value={input}
            onChange={setInput}
            onReset={() => {
              setInput(DEFAULT_INPUT);
              setMarks({});
            }}
            format={format}
            count={ids.length}
          />
        </aside>

        <main className="min-h-0 max-lg:order-1 max-lg:h-[62vh]">
          <TreePreview
            nodes={nodes}
            settings={settings}
            actions={{
              marks,
              editingId: editing?.id ?? null,
              onMark: handleMark,
              onStartRename: (id) => setEditing({ id, isNew: false }),
              onRename: handleRename,
              onDelete: handleDelete,
            }}
            onCreate={handleCreate}
            frameRef={frameRef}
          />
        </main>

        <aside className="min-h-0 overflow-y-auto border-l border-white/[0.06] bg-[#111113] max-lg:order-3 max-lg:border-l-0 max-lg:border-t">
          <AppearanceSettings settings={settings} update={update} />
          <TypographySettings settings={settings} update={update} />
          <SpacingSettings settings={settings} update={update} />
          <HighlightSettings
            settings={settings}
            update={update}
            markCount={markCount}
            onClearMarks={() => setMarks({})}
          />
        </aside>
      </div>
    </div>
  );
}
