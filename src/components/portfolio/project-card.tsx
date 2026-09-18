"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, FileText, Github, Layers, Lock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/profile-data";
import { useGithubData } from "./github-data";
import { ArchitectureDiagram } from "./architecture-diagram";
import { ClusterBadge, RepoChipsSkeleton, RepoMetaChip, StarsChip, TagChip } from "./shared";

const GITHUB_BASE = "https://github.com/bucky-ops";

/** Cartoon bounce curve - elastic overshoot (see the cartoon system spec). */
const EASE_CARTOON = [0.68, -0.55, 0.27, 1.55] as const;

interface ProjectCardProps {
  project: Project;
  /** When provided, "Case Study" opens the in-app dialog instead of a dead link. */
  onCaseStudy?: (project: Project) => void;
}

export function ProjectCard({ project, onCaseStudy }: ProjectCardProps) {
  const { repoStats, loading } = useGithubData();
  const stat = repoStats[project.repo];
  const hasRepo = project.repo !== "";
  const repoUrl = `${GITHUB_BASE}/${project.repo}`;
  const hasCaseStudy = Boolean(project.caseStudy) && hasRepo;

  return (
    /* Cartoon hover physics live on this wrapper: rubber-stamp squash
       (0.97Y / 1.02X pulse), a held -2px lift, and the flagship 2deg
       ledger tilt. MotionConfig reducedMotion="user" disables the whole
       transform set for reduced-motion visitors. */
    <motion.div
      className="h-full"
      whileHover={{
        y: -2,
        rotate: project.featured ? 2 : 0,
        scaleY: [1, 0.97, 1],
        scaleX: [1, 1.02, 1],
        transition: { duration: 0.28, ease: EASE_CARTOON },
      }}
    >
    <Card
      className={cn(
        // kam-card: plain CSS hook for the tag-bounce hover rule
        // (see globals.css). group/card drives the Tailwind hover set.
        "kam-card group/card relative flex h-full flex-col overflow-hidden rounded-2xl border-border bg-card transition-all duration-300 ease-out hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(227,179,65,0.07)]"
      )}
    >
      {/* Brand watermark - logo spec: icon at 7% opacity, zooms gently on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-9 -right-9 z-0 select-none transition-transform duration-300 ease-out group-hover/card:scale-110"
      >
        <Image
          src="/brand/kamama-icon-light.png"
          alt=""
          width={512}
          height={512}
          className="hidden size-28 opacity-[0.07] dark:block"
        />
        <Image
          src="/brand/kamama-icon-dark.png"
          alt=""
          width={512}
          height={512}
          className="size-28 opacity-[0.07] dark:hidden"
        />
      </div>
      <CardContent className="relative flex h-full flex-col gap-3.5 p-5 md:p-6">
        {/* Top row: cluster + flagship + stars */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <ClusterBadge cluster={project.cluster} />
            {project.featured ? (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                title="Flagship system"
              >
                <span aria-hidden="true" className="text-primary">★</span>
                Flagship
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {hasRepo && loading ? (
              <RepoChipsSkeleton />
            ) : (
              <>
                <RepoMetaChip
                  language={hasRepo && stat?.live ? stat.language : null}
                  pushedAt={hasRepo && stat?.live ? stat.pushedAt : null}
                />
                <StarsChip stars={hasRepo && stat?.live ? stat.stars : undefined} />
              </>
            )}
          </div>
        </div>

        {/* Title - logo/type spec: card title 20px / 600 */}
        <h3 className="text-xl font-semibold leading-snug text-foreground">
          {project.title}
        </h3>

        {/* Ledger line - cartoon pen stroke: draws left to right with an
           elastic flick (the overshoot slams against the overflow clip)
           and an amber pen-nib dot pops as the stroke completes. */}
        <span
          aria-hidden="true"
          className="relative -mt-2 block h-0.5 w-full"
        >
          <span className="block h-full w-full origin-left overflow-hidden rounded-full">
            <span className="block h-full w-full origin-left scale-x-0 bg-gradient-to-r from-primary to-[#F9B872] transition-transform duration-[450ms] ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] group-hover/card:scale-x-100" />
          </span>
          <span className="absolute right-0 top-1/2 size-2 -translate-y-1/2 scale-0 rounded-full bg-[#F9B872] opacity-0 transition-all duration-200 ease-out group-hover/card:scale-100 group-hover/card:opacity-100 group-hover/card:delay-[400ms]" />
        </span>

        {/* Problem */}
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground/70">Problem - </span>
          {project.problem}
        </p>

        {/* Architecture */}
        <p className="flex items-start gap-2 font-mono text-xs leading-relaxed text-muted-foreground">
          <Layers
            className="mt-0.5 size-3.5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>{project.architecture}</span>
        </p>

        {/* Stack - each chip is a .kam-tag so the CSS layer bounces them
            in sequence (70ms apart) as the card is hovered. */}
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((tag, ti) => (
            <span
              key={tag}
              className="kam-tag"
              style={{ "--tag-i": ti } as CSSProperties}
            >
              <TagChip tag={tag} />
            </span>
          ))}
        </div>

        {/* Metric callout */}
        <div className="flex items-start gap-2.5 rounded-r-lg border-l-2 border-primary bg-primary/5 px-3 py-2.5">
          <TrendingUp className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="font-mono text-xs leading-relaxed text-primary">
            {project.metric}
          </span>
        </div>

        {/* Expandable architecture diagram (flagship systems) */}
        {project.diagram ? <ArchitectureDiagram spec={project.diagram} title={project.title} /> : null}

        {/* Links */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {hasRepo ? (
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`View ${project.title} source on GitHub`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Github className="size-3.5" aria-hidden="true" />
              GitHub
              <ExternalLink className="size-3 opacity-60" aria-hidden="true" />
            </a>
          ) : (
            <span
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 font-mono text-xs text-muted-foreground/70"
              title="Private client deployment - source not public"
            >
              <Lock className="size-3.5" aria-hidden="true" />
              Private client deployment
            </span>
          )}

          {onCaseStudy ? (
            <button
              type="button"
              onClick={() => onCaseStudy(project)}
              aria-label={`Read the ${project.title} case study`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <FileText className="size-3.5" aria-hidden="true" />
              Case Study
            </button>
          ) : hasCaseStudy ? (
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Read the ${project.title} case study`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <FileText className="size-3.5" aria-hidden="true" />
              Case Study
            </a>
          ) : (
            <span className="inline-flex min-h-9 cursor-not-allowed items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground/70">
              <FileText className="size-3.5" aria-hidden="true" />
              Case Study
            </span>
          )}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}
