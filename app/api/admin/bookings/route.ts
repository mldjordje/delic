import { z } from "zod";
import { and, desc, eq, gte, lte, or } from "drizzle-orm";
import { created, fail, ok, readJson } from "@/lib/api/http";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";
import { parseDateAtTime, toBelgradeDateKey } from "@/lib/booking/schedule";
import { addMinutes, findConflicts, isWithinWorkHours, lockEmployeeSchedule } from "@/lib/booking/engine";
import { getDefaultEmployee } from "@/lib/booking/config";
import { buildVehicleMake, makePlaceholderEmail, normalizePhone, normalizePlate } from "@/lib/booking/manual-client";

export const runtime = "nodejs";

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const createSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  /** Novi klijent (npr. iz sveske) — kreira se zajedno sa terminom. */
  newClient: z
    .object({
      fullName: z.string().trim().min(2).max(255),
      phone: z.string().trim().max(32).optional().nullable(),
      email: z.union([z.string().trim().email().max(255), z.literal("")]).optional().nullable(),
    })
    .optional()
    .nullable(),
  vehicleId: z.string().uuid().optional().nullable(),
  newVehicle: z
    .object({
      /** car | motorcycle — tip se čuva kao prefiks marke („Motor · Yamaha”). */
      kind: z.enum(["car", "motorcycle"]).optional(),
      /** Vozilo nije zapisano (npr. u svesci) — kreira se „Nepoznato vozilo” za kasniju dopunu. */
      unknown: z.boolean().optional(),
      make: z.string().trim().max(100).optional().nullable(),
      model: z.string().trim().max(120).optional().nullable(),
      plateNumber: z.string().trim().max(16).optional().nullable(),
      year: z.number().int().min(1950).max(2100).optional().nullable(),
      registrationExpiresOn: dateKey.optional().nullable(),
    })
    .optional()
    .nullable(),
  serviceId: z.string().uuid(),
  /** ISO vreme, ili date + time u beogradskom vremenu. */
  startsAt: z.string().datetime().optional(),
  date: dateKey.optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  allowOutsideHours: z.boolean().optional(),
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
  const data = parsed.data;

  const db = getDb();
  const employee = await getDefaultEmployee();

  const startAt = data.startsAt
    ? new Date(data.startsAt)
    : data.date && data.time
      ? parseDateAtTime(data.date, data.time)
      : new Date(NaN);
  if (Number.isNaN(startAt.getTime())) {
    return fail(400, "Unesite ispravan datum i vreme.");
  }

  const [svc] = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.id, data.serviceId))
    .limit(1);
  if (!svc) {
    return fail(400, "Usluga nije pronađena.");
  }
  if (!svc.calendarEnabled) {
    return fail(400, "Ova usluga nije u kalendaru; ne može se zakazivati u terminu.");
  }

  if (!data.userId && !data.newClient) {
    return fail(400, "Izaberite klijenta ili unesite novog.");
  }
  if (!data.vehicleId && !data.newVehicle) {
    return fail(400, "Izaberite vozilo ili unesite novo.");
  }
  if (!data.vehicleId && data.newVehicle && !data.newVehicle.unknown && !data.newVehicle.make) {
    return fail(400, "Unesite marku vozila ili označite da vozilo nije zapisano.");
  }

  let userId = data.userId || null;
  const newPhone = data.newClient ? normalizePhone(data.newClient.phone) : "";
  const newEmail = data.newClient?.email ? data.newClient.email.trim().toLowerCase() : "";
  let reusedClient = false;

  // Novi klijent čiji telefon/email već postoji → koristi postojeći nalog (bez duplikata).
  if (!userId && data.newClient && (newPhone || newEmail)) {
    const conds = [
      newPhone ? eq(schema.users.phone, newPhone) : null,
      newEmail ? eq(schema.users.email, newEmail) : null,
    ].filter((c): c is NonNullable<typeof c> => c !== null);
    const [match] = await db
      .select({ id: schema.users.id, role: schema.users.role })
      .from(schema.users)
      .where(or(...conds))
      .limit(1);
    if (match) {
      if (match.role !== "client") {
        return fail(400, "Taj telefon/email pripada nalogu radnika ili administratora.");
      }
      userId = match.id;
      reusedClient = true;
    }
  }

  if (data.vehicleId) {
    const [vehicle] = await db
      .select({ userId: schema.vehicles.userId })
      .from(schema.vehicles)
      .where(eq(schema.vehicles.id, data.vehicleId))
      .limit(1);
    if (!vehicle || vehicle.userId !== userId) {
      return fail(400, "Vozilo nije pronađeno (ili ne pripada klijentu).");
    }
  }

  const durationMin = svc.durationMin;
  const endsAt = addMinutes(startAt, durationMin);

  if (!data.allowOutsideHours && !(await isWithinWorkHours(startAt, durationMin))) {
    return fail(400, "Termin je van radnog vremena. Uključite „Van radnog vremena” ako je to namerno.", {
      code: "OUTSIDE_HOURS",
    });
  }

  const status = data.status || "confirmed";

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

      const now = new Date();
      let clientId = userId;
      if (!clientId && data.newClient) {
        const [u] = await tx
          .insert(schema.users)
          .values({
            email: newEmail || makePlaceholderEmail(data.newClient.fullName),
            phone: newPhone || null,
            role: "client",
            createdAt: now,
            updatedAt: now,
          })
          .returning({ id: schema.users.id });
        clientId = u.id;
        await tx.insert(schema.profiles).values({
          userId: clientId,
          fullName: data.newClient.fullName.trim(),
          createdAt: now,
          updatedAt: now,
        });
      }
      if (!clientId) {
        throw new Error("NO_CLIENT");
      }

      let vehicleId = data.vehicleId || null;
      if (!vehicleId && data.newVehicle) {
        const nv = data.newVehicle;
        const [v] = await tx
          .insert(schema.vehicles)
          .values({
            userId: clientId,
            make: buildVehicleMake(nv.kind, nv.unknown ? null : nv.make),
            model: nv.model?.trim() || null,
            plateNumber: nv.unknown ? null : normalizePlate(nv.plateNumber) || null,
            year: nv.year ?? now.getFullYear(),
            // Na tehnički se obično dolazi pred istek registracije — podrazumevano datum termina.
            registrationExpiresOn: nv.registrationExpiresOn || toBelgradeDateKey(startAt),
            createdAt: now,
            updatedAt: now,
          })
          .returning({ id: schema.vehicles.id });
        vehicleId = v.id;
      }
      if (!vehicleId) {
        throw new Error("NO_VEHICLE");
      }

      const [row] = await tx
        .insert(schema.bookings)
        .values({
          userId: clientId,
          employeeId: employee.id,
          vehicleId,
          serviceId: svc.id,
          startsAt: startAt,
          endsAt,
          status,
          totalDurationMin: durationMin,
          totalPriceRsd: 0,
          workerNotes: data.workerNotes?.trim() || null,
          clientNotes: null,
        })
        .returning();

      createdBooking = row;

      await tx.insert(schema.bookingStatusLog).values({
        bookingId: row.id,
        previousStatus: null,
        nextStatus: status,
        changedByUserId: auth.user.id,
        note: "Kreirano ručno (admin)",
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "SLOT_TAKEN") {
      return fail(409, "Termin je zauzet. Izaberite drugo vreme.");
    }
    const code = typeof (e as { code?: unknown })?.code === "string" ? (e as { code: string }).code : "";
    if (code === "23505") {
      return fail(409, "Klijent sa tim telefonom/emailom već postoji — potražite ga u pretrazi.");
    }
    console.error(e);
    return fail(500, "Greška pri kreiranju termina.");
  }

  return created({ ok: true, booking: createdBooking, reusedClient });
}
