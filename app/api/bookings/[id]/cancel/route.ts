import { and, eq } from "drizzle-orm";
import { fail, ok, readJson } from "@/lib/api/http";
import { requireUser } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth.error) {
    return auth.error;
  }
  const { id } = await context.params;
  const body = await readJson(request);
  const parsed = bodySchema.safeParse(body || {});

  const db = getDb();
  const [booking] = await db
    .select()
    .from(schema.bookings)
    .where(and(eq(schema.bookings.id, id), eq(schema.bookings.userId, auth.user.id)))
    .limit(1);

  if (!booking) {
    return fail(404, "Termin nije pronađen.");
  }

  if (!["pending", "confirmed"].includes(booking.status)) {
    return fail(400, "Termin se ne može otkazati.");
  }

  const now = new Date();
  await db
    .update(schema.bookings)
    .set({
      status: "cancelled",
      cancellationReason: parsed.success ? parsed.data.reason || null : null,
      cancelledAt: now,
      updatedAt: now,
    })
    .where(eq(schema.bookings.id, id));

  await db.insert(schema.bookingStatusLog).values({
    bookingId: id,
    previousStatus: booking.status,
    nextStatus: "cancelled",
    changedByUserId: auth.user.id,
    note: "Otkazano od strane klijenta",
  });

  return ok({ ok: true });
}
