"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface GithubRepoStat {
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

export interface GithubRelease {
  tag: string;
  title: string;
  publishedAt: string | null;
  url: string;
  prerelease: boolean;
}

export interface GithubPublicRepo {
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

interface GithubData {
  /** repo slug → live stats; only repos that responded with live=true are useful */
  repoStats: Record<string, GithubRepoStat>;
  release: GithubRelease | null;
  /** Every public, non-fork repo under bucky-ops (sorted by recent push). */
  publicRepos: GithubPublicRepo[];
  /** True until the first repos fetch settles - drives chip shimmer skeletons. */
  loading: boolean;
}

const GithubDataContext = createContext<GithubData>({
  repoStats: {},
  release: null,
  publicRepos: [],
  loading: true,
});

interface RawReposResponse {
  ok?: boolean;
  repos?: {
    repo?: string;
    stars?: number;
    live?: boolean;
    language?: string | null;
    pushedAt?: string | null;
    forks?: number;
  }[];
  publicRepos?: GithubPublicRepo[];
}

interface RawReleasesResponse {
  ok?: boolean;
  releases?: {
    tag?: string;
    title?: string;
    publishedAt?: string | null;
    url?: string;
    prerelease?: boolean;
  }[];
}

/**
 * Fetches /api/github/repos and /api/releases exactly once for the whole app
 * (provider is mounted at the SPA root). Every fetch is wrapped in try/catch
 * and defaults to empty/neutral - no broken states when the API is cold.
 */
export function GithubDataProvider({ children }: { children: ReactNode }) {
  const [repoStats, setRepoStats] = useState<Record<string, GithubRepoStat>>({});
  const [release, setRelease] = useState<GithubRelease | null>(null);
  const [publicRepos, setPublicRepos] = useState<GithubPublicRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/github/repos");
        if (!res.ok) return;
        const json = (await res.json()) as RawReposResponse;
        if (cancelled || !json?.ok || !Array.isArray(json.repos)) return;
        const map: Record<string, GithubRepoStat> = {};
        for (const r of json.repos) {
          if (typeof r?.repo !== "string" || !r.repo) continue;
          map[r.repo] = {
            repo: r.repo,
            title: r.repo,
            cluster: "",
            stars: typeof r.stars === "number" ? r.stars : 0,
            forks: typeof r.forks === "number" ? r.forks : 0,
            language: typeof r.language === "string" ? r.language : null,
            pushedAt: typeof r.pushedAt === "string" ? r.pushedAt : null,
            url: `https://github.com/bucky-ops/${r.repo}`,
            live: Boolean(r.live),
          };
        }
        setRepoStats(map);
        if (Array.isArray(json.publicRepos) && !cancelled) {
          setPublicRepos(json.publicRepos);
        }
      } catch {
        /* neutral - stars simply stay hidden */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    (async () => {
      try {
        const res = await fetch("/api/releases");
        if (!res.ok) return;
        const json = (await res.json()) as RawReleasesResponse;
        if (cancelled || !json?.ok || !Array.isArray(json.releases)) return;
        const latest = json.releases.find((r) => typeof r?.tag === "string" && r.tag);
        if (!latest) return;
        setRelease({
          tag: latest.tag ?? "",
          title: latest.title ?? latest.tag ?? "",
          publishedAt: latest.publishedAt ?? null,
          url: latest.url || "https://github.com/bucky-ops/kamama-portfolio/releases",
          prerelease: Boolean(latest.prerelease),
        });
      } catch {
        /* neutral - footer falls back to v1.0.0 */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ repoStats, release, publicRepos, loading }),
    [repoStats, release, publicRepos, loading]
  );

  return (
    <GithubDataContext.Provider value={value}>
      {children}
    </GithubDataContext.Provider>
  );
}

export function useGithubData(): GithubData {
  return useContext(GithubDataContext);
}
