"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, FileText, PenLine } from "lucide-react";
import { formatDateLong, notes, type Note } from "@/lib/notes-data";
import { SectionHeading, TagChip } from "./shared";

/**
 * Notes — short engineering write-ups. List → article reader, both in-view
 * (no route change): consistent with the SPA tab pattern.
 */
export function NotesView() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const current = notes.find((n) => n.slug === openSlug) ?? null;

  const open = (slug: string) => {
    setOpenSlug(slug);
  };

  const goNext = (note: Note) => {
    const idx = notes.findIndex((n) => n.slug === note.slug);
    const next = notes[(idx + 1) % notes.length];
    setOpenSlug(next.slug);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6 md:py-12">
      <AnimatePresence mode="wait" initial={false}>
        {current ? (
          <motion.article
            key={current.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            aria-label={`Note: ${current.title}`}
            className="space-y-6"
          >
            {/* Reader header */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setOpenSlug(null)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                All notes
              </button>
              <div className="flex flex-wrap gap-1.5">
                {current.tags.map((t) => (
                  <TagChip key={t} tag={t} />
                ))}
              </div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
                {current.title}
              </h1>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 text-primary/70" aria-hidden="true" />
                  {formatDateLong(current.date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary/70" aria-hidden="true" />
                  {current.readingMinutes} min read
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <PenLine className="size-3.5 text-primary/70" aria-hidden="true" />
                  Collins Kamama
                </span>
              </p>
            </div>

            {/* Prose */}
            <div className="space-y-8 rounded-2xl border border-border bg-[#161B22] p-6 md:p-9">
              {current.sections.map((section, i) => (
                <section key={section.heading} className="space-y-3">
                  <h2 className="flex items-baseline gap-2.5 text-lg font-semibold tracking-tight text-foreground md:text-xl">
                    <span className="font-mono text-xs text-primary" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((p, j) => (
                    <p
                      key={j}
                      className="text-sm leading-[1.85] text-foreground/85 md:text-[15px]"
                    >
                      {p}
                    </p>
                  ))}
                </section>
              ))}
            </div>

            {/* Next note */}
            <button
              type="button"
              onClick={() => goNext(current)}
              className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Next note
                </span>
                <span className="mt-0.5 block text-sm font-semibold text-foreground">
                  {nextTitle(current)}
                </span>
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          </motion.article>
        ) : (
          <motion.section
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            aria-label="Notes list"
            className="space-y-6"
          >
            <SectionHeading
              kicker="Field notes · Engineering write-ups"
              title="Notes"
              subtitle="Short, practical write-ups from systems I actually ship — databases, RAG, and data-for-development pipelines."
            />
            <div className="space-y-4">
              {notes.map((note, i) => (
                <motion.button
                  key={note.slug}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  onClick={() => open(note.slug)}
                  aria-label={`Read note: ${note.title}`}
                  className="group w-full rounded-2xl border border-border bg-card p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(227,179,65,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 md:p-6"
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3 text-primary/70" aria-hidden="true" />
                      {formatDateLong(note.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3 text-primary/70" aria-hidden="true" />
                      {note.readingMinutes} min
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary md:text-xl">
                    {note.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {note.excerpt}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags.map((t) => (
                        <TagChip key={t} tag={t} />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      <FileText className="size-3.5" aria-hidden="true" />
                      Read note
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function nextTitle(current: Note): string {
  const idx = notes.findIndex((n) => n.slug === current.slug);
  return notes[(idx + 1) % notes.length].title;
}
