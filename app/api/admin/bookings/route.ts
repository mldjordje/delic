import { and, desc, eq, gte, lte } from "drizzle-orm";
import { fail, ok } from "@/lib/api/http";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";
import { parseDateAtTime, toBelgradeDateKey } from "@/lib/booking/schedule";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireStaffOrAdmin();
  if (auth.error) {
    return auth.error;
  }

  const url = new URL(request.url);
  let from = url.searchParams.get("from");
  let to = url.searchParams.get("to");

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
    .where(and(gte(schema.bookings.startsAt, start), lte(schema.bookings.startsAt, end)))
    .orderBy(desc(schema.bookings.startsAt));

  return ok({
    ok: true,
    bookings: rows.map((r) => ({
      ...r.booking,
      vehicle: r.vehicle,
      serviceName: r.serviceName,
      client: {
        email: r.userEmail,
        phone: r.userPhone,
        fullName: r.profileName,
      },
    })),
  });
}
