"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { GithubDataProvider } from "@/components/portfolio/github-data";
import { Header } from "@/components/portfolio/header";
import { Footer } from "@/components/portfolio/footer";
import { HomeView } from "@/components/portfolio/home-view";
import { WorkView } from "@/components/portfolio/work-view";
import { AboutView } from "@/components/portfolio/about-view";
import { ContactView } from "@/components/portfolio/contact-view";
import { ChangelogView } from "@/components/portfolio/changelog-view";
import { NotesView } from "@/components/portfolio/notes-view";
import { AdminView } from "@/components/portfolio/admin-view";
import { CommandPalette } from "@/components/portfolio/command-palette";
import type { Project } from "@/lib/profile-data";
import type { TabId } from "@/components/portfolio/shared";

const VALID_TABS: TabId[] = [
  "home",
  "projects",
  "notes",
  "about",
  "contact",
  "changelog",
  "admin",
];

function readTabFromUrl(): TabId | null {
  if (typeof window === "undefined") return null;
  const tab = new URLSearchParams(window.location.search).get("tab");
  return VALID_TABS.includes(tab as TabId) ? (tab as TabId) : null;
}

export default function Page() {
  const [tab, setTab] = useState<TabId>("home");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [focusProjectTitle, setFocusProjectTitle] = useState<string | null>(null);

  // Deep-link support: /?tab=contact opens the Contact view.
  // Deferred one tick so the initial paint matches SSR (no cascading render).
  useEffect(() => {
    const fromUrl = readTabFromUrl();
    if (!fromUrl) return;
    const id = window.setTimeout(() => setTab(fromUrl), 0);
    return () => window.clearTimeout(id);
  }, []);

  const navigate = useCallback((next: TabId) => {
    setTab(next);
    if (typeof window !== "undefined") {
      const url = next === "home" ? "/" : `/?tab=${next}`;
      window.history.replaceState(null, "", url);
    }
  }, []);

  // Open a system case study: switch to Work and auto-open the dialog.
  const openProject = useCallback(
    (project: Project) => {
      setFocusProjectTitle(project.title);
      setTab("projects");
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "/?tab=projects");
      }
    },
    []
  );

  const consumeFocus = useCallback(() => setFocusProjectTitle(null), []);

  // Scroll to top on every tab switch.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [tab]);

  // Keyboard shortcuts: 1-5 switch tabs (nav order). Ignored while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      const order: TabId[] = ["home", "projects", "notes", "about", "contact"];
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < order.length) {
        setTab(order[idx]);
        const url = order[idx] === "home" ? "/" : `/?tab=${order[idx]}`;
        window.history.replaceState(null, "", url);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <GithubDataProvider>
        <div className="flex min-h-screen flex-col bg-[#0D1117] text-[#E6EDF3]">
          <a
            href="#main-content"
            className="skip-link rounded-full border border-primary/50 bg-[#161B22] px-4 py-2 text-xs font-medium text-primary shadow-lg focus-visible:outline-none"
          >
            Skip to content
          </a>
          <Header
            active={tab}
            onNavigate={navigate}
            onOpenPalette={() => setPaletteOpen(true)}
          />
          <main className="flex-1" id="main-content">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {tab === "home" && <HomeView onNavigate={navigate} />}
                {tab === "projects" && (
                  <WorkView
                    focusProjectTitle={focusProjectTitle}
                    onConsumeFocus={consumeFocus}
                    onDiscuss={(project) => {
                      void project;
                      navigate("contact");
                    }}
                  />
                )}
                {tab === "notes" && <NotesView />}
                {tab === "about" && <AboutView />}
                {tab === "contact" && <ContactView />}
                {tab === "changelog" && <ChangelogView />}
                {tab === "admin" && <AdminView />}
              </motion.div>
            </AnimatePresence>
          </main>
          <Footer onNavigate={navigate} />
          <CommandPalette
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            onNavigate={navigate}
            onSelectProject={openProject}
          />
        </div>
      </GithubDataProvider>
    </MotionConfig>
  );
}
