"use client";

import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="border-b border-white/[0.06] px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{title}</h2>
        {action}
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

export function Row({ label, children, htmlFor }: { label: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="grid grid-cols-[84px_1fr] items-center gap-3">
      <label htmlFor={htmlFor} className="truncate text-xs text-zinc-400">
        {label}
      </label>
      <div className="flex min-w-0 items-center justify-end gap-2">{children}</div>
    </div>
  );
}

type SliderProps = {
  id?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
};

export function Slider({ id, value, min, max, step = 1, unit = "", onChange }: SliderProps) {
  return (
    <>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range min-w-0 flex-1"
      />
      <span className="w-10 shrink-0 text-right font-mono text-[11px] tabular-nums text-zinc-400">
        {step < 1 ? value.toFixed(2) : value}
        {unit}
      </span>
    </>
  );
}

type Option<T extends string> = { value: T; label: ReactNode; title?: string };

export function Select<T extends string>({
  id,
  value,
  options,
  onChange,
  className = "",
}: {
  id?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={`control h-7 min-w-0 cursor-pointer rounded-md pl-2 pr-6 text-xs ${className}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label as string}
        </option>
      ))}
    </select>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex h-7 rounded-md bg-white/[0.04] p-0.5 ring-1 ring-white/[0.06]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-[5px] px-2 text-[11px] transition-colors ${
            value === o.value ? "bg-white/[0.12] text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ColorInput({
  id,
  value,
  onChange,
  onReset,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  /** Shown when the value overrides a theme default. */
  onReset?: () => void;
}) {
  return (
    <>
      {onReset && (
        <button type="button" onClick={onReset} title="Reset to theme" className="text-zinc-500 hover:text-zinc-200">
          <RotateCcw size={12} />
        </button>
      )}
      <label className="control flex h-7 w-[112px] cursor-pointer items-center gap-2 rounded-md px-1.5">
        <span className="relative size-4 shrink-0 overflow-hidden rounded-[4px] ring-1 ring-white/15" style={{ background: value }}>
          <input
            id={id}
            type="color"
            value={toHex(value)}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </span>
        <span className="font-mono text-[11px] uppercase text-zinc-300">{toHex(value)}</span>
      </label>
    </>
  );
}

export function Toggle({ id, checked, onChange }: { id?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-[18px] w-8 rounded-full transition-colors ${checked ? "bg-zinc-200" : "bg-white/15"}`}
    >
      <span
        className={`absolute top-[3px] size-3 rounded-full transition-all ${
          checked ? "left-[17px] bg-zinc-900" : "left-[3px] bg-zinc-400"
        }`}
      />
    </button>
  );
}

/** `<input type="color">` only accepts #rrggbb. */
function toHex(color: string) {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(color)) return `#${[...color.slice(1)].map((c) => c + c).join("")}`.toLowerCase();
  return "#000000";
}
