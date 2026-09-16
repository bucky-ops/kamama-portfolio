"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, History, Tag } from "lucide-react";
import { SectionHeading } from "./shared";

/* ---------------------------------- types --------------------------------- */

interface ReleaseEntry {
  tag: string;
  title: string;
  publishedAt: string | null;
  url: string;
  prerelease: boolean;
  excerpt?: string;
}

/** Offline fallback so the view never renders empty while the API is cold. */
const FALLBACK_RELEASES: ReleaseEntry[] = [
  {
    tag: "v1.0.1",
    title: "v1.0.1 — Vercel git integration",
    publishedAt: "2026-09-16T00:00:00Z",
    url: "https://github.com/bucky-ops/kamama-portfolio/releases/tag/v1.0.1",
    prerelease: false,
    excerpt:
      "Vercel project pinned to the nextjs framework and connected to bucky-ops/kamama-portfolio — every push to main now auto-deploys to production.",
  },
  {
    tag: "v1.0.0",
    title: "v1.0.0 — Kamama Portfolio Launch",
    publishedAt: "2026-09-16T00:00:00Z",
    url: "https://github.com/bucky-ops/kamama-portfolio/releases/tag/v1.0.0",
    prerelease: false,
    excerpt:
      "Single-page portfolio with four tabbed views (Home, Work, About, Contact), 8 systems across 4 solution clusters, lead-qualifying contact form, live GitHub star data, and release automation via scripts/release.sh.",
  },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

/** Strip markdown syntax so release-note excerpts read as plain prose. */
function stripMd(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function ChangelogView() {
  const [releases, setReleases] = useState<ReleaseEntry[] | null>(null);
  const [source, setSource] = useState<string>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/releases");
        if (!res.ok) throw new Error();
        const json = (await res.json()) as { ok?: boolean; source?: string; releases?: ReleaseEntry[] };
        if (cancelled) return;
        const list = Array.isArray(json.releases) ? json.releases : [];
        setSource(json.source ?? "github");
        setReleases(list.length > 0 ? list : FALLBACK_RELEASES);
      } catch {
        if (!cancelled) {
          setSource("fallback");
          setReleases(FALLBACK_RELEASES);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = releases ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6 md:py-12">
      <section aria-label="Changelog" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            kicker="Release engineering"
            title="Changelog"
            subtitle="Every update to this site is tagged and published as a GitHub Release — this feed is the live proof."
          />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
            <Tag className="size-3 text-primary" aria-hidden="true" />
            source: {source}
          </span>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
            <History className="size-8 text-primary/60" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Loading release history…</p>
          </div>
        ) : (
          <ol className="relative space-y-0 border-l border-border pl-6">
            {list.map((r, idx) => (
              <motion.li
                key={r.tag}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="relative pb-8 last:pb-0"
              >
                {/* timeline node */}
                <span
                  className="absolute -left-[31px] top-1 flex size-2.5 items-center justify-center rounded-full bg-[#E3B341] ring-4 ring-[#0D1117]"
                  aria-hidden="true"
                />
                <div className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E3B341]/40 bg-[#E3B341]/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#E3B341]">
                      <Tag className="size-3" aria-hidden="true" />
                      {r.tag}
                    </span>
                    {r.prerelease ? (
                      <span className="rounded-full border border-[#F0883E]/40 bg-[#F0883E]/10 px-2 py-0.5 font-mono text-[10px] text-[#F0883E]">
                        pre-release
                      </span>
                    ) : null}
                    <time className="ml-auto font-mono text-[11px] text-muted-foreground" dateTime={r.publishedAt ?? undefined}>
                      {formatDate(r.publishedAt)}
                    </time>
                  </div>
                  <h3 className="mt-3 text-base font-semibold tracking-tight">{r.title || r.tag}</h3>
                  {r.excerpt ? (
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{stripMd(r.excerpt)}</p>
                  ) : null}
                  {r.url ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 transition-colors hover:underline"
                    >
                      View on GitHub
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </motion.li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
