"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCheck,
  Clock,
  Download,
  Eye,
  Inbox,
  Lock,
  LogOut,
  Mail,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./shared";

/* ---------------------------------- types --------------------------------- */

interface Lead {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  projectType: string;
  budgetRange: string | null;
  message: string;
  status: string;
  createdAt: string;
}

interface LeadStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  last7Days: number;
}

type StatusFilter = "all" | "new" | "read" | "replied";

const STORAGE_KEY = "kamama.admin.key";

const STATUS_STYLES: Record<string, string> = {
  new: "border-success/40 bg-success/10 text-success-fg",
  read: "border-border bg-secondary/60 text-muted-foreground",
  replied: "border-primary/40 bg-primary/10 text-primary",
};

const STATUS_DOT: Record<string, string> = {
  new: "bg-success",
  read: "bg-muted-foreground",
  replied: "bg-primary",
};

/* -------------------------------- helpers --------------------------------- */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function toCsv(leads: Lead[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ["Date", "Name", "Email", "Organization", "Project Type", "Budget", "Status", "Message"];
  const rows = leads.map((l) =>
    [
      new Date(l.createdAt).toISOString(),
      l.name,
      l.email,
      l.organization ?? "",
      l.projectType,
      l.budgetRange ?? "",
      l.status,
      l.message.replace(/\n/g, " "),
    ]
      .map(esc)
      .join(",")
  );
  return [header.map(esc).join(","), ...rows].join("\n");
}

/* --------------------------------- component ------------------------------- */

export function AdminView() {
  const { toast } = useToast();
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);
  const bootstrapped = useRef(false);

  /* ------- restore key from sessionStorage (survives tab switches) -------- */
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) setAdminKey(stored);
  }, []);

  const fetchLeads = useCallback(
    async (key: string) => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/leads", { headers: { "x-admin-key": key } });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          if (res.status === 401) {
            window.sessionStorage.removeItem(STORAGE_KEY);
            setAdminKey(null);
            setUnlockError("Key rejected - session cleared.");
          }
          return;
        }
        setLeads(data.leads as Lead[]);
        setStats(data.stats as LeadStats);
        setWarning((data.warning as string | undefined) ?? null);
      } catch {
        toast({ title: "Network error", description: "Could not reach the leads API.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (adminKey) void fetchLeads(adminKey);
  }, [adminKey, fetchLeads]);

  /* --------------------------------- actions ------------------------------- */

  const unlock = async () => {
    setUnlocking(true);
    setUnlockError(null);
    try {
      const res = await fetch("/api/admin/leads", {
        headers: { "x-admin-key": keyInput.trim() },
      });
      if (res.status === 401) {
        setUnlockError("Incorrect admin key. Try again.");
        return;
      }
      if (!res.ok) {
        setUnlockError("Admin inbox is not configured on this deployment.");
        return;
      }
      const trimmed = keyInput.trim();
      window.sessionStorage.setItem(STORAGE_KEY, trimmed);
      setAdminKey(trimmed);
      setKeyInput("");
      toast({ title: "Inbox unlocked", description: "Admin session active for this tab." });
    } catch {
      setUnlockError("Network error - is the server running?");
    } finally {
      setUnlocking(false);
    }
  };

  const lock = () => {
    window.sessionStorage.removeItem(STORAGE_KEY);
    setAdminKey(null);
    setLeads([]);
    setStats(null);
    toast({ title: "Inbox locked" });
  };

  const setStatus = async (lead: Lead, status: string) => {
    if (!adminKey) return;
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ id: lead.id, status }),
      });
      if (!res.ok) throw new Error();
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
      setSelected((prev) => (prev && prev.id === lead.id ? { ...prev, status } : prev));
      toast({ title: `Marked as ${status}` });
      void fetchLeads(adminKey); // refresh stats
    } catch {
      toast({ title: "Update failed", description: "Persistent storage may be unavailable.", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!adminKey || !pendingDelete) return;
    try {
      const res = await fetch(`/api/admin/leads?id=${encodeURIComponent(pendingDelete.id)}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
      if (!res.ok) throw new Error();
      setLeads((prev) => prev.filter((l) => l.id !== pendingDelete.id));
      setSelected(null);
      toast({ title: "Lead deleted" });
      void fetchLeads(adminKey);
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setPendingDelete(null);
    }
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(leads)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kamama-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported", description: `${leads.length} lead(s) downloaded.` });
  };

  /* --------------------------------- render -------------------------------- */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      const matchesSearch =
        q === "" ||
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.organization ?? "").toLowerCase().includes(q) ||
        l.message.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [leads, statusFilter, search]);

  if (!adminKey) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg"
        >
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
            <Lock className="size-6 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Lead Inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Private admin area. Enter the admin key to view contact-form submissions.
          </p>
          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void unlock();
            }}
          >
            <Input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Admin key"
              aria-label="Admin key"
              autoComplete="off"
              className="font-mono"
            />
            {unlockError ? (
              <p role="alert" className="text-left text-xs text-warn">
                {unlockError}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={unlocking || keyInput.trim().length === 0}>
              {unlocking ? "Checking…" : "Unlock inbox"}
            </Button>
          </form>
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            Key is checked server-side and kept in sessionStorage - it never leaves this browser tab.
          </p>
        </motion.div>
      </div>
    );
  }

  const statCards: { label: string; value: number; accent?: string }[] = [
    { label: "Total leads", value: stats?.total ?? 0 },
    { label: "New", value: stats?.new ?? 0, accent: "text-success-fg" },
    { label: "Replied", value: stats?.replied ?? 0, accent: "text-primary" },
    { label: "This week", value: stats?.last7Days ?? 0 },
  ];

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6 px-5 py-8 md:px-8 md:py-12">
      <section aria-label="Admin lead inbox" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            title="Lead Inbox"
            subtitle="Contact-form submissions - qualify, reply, and track status."
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchLeads(adminKey)}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={cn("size-3.5", loading && "animate-spin")} aria-hidden="true" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={leads.length === 0} className="gap-1.5">
              <Download className="size-3.5" aria-hidden="true" />
              CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={lock} className="gap-1.5 text-muted-foreground">
              <LogOut className="size-3.5" aria-hidden="true" />
              Lock
            </Button>
          </div>
        </div>

        {warning ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>{warning} Leads submitted on serverless are not persisted - check the deployment logs / email fallback.</p>
          </div>
        ) : null}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <p className={cn("font-mono text-2xl font-bold", s.accent ?? "text-foreground")}>{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + status filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads - name, email, org, message…"
              aria-label="Search leads"
              className="min-h-9 w-full rounded-full border border-border bg-card py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-primary/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div role="tablist" aria-label="Filter leads by status" className="flex flex-wrap gap-2">
          {(["all", "new", "read", "replied"] as StatusFilter[]).map((f) => {
            const isActive = statusFilter === f;
            const count = f === "all" ? leads.length : leads.filter((l) => l.status === f).length;
            return (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 font-mono text-xs capitalize transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  isActive
                    ? "border-primary bg-primary font-semibold text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {f}
                <span className="opacity-70">{count}</span>
              </button>
            );
          })}
          </div>
        </div>

        {/* Leads list */}
        <div className="max-h-[560px] space-y-2.5 overflow-y-auto pr-1 [scrollbar-width:thin]">
          <AnimatePresence initial={false}>
            {filtered.map((lead) => (
              <motion.button
                key={lead.id}
                layout
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelected(lead)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
                  lead.status === "new" && "border-l-2 border-l-success"
                )}
                aria-label={`Open lead from ${lead.name}`}
              >
                <span className={cn("size-2 shrink-0 rounded-full", STATUS_DOT[lead.status] ?? "bg-muted-foreground")} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="truncate text-sm font-semibold">{lead.name}</span>
                    {lead.organization ? (
                      <span className="truncate text-xs text-muted-foreground">· {lead.organization}</span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="font-mono">{lead.projectType}</span>
                    {lead.budgetRange ? <span className="font-mono">{lead.budgetRange}</span> : null}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" aria-hidden="true" />
                      {timeAgo(lead.createdAt)}
                    </span>
                  </span>
                </span>
                <span
                  className={cn(
                    "hidden shrink-0 items-center rounded-full border px-2 py-0.5 font-mono text-[10px] capitalize sm:inline-flex",
                    STATUS_STYLES[lead.status] ?? STATUS_STYLES.read
                  )}
                >
                  {lead.status}
                </span>
                <Eye className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </motion.button>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && !loading ? (
            <div className="grid-pattern flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
              <Inbox className="size-8 text-primary/60" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                {leads.length === 0
                  ? "No leads yet - the inbox fills up as people submit the contact form."
                  : search.trim()
                    ? "No leads match your search or filter."
                    : "No leads match this status filter."}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Lead detail dialog */}
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-left">
                  <span className={cn("size-2 rounded-full", STATUS_DOT[selected.status] ?? "bg-muted-foreground")} aria-hidden="true" />
                  {selected.name}
                </DialogTitle>
                <DialogDescription className="text-left">
                  {selected.organization ?? "Independent"} ·{" "}
                  {new Date(selected.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border bg-secondary/30 p-3">
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Email</dt>
                  <dd className="mt-0.5 truncate font-mono text-xs">{selected.email}</dd>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 p-3">
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Project</dt>
                  <dd className="mt-0.5 font-mono text-xs">{selected.projectType}</dd>
                </div>
                <div className="col-span-2 rounded-lg border border-border bg-secondary/30 p-3">
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Budget</dt>
                  <dd className="mt-0.5 font-mono text-xs">{selected.budgetRange ?? "Not specified"}</dd>
                </div>
              </dl>

              <div className="rounded-lg border border-border bg-background/60 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{selected.message}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" className="gap-1.5">
                  <a href={`mailto:${selected.email}?subject=Re:%20your%20Kamama%20Portfolio%20inquiry`}>
                    <Mail className="size-3.5" aria-hidden="true" />
                    Reply by email
                  </a>
                </Button>
                {selected.status !== "read" ? (
                  <Button variant="outline" size="sm" onClick={() => void setStatus(selected, "read")} className="gap-1.5">
                    <Eye className="size-3.5" aria-hidden="true" />
                    Mark read
                  </Button>
                ) : null}
                {selected.status !== "replied" ? (
                  <Button variant="outline" size="sm" onClick={() => void setStatus(selected, "replied")} className="gap-1.5">
                    <CheckCheck className="size-3.5" aria-hidden="true" />
                    Mark replied
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingDelete(selected)}
                  className="ml-auto gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? `"${pendingDelete.name}" will be permanently removed from the inbox.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void confirmDelete()}
              className="bg-destructive text-white hover:bg-destructive/85"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
