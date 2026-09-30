"use client";

import type { KeyboardEvent } from "react";
import { RotateCcw } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  format: string;
  count: number;
};

const INDENT = "  ";

export function TreeEditor({ value, onChange, onReset, format, count }: Props) {
  // Tab indents (useful for the indentation format); Esc releases focus for keyboard users.
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") return e.currentTarget.blur();
    if (e.key !== "Tab") return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: start, value: text } = el;

    if (e.shiftKey) {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const remove = text.slice(lineStart).match(/^ {1,2}/)?.[0].length ?? 0;
      if (!remove) return;
      el.setSelectionRange(lineStart, lineStart + remove);
      document.execCommand("delete"); // keeps native undo history
      el.setSelectionRange(start - remove, start - remove);
    } else {
      document.execCommand("insertText", false, INDENT);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          Tree
          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] normal-case tracking-normal text-zinc-400">
            {format}
          </span>
          <span className="font-mono text-[10px] normal-case tracking-normal text-zinc-600">{count} items</span>
        </div>
        <button type="button" onClick={onReset} title="Reset to example" className="text-zinc-500 hover:text-zinc-200">
          <RotateCcw size={13} />
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="File tree input"
        placeholder={"project/\n├── src/\n│   └── index.ts\n└── package.json"}
        className="min-h-[220px] flex-1 resize-none bg-transparent px-4 pb-4 font-mono text-[13px] leading-[1.65] text-zinc-200 outline-none placeholder:text-zinc-700"
      />

      <p className="border-t border-white/[0.06] px-4 py-3 text-[11px] leading-relaxed text-zinc-500">
        Paste <code className="text-zinc-400">tree</code> output, an ASCII tree or an indented list. Add{" "}
        <code className="text-zinc-400"># note</code> or <code className="text-zinc-400">← note</code> after a name for
        an annotation.
      </p>
    </div>
  );
}
