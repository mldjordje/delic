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
import { getTehnickiPregledService } from "@/lib/booking/technical-service";
import { WORKING_HOURS_SUMMARY } from "@/lib/booking/schedule";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";

const payloadSchema = z.object({
  vehicleId: z.string().uuid(),
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

  const svc = await getTehnickiPregledService();
  if (!svc) {
    return withCors(
      request,
      fail(500, "Usluga „Tehnički pregled” nije konfigurisana. Kontaktirajte admina.")
    );
  }

  const durationMin = svc.durationMin;
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
          totalPriceRsd: 0,
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

  console.log("[bookings:email] booking created, starting email flow", {
    bookingId: createdBooking!.id,
    userEmail: auth.user.email || null,
    resendKeySet: !!process.env.RESEND_API_KEY,
    resendFrom: process.env.RESEND_FROM || "(not set)",
    adminNotify: process.env.MAIL_ADMIN_TO || process.env.ADMIN_BOOKING_NOTIFY_EMAIL || "(not set)",
  });

  if (auth.user.email) {
    try {
      const c = await sendBookingConfirmationEmail({
        to: auth.user.email,
        startsAtIso: createdBooking!.startsAt.toISOString(),
      });
      console.log("[bookings:email] confirmation result", c);
      if (!c?.sent) {
        console.error("[bookings:email] confirmation NOT sent — reason:", (c as { reason?: string })?.reason);
      }
    } catch (e) {
      console.error("[bookings:email] confirmation threw exception:", e);
    }
  } else {
    console.warn("[bookings:email] user has no email — skipping confirmation.");
  }

  const notify = String(
    env.MAIL_ADMIN_TO || env.ADMIN_BOOKING_NOTIFY_EMAIL || ""
  ).trim();
  if (notify) {
    try {
      const r = await notifyAdminInbox({
        to: notify,
        subject: "Novi zahtev za termin — Auto Delić",
        text: `Korisnik ${auth.user.email || auth.user.id} — Tehnički pregled — ${createdBooking!.startsAt.toISOString()}`,
      });
      console.log("[bookings:email] admin notify result", r);
      if (!r?.sent) {
        console.error("[bookings:email] admin notify NOT sent — reason:", (r as { reason?: string })?.reason);
      }
    } catch (e) {
      console.error("[bookings:email] admin notify threw exception:", e);
    }
  } else {
    console.warn("[bookings:email] MAIL_ADMIN_TO / ADMIN_BOOKING_NOTIFY_EMAIL not set — skipping admin notify.");
  }

  return withCors(
    request,
    created({
      ok: true,
      booking: createdBooking,
    })
  );
}
