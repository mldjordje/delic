import { z } from "zod";
import { created, fail, readJson } from "@/lib/api/http";
import { withCors, corsPreflightResponse } from "@/lib/api/cors";
import { requireUser } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";
import { env } from "@/lib/env";
import { notifyAdminInbox, sendBookingConfirmationEmail } from "@/lib/auth/email";
import { getGarageSettings } from "@/lib/booking/config";
import {
  addMinutes,
  findConflicts,
  isWithinBookingWindow,
  isWithinWorkHours,
  lockEmployeeSchedule,
  userHasOverlappingBooking,
} from "@/lib/booking/engine";
import { getDefaultEmployee } from "@/lib/booking/config";
import { WORKING_HOURS_SUMMARY } from "@/lib/booking/schedule";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";

const payloadSchema = z.object({
  vehicleId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startAt: z.string().datetime(),
  clientNotes: z.string().max(1000).optional(),
});

export async function OPTIONS(request: Request) {
  return corsPreflightResponse(request) || new Response(null, { status: 405 });
}

export async function POST(request: Request) {
  const pre = corsPreflightResponse(request);
  if (pre) {
    return pre;
  }

  const auth = await requireUser();
  if (auth.error) {
    return withCors(request, auth.error);
  }

  const body = await readJson(request);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return withCors(request, fail(400, "Neispravan zahtev", parsed.error.flatten()));
  }

  const db = getDb();
  const startAt = new Date(parsed.data.startAt);
  const settings = await getGarageSettings();
  const employee = await getDefaultEmployee();

  const [svc] = await db
    .select()
    .from(schema.services)
    .where(
      and(eq(schema.services.id, parsed.data.serviceId), eq(schema.services.isActive, true))
    )
    .limit(1);

  if (!svc) {
    return withCors(request, fail(400, "Usluga nije pronađena ili je neaktivna."));
  }

  const durationMin = svc.durationMin;
  const priceRsd = svc.priceRsd;
  const endsAt = addMinutes(startAt, durationMin);

  const [vehicle] = await db
    .select()
    .from(schema.vehicles)
    .where(
      and(
        eq(schema.vehicles.id, parsed.data.vehicleId),
        eq(schema.vehicles.userId, auth.user.id)
      )
    )
    .limit(1);

  if (!vehicle) {
    return withCors(request, fail(400, "Vozilo nije pronađeno."));
  }

  if (!isWithinBookingWindow(startAt, settings.bookingWindowDays)) {
    return withCors(
      request,
      fail(400, `Termin mora biti u narednih ${settings.bookingWindowDays} dana.`)
    );
  }

  if (!(await isWithinWorkHours(startAt, durationMin))) {
    return withCors(
      request,
      fail(400, `Radno vreme: ${WORKING_HOURS_SUMMARY}`)
    );
  }

  if (await userHasOverlappingBooking(auth.user.id, startAt, endsAt)) {
    return withCors(
      request,
      fail(409, "Već imate zakazan termin u ovom vremenu.")
    );
  }

  let createdBooking: typeof schema.bookings.$inferSelect | undefined;

  try {
    await db.transaction(async (tx) => {
      await lockEmployeeSchedule(tx, employee.id);

      const conflicts = await findConflicts({
        employeeId: employee.id,
        startsAt: startAt,
        endsAt,
        tx,
      });

      if (conflicts.length) {
        throw new Error("SLOT_TAKEN");
      }

      const [row] = await tx
        .insert(schema.bookings)
        .values({
          userId: auth.user.id,
          employeeId: employee.id,
          vehicleId: vehicle.id,
          serviceId: svc.id,
          startsAt: startAt,
          endsAt,
          status: "pending",
          totalDurationMin: durationMin,
          totalPriceRsd: priceRsd,
          clientNotes: parsed.data.clientNotes || null,
        })
        .returning();

      createdBooking = row;

      await tx.insert(schema.bookingStatusLog).values({
        bookingId: row.id,
        previousStatus: null,
        nextStatus: "pending",
        changedByUserId: auth.user.id,
        note: "Kreirano online",
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "SLOT_TAKEN") {
      return withCors(request, fail(409, "Termin više nije slobodan."));
    }
    console.error(e);
    return withCors(request, fail(500, "Greška pri zakazivanju."));
  }

  if (auth.user.email) {
    try {
      await sendBookingConfirmationEmail({
        to: auth.user.email,
        startsAtIso: createdBooking!.startsAt.toISOString(),
      });
    } catch (e) {
      console.error(e);
    }
  }

  const notify = String(env.ADMIN_BOOKING_NOTIFY_EMAIL || "").trim();
  if (notify) {
    try {
      await notifyAdminInbox({
        to: notify,
        subject: "Novi zahtev za termin — Auto Delić",
        text: `Korisnik ${auth.user.email || auth.user.id} zakazao termin ${createdBooking!.startsAt.toISOString()}`,
      });
    } catch (e) {
      console.error(e);
    }
  }

  return withCors(
    request,
    created({
      ok: true,
      booking: createdBooking,
    })
  );
}
