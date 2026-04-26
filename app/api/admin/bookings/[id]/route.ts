import { eq } from "drizzle-orm";
import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api/http";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { sendBookingUpdateEmail } from "@/lib/auth/email";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

const patchSchema = z.object({
  status: z
    .enum(["pending", "confirmed", "completed", "cancelled", "no_show"])
    .optional(),
  workerNotes: z.string().max(8000).optional(),
  inspectionResult: z.enum(["passed", "failed"]).optional().nullable(),
  inspectionNote: z.string().max(8000).optional().nullable(),
});

function statusLabelSr(s: string) {
  const m: Record<string, string> = {
    pending: "Na čekanju",
    confirmed: "Potvrđeno",
    completed: "Završeno",
    cancelled: "Otkazano",
    no_show: "Nije se pojavio",
  };
  return m[s] || s;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireStaffOrAdmin();
  if (auth.error) {
    return auth.error;
  }

  const { id } = await context.params;
  const body = await readJson(request);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Neispravan zahtev", parsed.error.flatten());
  }

  if (auth.user.role === "staff") {
    if (parsed.data.status && !["completed", "confirmed"].includes(parsed.data.status)) {
      return fail(403, "Radnik može menjati samo status u potvrđeno ili završeno.");
    }
  }

  const d = parsed.data;
  if (d.status === "completed") {
    if (!d.inspectionResult || !d.inspectionNote || !String(d.inspectionNote).trim()) {
      return fail(
        400,
        "Za završen termin unesite rezultat (položio / nije položio) i napomenu."
      );
    }
  }

  const db = getDb();
  const [existing] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1);

  if (!existing) {
    return fail(404, "Termin nije pronađen.");
  }

  const [userRow] = await db
    .select({ email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.id, existing.userId))
    .limit(1);

  const now = new Date();
  const nextStatus = d.status !== undefined ? d.status : existing.status;
  const nextInspectionResult =
    d.inspectionResult !== undefined ? d.inspectionResult : existing.inspectionResult;
  const nextInspectionNote = d.inspectionNote !== undefined ? d.inspectionNote : existing.inspectionNote;

  const [row] = await db
    .update(schema.bookings)
    .set({
      ...(d.status !== undefined ? { status: d.status } : {}),
      ...(d.workerNotes !== undefined ? { workerNotes: d.workerNotes } : {}),
      ...(nextStatus !== "completed"
        ? { inspectionResult: null, inspectionNote: null }
        : {
            inspectionResult: nextInspectionResult ?? null,
            inspectionNote: (nextInspectionNote != null
              ? String(nextInspectionNote).trim()
              : (existing.inspectionNote ?? null)) as string | null,
          }),
      updatedAt: now,
    })
    .where(eq(schema.bookings.id, id))
    .returning();

  if (!row) {
    return fail(500, "Ažuriranje nije uspelo.");
  }

  if (d.status && d.status !== existing.status) {
    await db.insert(schema.bookingStatusLog).values({
      bookingId: id,
      previousStatus: existing.status,
      nextStatus: d.status,
      changedByUserId: auth.user.id,
      note: "Ažurirano iz admin panela",
    });
  }

  const statusForEmail = row.status;
  const shouldNotifyClient = Boolean(
    userRow?.email &&
      (Boolean(d.status !== undefined && d.status !== existing.status) ||
        Boolean(d.workerNotes !== undefined && d.workerNotes !== existing.workerNotes) ||
        Boolean(
          d.inspectionNote !== undefined && d.inspectionNote !== existing.inspectionNote
        ) ||
        Boolean(
          d.inspectionResult !== undefined && d.inspectionResult !== existing.inspectionResult
        ))
  );

  if (shouldNotifyClient && userRow?.email) {
    try {
      const emailResult = await sendBookingUpdateEmail({
        to: userRow.email,
        startsAtIso: existing.startsAt.toISOString(),
        status: statusLabelSr(String(statusForEmail)),
        workerNotes: row.workerNotes,
        inspectionResult: row.inspectionResult,
        inspectionNote: row.inspectionNote,
      });
      if (!emailResult?.sent) {
        console.error(
          "[admin.bookings.patch] client email not sent",
          (emailResult as { reason?: string })?.reason
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  return ok({ ok: true, booking: row });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireStaffOrAdmin();
  if (auth.error) return auth.error;

  if (auth.user.role === "staff") {
    return fail(403, "Radnici ne mogu brisati termine.");
  }

  const { id } = await context.params;
  const db = getDb();

  const [existing] = await db
    .select({ id: schema.bookings.id })
    .from(schema.bookings)
    .where(eq(schema.bookings.id, id))
    .limit(1);

  if (!existing) return fail(404, "Termin nije pronađen.");

  // Brišemo status log pa booking (FK constraint)
  await db.delete(schema.bookingStatusLog).where(eq(schema.bookingStatusLog.bookingId, id));
  await db.delete(schema.bookings).where(eq(schema.bookings.id, id));

  return ok({ ok: true, deleted: id });
}
