import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

/**
 * Admin leads inbox API — key-gated.
 * Auth: every request must carry `x-admin-key` matching the ADMIN_KEY env var.
 * The key lives server-side only (Vercel env + local .env.local); never shipped to the client bundle.
 */

export const ADMIN_KEY_HEADER = "x-admin-key";

const ALLOWED_STATUSES = ["new", "read", "replied"] as const;

function isAuthorized(req: NextRequest): boolean {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return false; // admin inbox not configured on this deployment
  const provided = req.headers.get(ADMIN_KEY_HEADER);
  return typeof provided === "string" && provided.length > 0 && provided === adminKey;
}

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized — valid admin key required." },
    { status: 401 }
  );
}

/** GET /api/admin/leads → leads + aggregate stats */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const [leads, total, countNew, countRead, countReplied] = await Promise.all([
      db.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
      db.contactMessage.count(),
      db.contactMessage.count({ where: { status: "new" } }),
      db.contactMessage.count({ where: { status: "read" } }),
      db.contactMessage.count({ where: { status: "replied" } }),
    ]);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last7Days = await db.contactMessage.count({
      where: { createdAt: { gte: weekAgo } },
    });

    return NextResponse.json({
      ok: true,
      leads,
      stats: { total, new: countNew, read: countRead, replied: countReplied, last7Days },
    });
  } catch (error) {
    // Serverless / no-DB fallback: inbox is empty but the API stays honest
    console.error("[admin/leads] DB unavailable:", error);
    return NextResponse.json({
      ok: true,
      leads: [],
      stats: { total: 0, new: 0, read: 0, replied: 0, last7Days: 0 },
      warning: "Persistent storage unavailable on this deployment.",
    });
  }
}

const patchSchema = z.object({
  id: z.string().min(1).max(64),
  status: z.enum(ALLOWED_STATUSES),
});

/** PATCH /api/admin/leads → update a lead's status (new | read | replied) */
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload — id + status required." },
        { status: 400 }
      );
    }

    const updated = await db.contactMessage.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json({ ok: true, lead: updated });
  } catch (error) {
    console.error("[admin/leads] PATCH failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not update lead — is persistent storage available?" },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/leads?id=... → remove a lead */
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "id query param required." }, { status: 400 });
  }

  try {
    await db.contactMessage.delete({ where: { id } });
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("[admin/leads] DELETE failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not delete lead." },
      { status: 500 }
    );
  }
}
