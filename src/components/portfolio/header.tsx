"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { nav, profile } from "@/lib/profile-data";
import { cn } from "@/lib/utils";
import type { TabId } from "./shared";

interface HeaderProps {
  active: TabId;
  onNavigate: (tab: TabId) => void;
}

export function Header({ active, onNavigate }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Elevation shadow once the page scrolls — gives the glass bar depth.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (tab: TabId) => {
    setOpen(false);
    onNavigate(tab);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-[#0D1117]/80 backdrop-blur-md transition-shadow duration-300",
        scrolled && "shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Logo */}
        <button
          type="button"
          onClick={() => go("home")}
          className="group flex min-h-11 items-center gap-2.5 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          aria-label="Kamama Portfolio — go to Home"
        >
          <span className="flex items-baseline">
            <span className="font-mono text-sm font-bold tracking-[0.25em] text-foreground">
              {profile.logo}
            </span>
            <span className="ml-1 inline-block size-1.5 rounded-full bg-primary" />
          </span>
          <span className="hidden text-xs text-muted-foreground sm:block">
            Kamama Consulting Solutions
          </span>
        </button>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center md:flex">
          {nav.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative min-h-11 px-3.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60 lg:px-4",
                  isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {isActive ? (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary lg:inset-x-4"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => go("contact")}
            className="hidden min-h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground hover:bg-[#F0B232] md:inline-flex"
          >
            Hire Me
          </Button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-11 border-border bg-transparent md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 border-l border-border bg-[#161B22]"
            >
              <SheetHeader>
                <SheetTitle className="flex items-baseline font-mono text-sm font-bold tracking-[0.25em]">
                  {profile.logo}
                  <span className="ml-1 inline-block size-1.5 rounded-full bg-primary" />
                </SheetTitle>
                <p className="text-xs text-muted-foreground">
                  Kamama Consulting Solutions
                </p>
              </SheetHeader>
              <nav
                aria-label="Mobile"
                className="flex flex-col gap-1 px-4"
              >
                {nav.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.id)}
                    className={cn(
                      "flex min-h-11 items-center rounded-lg px-3 text-left text-sm transition-colors",
                      active === item.id
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-auto p-4">
                <Button
                  type="button"
                  onClick={() => go("contact")}
                  className="min-h-11 w-full rounded-full bg-primary font-semibold text-primary-foreground hover:bg-[#F0B232]"
                >
                  Hire Me
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
