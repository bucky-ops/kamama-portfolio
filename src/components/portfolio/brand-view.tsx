"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Copy, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "./reveal";

/**
 * Brand view - the design system presented "in words", exactly as the
 * production wireframe specifies: the 8-token color palette with copyable
 * hex values, typography specimens, the 8pt spacing scale, the bento
 * rationale, and the full logo system (3 variants, do/don't rules, and
 * real mockups). Specimen panels intentionally use literal hex colors -
 * they document the palette, so they must not theme-shift.
 */

const ICON_LIGHT = "/brand/kamama-icon-light.png";
const WORDMARK_LIGHT = "/brand/kamama-wordmark-light-horizontal.png";
const WORDMARK_DARK = "/brand/kamama-logo-dark-horizontal.png";

interface Token {
  name: string;
  hex: string;
  usage: string;
}

const TOKENS: Token[] = [
  { name: "Background", hex: "#0D1117", usage: "Primary page bg, header, footer" },
  { name: "Card", hex: "#161B22", usage: "Card bg, header hover, input bg" },
  { name: "Border", hex: "#21262D", usage: "Borders, dividers, tag bg, button stroke" },
  { name: "Text Primary", hex: "#C9D1D9", usage: "Body text, nav links, headings" },
  { name: "Text Muted", hex: "#8B949E", usage: "Sublabels, captions, SYSTEMS • tag" },
  { name: "Accent", hex: "#F9B872", usage: "CTAs, Hire Me, link hover, timeline dot" },
  { name: "Accent Hover", hex: "#FFC985", usage: "Button hover, focus glow" },
  { name: "Success", hex: "#238636", usage: "Uptime badge, live status" },
];

const SPACING = [
  { px: "8px", bar: "w-2", use: "micro · between label & title" },
  { px: "16px", bar: "w-4", use: "card padding · inside cards, inputs" },
  { px: "24px", bar: "w-6", use: "between cards · gap-6 bento" },
  { px: "48px", bar: "w-12", use: "between sections · section y-spacing" },
  { px: "96px", bar: "w-24", use: "major blocks · hero to projects" },
];

const BENTO_LOGIC = [
  {
    lead: "Systems thinking",
    body: "Bento shows hierarchy, not list. Critical path larger, support smaller.",
  },
  {
    lead: "2-col hero (1.2fr + 0.8fr)",
    body: "Proof on left, status / stack on right. No centered fluff.",
  },
  {
    lead: "Three.js globe",
    body: "Low-poly <30k tris, subtle rotation 0.2rad/s, not background · contained in card, 280px.",
  },
  {
    lead: "Employer-ready",
    body: "Metrics first, not adjectives. 99.9% / 500K+ / SOC2.",
  },
];

const LOGO_DOS = [
  "Min height 24px header, 16px favicon",
  "Clear space = height of 'K' (16px)",
  "Colors: white on dark, black on light, amber #F9B872 for accent only",
  "Header logo + mono tagline SYSTEMS • BLOCKCHAIN • AI #8B949E",
  "Icon as favicon, OpenGraph, watermark",
];

const LOGO_DONTS = [
  "Don't stretch, skew, rotate, add drop shadow",
  "Don't change to random colors · only white / black / amber #F9B872",
  "Don't place light logo on white, dark logo on #0D1117",
  "Don't go smaller than 24px, don't crop",
  "Don't add tagline inside the logo · keep the mono tagline separate",
];

function TokenCard({ token }: { token: Token }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(token.hex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable - no-op */
    }
  };

  return (
    <Card className="flex h-full flex-col rounded-2xl border-border bg-card">
      <CardContent className="flex h-full flex-col gap-3 p-4">
        {/* Swatch - literal color, documented */}
        <div
          className="relative h-20 w-full rounded-xl border border-border"
          style={{ backgroundColor: token.hex }}
        >
          <span className="absolute bottom-2 left-2 rounded-md bg-black/45 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white">
            {token.hex}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">{token.name}</h3>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? `${token.hex} copied` : `Copy ${token.hex} to clipboard`}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {copied ? (
              <Check className="size-3 text-success-fg" aria-hidden="true" />
            ) : (
              <Copy className="size-3" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{token.usage}</p>
      </CardContent>
    </Card>
  );
}

export function BrandView() {
  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-10 px-5 py-8 md:px-8 md:py-12">
      {/* ── Hero: the system in words ─────────────────────────────────── */}
      <section aria-label="Design system introduction" className="grid gap-4 lg:grid-cols-5">
        <Card className="rounded-2xl border-border bg-card lg:col-span-3">
          <CardContent className="flex h-full flex-col justify-center gap-5 p-6 md:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Design System / v1.0 · Final
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] text-foreground md:text-[56px] md:leading-[0.98] md:tracking-[-0.03em]">
              Actual color &amp; design <span className="text-primary">in words.</span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Dark-first bento portfolio. Built to feel like production infra ·
              quiet, precise, no demo energy. Every token maps to real Tailwind
              usage.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1 xl:grid-cols-2">
          <Card className="rounded-2xl border-border bg-card">
            <CardContent className="flex h-full flex-col gap-2 p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Grid
              </p>
              <p className="font-semibold text-foreground">12-col / 8pt</p>
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                Bento 1.2fr + 0.8fr
                <br />
                hero, 4-col skills, 3-col projects
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border bg-card">
            <CardContent className="flex h-full flex-col gap-2 p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Radius / Shadow
              </p>
              <p className="font-semibold text-foreground">16-20px cards</p>
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                999px pills, 0 4px 24px
                <br />
                rgba(0,0,0,.4)
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Color palette ─────────────────────────────────────────────── */}
      <Reveal>
        <section aria-label="Color palette" className="space-y-5">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Color Palette
            </h2>
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
            <span className="whitespace-nowrap font-mono text-[11px] tracking-widest text-muted-foreground">
              8 TOKENS · WCAG AA
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {TOKENS.map((token) => (
              <TokenCard key={token.hex} token={token} />
            ))}
          </div>

          {/* Real Tailwind mapping - the promise of the page */}
          <div className="flex flex-wrap gap-3" aria-label="Tailwind class mapping">
            <span className="rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] text-muted-foreground">
              bg: bg-[#0D1117] · card: bg-[#161B22]
            </span>
            <span className="rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] text-muted-foreground">
              text: text-[#C9D1D9] / muted text-[#8B949E]
            </span>
            <span className="rounded-full border border-primary/40 bg-card px-4 py-2 font-mono text-[11px] text-primary">
              accent: bg-[#F9B872] hover:bg-[#FFC985] ring-[#F9B872]
            </span>
          </div>
        </section>
      </Reveal>

      {/* ── Typography + spacing + bento logic ────────────────────────── */}
      <Reveal>
        <section
          aria-label="Typography and layout rules"
          className="grid gap-4 lg:grid-cols-5"
        >
          {/* Type specimens */}
          <Card className="rounded-2xl border-border bg-card lg:col-span-3">
            <CardContent className="flex h-full flex-col gap-6 p-6 md:p-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Typography
              </p>

              <div className="space-y-1.5">
                <p className="text-4xl font-extrabold leading-none tracking-[-0.03em] text-foreground md:text-[44px]">
                  Display · 48-56px / 800
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  Inter 800 · -0.03em · line 0.95 · H1 hero: &ldquo;I build
                  production-grade systems&hellip;&rdquo;
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[32px] font-bold leading-tight tracking-tight text-foreground">
                  Section · 32px / 700
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  Inter 700 · tight · Projects / About titles
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-xl font-semibold text-foreground">
                  Card Title · 20px / 600
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  Inter 600 · 20px · Project card titles
                </p>
              </div>

              <div className="h-px bg-border" aria-hidden="true" />

              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-[420px] space-y-1.5">
                  <p className="text-base leading-relaxed text-foreground">
                    Body · 16-18px / 400 / 1.6. Inter Regular for paragraphs,
                    max 65ch. Muted #8B949E for secondary. Never pure white.
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Inter 400 · 16px · lh 1.6
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-border bg-secondary/60 px-3 py-1 font-mono text-xs text-foreground">
                      99.9% Uptime
                    </span>
                    <span className="rounded-full border border-border bg-secondary/60 px-3 py-1 font-mono text-xs text-foreground">
                      500K+ Tx/day
                    </span>
                  </div>
                  <div className="flex">
                    <span className="rounded-full border border-border bg-secondary/60 px-3 py-1 font-mono text-xs text-foreground">
                      5+ Years
                    </span>
                  </div>
                  <p className="max-w-[220px] font-mono text-[11px] leading-relaxed text-muted-foreground">
                    JetBrains Mono 500 · 11-13px · badges, metrics, SYSTEMS tag
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spacing scale + bento logic + header spec */}
          <div className="space-y-4 lg:col-span-2">
            <Card className="rounded-2xl border-border bg-card">
              <CardContent className="space-y-3.5 p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Spacing / 8pt
                </p>
                {SPACING.map((row) => (
                  <div key={row.px} className="flex items-center gap-3">
                    <span
                      className={`h-2 shrink-0 rounded-full bg-primary ${row.bar}`}
                      aria-hidden="true"
                    />
                    <span className="w-10 shrink-0 font-mono text-xs font-semibold text-foreground">
                      {row.px}
                    </span>
                    <span className="text-xs text-muted-foreground">{row.use}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border bg-card">
              <CardContent className="space-y-3 p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Bento Logic · Why
                </p>
                <ul className="space-y-3">
                  {BENTO_LOGIC.map((item) => (
                    <li key={item.lead} className="flex gap-2.5">
                      <span
                        className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {item.lead}:
                        </span>{" "}
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <span
                className="grid size-6 shrink-0 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground"
                aria-hidden="true"
              >
                !
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Header spec:</span>{" "}
                backdrop-blur 12px, bg #0D1117/80, border #21262D, logo 32px
                height, nav links 13px 500, active pill bg{" "}
                <span className="font-mono text-foreground">#C9D1D9</span> text{" "}
                <span className="font-mono text-foreground">#0D1117</span>.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── Logo system ───────────────────────────────────────────────── */}
      <Reveal>
        <section aria-label="Logo system" className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-[32px]">
                Logo System
              </h2>
              <p className="font-mono text-[11px] tracking-widest text-muted-foreground">
                3 VARIANTS · LIGHT PRIMARY · DARK FOR LIGHT BG · ICON ONLY
              </p>
            </div>
            <span className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
              min height 24px · clear space 16px
            </span>
          </div>

          {/* 3 variants - panels are literal (they document the palette) */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="flex h-full flex-col rounded-2xl border-border bg-card">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Light wordmark · Primary
                </p>
                <div className="grid h-44 place-items-center rounded-xl border border-border bg-[#161B22]">
                  <Image
                    src={WORDMARK_LIGHT}
                    alt="KAMAMA light wordmark on dark surface"
                    width={1059}
                    height={128}
                    className="h-9 w-auto max-w-full"
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Use on{" "}
                  <span className="font-semibold text-foreground">#0D1117</span> /{" "}
                  <span className="font-semibold text-foreground">#161B22</span>.
                  Header 32px, footer 24px. No recolor.
                </p>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col rounded-2xl border-[#C9D1D9] bg-[#C9D1D9] shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#0D1117]/60">
                  Dark wordmark · Light bg
                </p>
                <div className="grid h-44 place-items-center rounded-xl bg-white">
                  <Image
                    src={WORDMARK_DARK}
                    alt="KAMAMA dark wordmark on light surface"
                    width={384}
                    height={128}
                    className="h-12 w-auto max-w-full"
                  />
                </div>
                <p className="text-xs leading-relaxed text-[#0D1117]/70">
                  Use on white / #C9D1D9 cards, docs, light decks. Same spacing
                  rules.
                </p>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col rounded-2xl border-border bg-card">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Icon only · 1:1
                </p>
                <div className="grid h-44 place-items-center rounded-xl border border-border bg-[#161B22]">
                  <Image
                    src={ICON_LIGHT}
                    alt="KAMAMA network icon"
                    width={512}
                    height={512}
                    className="size-16"
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Favicon 32px, avatar, watermark 7% opacity in project cards.
                  Do not stretch.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Do / Don't */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl border-border bg-card">
              <CardContent className="space-y-3 p-6">
                <p className="font-mono text-[11px] uppercase tracking-widest text-success-fg">
                  {"DO'S"}
                </p>
                <ul className="space-y-2.5">
                  {LOGO_DOS.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-success-fg"
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-relaxed text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-primary/30 bg-card">
              <CardContent className="space-y-3 p-6">
                <p className="font-mono text-[11px] uppercase tracking-widest text-warn">
                  {"DON'TS"}
                </p>
                <ul className="space-y-2.5">
                  {LOGO_DONTS.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <X className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden="true" />
                      <span className="text-sm leading-relaxed text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Mockups */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="flex h-full flex-col rounded-2xl border-border bg-card">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Mockup · Business card
                </p>
                <div className="grid h-24 place-items-center rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="flex w-full items-center justify-between rounded-lg border border-[#21262D] bg-[#161B22] px-4 py-3">
                    <Image
                      src={ICON_LIGHT}
                      alt=""
                      aria-hidden="true"
                      width={512}
                      height={512}
                      className="size-[18px]"
                    />
                    <span className="font-mono text-[9px] tracking-[0.14em] text-[#8B949E]">
                      SYSTEMS • BLOCKCHAIN • AI
                    </span>
                  </div>
                </div>
                <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                  Card #161B22 · logo 18px · muted tagline 9px
                </p>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col rounded-2xl border-border bg-card">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Mockup · Favicon / Social
                </p>
                <div className="grid h-24 place-items-center rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="flex w-full items-center gap-3 rounded-lg border border-[#21262D] bg-[#0D1117] px-4 py-2.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-[#21262D] bg-[#161B22]">
                      <Image
                        src={ICON_LIGHT}
                        alt=""
                        aria-hidden="true"
                        width={512}
                        height={512}
                        className="size-4"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#C9D1D9]">
                        kamama.systems
                      </span>
                      <span className="block truncate text-xs text-[#8B949E]">
                        Operator · prod infra
                      </span>
                    </span>
                  </div>
                </div>
                <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                  16px favicon · OG 1200x630 dark bg #0D1117
                </p>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col rounded-2xl border-border bg-card">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Mockup · Header (actual)
                </p>
                <div className="grid h-24 place-items-center rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="flex w-full items-center justify-between rounded-lg border border-[#21262D] bg-[#0D1117]/95 px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <Image
                        src={ICON_LIGHT}
                        alt=""
                        aria-hidden="true"
                        width={512}
                        height={512}
                        className="size-5"
                      />
                      <span className="hidden font-mono text-[10px] tracking-[0.14em] text-[#8B949E] sm:inline">
                        SYSTEMS • BLOCKCHAIN • AI
                      </span>
                    </span>
                    <span className="rounded-full bg-[#F9B872] px-3 py-1 text-[11px] font-bold text-[#0D1117]">
                      Hire Me
                    </span>
                  </div>
                </div>
                <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                  backdrop-blur 12px · border #21262D · CTA #F9B872
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
