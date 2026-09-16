"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  ChevronRight,
  CloudCog,
  Code2,
  Database,
  Download,
  Globe,
  Landmark,
  type LucideIcon,
  MapPin,
  Quote,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  philosophy,
  profile,
  projects,
  skillCards,
  testimonials,
  trustLogos,
  type Project,
} from "@/lib/profile-data";
import { AnimatedStat } from "./animated-stat";
import { ProjectCard } from "./project-card";
import { ProjectDialog } from "./project-dialog";
import { Reveal } from "./reveal";
import { InitialsAvatar, SectionHeading, TagChip, type TabId } from "./shared";

const HEADLINE_HIGHLIGHT = "operate, not just demo";

const skillIcons: Record<string, LucideIcon> = {
  code: Code2,
  brain: BrainCircuit,
  database: Database,
  cloud: CloudCog,
};

const trustIcons: LucideIcon[] = [Globe, Building2, Landmark, Building2];

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

interface HomeViewProps {
  onNavigate: (tab: TabId) => void;
  /** Fired by the featured-card dialog CTA ("Discuss this system"). */
  onDiscuss?: (project: Project) => void;
}

export function HomeView({ onNavigate, onDiscuss }: HomeViewProps) {
  const featured = projects.filter((p) => p.featured);
  const [caseStudy, setCaseStudy] = useState<Project | null>(null);
  const [headlineBefore, headlineAfter] = profile.headline.split(
    HEADLINE_HIGHLIGHT
  );

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-10 px-5 py-8 md:px-8 md:py-12">
      {/* ── Hero bento ─────────────────────────────────────────────── */}
      <section aria-label="Introduction" className="grid gap-4 lg:grid-cols-5">
        {/* Left - headline + CTAs + philosophy flow */}
        <Card className="rounded-2xl border-border bg-card lg:col-span-3">
          <CardContent className="flex h-full flex-col gap-6 p-6 md:p-8">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <MapPin className="size-3.5 text-primary" aria-hidden="true" />
              Solution Architect • Nairobi, Kenya • UTC+3
            </p>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl md:leading-[1.15]">
                {headlineBefore}
                <span className="text-primary">{HEADLINE_HIGHLIGHT}</span>
                {headlineAfter}
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                {profile.subhead}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => onNavigate("projects")}
                className="min-h-11 rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                View Systems
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                asChild
                className="min-h-11 rounded-full border-border bg-transparent hover:border-primary/40 hover:bg-secondary/50"
              >
                <a
                  href="/resume/Kamama_Curriculum_Vitae_2025.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download Resume
                </a>
              </Button>
              <p className="flex min-h-11 items-center gap-1.5 pl-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                Nairobi • Remote / Hybrid • Kenyan eligible for ICA globally
              </p>
            </div>

            {/* Architecture philosophy - 4-step mini flow */}
            <div aria-label="Architecture philosophy" className="mt-auto pt-2">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Architecture philosophy
              </p>
              <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                {philosophy.map((step, i) => (
                  <li key={step.step} className="flex min-w-0 flex-1 items-center gap-2">
                    <div
                      className="min-w-0 flex-1 rounded-lg border border-border bg-secondary/40 p-3 transition-colors hover:border-primary/40"
                      title={step.text}
                    >
                      <span className="font-mono text-[11px] text-primary">
                        {step.step}
                      </span>
                      <p className="mt-0.5 truncate text-xs font-medium text-foreground sm:whitespace-normal">
                        {step.title}
                      </p>
                    </div>
                    {i < philosophy.length - 1 ? (
                      <ChevronRight
                        className="hidden size-4 shrink-0 text-primary/60 sm:block"
                        aria-hidden="true"
                      />
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Right - photo placeholder + stats */}
        <Card className="overflow-hidden rounded-2xl border-border bg-card lg:col-span-2">
          <CardContent className="flex h-full flex-col p-6 md:p-8">
            <div className="grid-pattern relative flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border border-border/60 bg-secondary/20 py-8">
              {/* soft amber glow behind avatar */}
              <div
                className="glow-amber pointer-events-none absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
                aria-hidden="true"
              />
              <InitialsAvatar />
              <div className="relative text-center">
                <p className="font-mono text-sm font-semibold tracking-wide text-foreground">
                  {profile.shortName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {profile.role}
                </p>
              </div>
              {/* corner geo badge */}
              <span
                className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground backdrop-blur-sm"
                aria-hidden="true"
              >
                <Globe className="size-3 text-primary/70" />
                NBO · UTC+3
              </span>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4">
              {profile.stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-mono text-2xl font-bold text-primary md:text-3xl">
                    <AnimatedStat value={stat.value} />
                  </dd>
                  <dd className="mt-0.5 text-xs text-muted-foreground">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </section>

      {/* ── Trust bar ──────────────────────────────────────────────── */}
      <Reveal>
        <section
          aria-label="Trusted by"
          className="rounded-2xl border border-border bg-card px-5 py-4 md:px-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Trusted across
            </span>
            {trustLogos.map((org, i) => {
              const Icon = trustIcons[i % trustIcons.length];
              return (
                <span
                  key={org}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground"
                >
                  <Icon className="size-3.5 text-primary/70" aria-hidden="true" />
                  {org}
                </span>
              );
            })}
          </div>
        </section>
      </Reveal>

      {/* ── Skills bento ───────────────────────────────────────────── */}
      <section aria-label="Skills" className="space-y-4">
        <SectionHeading
          kicker="Capabilities"
          title="What I bring"
          subtitle="Four pillars, each backed by a production metric - not a bullet point."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {skillCards.map((skill, i) => {
            const Icon = skillIcons[skill.icon] ?? Code2;
            return (
              <Reveal key={skill.title} delay={i * 0.07} className="h-full">
                <Card
                  className="group/skill relative h-full overflow-hidden rounded-2xl border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(227,179,65,0.07)] dark:hover:shadow-[0_8px_32px_rgba(227,179,65,0.07)] shadow-[0_8px_32px_rgba(31,35,40,0.06)]"
                  onMouseMove={(e) => {
                    // Cursor spotlight - CSS vars drive the radial overlay
                    // (direct DOM write, no re-render, touch-safe: overlay is
                    // hover-only).
                    const rect = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
                    e.currentTarget.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
                  }}
                >
                  {/* Spotlight overlay - lights up under the cursor on hover */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/skill:opacity-100"
                    style={{
                      background:
                        "radial-gradient(220px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(227,179,65,0.12), transparent 60%)",
                    }}
                  />
                  <CardContent className="relative flex h-full flex-col gap-3 p-5">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">
                      {skill.title}
                    </h3>
                    <div>
                      <p className="font-mono text-base font-bold leading-snug text-primary md:text-lg">
                        {skill.metric}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {skill.metricNote}
                      </p>
                    </div>
                    {/* Depth meter - animated amber fill on scroll into view */}
                    <div
                      role="img"
                      aria-label={`${skill.title} depth: ${skill.depth} out of 100`}
                    >
                      <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#7a5c14] via-primary to-[#F9B872]"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.depth}%` }}
                          viewport={{ once: true, margin: "0px 0px -32px 0px" }}
                          transition={{
                            duration: 0.9,
                            delay: 0.15 + i * 0.07,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                        <span>depth</span>
                        <span className="text-primary/80">{skill.depth}/100</span>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                      {skill.tags.map((tag) => (
                        <TagChip key={tag} tag={tag} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Featured systems ───────────────────────────────────────── */}
      <section aria-label="Featured systems" className="space-y-4">
        <SectionHeading
          kicker="Selected work"
          title="Featured Systems"
          subtitle="Flagship builds - every one ships with architecture, a metric, and source."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((project, i) => (
            <Reveal key={project.title} delay={i * 0.07} className="flex">
              <div className="w-full">
                <ProjectCard project={project} onCaseStudy={setCaseStudy} />
              </div>
            </Reveal>
          ))}
        </div>
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onNavigate("projects")}
            className="min-h-11 rounded-full border-border bg-transparent px-6 hover:border-primary/40 hover:bg-secondary/50"
          >
            All Systems
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </section>

      {/* ── Testimonials strip ────────────────────────────────────────── */}
      <section aria-label="What partners say" className="space-y-4">
        <SectionHeading
          kicker="Social proof"
          title="What partners say"
          subtitle="Abridged from written professional references - originals available on request."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.07} className="h-full">
              <figure className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(227,179,65,0.07)] shadow-[0_8px_32px_rgba(31,35,40,0.06)]">
                <div className="flex items-start justify-between gap-2">
                  <Quote
                    className="size-4 shrink-0 text-primary/70 transition-colors group-hover:text-primary"
                    aria-hidden="true"
                  />
                  <span
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 font-mono text-[10px] text-success-fg"
                    title="Professional reference held on file"
                  >
                    <ShieldCheck className="size-3" aria-hidden="true" />
                    On file
                  </span>
                </div>
                <blockquote className="mb-4 mt-3 line-clamp-4 text-sm italic leading-relaxed text-muted-foreground">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3 border-t border-border/60 pt-3">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F9B872] via-[#F9B872] to-[#7a5c14] font-mono text-xs font-bold text-[#161206] ring-1 ring-[#F9B872]/40"
                    aria-hidden="true"
                  >
                    {t.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.title}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => onNavigate("about")}
            className="group inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-primary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            Read full references in About
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
        </div>
      </section>

      {/* In-app case study dialog for featured systems */}
      <ProjectDialog
        project={caseStudy}
        open={caseStudy !== null}
        onOpenChange={(open) => {
          if (!open) setCaseStudy(null);
        }}
        onDiscuss={
          onDiscuss ??
          (() => {
            onNavigate("contact");
          })
        }
      />
    </div>
  );
}
