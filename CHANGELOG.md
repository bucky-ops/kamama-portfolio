# Changelog

All notable updates to the **Kamama Portfolio** are documented here.
Every release is tagged on GitHub (`vX.Y.Z`) and published as a GitHub Release —
the site footer reads this feed live via `/api/releases`.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versioning follows [Semantic Versioning](https://semver.org/).

## [1.7.0] — 2026-09-16

### Added
- **Light/dark theme toggle (brand dual-theme)**: the site now ships two complete
  themes — the original gruvbox dark (brand default for every first visit) and a new
  light "warm paper" theme (cream `#FBF7EE` canvas, ink text, amber darkened to
  `#A16207` for AA contrast on white cards). Header sun/moon switch on every
  breakpoint (crossfade + rotate micro-interaction, View Transition crossfade when
  supported, reduced-motion safe), a "Switch to light/dark theme" command-palette
  action, `localStorage` persistence (`kamama-theme`), no-flash first paint via
  next-themes, and live `<meta name="theme-color">` sync so mobile browser chrome
  matches both modes.
- **Notes reading history**: reading progress is recorded per note in
  `localStorage` (milestone-throttled, final position saved on close — purely local,
  nothing tracked server-side). The Notes list gains a "Continue reading" strip with
  per-note amber progress bars that reopens a note at the exact position (35%-viewport
  reading-line anchor — stored % and on-screen % agree, so repeated resumes never
  inflate), plus "% read" / "Finished ✓" chips on list cards.

### Changed
- **Full dark-color migration to design tokens**: ~90 hardcoded dark hexes across 12
  components (cards, dialogs, chips, status colors, timeline, palette, back-to-top
  ring, print-safe surfaces) replaced with shadcn theme tokens — every surface now
  adapts to both themes instead of assuming dark.
- **Theme-aware chrome**: custom scrollbar, text selection, grid-pattern lines and
  header scroll-shadow now derive from CSS variables; `color-scheme` flips per theme
  so native inputs/scrollbars match; PWA viewport colors follow the active theme.

### Verified
- E2E (agent-browser): fresh visitor → dark default (`ls=null`); toggle → light
  (`html.light`, cream bg, white cards) persisted across reload; toggle back → dark
  unchanged; palette action switches theme. Reading history: 0% at top, 51% mid-scroll
  → stored 51% → strip 51% → resume lands exactly 51% (no inflation); full scroll →
  100% → "Finished" chip, strip hidden. Founder email `muchiri.collin@aol.com` still
  featured first in Contact. Mobile 390 light render clean; zero console errors on a
  fresh session; ESLint clean, `tsc --noEmit` clean (src).

## [1.6.0] — 2026-09-16

### Added
- **Contact prefill funnel**: "Discuss this system" in any case-study dialog now jumps
  to Contact with the form pre-filled from that system — a natural opening message
  ("Hi Collins — I'd like to discuss your work on …"), the matching project type
  (cluster → type mapping), and a dismissible amber "Pre-filled from …" hint chip.
  Deep-linkable via `/?tab=contact&topic=<system title>`; clearing the chip (or sending
  the message) drops the param so a refresh starts clean.
- **Notes search + tag filters**: the Notes list gained a live search box (title,
  excerpt, tags — try "PostgreSQL" or "RAG"), alphabetical tag-filter chips with an
  "All n" pill, a "n of m notes" result counter, and a styled empty state with a
  one-tap "Clear search & filters" reset. Press `/` anywhere on the list to jump into
  search (form-field safe, desktop hint kbd inside the input).
- **Admin inbox search**: leads can now be searched by name, email, organization, or
  message content — combined with the existing status pills — so the founder can find
  a lead in seconds as the inbox grows. Search-aware empty state included.

### Changed
- **Skill tiles spotlight hover**: a soft amber radial glow now follows the cursor
  across each Home skill pillar (direct CSS-variable writes — zero re-renders,
  hover-only so touch devices are unaffected).
- **Live repo chips shimmer**: while the GitHub repos API is in flight, project cards
  render pulse-skeleton chips in the exact slot the live `language · updated` and
  star chips will occupy — no layout jump when data lands (cards + case-study dialog).

### Verified
- E2E: discuss-CTA → `?tab=contact&topic=…` seeds message + project type; chip dismiss
  reverts fields and URL; success clears the funnel. Notes `/` shortcut focuses search;
  "rag" → 1 of 3; empty state + clear works; RAG tag chip filters with aria-pressed.
  Admin: "Grace" → 1 lead, "zzz" → search-aware empty state. Spotlight CSS vars track
  the cursor. Mobile 390 renders the search + chips cleanly.
- Founder email `muchiri.collin@aol.com` still featured first in Contact.
- ESLint clean, `tsc --noEmit` clean (src), zero console errors.

## [1.5.0] — 2026-09-16

### Added
- **Print / Save-PDF case-study one-pager**: every case-study dialog now has a
  "Print / PDF" button that opens the browser print dialog over a dedicated print-only
  rendering — a clean, black-on-white branded one-pager (KAMAMA letterhead, problem →
  architecture → stage-by-stage flow → stack → outcome, amber accent bars, contact
  footer with `muchiri.collin@aol.com`). Implemented with a `@media print` stylesheet
  that hides the app chrome, neutralizes the dialog (fixed/translate/max-height) and
  reveals only the sheet — no dependencies, works from any browser's Ctrl/Cmd+P too.
- **Share buttons (Web Share API + clipboard fallback)**: case-study dialogs share the
  site with system context; Notes readers get "Share note" with shareable deep links —
  every note is now linkable via `/?tab=notes&n=<slug>` (URL syncs live as you open
  notes, deferred read keeps SSR paint consistent). Fallback copies the link with a
  "Link copied" toast; denial degrades to a clear "Couldn't share" toast.
- **Back-to-top control with scroll-progress ring**: floating bottom-right button
  appears after ~500 px of scroll, shows page scroll progress as an animated amber SVG
  ring, announces progress to screen readers (`aria-label`), smooth-scrolls to top
  (instant under `prefers-reduced-motion`), and is excluded from print output.
- **API rate limiting**: new `src/lib/rate-limit.ts` in-memory sliding-window limiter.
  `POST /api/contact` allows 5 messages / 10 min per IP (429 + `Retry-After`, friendly
  error copy surfaced in the form's error panel); `/api/admin/leads` allows 40 req /
  10 min per IP across all methods — ADMIN_KEY brute force is no longer viable. Buckets
  self-clean lazily to keep memory bounded.

### Changed
- Contact form error panel now surfaces the server's specific error message (e.g. the
  rate-limit copy) above the direct-email fallback line.
- Print hardening: app root hidden in print flow, reading-progress bar and share/print
  buttons excluded from print output, `@page` margins set.

### Verified
- agent-browser `pdf` render of the print one-pager (Blockchain Inventory System):
  single clean page with letterhead, 4-stage flow, amber outcome bar and contact footer.
- Rate limit E2E: 5/5 contact POSTs accepted, 6th → 429 `retry-after: 598`; admin loop
  40× 401 → 429. Test rows removed afterwards.
- Notes deep link `/?tab=notes&n=rag-for-sdg-evidence` opens the reader with Share note.
- Back-to-top: hidden at top, appears at 22% scroll with live ring, returns to top.
- ESLint clean, `tsc --noEmit` clean (src), zero console errors.

## [1.4.0] — 2026-09-16

### Added
- **Testimonials on the landing view**: a "What partners say" section on Home brings
  social proof above the fold journey's end — three abridged reference cards
  (Alice Ndungu, James Ndegwa, Victor Rotich) with amber initial avatars, green
  "On file" verified chips, clamped quotes, and a "Read full references in About"
  hand-off link.
- **One-tap vCard download** in Contact: "Save contact card (.vcf)" builds a vCard 3.0
  client-side (all three email lines, phone, org, title, site URL, Nairobi address) and
  downloads `Collins-Kamama.vcf` — prospects can add Collins to their address book with
  one tap. Pure client-side, no dependencies, confirmed by toast.
- **Reading progress bar + scroll-spy TOC in Notes**: the article reader now shows an
  amber gradient progress bar pinned under the sticky header (with a live `%` readout in
  the meta row) and an "On this page" chip navigation — numbered chips smooth-scroll to
  sections, and the chip for the section currently in the reader's middle band
  highlights automatically (IntersectionObserver). Notes reset scroll to top when opened.
- **RSS feed** at `/feed.xml`: statically generated RSS 2.0 for the Notes blog (titles,
  dates, categories, full content) and declared via `<link rel="alternate">` in the
  document head so readers/apps can subscribe.

### Changed
- **Scroll-reveal choreography site-wide**: new `Reveal` component (fade + rise on first
  viewport entry, staggered delays, honors `prefers-reduced-motion`) applied to Home
  (trust bar, skill tiles, featured systems, testimonials), About (timeline + side
  cards), Contact (form, direct lines, availability, map), and Notes list cards.
- **Skill depth meters**: each Home skill pillar now carries an animated amber gradient
  depth bar (fills on scroll into view) with a `depth n/100` mono readout and an
  accessible `aria-label`; depth values live in `profile-data.ts`.
- **Career timeline hover polish**: timeline entries highlight as a card on hover
  (border + tint), and their amber node scales up — matching the site-wide hover
  language.

## [1.3.0] — 2026-09-16

### Added
- **Command palette (⌘K / Ctrl+K)**: fast, searchable launcher in every view. Groups:
  Navigate (all 7 views with `1–5` shortcuts), Open a system case study (all 8 systems,
  filterable by title/cluster/stack), Notes, and Quick actions — copy founder email, mailto
  Collins, download resume, GitHub + LinkedIn profiles. Search pill (`Search ⌘K`) added to
  the header on desktop, icon button on mobile. Built on cmdk (`ui/command`) themed to the
  gruvbox tokens.
- **In-app case study dialogs**: every project card's "Case Study" button now opens a rich
  dialog — cluster + flagship badges, live repo meta & stars, Problem / Architecture /
  Stack / Metric sections, the expandable stage diagram for flagships, a "View source"
  link (or "Private client deployment" chip), and a **"Discuss this system"** CTA that
  hands off to the Contact view. Wired from Home featured cards, Work cards, and the
  command palette (palette selection deep-opens the dialog on the Work tab).
- **Professional references upgraded**: placeholder quotes replaced with abridged reference
  summaries for the three named referees (Alice Ndungu — UNON records digitization & GDPR
  migration; James Ndegwa — Nakuru County systems migration & IT support; Victor Rotich —
  campus IT reliability & mentorship). Redesigned cards: amber gradient initial avatars,
  green "On file" verified chip, contact proof, and the work each reference covers. Cards
  state clearly that originals are available on request.
- **Animated hero stat counters**: `5+ / 10+ / 99.9% / 500K+` count up with an ease-out
  curve on first view (tabular numbers, honors `prefers-reduced-motion`, renders final
  value instantly when reduced).
- **Contact anti-spam**: invisible honeypot field + form-timing check on `POST /api/contact`.
  Bot-looking submissions get a fake success response (never stored); legacy clients
  without the fields keep working.

### Changed
- Skill cards on Home now share the project-card hover treatment (lift + amber glow);
  case-study buttons render as real buttons with focus rings; dialog content scrolls at
  `85vh` max for small screens.
- Fixed the doubled `v1.1.0 — v1.1.0 —` GitHub Release title (API patch, no code change).
- Fixed a testimonial name typo (`Mr.s` → `Ms.`).

## [1.2.0] — 2026-09-16

### Added
- **Notes (engineering blog)** — new tab in the main nav (`/?tab=notes`): three first-person
  write-ups grounded in real project work — Tier 3 PostgreSQL HA at 500K+ daily tx, building
  the UN-Habitat SDG 11 RAG system, and the ODK/KoboToolbox → Power BI M&E pipeline. List +
  in-app article reader with numbered sections, reading time, tags and next-note navigation.
  Content lives in `src/lib/notes-data.ts` for easy editing.
- **Live repo meta on project cards**: the GitHub API payload (language + last push) is now
  surfaced through the client context and rendered as a chip — e.g. `TypeScript · 7mo` — so
  employers can see systems are maintained at a glance. Chips render only when the API
  responds live.
- **Keyboard navigation**: keys `1–5` switch views (Home, Work, Notes, About, Contact);
  ignored while typing in form fields; hint surfaced in the footer.
- **PWA basics + SEO extras**: `manifest.webmanifest` (dark theme color, amber K icon),
  `theme_color` viewport export, and a generated `sitemap.xml`.

### Changed
- Project cards group the live stars chip with the new repo-meta chip; footer shows a
  keyboard-hint kbd chip.

## [1.1.0] — 2026-09-16

### Added
- **Admin Lead Inbox** (`/?tab=admin`, lock icon in footer): private, key-gated view of
  every contact-form submission. New API `GET/PATCH/DELETE /api/admin/leads` guarded by an
  `ADMIN_KEY` env var (server-side only, never shipped to the client). Includes lead stats
  (total / new / replied / this week), status filters, lead detail dialog with one-click
  "Reply by email", status workflow (new → read → replied), delete-with-confirmation, and
  CSV export. Key is stored in sessionStorage and cleared on lock.
- **Architecture diagrams for flagship systems**: the three ★ Flagship cards (Blockchain
  Inventory, SDG RAG, Climate & Food Security Intelligence) now carry an expandable
  stage-by-stage architecture flow (Trust & Ingestion → Core/Intelligence → Decision → Ops)
  rendered inline in the project card — replaces the Excalidraw placeholder note.
- **On-site Changelog view** (`/?tab=changelog`, footer link): live GitHub Releases feed
  rendered as a version timeline with cleaned release-note excerpts and links to GitHub.
- **SEO / Open Graph**: branded OG banner (1344×768) wired into `openGraph` + `twitter`
  metadata, `metadataBase` + canonical URL, robots directives, and JSON-LD `Person`
  structured data (name, role, emails, socials, expertise). Amber "K" favicon via
  `src/app/icon.svg`.

### Changed
- Styling polish: soft amber radial glow behind the hero avatar, "NBO · UTC+3" geo badge,
  header elevation shadow on scroll, section-heading kickers, card hover lift + amber glow,
  ★ Flagship markers on featured project cards, `text-wrap: balance` for headings,
  `scrollbar-gutter: stable` to stop layout shift, skip-to-content link.

### Deployment note
- For the hosted admin inbox, set `ADMIN_KEY` in Vercel → Project → Settings → Environment
  Variables (local dev uses `.env.local`). Without it the inbox stays locked and shows a
  clear "not configured" message.

## [1.0.1] — 2026-09-16

### Changed
- Vercel project pinned to the `nextjs` framework (project-level) and connected to the
  GitHub repo `bucky-ops/kamama-portfolio` — every push to `main` now auto-deploys to
  production, every tag can be traced to a deployment.
- Old project link to legacy `kamama-digital-canvas` repo detached.

[Unreleased]: https://github.com/bucky-ops/kamama-portfolio/compare/v1.7.0...HEAD
[1.7.0]: https://github.com/bucky-ops/kamama-portfolio/releases/tag/v1.7.0
[1.6.0]: https://github.com/bucky-ops/kamama-portfolio/releases/tag/v1.6.0
[1.5.0]: https://github.com/bucky-ops/kamama-portfolio/releases/tag/v1.5.0
[1.4.0]: https://github.com/bucky-ops/kamama-portfolio/releases/tag/v1.4.0
[1.3.0]: https://github.com/bucky-ops/kamama-portfolio/releases/tag/v1.3.0
[1.2.0]: https://github.com/bucky-ops/kamama-portfolio/releases/tag/v1.2.0
[1.1.0]: https://github.com/bucky-ops/kamama-portfolio/releases/tag/v1.1.0
[1.0.1]: https://github.com/bucky-ops/kamama-portfolio/releases/tag/v1.0.1

## [Unreleased]

### Planned
- Replace abridged reference summaries with verbatim LinkedIn recommendations
- LinkedIn URL refresh
- Founder-side: set `ADMIN_KEY` in Vercel env to unlock the hosted lead inbox

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
