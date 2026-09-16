"use client";

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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  philosophy,
  profile,
  projects,
  skillCards,
  trustLogos,
} from "@/lib/profile-data";
import { ProjectCard } from "./project-card";
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

export function HomeView({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const featured = projects.filter((p) => p.featured);
  const [headlineBefore, headlineAfter] = profile.headline.split(
    HEADLINE_HIGHLIGHT
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6 md:py-12">
      {/* ── Hero bento ─────────────────────────────────────────────── */}
      <section aria-label="Introduction" className="grid gap-4 lg:grid-cols-5">
        {/* Left — headline + CTAs + philosophy flow */}
        <Card className="rounded-2xl border-border bg-[#161B22] lg:col-span-3">
          <CardContent className="flex h-full flex-col gap-6 p-6 md:p-8">
            <p className="flex items-center gap-2 font-mono text-xs text-[#3FB950]">
              <span className="relative flex size-2.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3FB950] opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-[#3FB950]" />
              </span>
              Open for ICA contracts · Nairobi (UTC+3)
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
                className="min-h-11 rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-[#F0B232]"
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
                  href="/resume/Collins_Kamama_Master_Resume_2026_Updated.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download Resume
                </a>
              </Button>
            </div>

            {/* Architecture philosophy — 4-step mini flow */}
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

        {/* Right — photo placeholder + stats */}
        <Card className="overflow-hidden rounded-2xl border-border bg-[#161B22] lg:col-span-2">
          <CardContent className="flex h-full flex-col p-6 md:p-8">
            <div className="grid-pattern relative flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-border/60 bg-secondary/20 py-8">
              <InitialsAvatar />
              <div className="text-center">
                <p className="font-mono text-sm font-semibold tracking-wide text-foreground">
                  {profile.shortName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {profile.role}
                </p>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4">
              {profile.stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-mono text-2xl font-bold text-primary md:text-3xl">
                    {stat.value}
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
      <motion.section
        aria-label="Trusted by"
        {...fadeUp}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-border bg-[#161B22] px-5 py-4 md:px-6"
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
      </motion.section>

      {/* ── Skills bento ───────────────────────────────────────────── */}
      <section aria-label="Skills" className="space-y-4">
        <SectionHeading
          title="What I bring"
          subtitle="Four pillars, each backed by a production metric — not a bullet point."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {skillCards.map((skill, i) => {
            const Icon = skillIcons[skill.icon] ?? Code2;
            return (
              <motion.div
                key={skill.title}
                {...fadeUp}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <Card className="h-full rounded-2xl border-border bg-[#161B22] transition-colors duration-200 hover:border-primary/40">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
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
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                      {skill.tags.map((tag) => (
                        <TagChip key={tag} tag={tag} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Featured systems ───────────────────────────────────────── */}
      <section aria-label="Featured systems" className="space-y-4">
        <SectionHeading
          title="Featured Systems"
          subtitle="Flagship builds — every one ships with architecture, a metric, and source."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((project, i) => (
            <motion.div
              key={project.title}
              {...fadeUp}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="flex"
            >
              <div className="w-full">
                <ProjectCard project={project} />
              </div>
            </motion.div>
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
    </div>
  );
}
