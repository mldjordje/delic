import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { fail, ok } from "@/lib/api/http";
import { requireUser } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

const querySchema = z.object({
  vehicleId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.error) {
    return auth.error;
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    vehicleId: url.searchParams.get("vehicleId") || undefined,
  });
  if (!parsed.success) {
    return fail(400, "Neispravan zahtev", parsed.error.flatten());
  }

  const db = getDb();
  const where = parsed.data.vehicleId
    ? and(eq(schema.bookings.userId, auth.user.id), eq(schema.bookings.vehicleId, parsed.data.vehicleId))
    : eq(schema.bookings.userId, auth.user.id);

  const rows = await db
    .select({
      booking: schema.bookings,
      vehicle: schema.vehicles,
      service: schema.services,
    })
    .from(schema.bookings)
    .innerJoin(schema.vehicles, eq(schema.bookings.vehicleId, schema.vehicles.id))
    .innerJoin(schema.services, eq(schema.bookings.serviceId, schema.services.id))
    .where(where)
    .orderBy(desc(schema.bookings.startsAt));

  return ok({
    ok: true,
    bookings: rows.map((r) => ({
      ...r.booking,
      vehicle: r.vehicle,
      service: r.service,
    })),
  });
}
