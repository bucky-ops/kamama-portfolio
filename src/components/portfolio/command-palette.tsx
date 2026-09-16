"use client";

import { useCallback, useEffect } from "react";
import {
  ArrowRight,
  Copy,
  Download,
  FileText,
  Github,
  Home,
  Layers,
  Linkedin,
  Lock,
  Mail,
  MessageSquare,
  Moon,
  NotebookPen,
  Sun,
  User,
  Wrench,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { profile, projects } from "@/lib/profile-data";
import { notes } from "@/lib/notes-data";
import type { Project } from "@/lib/profile-data";
import type { TabId } from "./shared";

const NAV_ITEMS: { tab: TabId; label: string; icon: typeof Home; shortcut: string }[] = [
  { tab: "home", label: "Home", icon: Home, shortcut: "1" },
  { tab: "projects", label: "Work — systems & solutions", icon: Layers, shortcut: "2" },
  { tab: "notes", label: "Notes — engineering blog", icon: NotebookPen, shortcut: "3" },
  { tab: "about", label: "About — timeline & references", icon: User, shortcut: "4" },
  { tab: "contact", label: "Contact — start a project", icon: Mail, shortcut: "5" },
  { tab: "changelog", label: "Changelog — release history", icon: FileText, shortcut: "" },
  { tab: "admin", label: "Admin — lead inbox", icon: Lock, shortcut: "" },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (tab: TabId) => void;
  onSelectProject: (project: Project) => void;
}

/**
 * ⌘K / Ctrl+K command palette: jump to any view, open a system case study,
 * open a note, or run quick actions (copy email, resume, mailto, socials).
 */
export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
  onSelectProject,
}: CommandPaletteProps) {
  const { toast } = useToast();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  // Global shortcut — toggle with ⌘K / Ctrl+K.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const run = useCallback(
    (action: () => void) => {
      onOpenChange(false);
      // Defer so the palette closes before the view switches (smoother hand-off).
      window.setTimeout(action, 0);
    },
    [onOpenChange]
  );

  const copyEmail = useCallback(() => {
    run(async () => {
      try {
        await navigator.clipboard.writeText(profile.emails.founder);
        toast({ description: `Copied ${profile.emails.founder} to clipboard` });
      } catch {
        toast({ description: "Clipboard unavailable — email is on the Contact view" });
      }
    });
  }, [run, toast]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Search views, systems, notes and quick actions"
      className="rounded-2xl border-border bg-popover [&_[cmdk-group-heading]]:text-primary/70 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_svg]:text-primary/70"
    >
      <CommandInput placeholder="Search views, systems, notes, actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map(({ tab, label, icon: Icon, shortcut }) => (
            <CommandItem
              key={tab}
              value={`${label} ${tab}`}
              onSelect={() => run(() => onNavigate(tab))}
              className="gap-2.5 rounded-lg data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
              {shortcut ? (
                <CommandShortcut className="font-mono">{shortcut}</CommandShortcut>
              ) : null}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Open a system case study">
          {projects.map((project) => (
            <CommandItem
              key={project.title}
              value={`${project.title} ${project.cluster} ${project.stack.join(" ")}`}
              onSelect={() => run(() => onSelectProject(project))}
              className="gap-2.5 rounded-lg data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
            >
              <Wrench className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 truncate">{project.title}</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                {project.cluster}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Notes">
          {notes.map((note) => (
            <CommandItem
              key={note.slug}
              value={`${note.title} ${note.tags.join(" ")}`}
              onSelect={() => run(() => onNavigate("notes"))}
              className="gap-2.5 rounded-lg data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
            >
              <NotebookPen className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 truncate">{note.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick actions">
          <CommandItem
            value="theme light dark appearance mode toggle"
            onSelect={() =>
              run(() => setTheme(isDark ? "light" : "dark"))
            }
            className="gap-2.5 rounded-lg data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
          >
            {isDark ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
            Switch to {isDark ? "light" : "dark"} theme
          </CommandItem>
          <CommandItem
            value="copy founder email collins"
            onSelect={copyEmail}
            className="gap-2.5 rounded-lg data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
          >
            <Copy className="size-4" aria-hidden="true" />
            Copy founder email
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">
              {profile.emails.founder}
            </span>
          </CommandItem>
          <CommandItem
            value="email collins founder mailto"
            onSelect={() =>
              run(() => {
                window.location.href = `mailto:${profile.emails.founder}`;
              })
            }
            className="gap-2.5 rounded-lg data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
          >
            <MessageSquare className="size-4" aria-hidden="true" />
            Email Collins
            <ArrowRight className="ml-auto size-3.5 opacity-60" aria-hidden="true" />
          </CommandItem>
          <CommandItem
            value="download resume cv pdf"
            onSelect={() =>
              run(() => {
                window.open(
                  "/resume/Collins_Kamama_Master_Resume_2026_Updated.pdf",
                  "_blank",
                  "noreferrer"
                );
              })
            }
            className="gap-2.5 rounded-lg data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
          >
            <Download className="size-4" aria-hidden="true" />
            Download resume (PDF)
          </CommandItem>
          <CommandItem
            value="github profile bucky-ops repos"
            onSelect={() =>
              run(() => {
                window.open(profile.socials.github, "_blank", "noreferrer");
              })
            }
            className="gap-2.5 rounded-lg data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
          >
            <Github className="size-4" aria-hidden="true" />
            GitHub profile — {profile.socials.githubHandle}
          </CommandItem>
          <CommandItem
            value="linkedin profile collins kamama"
            onSelect={() =>
              run(() => {
                window.open(profile.socials.linkedin, "_blank", "noreferrer");
              })
            }
            className="gap-2.5 rounded-lg data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
          >
            <Linkedin className="size-4" aria-hidden="true" />
            LinkedIn — {profile.socials.linkedinHandle}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
