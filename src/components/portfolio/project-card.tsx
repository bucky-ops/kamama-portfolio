"use client";

import { ExternalLink, FileText, Github, Layers, Lock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@/lib/profile-data";
import { useGithubData } from "./github-data";
import { ClusterBadge, StarsChip, TagChip } from "./shared";

const GITHUB_BASE = "https://github.com/bucky-ops";

export function ProjectCard({ project }: { project: Project }) {
  const { repoStats } = useGithubData();
  const stat = repoStats[project.repo];
  const hasRepo = project.repo !== "";
  const repoUrl = `${GITHUB_BASE}/${project.repo}`;
  const hasCaseStudy = Boolean(project.caseStudy) && hasRepo;

  return (
    <Card className="flex h-full flex-col rounded-2xl border-border bg-[#161B22] transition-colors duration-200 hover:border-primary/40">
      <CardContent className="flex h-full flex-col gap-3.5 p-5 md:p-6">
        {/* Top row: cluster + stars */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ClusterBadge cluster={project.cluster} />
          <StarsChip stars={hasRepo && stat?.live ? stat.stars : undefined} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold leading-snug text-foreground">
          {project.title}
        </h3>

        {/* Problem */}
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground/70">Problem — </span>
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

        {/* Stack */}
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>

        {/* Metric callout */}
        <div className="flex items-start gap-2.5 rounded-r-lg border-l-2 border-primary bg-primary/5 px-3 py-2.5">
          <TrendingUp className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="font-mono text-xs leading-relaxed text-primary">
            {project.metric}
          </span>
        </div>

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
              title="Private client deployment — source not public"
            >
              <Lock className="size-3.5" aria-hidden="true" />
              Private client deployment
            </span>
          )}

          {hasCaseStudy ? (
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
  );
}
