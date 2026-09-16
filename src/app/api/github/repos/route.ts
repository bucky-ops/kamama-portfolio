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

/**
 * Live GitHub stats for the featured repos — token is server-side only.
 * Falls back gracefully (live: false) when the token is missing or rate-limited.
 */
export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "kamama-portfolio",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const slugs = projects
    .map((p) => p.repo)
    .filter((r): r is string => Boolean(r));

  const results = await Promise.all(
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
  );

  return NextResponse.json({ ok: true, repos: results });
}
