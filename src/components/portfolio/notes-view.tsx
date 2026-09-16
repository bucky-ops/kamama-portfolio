"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CircleCheck,
  ChevronDown,
  Clock,
  FileText,
  History,
  ListTree,
  PenLine,
  Search,
  SearchX,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatDateLong, notes, type Note } from "@/lib/notes-data";
import {
  clearReadingHistory,
  getReadingHistory,
  recordReadingProgress,
  removeReadingEntry,
  type ReadingEntry,
} from "@/lib/reading-history";
import { Reveal } from "./reveal";
import { SectionHeading, TagChip } from "./shared";
import { ShareButton } from "./share-button";
import { cn } from "@/lib/utils";

/** Compact relative time for history rows - "just now", "5m ago", "2h ago", "3d ago". */
function readAgo(epochMs: number): string {
  const mins = Math.max(0, Math.round((Date.now() - epochMs) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(epochMs).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Notes - short engineering write-ups. List → article reader, both in-view
 * (no route change): consistent with the SPA tab pattern.
 * Reader adds a reading-progress bar and a scroll-spy "On this page" TOC.
 */
export function NotesView() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [history, setHistory] = useState<ReadingEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [resumePercent, setResumePercent] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const current = notes.find((n) => n.slug === openSlug) ?? null;

  // Reading history lives in localStorage - load after mount (SSR-safe) and
  // refresh whenever the reader closes, so the list reflects the latest read.
  useEffect(() => {
    if (current) return;
    const id = window.setTimeout(() => setHistory(getReadingHistory()), 0);
    return () => window.clearTimeout(id);
  }, [current]);

  // Notes the visitor has started but not finished - powers Continue reading.
  const continueEntries = history
    .filter((e) => e.percent >= 4 && e.percent < 100)
    .map((e) => ({ entry: e, note: notes.find((n) => n.slug === e.slug) }))
    .filter((x): x is { entry: ReadingEntry; note: Note } => !!x.note)
    .slice(0, 2);

  const readPercentBySlug = new Map(history.map((e) => [e.slug, e.percent]));

  // All tags across notes, alphabetically - powers the filter chips.
  const allTags = [...new Set(notes.flatMap((n) => n.tags))].sort();

  const filtered = notes.filter((note) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q === "" ||
      note.title.toLowerCase().includes(q) ||
      note.excerpt.toLowerCase().includes(q) ||
      note.tags.some((t) => t.toLowerCase().includes(q));
    const matchesTag = !activeTag || note.tags.includes(activeTag);
    return matchesQuery && matchesTag;
  });

  // Press "/" to jump into search (ignored while typing in any field).
  useEffect(() => {
    if (current) return; // reader open - no list search visible
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current]);

  // Deep-link support: /?tab=notes&n=<slug> opens a specific note.
  // Deferred one tick so the initial paint matches SSR (list view).
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("n");
    if (slug && notes.some((n) => n.slug === slug)) {
      const id = window.setTimeout(() => setOpenSlug(slug), 0);
      return () => window.clearTimeout(id);
    }
  }, []);

  // Keep the URL in sync so any note is shareable/linkable.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = openSlug ? `/?tab=notes&n=${openSlug}` : "/?tab=notes";
    window.history.replaceState(null, "", url);
  }, [openSlug]);

  const open = (slug: string, resume = 0) => {
    setResumePercent(resume);
    setOpenSlug(slug);
  };

  const closeReader = () => {
    setOpenSlug(null);
    setResumePercent(0);
  };

  const goNext = (note: Note) => {
    const idx = notes.findIndex((n) => n.slug === note.slug);
    const next = notes[(idx + 1) % notes.length];
    setResumePercent(0);
    setOpenSlug(next.slug);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6 md:py-12">
      <AnimatePresence mode="wait" initial={false}>
        {current ? (
          <NoteReader
            key={current.slug}
            note={current}
            initialPercent={resumePercent}
            onBack={closeReader}
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
              subtitle="Short, practical write-ups from systems I actually ship - databases, RAG, and data-for-development pipelines."
            />

            {/* Continue reading - from local reading history (never leaves the browser) */}
            {continueEntries.length > 0 ? (
              <section
                aria-label="Continue reading"
                className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-primary">
                    <BookOpen className="size-3.5" aria-hidden="true" />
                    Continue reading
                  </p>
                  <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 px-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-destructive focus-visible:ring-destructive/40"
                      >
                        <History className="size-3" aria-hidden="true" />
                        Clear history
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear reading history?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This removes all "Continue reading" positions and
                          "% read" marks stored in this browser. The notes
                          themselves are untouched - you can always start fresh.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep history</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40"
                          onClick={() => {
                            clearReadingHistory();
                            setHistory([]);
                          }}
                        >
                          Clear history
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {continueEntries.map(({ entry, note }) => (
                    <div
                      key={entry.slug}
                      className="group relative rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 focus-within:ring-2 focus-within:ring-ring/60"
                    >
                      <button
                        type="button"
                        onClick={() => open(entry.slug, entry.percent)}
                        aria-label={`Continue reading ${note.title} from ${entry.percent}%`}
                        className="block w-full rounded-xl p-3.5 pr-9 text-left focus-visible:outline-none"
                      >
                        <span className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                          {note.title}
                        </span>
                        <span className="mt-2 flex items-center gap-2">
                          <span
                            className="h-1 flex-1 overflow-hidden rounded-full bg-secondary"
                            role="progressbar"
                            aria-label={`Reading progress for ${note.title}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={entry.percent}
                          >
                            <span
                              className="block h-full rounded-full bg-primary transition-[width]"
                              style={{ width: `${entry.percent}%` }}
                            />
                          </span>
                          <span className="shrink-0 font-mono text-[10px] tabular-nums text-primary">
                            {entry.percent}%
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeReadingEntry(entry.slug);
                          setHistory((prev) => prev.filter((h) => h.slug !== entry.slug));
                        }}
                        aria-label={`Remove ${note.title} from reading history`}
                        className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Full reading history - every stored entry, not just the two
                resume cards above. Local-only data, trivially clearable. */}
            {history.length > 0 ? (
              <section aria-label="Reading history" className="mt-2">
                <button
                  type="button"
                  onClick={() => setHistoryOpen((v) => !v)}
                  aria-expanded={historyOpen}
                  className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3.5 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <History className="size-3.5 text-primary" aria-hidden="true" />
                  <span>
                    Reading history
                    <span className="ml-1.5 rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-foreground/80">
                      {history.length}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "ml-auto size-3.5 transition-transform duration-200",
                      historyOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>
                {historyOpen ? (
                  <motion.ul
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="mt-2 space-y-1.5"
                  >
                    {history.map((entry) => {
                      const note = notes.find((n) => n.slug === entry.slug);
                      if (!note) return null; // pruned on next write
                      const finished = entry.percent >= 100;
                      return (
                        <li
                          key={entry.slug}
                          className="group/row relative flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 py-2 pl-3.5 pr-10 transition-colors hover:border-primary/30"
                        >
                          <button
                            type="button"
                            onClick={() => open(entry.slug, entry.percent)}
                            aria-label={
                              finished
                                ? `Reread ${note.title}`
                                : `Continue reading ${note.title} from ${entry.percent}%`
                            }
                            className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="line-clamp-1 text-[13px] font-medium text-foreground transition-colors group-hover/row:text-primary">
                                {note.title}
                              </span>
                              <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                                {finished ? "Finished" : "Last read"} · {readAgo(entry.updatedAt)}
                              </span>
                            </span>
                            <span
                              className="h-1 w-16 shrink-0 overflow-hidden rounded-full bg-secondary sm:w-24"
                              role="progressbar"
                              aria-label={`Reading progress for ${note.title}`}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={entry.percent}
                            >
                              <span
                                className={cn(
                                  "block h-full rounded-full transition-[width]",
                                  finished ? "bg-success" : "bg-primary"
                                )}
                                style={{ width: `${entry.percent}%` }}
                              />
                            </span>
                            <span
                              className={cn(
                                "w-12 shrink-0 text-right font-mono text-[10px] tabular-nums",
                                finished ? "text-success-fg" : "text-primary"
                              )}
                            >
                              {finished ? "✓ done" : `${entry.percent}%`}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              removeReadingEntry(entry.slug);
                              setHistory((prev) => prev.filter((h) => h.slug !== entry.slug));
                            }}
                            aria-label={`Remove ${note.title} from reading history`}
                            className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                          >
                            <X className="size-3.5" aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </motion.ul>
                ) : null}
              </section>
            ) : null}

            {/* Search + tag filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search notes - try “PostgreSQL” or “RAG”…"
                  aria-label="Search notes by title, excerpt, or tag"
                  className="min-h-11 w-full rounded-xl border border-border bg-card pl-10 pr-14 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-primary/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
                <kbd className="pointer-events-none absolute right-3.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-secondary/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
                  /
                </kbd>
              </div>
              <div
                className="flex flex-wrap items-center gap-1.5"
                role="group"
                aria-label="Filter notes by tag"
              >
                <button
                  type="button"
                  onClick={() => setActiveTag(null)}
                  aria-pressed={activeTag === null}
                  className={cn(
                    "inline-flex min-h-8 items-center rounded-full border px-3 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                    activeTag === null
                      ? "border-primary/50 bg-primary/10 font-medium text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  All
                  <span className="ml-1 opacity-60">{notes.length}</span>
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    aria-pressed={activeTag === tag}
                    className={cn(
                      "inline-flex min-h-8 items-center rounded-full border px-3 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                      activeTag === tag
                        ? "border-primary/50 bg-primary/10 font-medium text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    {tag}
                  </button>
                ))}
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                  {filtered.length} of {notes.length} notes
                </span>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
                <SearchX className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-foreground">No notes match</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different keyword or clear the filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveTag(null);
                  }}
                  className="mt-4 inline-flex min-h-9 items-center rounded-full border border-border px-4 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  Clear search & filters
                </button>
              </div>
            ) : (
            <div className="space-y-4">
              {filtered.map((note, i) => (
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
                      {(() => {
                        const readPct = readPercentBySlug.get(note.slug);
                        if (readPct === undefined || readPct < 4) return null;
                        if (readPct >= 100) {
                          return (
                            <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success-fg">
                              <CircleCheck className="size-3" aria-hidden="true" />
                              Finished
                            </span>
                          );
                        }
                        return (
                          <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary tabular-nums">
                            {readPct}% read
                          </span>
                        );
                      })()}
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
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Tracks reading progress (0..1) of an article element using a "reading line"
 * anchored at 35% of the viewport height: 0% until the line crosses the prose
 * top, 100% once it passes the prose bottom. The same anchor drives the
 * resume-scroll, so the stored percent and the on-screen percent agree and
 * repeated resume cycles never inflate the saved value.
 */
function useReadingProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Article fully on screen (bottom edge above the fold) → finished,
      // even if the reading-line anchor hasn't crossed the prose end
      // (trailing content like the next-note card extends the page).
      if (rect.bottom <= window.innerHeight) {
        setProgress(1);
        return;
      }
      const topAbs = rect.top + window.scrollY;
      const anchor = window.innerHeight * 0.35;
      const denom = rect.height || 1;
      const value = (window.scrollY + anchor - topAbs) / denom;
      setProgress(Math.min(1, Math.max(0, value)));
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
  /** Resume position (0–100) when reopened from "Continue reading". */
  initialPercent?: number;
  onBack: () => void;
  onNext: () => void;
  nextTitle: string;
}

function NoteReader({
  note,
  initialPercent = 0,
  onBack,
  onNext,
  nextTitle,
}: NoteReaderProps) {
  const proseRef = useRef<HTMLDivElement>(null);
  const progress = useReadingProgress(proseRef);
  const active = useScrollSpy(note.sections.length);
  const lastRecorded = useRef(0);

  // Fresh note → start at the top, or resume where the visitor left off.
  useEffect(() => {
    if (initialPercent >= 4 && proseRef.current) {
      const rect = proseRef.current.getBoundingClientRect();
      const target =
        rect.top +
        window.scrollY +
        rect.height * (initialPercent / 100) -
        window.innerHeight * 0.35;
      window.scrollTo({
        top: Math.max(0, target),
        behavior: "instant" as ScrollBehavior,
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, []);

  // Persist reading progress locally: write on ~7% milestones so the
  // "Continue reading" strip is accurate without hammering localStorage.
  useEffect(() => {
    const pct = Math.round(progress * 100);
    const value = pct >= 96 ? 100 : pct;
    if (Math.abs(value - lastRecorded.current) >= 7) {
      lastRecorded.current = value;
      recordReadingProgress(note.slug, value);
    }
  }, [progress, note.slug]);

  // Closing/unmounting the reader always records the final position.
  useEffect(() => {
    return () => {
      recordReadingProgress(note.slug, lastRecorded.current);
    };
  }, [note.slug]);

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
      {/* Reading progress - sits just below the sticky header */}
      <div
        className="fixed inset-x-0 top-16 z-30 h-0.5 bg-transparent"
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full bg-gradient-to-r from-[#7a5c14] via-primary to-[#F9B872] transition-[width] duration-150 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Reader header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            All notes
          </button>
          <ShareButton
            title={`${note.title} - Collins Kamama`}
            text={`${note.title} - field note by Collins Kamama`}
            path={`/?tab=notes&n=${note.slug}`}
            label="Share note"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 print:hidden"
          />
        </div>
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
          <span className="ml-auto tabular-nums text-primary/80">
            {percent}%{percent >= 96 ? " · done" : ""}
          </span>
        </p>
      </div>

      {/* On this page - scroll-spy chips */}
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
      <div ref={proseRef} className="space-y-8 rounded-2xl border border-border bg-card p-6 md:p-9">
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
