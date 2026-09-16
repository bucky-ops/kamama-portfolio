import { NextResponse } from "next/server";
import { projects } from "@/lib/profile-data";

export const revalidate = 600; // cache live stats for 10 minutes

interface RepoStats {
  repo: string;
  title: string;
  cluster: string;
  stars: number;
  forks: number;
  language: string | null;
  pushedAt: string | null;
  url: string;
  live: boolean;
}

interface PublicRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  homepage: string | null;
  pushedAt: string | null;
  url: string;
}

interface CacheEntry {
  at: number;
  repos: RepoStats[];
  publicRepos: PublicRepo[];
}

/** Module-level response cache - shields the GitHub API from burst traffic. */
const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: CacheEntry | null = null;

/**
 * Live GitHub stats for the featured repos + the full public repository list
 * under bucky-ops. Token is server-side only. Falls back gracefully
 * (live: false / empty list) when the token is missing or rate-limited.
 */
export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return NextResponse.json({ ok: true, repos: cache.repos, publicRepos: cache.publicRepos });
  }

  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "kamama-portfolio",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const slugs = projects
    .map((p) => p.repo)
    .filter((r): r is string => Boolean(r));

  const [results, publicRepos] = await Promise.all([
    Promise.all(
      slugs.map(async (repo): Promise<RepoStats> => {
        const fallback: RepoStats = {
          repo,
          title: projects.find((p) => p.repo === repo)?.title ?? repo,
          cluster: projects.find((p) => p.repo === repo)?.cluster ?? "",
          stars: 0,
          forks: 0,
          language: null,
          pushedAt: null,
          url: `https://github.com/bucky-ops/${repo}`,
          live: false,
        };
        try {
          const res = await fetch(
            `https://api.github.com/repos/bucky-ops/${repo}`,
            { headers, signal: AbortSignal.timeout(8000) }
          );
          if (!res.ok) return fallback;
          const data = await res.json();
          return {
            repo,
            title: data.name ?? fallback.title,
            cluster: fallback.cluster,
            stars: data.stargazers_count ?? 0,
            forks: data.forks_count ?? 0,
            language: data.language ?? null,
            pushedAt: data.pushed_at ?? null,
            url: data.html_url ?? fallback.url,
            live: true,
          };
        } catch {
          return fallback;
        }
      })
    ),
    (async (): Promise<PublicRepo[]> => {
      try {
        const res = await fetch(
          "https://api.github.com/users/bucky-ops/repos?per_page=100&sort=pushed",
          { headers, signal: AbortSignal.timeout(8000) }
        );
        if (!res.ok) return [];
        const data = (await res.json()) as Array<Record<string, unknown>>;
        if (!Array.isArray(data)) return [];
        return data
          .filter((r) => r.fork !== true && typeof r.name === "string")
          .map((r) => ({
            name: String(r.name),
            description:
              typeof r.description === "string" ? r.description : null,
            language: typeof r.language === "string" ? r.language : null,
            stars: typeof r.stargazers_count === "number" ? r.stargazers_count : 0,
            forks: typeof r.forks_count === "number" ? r.forks_count : 0,
            topics: Array.isArray(r.topics) ? r.topics.map(String).slice(0, 4) : [],
            homepage: typeof r.homepage === "string" && r.homepage ? r.homepage : null,
            pushedAt: typeof r.pushed_at === "string" ? r.pushed_at : null,
            url: String(r.html_url ?? `https://github.com/bucky-ops/${r.name}`),
          }));
      } catch {
        return [];
      }
    })(),
  ]);

  cache = { at: Date.now(), repos: results, publicRepos };
  return NextResponse.json({ ok: true, repos: results, publicRepos });
}
