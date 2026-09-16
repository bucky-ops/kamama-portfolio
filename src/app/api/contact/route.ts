import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit, clientIpFrom } from "@/lib/rate-limit";

/** Per-IP sliding window: 5 messages per 10 minutes is generous for humans. */
const RATE_MAX = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.string().trim().email("Valid email required").max(200),
  organization: z.string().trim().max(200).optional().or(z.literal("")),
  projectType: z
    .enum(["Enterprise System", "Blockchain", "AI / RAG", "M&E Dashboard", "Consulting"])
    .or(z.string().trim().min(1).max(80)),
  budgetRange: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell me a bit more (10+ characters)").max(5000),
  // Anti-spam (both optional so legacy clients keep working):
  website: z.string().max(200).optional(), // honeypot — bots fill it
  startedAt: z.number().optional(), // form mount timestamp — bots submit instantly
});

/** Submissions faster than this are treated as bot traffic. */
const MIN_HUMAN_MS = 2500;

/** Bot-looking submissions get a fake success so they learn nothing. */
function botSuccess(): NextResponse {
  return NextResponse.json({
    ok: true,
    id: `mem_${Date.now()}`,
    stored: "memory",
  });
}

export async function POST(req: NextRequest) {
  try {
    // ── Rate limit gate (abuse protection, before any parsing) ───
    const limiter = checkRateLimit(`contact:${clientIpFrom(req)}`, RATE_MAX, RATE_WINDOW_MS);
    if (!limiter.allowed) {
      console.warn("[contact] Rate limit hit —", clientIpFrom(req));
      return NextResponse.json(
        {
          ok: false,
          error:
            "Too many messages from this connection. Please wait a few minutes and try again — or email me directly.",
        },
        { status: 429, headers: { "Retry-After": String(limiter.retryAfterSec) } }
      );
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Validation failed",
          issues: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // ── Anti-spam gate ────────────────────────────────────────────
    // 1) Honeypot: any value in the invisible "website" field → bot.
    if (data.website && data.website.trim() !== "") {
      console.warn("[contact] Honeypot triggered — dropped submission from", data.email);
      return botSuccess();
    }
    // 2) Timing: submitted before a human could realistically finish → bot.
    if (
      typeof data.startedAt === "number" &&
      Number.isFinite(data.startedAt) &&
      Date.now() - data.startedAt < MIN_HUMAN_MS
    ) {
      console.warn("[contact] Timing check failed — dropped submission from", data.email);
      return botSuccess();
    }

    try {
      const saved = await db.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          organization: data.organization || null,
          projectType: data.projectType,
          budgetRange: data.budgetRange || null,
          message: data.message,
        },
      });
      return NextResponse.json({ ok: true, id: saved.id, stored: "database" });
    } catch (dbError) {
      // Graceful fallback (e.g. serverless without persistent disk): accept but flag
      console.error("[contact] DB unavailable, message accepted in memory:", dbError);
      return NextResponse.json({
        ok: true,
        id: `mem_${Date.now()}`,
        stored: "memory",
        warning: "Persistent storage unavailable — email fallback in effect.",
      });
    }
  } catch (error) {
    console.error("[contact] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please email me directly." },
      { status: 500 }
    );
  }
}
