import { NextResponse } from "next/server";

export const revalidate = 300;

export const GITHUB_REPO = "bucky-ops/kamama-portfolio";

/**
 * Release log - the public answer to "is every update logged and tagged?".
 * Reads GitHub Releases for the repo; the local DB mirrors them (see ReleaseLog model).
 */
export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "kamama-portfolio",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=20`,
      { headers, next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) }
    );

    if (!res.ok) {
      return NextResponse.json(
        { ok: true, source: "none", releases: [], note: "Releases appear after the first GitHub release is published." },
        { status: 200 }
      );
    }

    const releases = await res.json();
    return NextResponse.json({
      ok: true,
      source: "github",
      repo: `https://github.com/${GITHUB_REPO}`,
      releases: (Array.isArray(releases) ? releases : []).map((r: {
        tag_name?: string;
        name?: string;
        published_at?: string;
        html_url?: string;
        prerelease?: boolean;
        body?: string;
      }) => ({
        tag: r.tag_name ?? "",
        title: r.name ?? r.tag_name ?? "",
        publishedAt: r.published_at ?? null,
        url: r.html_url ?? "",
        prerelease: Boolean(r.prerelease),
        excerpt: (r.body ?? "").slice(0, 240),
      })),
    });
  } catch (error) {
    console.error("[releases] GitHub fetch failed:", error);
    return NextResponse.json(
      { ok: true, source: "none", releases: [], note: "Release feed temporarily unavailable." },
      { status: 200 }
    );
  }
}
