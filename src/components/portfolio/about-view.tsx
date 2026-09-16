"use client";

import {
  Award,
  GraduationCap,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  certifications,
  education,
  interests,
  testimonials,
  timeline,
} from "@/lib/profile-data";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

function CertChip({ status }: { status: string }) {
  const complete = status === "Complete";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium",
        complete
          ? "border-[#3FB950]/40 bg-[#3FB950]/10 text-[#3FB950]"
          : "border-primary/40 bg-primary/10 text-primary"
      )}
    >
      {status}
    </span>
  );
}

function AboutCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Award;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border-border bg-[#161B22]">
      <CardContent className="space-y-3 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          {title}
        </h3>
        {children}
      </CardContent>
    </Card>
  );
}

export function AboutView() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-12">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Career timeline ──────────────────────────────────────── */}
        <Reveal className="lg:col-span-3">
        <section
          aria-label="Career timeline"
          className="h-full"
        >
          <Card className="h-full rounded-2xl border-border bg-[#161B22]">
            <CardContent className="p-6 md:p-8">
              <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground md:text-2xl">
                Career Timeline
              </h2>
              <ol className="ml-1 space-y-2 border-l border-[#30363D] pl-6">
                {timeline.map((entry) => (
                  <li
                    key={`${entry.period}-${entry.org}`}
                    className="group relative -mx-3 rounded-xl border border-transparent px-3 py-3 transition-all duration-200 hover:border-primary/25 hover:bg-secondary/30"
                  >
                    <span
                      className="absolute -left-[39px] top-[19px] size-2.5 rounded-full bg-primary ring-4 ring-primary/15 transition-all duration-200 group-hover:scale-125 group-hover:ring-primary/30"
                      aria-hidden="true"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-primary">
                        {entry.period}
                      </span>
                      <span className="rounded-full border border-border bg-secondary/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {entry.tag}
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-semibold text-foreground">
                      {entry.org}
                    </h3>
                    <p className="text-sm text-muted-foreground">{entry.role}</p>
                    <ul className="mt-2.5 space-y-1.5">
                      {entry.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                        >
                          <span
                            className="mt-[7px] size-1 shrink-0 rounded-full bg-primary/70"
                            aria-hidden="true"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>
        </Reveal>

        {/* ── Stacked side cards ───────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Education */}
          <Reveal>
          <section aria-label="Education">
            <AboutCard title="Education" icon={GraduationCap}>
              <div className="space-y-4">
                {education.map((ed) => (
                  <div key={ed.degree}>
                    <p className="text-sm font-semibold text-foreground">
                      {ed.school}
                    </p>
                    <p className="text-sm text-muted-foreground">{ed.degree}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {ed.detail}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/80">
                      {ed.note}
                    </p>
                  </div>
                ))}
              </div>
            </AboutCard>
          </section>
          </Reveal>

          {/* Certifications */}
          <Reveal delay={0.06}>
          <section aria-label="Certifications">
            <AboutCard title="Certifications" icon={Award}>
              <div className="max-h-72 space-y-3 overflow-y-auto pr-2">
                {certifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm leading-snug text-foreground">
                        {cert.name}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {cert.year}
                      </p>
                    </div>
                    <CertChip status={cert.status} />
                  </div>
                ))}
              </div>
            </AboutCard>
          </section>
          </Reveal>

          {/* Interests */}
          <Reveal delay={0.12}>
          <section aria-label="Interests">
            <AboutCard title="Interests" icon={Sparkles}>
              <div className="flex flex-wrap gap-1.5">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-md border border-border bg-secondary/40 px-2.5 py-1 font-mono text-xs text-muted-foreground"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </AboutCard>
          </section>
          </Reveal>

          {/* Testimonials */}
          <Reveal delay={0.18}>
          <section aria-label="References and recommendations">
            <AboutCard
              title="References & Recommendations"
              icon={Quote}
            >
              <div className="space-y-4">
                {testimonials.map((t) => (
                  <figure
                    key={t.name}
                    className="group rounded-xl border border-border/70 bg-secondary/30 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-secondary/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Quote
                        className="size-4 shrink-0 text-primary/70 transition-colors group-hover:text-primary"
                        aria-hidden="true"
                      />
                      <span
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#3FB950]/30 bg-[#3FB950]/10 px-2 py-0.5 font-mono text-[10px] text-[#3FB950]"
                        title="Professional reference held on file"
                      >
                        <ShieldCheck className="size-3" aria-hidden="true" />
                        On file
                      </span>
                    </div>
                    <blockquote className="mt-2.5 text-sm italic leading-relaxed text-muted-foreground">
                      “{t.quote}”
                    </blockquote>
                    <figcaption className="mt-4 flex items-center gap-3 border-t border-border/60 pt-3">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F0B232] via-[#E3B341] to-[#7a5c14] font-mono text-xs font-bold text-[#161206] ring-1 ring-[#F0B232]/40"
                        aria-hidden="true"
                      >
                        {t.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">{t.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{t.title}</p>
                      </div>
                    </figcaption>
                    <p className="mt-2 truncate font-mono text-[11px] text-primary" title={`Reference: ${t.proof}`}>
                      {t.proof}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground/70">{t.work}</p>
                  </figure>
                ))}
                <p className="text-[11px] italic text-muted-foreground/70">
                  Quotes abridged from written professional references — original letters &amp; LinkedIn recommendations available on request.
                </p>
              </div>
            </AboutCard>
          </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
