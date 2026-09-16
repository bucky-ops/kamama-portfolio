/**
 * Kamama Portfolio - Notes reading history (localStorage-backed).
 * Tracks how far a visitor has read each note so the Notes list can offer
 * "Continue reading" and mark finished notes. Purely local, no tracking:
 * data never leaves the browser and is trivially clearable.
 */

const STORAGE_KEY = "kamama.reading-history";
const MAX_ENTRIES = 8;

export interface ReadingEntry {
  slug: string;
  /** 0–100; 100 means finished. */
  percent: number;
  /** Epoch ms of the last progress write. */
  updatedAt: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeParse(raw: string | null): ReadingEntry[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (e): e is ReadingEntry =>
          !!e &&
          typeof e === "object" &&
          typeof (e as ReadingEntry).slug === "string" &&
          typeof (e as ReadingEntry).percent === "number" &&
          typeof (e as ReadingEntry).updatedAt === "number"
      )
      .map((e) => ({
        slug: e.slug,
        percent: Math.min(100, Math.max(0, Math.round(e.percent))),
        updatedAt: e.updatedAt,
      }));
  } catch {
    return [];
  }
}

/** All entries, most recently read first, capped at MAX_ENTRIES. */
export function getReadingHistory(): ReadingEntry[] {
  if (!isBrowser()) return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY)).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );
}

export function getReadingEntry(slug: string): ReadingEntry | null {
  return getReadingHistory().find((e) => e.slug === slug) ?? null;
}

/**
 * Upsert progress for a note. Values below 3% are ignored (scroll noise),
 * 96%+ is normalised to 100 (finished). Prunes unknown/oldest overflow.
 */
export function recordReadingProgress(slug: string, percent: number): void {
  if (!isBrowser() || !slug) return;
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  if (clamped < 3) return;
  const value = clamped >= 96 ? 100 : clamped;

  try {
    const entries = safeParse(window.localStorage.getItem(STORAGE_KEY)).filter(
      (e) => e.slug !== slug
    );
    entries.unshift({ slug, percent: value, updatedAt: Date.now() });
    const pruned = entries
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
  } catch {
    // Private mode / storage full - reading history is best-effort.
  }
}

/** Removes a single note from the history (per-card dismiss control). */
export function removeReadingEntry(slug: string): void {
  if (!isBrowser() || !slug) return;
  try {
    const entries = safeParse(window.localStorage.getItem(STORAGE_KEY)).filter(
      (e) => e.slug !== slug
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Private mode / storage full - reading history is best-effort.
  }
}

/** Wipes the reading history (exposed for an explicit clear control). */
export function clearReadingHistory(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
