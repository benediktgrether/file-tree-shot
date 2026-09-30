"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type MenuItem =
  | { label: string; icon?: ReactNode; shortcut?: string; danger?: boolean; onSelect: () => void }
  | "separator";

type Props = { x: number; y: number; items: MenuItem[]; onClose: () => void };

export function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  // Keep the menu inside the viewport, focus the first entry, and close on outside interaction.
  useLayoutEffect(() => {
    const el = ref.current!;
    const { width, height } = el.getBoundingClientRect();
    setPos({
      left: Math.min(x, window.innerWidth - width - 8),
      top: Math.min(y, window.innerHeight - height - 8),
    });
    el.querySelector<HTMLElement>("[role=menuitem]")?.focus();

    const onPointer = (e: PointerEvent) => {
      if (!el.contains(e.target as Node)) onClose();
    };
    window.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("resize", onClose);
    window.addEventListener("blur", onClose);
    return () => {
      window.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("blur", onClose);
    };
  }, [x, y, onClose]);

  const handleKey = (e: KeyboardEvent) => {
    const entries = Array.from(ref.current!.querySelectorAll<HTMLElement>("[role=menuitem]"));
    const index = entries.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape" || e.key === "Tab") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      entries[(index + step + entries.length) % entries.length]?.focus();
    }
  };

  return (
    <div
      ref={ref}
      role="menu"
      onKeyDown={handleKey}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed z-50 min-w-[200px] rounded-lg bg-[#1c1c1f]/95 p-1 text-xs text-zinc-200 shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur"
      style={pos}
    >
      {items.map((item, i) =>
        item === "separator" ? (
          <div key={i} role="separator" className="mx-2 my-1 h-px bg-white/[0.08]" />
        ) : (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              item.onSelect();
            }}
            className={`flex h-7 w-full items-center gap-2.5 rounded-md px-2 text-left outline-none hover:bg-white/[0.08] focus:bg-white/[0.08] ${
              item.danger ? "text-red-300" : ""
            }`}
          >
            <span className="flex w-3.5 justify-center text-zinc-400">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.shortcut && <kbd className="!bg-transparent !text-zinc-500">{item.shortcut}</kbd>}
          </button>
        ),
      )}
    </div>
  );
}
