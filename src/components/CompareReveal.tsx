"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  /** Top layer, visible to the left of the handle. */
  before: ReactNode;
  /** Bottom layer, visible to the right of the handle. */
  after: ReactNode;
  label: string;
  defaultPosition?: number;
  min?: number;
  max?: number;
  /** Nudge the handle both ways once on load so people see it moves. */
  introSweep?: boolean;
  snapOnDoubleClick?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Two stacked layers split by a draggable handle. Content inside either layer can carry
 * `data-reveal="<0-100>"`: when it receives keyboard focus the handle moves there, so
 * nothing focusable ever sits hidden behind the other layer.
 */
export function CompareReveal({
  before,
  after,
  label,
  defaultPosition = 50,
  min = 0,
  max = 100,
  introSweep = false,
  snapOnDoubleClick,
  className = "",
  style,
}: Props) {
  const [pos, setPos] = useState(defaultPosition);
  const [touched, setTouched] = useState(false);
  const [dragging, setDragging] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const sweep = useRef<number | null>(null);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  function stopSweep() {
    if (sweep.current !== null) cancelAnimationFrame(sweep.current);
    sweep.current = null;
  }

  function interact(n: number) {
    stopSweep();
    setTouched(true);
    setPos(clamp(n));
  }

  useEffect(() => {
    if (!introSweep || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now() + 700;
    const duration = 1800;
    const tick = (now: number) => {
      const t = (now - start) / duration;
      if (t >= 1) {
        setPos(defaultPosition);
        sweep.current = null;
        return;
      }
      // One gentle swing right, then left, then home.
      if (t > 0) setPos(defaultPosition + Math.sin(t * Math.PI * 2) * 12 * (1 - t * 0.4));
      sweep.current = requestAnimationFrame(tick);
    };
    sweep.current = requestAnimationFrame(tick);
    return stopSweep;
  }, [introSweep, defaultPosition]);

  function fromPointer(clientX: number) {
    const r = box.current?.getBoundingClientRect();
    if (r) interact(((clientX - r.left) / r.width) * 100);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step = e.shiftKey ? 20 : 5;
    const next =
      e.key === "ArrowLeft" ? pos - step
      : e.key === "ArrowRight" ? pos + step
      : e.key === "Home" ? min
      : e.key === "End" ? max
      : null;
    if (next === null) return;
    e.preventDefault();
    interact(next);
  }

  function onFocusCapture(e: React.FocusEvent) {
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-reveal]");
    if (target && e.target !== e.currentTarget) interact(Number(target.dataset.reveal));
  }

  return (
    <div
      ref={box}
      className={`relative isolate grid select-none ${className}`}
      style={style}
      onFocusCapture={onFocusCapture}
    >
      <div className="[grid-area:1/1]">{after}</div>
      <div
        className={`[grid-area:1/1] ${dragging ? "" : "transition-[clip-path] duration-300 ease-out"}`}
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        {before}
      </div>

      {/* Divider + handle. The wide transparent strip makes the line easy to grab. */}
      <div
        className="absolute inset-y-0 z-10 w-10 -translate-x-1/2 cursor-ew-resize touch-none"
        style={{ left: `${pos}%`, transition: dragging ? "none" : "left 300ms ease-out" }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => dragging && fromPointer(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onDoubleClick={() => snapOnDoubleClick !== undefined && interact(snapOnDoubleClick)}
      >
        <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-sunshine" />
        <div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={Math.round(pos)}
          onKeyDown={onKeyDown}
          className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink bg-surface shadow-[0_0_0_8px_rgba(247,201,72,0.35)] transition-transform hover:scale-105"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M9 6 3 12l6 6M15 6l6 6-6 6" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span
          aria-hidden="true"
          className={`absolute top-[calc(50%+2.6rem)] left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-xs font-medium whitespace-nowrap text-cream transition-opacity duration-500 ${
            touched ? "opacity-0" : "opacity-100"
          }`}
        >
          Drag to explore
        </span>
      </div>
    </div>
  );
}
