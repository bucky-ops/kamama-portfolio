"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Parses stat strings like "5+", "10+", "99.9%", "500K+" into
 * { prefix, target, decimals, suffix } for the count-up animation.
 */
function parseStat(value: string): {
  prefix: string;
  target: number;
  decimals: number;
  suffix: string;
} | null {
  const match = value.match(/^([^\d]*)([\d.]+)(.*)$/);
  if (!match) return null;
  const [, prefix, num, suffix] = match;
  const target = Number(num);
  if (Number.isNaN(target)) return null;
  return {
    prefix,
    target,
    decimals: num.includes(".") ? num.split(".")[1].length : 0,
    suffix,
  };
}

const DURATION_MS = 1100;

/** Ease-out cubic - fast start, gentle landing. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Count-up stat number. Renders the final value immediately when the user
 * prefers reduced motion; otherwise animates 0 → target on first view.
 */
export function AnimatedStat({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const parsed = parseStat(value);
  // `settled` starts true so SSR/no-JS markup is never blurred; the effect
  // un-settles only when a count-up actually runs (odometer blur -> focus).
  const [display, setDisplay] = useState(() => (parsed ? "0" : value));
  const [settled, setSettled] = useState(true);

  // Runs once per `value` (the parsed object is derived inside the effect so a
  // fresh identity per render can't re-trigger the animation loop).
  useEffect(() => {
    const parsed = parseStat(value);
    if (!parsed) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 0 : DURATION_MS;

    const start = performance.now();
    let raf = 0;
    let blurEngaged = false;
    const tick = (now: number) => {
      // Blur engages on the first frame (inside rAF, never synchronously in
      // the effect) and releases when the count lands - blur -> focus.
      if (!blurEngaged) {
        blurEngaged = true;
        if (duration > 0) setSettled(false);
      }
      const progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const current = parsed.target * easeOut(progress);
      // Render only the numeric part - prefix/suffix are added by the markup.
      setDisplay(current.toFixed(parsed.decimals));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setSettled(true); // release blur - the number lands in focus
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  if (!parsed) {
    return <span className={cn(className)}>{value}</span>;
  }

  return (
    <span
      className={cn(
        "tabular-nums transition-[filter] duration-300 ease-out",
        settled ? "blur-0" : "blur-[2px]",
        className
      )}
    >
      {parsed.prefix}
      {display}
      {parsed.suffix}
    </span>
  );
}
