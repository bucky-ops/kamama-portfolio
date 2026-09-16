"use client";

import { useEffect } from "react";
import {
  ExternalLink,
  Github,
  Layers,
  Lock,
  MessageSquare,
  Printer,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Project } from "@/lib/profile-data";
import { useGithubData } from "./github-data";
import { ArchitectureDiagram } from "./architecture-diagram";
import { ClusterBadge, RepoChipsSkeleton, RepoMetaChip, StarsChip, TagChip } from "./shared";
import { CaseStudyPrint } from "./case-study-print";
import { ShareButton } from "./share-button";

const GITHUB_BASE = "https://github.com/bucky-ops";

interface ProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fired when the visitor clicks "Discuss this system" (close + go to Contact). */
  onDiscuss?: (project: Project) => void;
}

/**
 * In-app case study: full problem → architecture → metric breakdown for a
 * system, replacing the dead external "Case Study" links.
 */
export function ProjectDialog({
  project,
  open,
  onOpenChange,
  onDiscuss,
}: ProjectDialogProps) {
  const { repoStats, loading } = useGithubData();
  const stat = project ? repoStats[project.repo] : undefined;
  const hasRepo = Boolean(project?.repo);
  const repoUrl = `${GITHUB_BASE}/${project?.repo ?? ""}`;

  // Esc-to-close is handled by Radix; keep focus sane for screen readers.
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] gap-0 overflow-y-auto rounded-2xl border-border bg-[#161B22] p-0 sm:max-w-2xl"
        aria-describedby={undefined}
      >
        <DialogHeader className="space-y-3 border-b border-border/70 p-6 text-left">
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
            {hasRepo && stat?.live ? (
              <>
                <RepoMetaChip language={stat.language} pushedAt={stat.pushedAt} />
                <StarsChip stars={stat.stars} />
              </>
            ) : hasRepo && loading ? (
              <RepoChipsSkeleton />
            ) : null}
          </div>
          <DialogTitle className="text-xl font-bold leading-snug tracking-tight text-foreground md:text-2xl">
            {project.title}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs leading-relaxed text-muted-foreground">
            Case study · {project.cluster}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Problem */}
          <section aria-label="Problem statement" className="space-y-2">
            <h4 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-primary/80">
              <Target className="size-3.5" aria-hidden="true" />
              Problem
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {project.problem}
            </p>
          </section>

          {/* Approach */}
          <section aria-label="Approach and architecture" className="space-y-2">
            <h4 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-primary/80">
              <Layers className="size-3.5" aria-hidden="true" />
              Architecture
            </h4>
            <p className="font-mono text-xs leading-relaxed text-foreground/90">
              {project.architecture}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {project.caseStudy}
            </p>
          </section>

          {/* Stage diagram */}
          {project.diagram ? (
            <section aria-label="Stage-by-stage architecture">
              <ArchitectureDiagram spec={project.diagram} title={project.title} />
            </section>
          ) : null}

          {/* Stack */}
          <section aria-label="Technology stack" className="space-y-2">
            <h4 className="font-mono text-[11px] uppercase tracking-widest text-primary/80">
              Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </div>
          </section>

          {/* Metric */}
          <div className="flex items-start gap-2.5 rounded-r-lg border-l-2 border-primary bg-primary/5 px-3 py-2.5">
            <TrendingUp className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="font-mono text-xs leading-relaxed text-primary">
              {project.metric}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border/70 bg-secondary/20 p-6">
          {onDiscuss ? (
            <Button
              type="button"
              onClick={() => onDiscuss(project)}
              className="min-h-11 flex-1 rounded-full bg-primary font-semibold text-primary-foreground hover:bg-[#F0B232] sm:flex-none sm:px-6"
            >
              <MessageSquare className="size-4" aria-hidden="true" />
              Discuss this system
            </Button>
          ) : null}

          {hasRepo ? (
            <Button
              variant="outline"
              asChild
              className="min-h-11 flex-1 rounded-full border-border bg-transparent hover:border-primary/40 hover:bg-secondary/50 sm:flex-none sm:px-6"
            >
              <a href={repoUrl} target="_blank" rel="noreferrer">
                <Github className="size-4" aria-hidden="true" />
                View source
                <ExternalLink className="size-3 opacity-60" aria-hidden="true" />
              </a>
            </Button>
          ) : (
            <span
              className="inline-flex min-h-11 cursor-not-allowed items-center gap-1.5 rounded-full border border-dashed border-border px-4 font-mono text-xs text-muted-foreground/70"
              title="Private client deployment — source not public"
            >
              <Lock className="size-3.5" aria-hidden="true" />
              Private client deployment
            </span>
          )}

          {/* Print / Save as PDF — renders the branded one-pager via print CSS */}
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
            aria-label={`Print or save ${project.title} case study as PDF`}
            title="Opens the print dialog — save as PDF to share a one-pager"
            className="min-h-11 flex-1 rounded-full border-border bg-transparent hover:border-primary/40 hover:bg-secondary/50 sm:flex-none sm:px-6"
          >
            <Printer className="size-4" aria-hidden="true" />
            Print / PDF
          </Button>

          {/* Share — Web Share API with clipboard fallback */}
          <ShareButton
            title={`${project.title} — Collins Kamama`}
            text={`${project.title} — case study by Collins Kamama (Kamama Consulting Solutions)`}
            path="/?tab=projects"
            label="Share"
            className="min-h-11 flex-1 rounded-full border border-border bg-transparent text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 sm:flex-none sm:px-6 print:hidden"
          />
        </div>

        {/* Print-only branded one-pager (invisible on screen) */}
        <CaseStudyPrint project={project} />
      </DialogContent>
    </Dialog>
  );
}
