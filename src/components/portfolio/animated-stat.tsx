"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Cartoon bounce curve - elastic overshoot. */
const EASE_CARTOON = [0.68, -0.55, 0.27, 1.55] as const;

/** A stat is a value shaped like "5+", "99.9%", "500K+" - number plus garnish. */
function isStat(value: string): boolean {
  return /^[^\d]*[\d.]+.*$/.test(value.trim());
}

/**
 * Cartoon stat: the number inflates like a balloon (0.75 -> 1.12 -> 0.96
 * -> 1) once it scrolls into view, while a 4-line amber starburst fires
 * behind it as the secondary action. Replaces the v1.15 odometer/blur
 * treatment per the cartoon system spec.
 *
 * Gating: SSR and the hydration paint always render the plain final value
 * (real markup for no-JS, SEO, and reduced-motion first paint). After
 * mount we read the media query directly - the same proven pattern as the
 * header assemble - and only then engage the cartoon wrappers. MotionConfig
 * reducedMotion="user" plus the CSS reduced-motion net back this up.
 */
export function AnimatedStat({
  value,
  index = 0,
  className,
}: {
  value: string;
  /** Position in the stat grid - staggers pop and starburst per item. */
  index?: number;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Deferred (never synchronous state in the effect body) + live media
  // listener so toggling the OS setting mid-session downgrades instantly.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    const id = window.setTimeout(() => {
      setReduced(mq.matches);
      setArmed(true);
    }, 0);
    return () => {
      window.clearTimeout(id);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  const animate = armed && !reduced && isStat(value);

  if (!animate) {
    return (
      <span className={cn("tabular-nums", className)}>{value}</span>
    );
  }

  const viewport = { once: true, amount: 0.5 } as const;

  return (
    <span className={cn("relative inline-block tabular-nums", className)}>
      {/* Secondary action - 4-line amber starburst, expands and fades */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -left-3 -top-3 size-8"
        initial={{ scale: 0, rotate: 0, opacity: 1 }}
        whileInView={{ scale: 1.8, rotate: 90, opacity: 0 }}
        viewport={viewport}
        transition={{ delay: 0.2 + index * 0.1, duration: 0.6, ease: "easeOut" }}
      >
        <span className="absolute inset-0 m-auto h-[2px] w-8 bg-primary" />
        <span className="absolute inset-0 m-auto h-[2px] w-8 rotate-45 bg-primary" />
        <span className="absolute inset-0 m-auto h-[2px] w-8 rotate-90 bg-primary" />
        <span className="absolute inset-0 m-auto h-[2px] w-8 rotate-[135deg] bg-primary" />
      </motion.span>
      {/* The number - balloon-inflating overshoot pop */}
      <motion.span
        className="inline-block"
        initial={{ scale: 0.75, y: 18, opacity: 0 }}
        whileInView={{
          scale: [0.75, 1.12, 0.96, 1],
          y: [18, -4, 2, 0],
          opacity: [0, 1, 1, 1],
        }}
        viewport={viewport}
        transition={{
          delay: 0.15 + index * 0.1,
          duration: 0.5,
          times: [0, 0.55, 0.75, 1],
          ease: EASE_CARTOON,
        }}
      >
        {value}
      </motion.span>
    </span>
  );
}
