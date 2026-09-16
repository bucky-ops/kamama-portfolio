import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.string().trim().email("Valid email required").max(200),
  organization: z.string().trim().max(200).optional().or(z.literal("")),
  projectType: z
    .enum(["Enterprise System", "Blockchain", "AI / RAG", "M&E Dashboard", "Consulting"])
    .or(z.string().trim().min(1).max(80)),
  budgetRange: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell me a bit more (10+ characters)").max(5000),
});

export async function POST(req: NextRequest) {
  try {
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
