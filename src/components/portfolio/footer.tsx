"use client";

import { Github, Linkedin, Tag, Twitter } from "lucide-react";
import { profile } from "@/lib/profile-data";
import { useGithubData } from "./github-data";

export function Footer() {
  const { release } = useGithubData();

  const tag = release?.tag || "v1.0.0";
  const changelogUrl = "https://github.com/bucky-ops/kamama-portfolio/releases";

  const socials = [
    { href: profile.socials.github, label: `GitHub — ${profile.socials.githubHandle}`, Icon: Github },
    { href: profile.socials.linkedin, label: "LinkedIn — collins-kamama", Icon: Linkedin },
    { href: profile.socials.twitter, label: `Twitter — ${profile.socials.twitterHandle}`, Icon: Twitter },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-[#0D1117] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-muted-foreground sm:px-6 md:flex-row">
        {/* Zone 1 — copyright */}
        <p>
          © 2026 Collins Kamama · Kamama Consulting Solutions
        </p>

        {/* Zone 2 — release badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-1 font-mono text-[11px] text-foreground">
            <Tag className="size-3 text-primary" aria-hidden="true" />
            {tag}
          </span>
          <a
            href={changelogUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded px-1 underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Changelog
          </a>
        </div>

        {/* Zone 3 — stack + socials */}
        <div className="flex items-center gap-3">
          <p className="hidden sm:block">Built with Next.js 16 · Deployed on Vercel</p>
          <div className="flex items-center gap-1.5">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex size-9 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-colors hover:border-border hover:text-primary"
              >
                <Icon className="size-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
