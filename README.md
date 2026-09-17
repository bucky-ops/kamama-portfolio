# Kamama Portfolio - Production-Grade Systems

> **Collins (Muchiri) Kamama** · Solution Architect · Full Stack Developer · Data Scientist
> Nairobi, Kenya (UTC+3) - available for remote ICA contracts globally.

Portfolio for **Kamama Consulting Solutions**: production-grade systems for governance,
AI and enterprise operations - built for the UN system, NGOs, government and enterprise
across East Africa.

**Contact:** [muchiri.collin@aol.com](mailto:muchiri.collin@aol.com) (Founder) ·
[kamamamuchiri@yahoo.com](mailto:kamamamuchiri@yahoo.com) · +254 700 845 084

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript 5 |
| UI | Tailwind CSS 4 · shadcn/ui (New York) · framer-motion · lucide-react |
| Data | Prisma ORM + SQLite (`ContactMessage`, `ReleaseLog`) |
| Deploy | Vercel (connected to GitHub - auto-deploy on push) |

## Views

- **Home** - hero bento, architecture philosophy (Trust & Ingestion → Intelligence →
  Decision & Action → Deployment & Ops), trust bar, skills bento, featured systems.
- **Work** - 8 systems across 4 clusters with live GitHub stats and cluster filters.
- **About** - career timeline, education, certifications, references.
- **Contact** - qualifying form (project type + budget) + direct lines. Founder email first.

## APIs

| Route | Method | Purpose |
|---|---|---|
| `/api/contact` | POST | zod-validated lead capture → Prisma (graceful fallback) |
| `/api/github/repos` | GET | Live star/fork/push stats for featured repos (10-min cache) |
| `/api/releases` | GET | GitHub Releases feed powering the footer changelog |

## Release management (logged + tagged)

Every update is **committed, tagged and released** on GitHub:

```bash
# patch (default) | minor | major
bash scripts/release.sh patch "one-line summary of the update"
```

The script: bumps version → updates CHANGELOG.md check → commit → annotated tag
`vX.Y.Z` → push `main` + tag → GitHub Release (notes from CHANGELOG) → `ReleaseLog`
row. The site footer reads releases live via `/api/releases`.

Manual flow: commit → `git tag -a v1.0.1 -m "..."` → push → create Release from tag.

## Local development

```bash
bun install
cp .env.example .env.local   # optional: enables live GitHub stats server-side
bun run db:push
bun run dev                  # http://localhost:3000
```

Environment variables (never committed):

- `DATABASE_URL` - SQLite file path (required)
- `GITHUB_TOKEN` - GitHub PAT (optional; powers live repo stats + releases feed)

## License

© 2026 Collins Kamama · Kamama Consulting Solutions. All rights reserved.
