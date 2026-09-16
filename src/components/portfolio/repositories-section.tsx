"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Github, Globe, Search, Star } from "lucide-react";
import { useGithubData } from "./github-data";
import { profile } from "@/lib/profile-data";
import { cn } from "@/lib/utils";

/** Canonical GitHub language colors for the repo dots. */
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "Jupyter Notebook": "#DA5B0B",
  Go: "#00ADD8",
  Rust: "#dea584",
  Shell: "#89e051",
};

function relativePush(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const days = Math.max(0, Math.round((Date.now() - then) / 86_400_000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

/**
 * Full public-repository index for github.com/bucky-ops, fed live by
 * /api/github/repos (publicRepos). Renders every non-fork repo with
 * description, language, stars, topics and a live-demo link when present.
 */
export function RepositoriesSection() {
  const { publicRepos, loading } = useGithubData();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return publicRepos;
    return publicRepos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        r.topics.some((t) => t.toLowerCase().includes(q)) ||
        (r.language ?? "").toLowerCase().includes(q)
    );
  }, [publicRepos, query]);

  return (
    <section aria-label="Public repositories on GitHub" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Github className="size-4 text-primary" aria-hidden="true" />
            Public Repositories
            <span className="rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
              {loading ? "…" : publicRepos.length}
            </span>
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Everything open-sourced under{" "}
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              github.com/{profile.socials.githubHandle}
            </a>{" "}
            - the full archive behind the featured systems above.
          </p>
        </div>

        {publicRepos.length > 6 ? (
          <label className="relative block">
            <span className="sr-only">Search repositories</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search repos…"
              className="h-9 w-48 rounded-full border border-border bg-card pl-9 pr-3 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
            />
          </label>
        ) : null}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[118px] animate-pulse rounded-2xl border border-border bg-card/60"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-10 text-center text-sm text-muted-foreground">
          {publicRepos.length === 0
            ? "Repository index is unavailable right now - browse everything on GitHub directly."
            : `No repositories match "${query}".`}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((repo) => {
            const push = relativePush(repo.pushedAt);
            const langColor = repo.language ? LANG_COLORS[repo.language] : undefined;
            return (
              <li key={repo.name} className="flex">
                <div className="group flex w-full flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-[#2D333B]">
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 truncate font-mono text-[13px] font-semibold text-foreground group-hover:text-primary"
                      title={repo.name}
                    >
                      {repo.name}
                    </a>
                    {repo.homepage ? (
                      <a
                        href={repo.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${repo.name} live demo`}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/20"
                      >
                        <Globe className="size-3" aria-hidden="true" />
                        Live
                      </a>
                    ) : (
                      <ExternalLink
                        className="size-3.5 shrink-0 text-muted-foreground/50"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  {repo.description ? (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {repo.description}
                    </p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-[11px] text-muted-foreground">
                    {repo.language ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: langColor ?? "#8b949e" }}
                          aria-hidden="true"
                        />
                        {repo.language}
                      </span>
                    ) : null}
                    {repo.stars > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3" aria-hidden="true" />
                        {repo.stars}
                      </span>
                    ) : null}
                    {push ? (
                      <span className="font-mono text-[10px]">pushed {push}</span>
                    ) : null}
                    {repo.topics.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className={cn(
                          "rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px]"
                        )}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
