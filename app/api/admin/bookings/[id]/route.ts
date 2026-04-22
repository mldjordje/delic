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
});

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
  const [row] = await db
    .update(schema.bookings)
    .set({
      ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      ...(parsed.data.workerNotes !== undefined ? { workerNotes: parsed.data.workerNotes } : {}),
      updatedAt: now,
    })
    .where(eq(schema.bookings.id, id))
    .returning();

  const shouldNotifyClient =
    Boolean(userRow?.email) &&
    ((parsed.data.status && parsed.data.status !== existing.status) ||
      (parsed.data.workerNotes !== undefined && parsed.data.workerNotes !== existing.workerNotes));

  if (parsed.data.status && parsed.data.status !== existing.status) {
    await db.insert(schema.bookingStatusLog).values({
      bookingId: id,
      previousStatus: existing.status,
      nextStatus: parsed.data.status,
      changedByUserId: auth.user.id,
      note: "Ažurirano iz admin panela",
    });
  }

  if (shouldNotifyClient && userRow?.email) {
    try {
      await sendBookingUpdateEmail({
        to: userRow.email,
        startsAtIso: existing.startsAt.toISOString(),
        status: row.status,
        workerNotes: row.workerNotes,
      });
    } catch (e) {
      console.error(e);
    }
  }

  return ok({ ok: true, booking: row });
}
