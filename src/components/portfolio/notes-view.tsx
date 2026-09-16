"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  FileText,
  ListTree,
  PenLine,
} from "lucide-react";
import { formatDateLong, notes, type Note } from "@/lib/notes-data";
import { Reveal } from "./reveal";
import { SectionHeading, TagChip } from "./shared";
import { cn } from "@/lib/utils";

/**
 * Notes — short engineering write-ups. List → article reader, both in-view
 * (no route change): consistent with the SPA tab pattern.
 * Reader adds a reading-progress bar and a scroll-spy "On this page" TOC.
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
          <NoteReader
            key={current.slug}
            note={current}
            onBack={() => setOpenSlug(null)}
            onNext={() => goNext(current)}
            nextTitle={nextTitle(current)}
          />
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
                <Reveal key={note.slug} delay={i * 0.06}>
                  <button
                    type="button"
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
                  </button>
                </Reveal>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Tracks reading progress (0..1) of a scrollable article element. */
function useReadingProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const denom = rect.height || 1;
      const value = Math.min(1, Math.max(0, (vh - rect.top) / denom));
      setProgress(value);
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
  }, [ref]);

  return progress;
}

/** Highlights the section currently in the reader's middle band. */
function useScrollSpy(count: number) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-section-index") ?? "0");
            setActive(idx);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    const els = document.querySelectorAll("[data-section-index]");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [count]);

  return active;
}

interface NoteReaderProps {
  note: Note;
  onBack: () => void;
  onNext: () => void;
  nextTitle: string;
}

function NoteReader({ note, onBack, onNext, nextTitle }: NoteReaderProps) {
  const proseRef = useRef<HTMLDivElement>(null);
  const progress = useReadingProgress(proseRef);
  const active = useScrollSpy(note.sections.length);

  // Fresh note → start at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const jumpTo = (index: number) => {
    const el = document.querySelector(`[data-section-index="${index}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const percent = Math.round(progress * 100);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      aria-label={`Note: ${note.title}`}
      className="space-y-6"
    >
      {/* Reading progress — sits just below the sticky header */}
      <div
        className="fixed inset-x-0 top-16 z-30 h-0.5 bg-transparent"
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full bg-gradient-to-r from-[#7a5c14] via-primary to-[#F0B232] transition-[width] duration-150 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Reader header */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          All notes
        </button>
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
        </div>
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
          {note.title}
        </h1>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-primary/70" aria-hidden="true" />
            {formatDateLong(note.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-primary/70" aria-hidden="true" />
            {note.readingMinutes} min read
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PenLine className="size-3.5 text-primary/70" aria-hidden="true" />
            Collins Kamama
          </span>
          <span className="ml-auto tabular-nums text-primary/80">{percent}%</span>
        </p>
      </div>

      {/* On this page — scroll-spy chips */}
      <nav
        aria-label="On this page"
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3"
      >
        <span className="mr-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <ListTree className="size-3.5 text-primary/70" aria-hidden="true" />
          On this page
        </span>
        {note.sections.map((section, i) => (
          <button
            key={section.heading}
            type="button"
            onClick={() => jumpTo(i)}
            aria-current={active === i ? "true" : undefined}
            className={cn(
              "inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
              active === i
                ? "border-primary/50 bg-primary/10 font-medium text-primary"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            <span className="font-mono text-[10px] opacity-70">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="max-w-[16rem] truncate sm:max-w-xs">{section.heading}</span>
          </button>
        ))}
      </nav>

      {/* Prose */}
      <div ref={proseRef} className="space-y-8 rounded-2xl border border-border bg-[#161B22] p-6 md:p-9">
        {note.sections.map((section, i) => (
          <section
            key={section.heading}
            data-section-index={i}
            className="scroll-mt-24 space-y-3"
          >
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
        onClick={onNext}
        className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <span>
          <span className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Next note
          </span>
          <span className="mt-0.5 block text-sm font-semibold text-foreground">
            {nextTitle}
          </span>
        </span>
        <ArrowRight
          className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </button>
    </motion.article>
  );
}

function nextTitle(current: Note): string {
  const idx = notes.findIndex((n) => n.slug === current.slug);
  return notes[(idx + 1) % notes.length].title;
}
