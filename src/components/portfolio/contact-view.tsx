"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Github,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  Shield,
  Sparkles,
  Twitter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { availability, budgetRanges, profile, projectTypes, projects } from "@/lib/profile-data";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  email: z.email("Valid email required").max(200),
  organization: z.string().max(200),
  projectType: z.string().min(1, "Select a project type").max(80),
  budgetRange: z.string().max(80),
  message: z.string().min(10, "Tell me a bit more (10+ characters)").max(5000),
  // Honeypot — humans never see or fill this field.
  website: z.string().max(200),
});

type ContactValues = z.infer<typeof contactSchema>;
type SubmitStatus = "idle" | "sending" | "success" | "error";

/**
 * Builds a vCard 3.0 string so prospects can save Collins to their address
 * book with one tap. Pure client-side — no dependencies, no network call.
 */
function buildVCard(): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:Kamama;Muchiri Collins;;;`,
    `FN:${profile.name}`,
    `ORG:Kamama Consulting Solutions`,
    `TITLE:${profile.role}`,
    `EMAIL;TYPE=WORK,INTERNET,PRIMARY:${profile.emails.founder}`,
    `EMAIL;TYPE=HOME,INTERNET:${profile.emails.personal}`,
    `EMAIL;TYPE=HOME,INTERNET:${profile.emails.secure}`,
    `TEL;TYPE=CELL:${profile.phone.replace(/\s/g, "")}`,
    `URL:https://kamama-portfolio.vercel.app`,
    `ADR;TYPE=WORK:;;Nairobi;;;Kenya;`,
    `NOTE:Production-grade blockchain, AI & data platforms. Open for remote ICA contracts.`,
    "END:VCARD",
  ];
  return lines.join("\r\n");
}

function downloadVCard() {
  const blob = new Blob([buildVCard()], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Collins-Kamama.vcf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Live Nairobi local time chip. Renders nothing until mounted (the SSR
 * markup has no time at all), so there is no hydration mismatch and no
 * placeholder flash; updates every 30s. Fixed min-width keeps the layout
 * steady as digits change.
 */
function NairobiClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Nairobi",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (time === null) return null;

  return (
    <span
      className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.07] px-2.5 py-1 font-mono text-xs tabular-nums text-primary"
      role="timer"
      aria-label={`Current local time in Nairobi: ${time} East Africa Time`}
    >
      <Clock className="size-3.5" aria-hidden="true" />
      <span className="min-w-[3.2rem] text-left">{time}</span>
      <span className="text-[10px] text-muted-foreground">EAT</span>
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={copy}
      aria-label={copied ? "Copied to clipboard" : `Copy ${value} to clipboard`}
      className="size-9 shrink-0 text-muted-foreground hover:text-primary"
    >
      {copied ? (
        <Check className="size-4 text-success" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}

/** Cluster → contact-form "project type" mapping for the prefill funnel. */
const CLUSTER_TO_TYPE: Record<string, string> = {
  "Enterprise Blockchain": "Blockchain",
  "AI & Analytics": "AI / RAG",
  "Climate & Civic": "M&E Dashboard",
  "Infrastructure": "Enterprise System",
  "Web & Creative": "Consulting",
};

function projectTypeForCluster(cluster?: string): string {
  return (cluster && CLUSTER_TO_TYPE[cluster]) || "Enterprise System";
}

function prefillMessage(title: string): string {
  return `Hi Collins — I'd like to discuss your work on "${title}". We have a similar challenge and would like to scope a solution.`;
}

export function ContactView() {
  const { toast } = useToast();
  const [status, setStatus] = useState<SubmitStatus>("idle");
  /** Server-provided error detail (e.g. rate-limit copy) shown in the error panel. */
  const [errorHint, setErrorHint] = useState<string | null>(null);
  // Anti-spam: form mount timestamp — submissions faster than human speed are dropped server-side.
  const startedAtRef = useRef<number>(Date.now());

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      organization: "",
      projectType: "",
      budgetRange: "",
      message: "",
      website: "",
    },
  });

  // ── Prefill funnel: /?tab=contact&topic=<system title> ─────────
  // Set by the "Discuss this system" CTA in case-study dialogs — seeds the
  // message + project type so the visitor starts from context, not a blank form.
  const [topic, setTopic] = useState<string | null>(null);
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("topic");
    const title = raw?.trim().slice(0, 120);
    if (!title) return;
    const id = window.setTimeout(() => {
      setTopic(title);
      const project = projects.find((p) => p.title === title);
      form.setValue("projectType", projectTypeForCluster(project?.cluster), {
        shouldValidate: false,
      });
      form.setValue("message", prefillMessage(title), { shouldValidate: false });
    }, 0);
    return () => window.clearTimeout(id);
  }, [form]);

  /** Drop the prefill: clear chip + URL param + revert the seeded fields. */
  const clearTopic = () => {
    setTopic(null);
    form.setValue("message", "");
    form.setValue("projectType", "");
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/?tab=contact");
    }
  };

  const onSubmit = async (values: ContactValues) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          organization: values.organization.trim(),
          projectType: values.projectType,
          budgetRange: values.budgetRange.trim(),
          message: values.message.trim(),
          website: values.website, // honeypot
          startedAt: startedAtRef.current, // timing check
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (res.ok && json?.ok) {
        setStatus("success");
        setErrorHint(null);
        form.reset();
        // Funnel complete — drop the topic param so a refresh starts clean.
        setTopic(null);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", "/?tab=contact");
        }
        toast({
          title: "Message sent",
          description: "Thanks — expect a scoped reply within 24 hours.",
        });
      } else {
        setErrorHint(
          typeof json?.error === "string" && json.error ? json.error : null
        );
        setStatus("error");
      }
    } catch {
      setErrorHint(null);
      setStatus("error");
    }
  };

  const socials = [
    { href: profile.socials.github, label: `GitHub — ${profile.socials.githubHandle}`, Icon: Github },
    { href: profile.socials.twitter, label: `Twitter — ${profile.socials.twitterHandle}`, Icon: Twitter },
    { href: profile.socials.linkedin, label: "LinkedIn — collins-kamama", Icon: Linkedin },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-12">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Left: conversation form ──────────────────────────────── */}
        <Reveal>
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Start a conversation
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell me about the system you need — I reply with architecture, not
              a sales pitch.
            </p>

            {topic ? (
              <div
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2.5"
                role="status"
              >
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-foreground/90">
                  Pre-filled from{" "}
                  <span className="font-semibold text-primary">{topic}</span> —
                  tweak the message below as you like.
                </p>
                <button
                  type="button"
                  onClick={clearTopic}
                  aria-label="Clear pre-filled message"
                  className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : null}

            {status === "success" ? (
              <div className="mt-6 rounded-xl border border-success/40 bg-success/10 p-5 text-center">
                <CheckCircle2
                  className="mx-auto size-10 text-success"
                  aria-hidden="true"
                />
                <p className="mt-3 font-semibold text-foreground">
                  Message received — thank you.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  I read every message personally and reply within 24 hours.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStatus("idle")}
                  className="mt-4 min-h-11 rounded-full border-border bg-transparent hover:border-primary/40"
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-6 space-y-5"
                  noValidate
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Jane Wanjiru"
                              autoComplete="name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="jane@org.org"
                              autoComplete="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="UNDP Kenya"
                              autoComplete="organization"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Type *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select project type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="border-border bg-card">
                              {projectTypes.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="budgetRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Range</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select budget range (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-border bg-card">
                            {budgetRanges.map((b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What are you building, who is it for, and what does success look like?"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Honeypot — visually hidden, ignored by humans, catnip for bots */}
                  <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
                    <label htmlFor="contact-website">Website</label>
                    <input
                      id="contact-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      placeholder="Leave this field empty"
                      {...form.register("website")}
                    />
                  </div>

                  {status === "error" ? (
                    <div
                      role="alert"
                      className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm"
                    >
                      <p className="font-medium text-destructive">
                        Something went wrong sending your message.
                      </p>
                      {errorHint ? (
                        <p className="mt-1 text-muted-foreground">{errorHint}</p>
                      ) : null}
                      <p className="mt-1 text-muted-foreground">
                        Please email me directly at{" "}
                        <a
                          href={`mailto:${profile.emails.founder}`}
                          className="font-medium text-primary underline underline-offset-4"
                        >
                          {profile.emails.founder}
                        </a>
                      </p>
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={status === "sending"}
                    className="min-h-11 w-full rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto sm:px-8"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="size-4" aria-hidden="true" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-xs italic text-muted-foreground/80">
                    Your project type &amp; budget help me reply with a scoped
                    answer — not a template.
                  </p>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
        </Reveal>

        {/* ── Right: contact details ───────────────────────────────── */}
        <div className="space-y-6">
          <Reveal delay={0.08}>
          <Card className="rounded-2xl border-border bg-card">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Direct lines
              </h2>

              {/* Founder email FIRST — client requirement */}
              <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/40 bg-primary/10 p-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Mail className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <a
                    href={`mailto:${profile.emails.founder}`}
                    className="truncate text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {profile.emails.founder}
                  </a>
                  <span className="hidden shrink-0 rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-bold text-primary-foreground sm:inline">
                    Founder
                  </span>
                </div>
                <CopyButton value={profile.emails.founder} />
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Mail className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <a
                    href={`mailto:${profile.emails.personal}`}
                    className="truncate text-sm text-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    {profile.emails.personal}
                  </a>
                </div>
                <CopyButton value={profile.emails.personal} />
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Shield className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <a
                    href={`mailto:${profile.emails.secure}`}
                    className="truncate text-sm text-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    {profile.emails.secure}
                  </a>
                </div>
                <CopyButton value={profile.emails.secure} />
              </div>

              <Separator className="bg-border" />

              <div className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <a
                  href={`tel:${profile.phone.replace(/\s/g, "")}`}
                  className="text-sm text-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {profile.phone}
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-sm text-foreground">{profile.location}</p>
                  <p className="text-xs text-muted-foreground">
                    Remote ICA contracts globally · Hybrid · 1–4× travel/yr
                  </p>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Social row */}
              <div className="flex flex-wrap items-center gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span className="font-mono">
                      {label.split(" — ")[1]}
                    </span>
                  </a>
                ))}
              </div>

              <Separator className="bg-border" />

              {/* Save contact — one-tap vCard download */}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  downloadVCard();
                  toast({
                    title: "Contact card downloaded",
                    description:
                      "Collins-Kamama.vcf — open it to add all direct lines to your address book.",
                  });
                }}
                className="min-h-11 w-full rounded-full border-border bg-transparent hover:border-primary/40 hover:bg-secondary/50"
              >
                <Download className="size-4 text-primary" aria-hidden="true" />
                Save contact card (.vcf)
              </Button>
            </CardContent>
          </Card>
          </Reveal>

          {/* Availability */}
          <Reveal delay={0.14}>
          <Card className="rounded-2xl border-border bg-card">
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="relative flex size-2.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-success" />
                </span>
                Availability
              </h2>
              <ul className="space-y-2">
                {availability.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span
                      className="mt-[7px] size-1 shrink-0 rounded-full bg-success"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          </Reveal>

          {/* Map placeholder */}
          <Reveal delay={0.2}>
          <div
            className={cn(
              "grid-pattern flex items-center gap-3 rounded-2xl border border-dashed border-border p-6"
            )}
          >
            <MapPin className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm text-foreground">
                Nairobi, Kenya — UTC+3 · EAT
              </p>
              <p className="text-xs text-muted-foreground">
                Working across UN, NGO, government &amp; enterprise timezones
              </p>
            </div>
            <NairobiClock />
          </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
