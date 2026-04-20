import { desc, eq } from "drizzle-orm";
import { ok } from "@/lib/api/http";
import { requireUser } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) {
    return auth.error;
  }
  const db = getDb();

  const rows = await db
    .select({
      booking: schema.bookings,
      vehicle: schema.vehicles,
      serviceName: schema.services.name,
    })
    .from(schema.bookings)
    .innerJoin(schema.vehicles, eq(schema.bookings.vehicleId, schema.vehicles.id))
    .innerJoin(schema.services, eq(schema.bookings.serviceId, schema.services.id))
    .where(eq(schema.bookings.userId, auth.user.id))
    .orderBy(desc(schema.bookings.startsAt));

  return ok({
    ok: true,
    bookings: rows.map((r) => ({
      ...r.booking,
      vehicle: r.vehicle,
      serviceName: r.serviceName,
    })),
  });
}
