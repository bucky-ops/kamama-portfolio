"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiagramSpec } from "@/lib/profile-data";

/**
 * Expandable stage-by-stage architecture flow for flagship systems.
 * Desktop: stages flow left → right with arrows. Mobile: vertical stack.
 */
export function ArchitectureDiagram({
  spec,
  title,
  defaultOpen = false,
}: {
  spec: DiagramSpec;
  title: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-background/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full min-h-11 items-center gap-2 px-3.5 py-2.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <Network className="size-3.5 text-primary" aria-hidden="true" />
        <span>Architecture — {title}</span>
        <ChevronDown
          className={cn("ml-auto size-3.5 transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="border-t border-border/70 px-3.5 py-4">
            <div className="flex flex-col items-stretch gap-1.5 md:flex-row md:items-center md:gap-1">
              {spec.stages.map((stage, i) => (
                <div key={stage.label} className="contents">
                  {i > 0 ? (
                    <ArrowRight
                      className="mx-auto size-4 shrink-0 rotate-90 text-primary/60 md:rotate-0"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="flex-1 rounded-lg border border-border/70 bg-secondary/25 p-2.5 transition-colors hover:border-primary/30">
                    <p className="font-mono text-[10px] uppercase tracking-wide text-primary">
                      {String(i + 1).padStart(2, "0")} · {stage.label}
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {stage.items.map((item) => (
                        <li key={item} className="flex items-start gap-1.5 text-[11px] leading-snug text-foreground/90">
                          <span className="mt-1 size-1 shrink-0 rounded-full bg-primary/70" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
