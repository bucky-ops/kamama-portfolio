"use client";

import { History, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectCluster } from "@/lib/profile-data";

export type TabId =
  | "home"
  | "projects"
  | "notes"
  | "about"
  | "brand"
  | "contact"
  | "changelog"
  | "admin";

/** Compact relative time for repo activity: "3d", "2w", "5mo", "1y+". */
function relativeShort(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const days = Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
  if (days < 1) return "today";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return "1y+";
}

/** Amber → dark gradient initials block used as the photo placeholder. */
export function InitialsAvatar() {
  return (
    <div
      className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F9B872] via-[#F9B872] to-[#7a5c14] shadow-lg shadow-primary/20 ring-1 ring-[#F9B872]/40 md:h-28 md:w-28"
      aria-hidden="true"
    >
      <span className="font-mono text-4xl font-bold tracking-tight text-[#161206] md:text-5xl">
        CK
      </span>
    </div>
  );
}

const clusterStyles: Record<ProjectCluster, string> = {
  "Enterprise Blockchain":
    "border-primary/40 bg-primary/10 text-primary",
  "AI & Analytics": "border-success/40 bg-success/10 text-success-fg",
  "Climate & Civic": "border-warn/40 bg-warn/10 text-warn",
  Infrastructure: "border-border bg-secondary/60 text-muted-foreground",
};

export function ClusterBadge({
  cluster,
  className,
}: {
  cluster: ProjectCluster;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-wide",
        clusterStyles[cluster],
        className
      )}
    >
      {cluster}
    </span>
  );
}

export function TagChip({ tag }: { tag: string }) {
  return (
    <span className="rounded-md border border-border bg-secondary/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
      {tag}
    </span>
  );
}

/**
 * Shimmer placeholder for the live GitHub chips while the repos API is in
 * flight - renders in exactly the slot the real chips will occupy, so the
 * card doesn't jump when data lands.
 */
export function RepoChipsSkeleton() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
      <span className="h-5 w-16 animate-pulse rounded-full border border-border/60 bg-secondary/40" />
      <span className="h-5 w-10 animate-pulse rounded-full border border-border/60 bg-secondary/40" />
    </span>
  );
}

/** Live GitHub stars chip - renders only when the repo responded (live=true). */
export function StarsChip({
  stars,
  className,
}: {
  stars: number | undefined;
  className?: string;
}) {
  if (stars === undefined) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground",
        className
      )}
    >
      <Star className="size-3 text-primary" aria-hidden="true" />
      {stars.toLocaleString()}
      <span className="sr-only">GitHub stars</span>
    </span>
  );
}

/**
 * Live repo meta chip - primary language + last push, rendered only when the
 * GitHub API responded. Answers the employer question "is this maintained?".
 */
export function RepoMetaChip({
  language,
  pushedAt,
  className,
}: {
  language?: string | null;
  pushedAt?: string | null;
  className?: string;
}) {
  const updated = relativeShort(pushedAt ?? null);
  if (!language && !updated) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground",
        className
      )}
    >
      {language ? <span className="text-foreground/80">{language}</span> : null}
      {language && updated ? <span aria-hidden="true" className="opacity-40">·</span> : null}
      {updated ? (
        <span className="inline-flex items-center gap-1" title="Last push to GitHub">
          <History className="size-3" aria-hidden="true" />
          {updated}
        </span>
      ) : null}
    </span>
  );
}

export function SectionHeading({
  title,
  subtitle,
  kicker,
}: {
  title: string;
  subtitle?: string;
  kicker?: string;
}) {
  return (
    <div className="space-y-1.5">
      {kicker ? (
        <p className="font-mono text-[11px] uppercase tracking-widest text-primary/80">
          {kicker}
        </p>
      ) : null}
      <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-[32px]">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}
