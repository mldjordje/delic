import { z } from "zod";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { created, fail, ok, readJson } from "@/lib/api/http";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";
import { parseDateAtTime, toBelgradeDateKey } from "@/lib/booking/schedule";
import { addMinutes, findConflicts, isWithinWorkHours, lockEmployeeSchedule } from "@/lib/booking/engine";
import { getDefaultEmployee } from "@/lib/booking/config";

export const runtime = "nodejs";

const createSchema = z.object({
  userId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]).optional(),
  workerNotes: z.string().max(8000).optional().nullable(),
});

export async function GET(request: Request) {
  const auth = await requireStaffOrAdmin();
  if (auth.error) {
    return auth.error;
  }

  const url = new URL(request.url);
  let from = url.searchParams.get("from");
  let to = url.searchParams.get("to");
  const calendarOnly = url.searchParams.get("calendar") === "1";

  if (auth.user.role === "staff") {
    const today = toBelgradeDateKey(new Date());
    from = today;
    to = today;
  }

  if (!from || !to) {
    return fail(400, "Parametri from i to (YYYY-MM-DD) su obavezni za administratora.");
  }

  const start = parseDateAtTime(from, "00:00");
  const end = parseDateAtTime(to, "23:59", 59);

  const db = getDb();
  const dateWhere = and(gte(schema.bookings.startsAt, start), lte(schema.bookings.startsAt, end));
  const calendarWhere = calendarOnly
    ? and(dateWhere, eq(schema.services.calendarEnabled, true))
    : dateWhere;
  const rows = await db
    .select({
      booking: schema.bookings,
      vehicle: schema.vehicles,
      serviceName: schema.services.name,
      userEmail: schema.users.email,
      userPhone: schema.users.phone,
      profileName: schema.profiles.fullName,
    })
    .from(schema.bookings)
    .innerJoin(schema.vehicles, eq(schema.bookings.vehicleId, schema.vehicles.id))
    .innerJoin(schema.services, eq(schema.bookings.serviceId, schema.services.id))
    .innerJoin(schema.users, eq(schema.bookings.userId, schema.users.id))
    .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
    .where(calendarWhere)
    .orderBy(desc(schema.bookings.startsAt));

  const employee = await getDefaultEmployee();
  let blocked: (typeof schema.blockedSlots.$inferSelect)[] = [];
  try {
    blocked = await db
      .select()
      .from(schema.blockedSlots)
      .where(
        and(
          eq(schema.blockedSlots.employeeId, employee.id),
          gte(schema.blockedSlots.startsAt, start),
          lte(schema.blockedSlots.startsAt, end)
        )
      )
      .orderBy(desc(schema.blockedSlots.startsAt));
  } catch (e) {
    // Backwards-compatible if migration isn't applied yet
    const anyErr = e as any;
    const code = typeof anyErr?.code === "string" ? anyErr.code : "";
    const msg = typeof anyErr?.message === "string" ? anyErr.message : "";
    const missing = code === "42P01" || (msg.toLowerCase().includes("relation") && msg.toLowerCase().includes("does not exist"));
    if (!missing) {
      throw e;
    }
  }

  return ok({
    ok: true,
    bookings: [
      ...rows.map((r) => ({
      ...r.booking,
      vehicle: r.vehicle,
      serviceName: r.serviceName,
      client: {
        email: r.userEmail,
        phone: r.userPhone,
        fullName: r.profileName,
      },
      })),
      ...blocked.map((b) => ({
        id: b.id,
        userId: "00000000-0000-0000-0000-000000000000",
        employeeId: b.employeeId,
        vehicleId: "00000000-0000-0000-0000-000000000000",
        serviceId: "00000000-0000-0000-0000-000000000000",
        startsAt: b.startsAt,
        endsAt: b.endsAt,
        status: "blocked",
        workerNotes: b.reason,
        clientNotes: null,
        cancellationReason: null,
        cancelledAt: null,
        totalDurationMin: 0,
        totalPriceRsd: 0,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        vehicle: { id: b.id, userId: "00000000-0000-0000-0000-000000000000", make: "BLOKADA", year: new Date(b.startsAt).getFullYear() } as any,
        serviceName: "Blokada",
        client: { email: null, phone: null, fullName: "Blokirano" },
      })) as any,
    ],
  });
}

export async function POST(request: Request) {
  const auth = await requireStaffOrAdmin();
  if (auth.error) {
    return auth.error;
  }

  const body = await readJson(request);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Neispravan zahtev", parsed.error.flatten());
  }

  const db = getDb();
  const employee = await getDefaultEmployee();

  const startAt = new Date(parsed.data.startsAt);
  if (Number.isNaN(startAt.getTime())) {
    return fail(400, "Neispravan datum startsAt.");
  }

  const [svc] = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.id, parsed.data.serviceId))
    .limit(1);
  if (!svc) {
    return fail(400, "Usluga nije pronađena.");
  }
  if (!svc.calendarEnabled) {
    return fail(400, "Ova usluga nije u kalendaru; ne može se zakazivati u terminu.");
  }

  const [vehicle] = await db
    .select()
    .from(schema.vehicles)
    .where(eq(schema.vehicles.id, parsed.data.vehicleId))
    .limit(1);
  if (!vehicle || vehicle.userId !== parsed.data.userId) {
    return fail(400, "Vozilo nije pronađeno (ili ne pripada klijentu).");
  }

  const durationMin = svc.durationMin;
  const endsAt = addMinutes(startAt, durationMin);

  if (!(await isWithinWorkHours(startAt, durationMin))) {
    return fail(400, "Termin je van radnog vremena.");
  }

  const status = parsed.data.status || "confirmed";

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
          userId: parsed.data.userId,
          employeeId: employee.id,
          vehicleId: parsed.data.vehicleId,
          serviceId: svc.id,
          startsAt: startAt,
          endsAt,
          status,
          totalDurationMin: durationMin,
          totalPriceRsd: 0,
          workerNotes: parsed.data.workerNotes || null,
          clientNotes: null,
        })
        .returning();

      createdBooking = row;

      await tx.insert(schema.bookingStatusLog).values({
        bookingId: row.id,
        previousStatus: null,
        nextStatus: status,
        changedByUserId: auth.user.id,
        note: "Kreirano ručno (kalendar)",
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "SLOT_TAKEN") {
      return fail(409, "Termin je zauzet.");
    }
    console.error(e);
    return fail(500, "Greška pri kreiranju termina.");
  }

  return created({ ok: true, booking: createdBooking });
}
