"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus } from "lucide-react";
import { projectFilters, projects, type ProjectCluster } from "@/lib/profile-data";
import { ProjectCard } from "./project-card";
import { SectionHeading } from "./shared";
import { cn } from "@/lib/utils";

type Filter = "All" | ProjectCluster;

export function WorkView() {
  const [filter, setFilter] = useState<Filter>("All");

  const counts = useMemo(() => {
    const map = new Map<Filter, number>();
    for (const f of projectFilters) {
      map.set(
        f,
        f === "All"
          ? projects.length
          : projects.filter((p) => p.cluster === f).length
      );
    }
    return map;
  }, []);

  const filtered = useMemo(
    () =>
      filter === "All"
        ? projects
        : projects.filter((p) => p.cluster === filter),
    [filter]
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 md:py-12">
      <section aria-label="Systems and solutions" className="space-y-6">
        <SectionHeading
          title="Systems & Solutions"
          subtitle="Grouped by solution cluster — not chronology. Every system ships with architecture, metric, and source."
        />

        {/* Filter pills */}
        <div
          role="tablist"
          aria-label="Filter projects by cluster"
          className="flex flex-wrap gap-2"
        >
          {projectFilters.map((f) => {
            const isActive = filter === f;
            const count = counts.get(f) ?? 0;
            return (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(f)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  isActive
                    ? "border-primary bg-primary font-semibold text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {f}
                <span
                  className={cn(
                    "font-mono text-[11px]",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Project cards */}
        <motion.div layout className="grid gap-4 lg:grid-cols-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((project) => (
              <motion.div
                key={project.title}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="flex"
              >
                <div className="w-full">
                  <ProjectCard project={project} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Architecture diagram placeholder */}
        <div className="grid-pattern flex items-center gap-3 rounded-2xl border border-dashed border-border px-5 py-6 text-muted-foreground">
          <ImagePlus className="size-5 shrink-0 text-primary/70" aria-hidden="true" />
          <p className="text-sm">
            Architecture diagrams — one per flagship system (Excalidraw SVG export)
          </p>
        </div>
      </section>
    </div>
  );
}
