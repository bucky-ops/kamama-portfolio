# Changelog

All notable updates to the **Kamama Portfolio** are documented here.
Every release is tagged on GitHub (`vX.Y.Z`) and published as a GitHub Release —
the site footer reads this feed live via `/api/releases`.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versioning follows [Semantic Versioning](https://semver.org/).

## [1.0.1] — 2026-09-16

### Changed
- Vercel project pinned to the `nextjs` framework (project-level) and connected to the
  GitHub repo `bucky-ops/kamama-portfolio` — every push to `main` now auto-deploys to
  production, every tag can be traced to a deployment.
- Old project link to legacy `kamama-digital-canvas` repo detached.

[Unreleased]: https://github.com/bucky-ops/kamama-portfolio/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/bucky-ops/kamama-portfolio/releases/tag/v1.0.1

## [Unreleased]

### Planned
- Architecture diagram (SVG) per flagship system
- Real recommendation quotes replacing placeholder testimonials
- LinkedIn URL refresh

## [1.0.0] — 2026-09-16

### Added
- **Single-page portfolio** (Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui) with four
  tabbed views: Home, Work (Systems), About, Contact — deep-linkable via `/?tab=`.
- **Home**: hero bento ("I build production-grade systems that operate, not just demo"),
  4-step architecture philosophy (Trust & Ingestion → Intelligence → Decision & Action →
  Deployment & Ops), CK stat overlay (5+ yrs · 10+ apps · 99.9% uptime · 500K+ daily tx),
  trust bar (UN, UNDP Kenya, Nakuru County Government, TechSavanna Kenya), skills bento
  with production metrics, 3 featured systems.
- **Work**: 8 systems across 4 solution clusters (Enterprise Blockchain, AI & Analytics,
  Climate & Civic, Infrastructure) with live GitHub star counts, problem → architecture →
  metric → source structure, and cluster filters.
- **About**: career timeline (UNV/UNDP, Binti Rising, Kamama Consulting, UNON, Nakuru
  County, Metro Supermarket), education, certifications, interests, references.
- **Contact**: lead-qualifying form (project type + budget dropdowns) persisting to
  Prisma/SQLite via `POST /api/contact`; **founder email `muchiri.collin@aol.com`**
  featured first with Founder badge, plus kamamamuchiri@yahoo.com, 911recaro@protonmail.com,
  phone, availability and socials.
- **APIs**: `/api/contact` (zod-validated, graceful no-DB fallback), `/api/github/repos`
  (live repo stats, token server-side only), `/api/releases` (GitHub Releases feed).
- **Release engineering**: `scripts/release.sh` — version bump, annotated git tag, GitHub
  Release + `ReleaseLog` mirror; CHANGELOG.md enforced for every update.
- Resume download (PDF) at `/resume/Collins_Kamama_Master_Resume_2026_Updated.pdf`.
- Dark gruvbox theme (#0D1117 / amber #E3B341), responsive mobile-first layout, sticky
  footer, custom scrollbars, reduced-motion support, accessibility tree verified.

### Verified
- E2E browser verification: all tabs, cluster filters, mobile drawer, contact form
  submission persisted to database, live GitHub star data, zero console errors.
- ESLint clean; TypeScript strict, no `any`.

[1.0.0]: https://github.com/bucky-ops/kamama-portfolio/releases/tag/v1.0.0
