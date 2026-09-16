"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Scroll distance (px) after which the button fades in. */
const SHOW_AFTER = 480;
const RING_R = 20;
const RING_C = 2 * Math.PI * RING_R;

/**
 * Floating back-to-top control with an SVG scroll-progress ring.
 * - rAF-throttled scroll listener (no jank)
 * - fades/scales in after SHOW_AFTER px, flips out at the top
 * - ring doubles as a progress indicator (aria-label announces it)
 * - honours prefers-reduced-motion (instant jump)
 * - hidden in print output
 */
export function BackToTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setVisible(y > SHOW_AFTER);
      setProgress(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      tabIndex={visible ? 0 : -1}
      aria-label={`Back to top - page ${Math.round(progress * 100)}% scrolled`}
      className={cnPrint(visible)}
      aria-hidden={!visible}
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        {/* track */}
        <circle
          cx="24"
          cy="24"
          r={RING_R}
          fill="none"
          className="stroke-border"
          strokeWidth="2"
        />
        {/* progress */}
        <circle
          cx="24"
          cy="24"
          r={RING_R}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={RING_C}
          strokeDashoffset={RING_C * (1 - progress)}
          style={{ transition: "stroke-dashoffset 120ms linear" }}
          className="stroke-primary"
        />
      </svg>
      <ArrowUp className="size-4 text-primary" aria-hidden="true" />
    </button>
  );
}

/** Kept separate so the long class string stays readable. */
function cnPrint(visible: boolean): string {
  return [
    "fixed bottom-5 right-5 z-40 grid size-11 place-items-center rounded-full",
    "border border-border bg-card/90 shadow-lg backdrop-blur print:hidden",
    "transition-all duration-200 hover:border-primary/50 hover:shadow-[0_0_18px_rgba(227,179,65,0.25)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
    "md:bottom-8 md:right-8",
    visible ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0",
  ].join(" ");
}
