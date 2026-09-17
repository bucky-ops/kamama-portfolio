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
| `/api/contact` | POST | zod-validated lead capture → Prisma → email notification + visitor auto-reply |
| `/api/admin/leads` | GET/PATCH/DELETE | Key-gated lead inbox (`x-admin-key` header, rate-limited) |
| `/api/github/repos` | GET | Live star/fork/push stats for featured repos (10-min cache) |
| `/api/releases` | GET | GitHub Releases feed powering the footer changelog |

## Email sending (contact form)

Every accepted lead triggers two emails automatically:

1. **Founder notification** - full lead details (name, email, organization, project
   type, budget, message) sent to `MAIL_TO` (defaults to the founder inbox) with
   `Reply-To` set to the visitor, so replying goes straight to the lead.
2. **Visitor auto-reply** - branded acknowledgment with a copy of the submitted
   message and a 24-hour response expectation.

Transport is chosen automatically from environment variables (see `.env.example`):

| Transport | When | Setup |
|---|---|---|
| Resend | `RESEND_API_KEY` set | Create a free API key at resend.com - recommended on Vercel |
| SMTP | `SMTP_HOST` set | Any SMTP account (Gmail app password, Zoho, Mailgun) |
| Log | `MAIL_TRANSPORT=log` | Local QA: renders the full email into the server log |
| None | nothing configured | Leads are still stored; emails are skipped gracefully |

All user input is HTML-escaped before it enters email markup, and mail failures
never fail an accepted lead (the response reports `emailed: true/false`).

## Security

- **HTTPS** - automatic on Vercel; HSTS is preloaded via response headers
  (`max-age=63072000; includeSubDomains; preload`).
- **Headers** - Content-Security-Policy (self-only scripts, no framing),
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
  `Permissions-Policy` (camera/mic/geo off), `poweredByHeader` disabled.
- **Input validation** - every API body is zod-validated server-side; field
  lengths, enum whitelist and email format enforced.
- **Abuse protection** - per-IP sliding-window rate limits (contact: 5 per 10 min,
  admin: 40 per 10 min) plus honeypot + submit-timing bot traps.
- **Secrets** - all credentials live in server-side env vars only, never shipped
  to the client bundle and never committed (`.env*` is gitignored).
- **Admin inbox** - gated by the `ADMIN_KEY` header check, never authorized when
  unset; the key is compared server-side only.
- **Email safety** - user input is HTML-escaped in all outbound mail templates.

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
- `ADMIN_KEY` - admin inbox key (optional; enables the leads API)
- `RESEND_API_KEY` / `SMTP_HOST` - email transports (optional; see Email section)
- `MAIL_FROM`, `MAIL_TO` - sender identity and founder notification inbox

## License

© 2026 Collins Kamama · Kamama Consulting Solutions. All rights reserved.
