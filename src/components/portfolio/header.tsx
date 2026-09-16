"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Github, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nav, profile } from "@/lib/profile-data";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import type { TabId } from "./shared";

interface HeaderProps {
  active: TabId;
  onNavigate: (tab: TabId) => void;
  onOpenPalette?: () => void;
}

/* Brand wordmarks - light version on the dark header (primary), dark version
   on light. Swapped via CSS (`dark:` variants) instead of useTheme(): the html
   class is applied pre-paint by next-themes' blocking script, so fresh loads
   with a stored light theme get the correct mark with zero flash and no
   hydration timing dependency. */
const LOGO_LIGHT = "/brand/kamama-wordmark-light-horizontal.png";
const LOGO_DARK = "/brand/kamama-logo-dark-horizontal.png";

export function Header({ active, onNavigate, onOpenPalette }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  // Elevation shadow once the page scrolls - gives the glass bar depth.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (tab: TabId) => onNavigate(tab);

  const navPill = (item: (typeof nav)[number], extra?: string) => {
    const isActive = active === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => go(item.id)}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
          extra,
          isActive
            ? "bg-foreground font-semibold text-background shadow-sm"
            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        )}
      >
        {item.label}
      </button>
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl transition-shadow duration-300",
        scrolled &&
          "shadow-[0_8px_24px_rgba(31,35,40,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-3 px-5 md:px-8">
        {/* Brand: real KAMAMA wordmark + systems tagline pill */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => go("home")}
            className="flex min-h-11 shrink-0 items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            aria-label="Kamama Portfolio - go to Home"
          >
            <Image
              src={LOGO_LIGHT}
              alt="KAMAMA logo"
              width={1059}
              height={128}
              priority
              className="hidden h-6 w-auto shrink-0 md:h-8 dark:block"
            />
            <Image
              src={LOGO_DARK}
              alt="KAMAMA logo"
              width={384}
              height={128}
              priority
              className="block h-6 w-auto shrink-0 md:h-8 dark:hidden"
            />
          </button>
          <span className="hidden whitespace-nowrap rounded-full border border-border px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-muted-foreground xl:inline">
            SYSTEMS • BLOCKCHAIN • AI
          </span>
        </div>

        {/* Desktop pill nav - xl+ only: 6 pills + brand only fit at the full
            1280px grid; smaller widths use the scrollable strip below */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 rounded-full border border-border bg-card p-1 xl:flex"
        >
          {nav.map((item) => navPill(item))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <a
            href={profile.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub - bucky-ops"
            className="hidden size-9 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-secondary sm:grid"
          >
            <Github className="size-4" aria-hidden="true" />
          </a>

          {/* Command palette trigger - compact icon (palette itself is ⌘K) */}
          {onOpenPalette ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onOpenPalette}
              aria-label="Open command palette (Control+K)"
              title="Search (Control+K)"
              className="size-9 shrink-0 rounded-full border-border bg-transparent"
            >
              <Search className="size-4" aria-hidden="true" />
            </Button>
          ) : null}

          <ThemeToggle />

          <Button
            type="button"
            onClick={() => go("contact")}
            className="hidden h-9 rounded-full bg-primary px-4 text-[13px] font-bold text-primary-foreground hover:bg-primary/90 sm:inline-flex"
          >
            Hire Me
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Scrollable pill tab strip - md to xl (desktop nav takes over at 1280+) */}
      <nav
        aria-label="Mobile"
        className="flex gap-2 overflow-x-auto border-t border-border bg-background px-3 py-2 xl:hidden"
      >
        {nav.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "h-9 whitespace-nowrap rounded-full border px-4 text-[13px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                isActive
                  ? "border-foreground bg-foreground font-semibold text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
