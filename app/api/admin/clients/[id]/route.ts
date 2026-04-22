import { and, desc, eq } from "drizzle-orm";
import { fail, ok } from "@/lib/api/http";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireStaffOrAdmin();
  if (auth.error) {
    return auth.error;
  }

  const { id } = await context.params;
  const db = getDb();

  const [client] = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      phone: schema.users.phone,
      role: schema.users.role,
      createdAt: schema.users.createdAt,
      fullName: schema.profiles.fullName,
    })
    .from(schema.users)
    .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
    .where(eq(schema.users.id, id))
    .limit(1);

  if (!client) {
    return fail(404, "Klijent nije pronađen.");
  }

  const vehicles = await db
    .select()
    .from(schema.vehicles)
    .where(eq(schema.vehicles.userId, id))
    .orderBy(desc(schema.vehicles.createdAt));

  const bookings = await db
    .select({
      booking: schema.bookings,
      serviceName: schema.services.name,
      vehicle: schema.vehicles,
    })
    .from(schema.bookings)
    .innerJoin(schema.services, eq(schema.bookings.serviceId, schema.services.id))
    .innerJoin(schema.vehicles, eq(schema.bookings.vehicleId, schema.vehicles.id))
    .where(eq(schema.bookings.userId, id))
    .orderBy(desc(schema.bookings.startsAt))
    .limit(200);

  return ok({
    ok: true,
    client,
    vehicles,
    bookings: bookings.map((r) => ({
      ...r.booking,
      serviceName: r.serviceName,
      vehicle: r.vehicle,
    })),
  });
}

