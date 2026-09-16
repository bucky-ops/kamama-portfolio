import { notes } from "@/lib/notes-data";

/**
 * RSS 2.0 feed for the Notes engineering blog — statically generated at build
 * time from notes-data.ts (single source of truth).
 */

const SITE_URL = "https://kamama-portfolio.vercel.app";
const FEED_URL = `${SITE_URL}/feed.xml`;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const dynamic = "force-static";

export function GET(): Response {
  const items = notes
    .map((note) => {
      const url = `${SITE_URL}/?tab=notes`;
      const description = escapeXml(note.excerpt);
      return `    <item>
      <title>${escapeXml(note.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="false">${escapeXml(note.slug)}</guid>
      <pubDate>${new Date(`${note.date}T09:00:00+03:00`).toUTCString()}</pubDate>
      <description>${description}</description>
      <content:encoded><![CDATA[${note.sections
        .map(
          (s) =>
            `<h2>${s.heading}</h2>${s.paragraphs
              .map((p) => `<p>${p}</p>`)
              .join("")}`
        )
        .join("")}]]></content:encoded>
      ${note.tags
        .map((t) => `<category>${escapeXml(t)}</category>`)
        .join("\n      ")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Collins Kamama — Notes</title>
    <link>${SITE_URL}/?tab=notes</link>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
    <description>Short, practical engineering write-ups from production systems — PostgreSQL HA, RAG, and data-for-development pipelines.</description>
    <language>en</language>
    <lastBuildDate>${new Date(
      `${notes[0]?.date ?? "2026-01-01"}T09:00:00+03:00`
    ).toUTCString()}</lastBuildDate>
    <generator>Kamama Portfolio</generator>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
