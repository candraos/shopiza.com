'use client';

import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-[var(--line-soft)] bg-white px-3 py-2 shadow-[0_10px_22px_rgba(18,26,56,0.05)]">
      <button
        type="button"
        className="rounded-full p-2 text-[var(--navy-950)] hover:bg-[rgba(19,24,47,0.05)] disabled:opacity-40"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(
            Math.min(
              max,
              Math.max(min, Number(event.target.value || min)),
            ),
          )
        }
        className="w-14 border-none bg-transparent text-center text-sm font-semibold outline-none"
      />
      <button
        type="button"
        className="rounded-full p-2 text-[var(--navy-950)] hover:bg-[rgba(19,24,47,0.05)] disabled:opacity-40"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
