import { desc, eq } from "drizzle-orm";
import { ok } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

/** Lista završenih tehničkih pregleda sa rezultatima (samo admin). */
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const db = getDb();
  const rows = await db
    .select({
      booking: schema.bookings,
      vehicle: schema.vehicles,
      serviceName: schema.services.name,
      userEmail: schema.users.email,
      profileName: schema.profiles.fullName,
    })
    .from(schema.bookings)
    .innerJoin(schema.vehicles, eq(schema.bookings.vehicleId, schema.vehicles.id))
    .innerJoin(schema.services, eq(schema.bookings.serviceId, schema.services.id))
    .innerJoin(schema.users, eq(schema.bookings.userId, schema.users.id))
    .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
    .where(
      eq(schema.bookings.status, "completed")
    )
    .orderBy(desc(schema.bookings.startsAt));

  const withNotes = rows.filter(
    (r) => r.booking.inspectionResult != null || (r.booking.inspectionNote && r.booking.inspectionNote.trim())
  );

  return ok({
    ok: true,
    items: withNotes.map((r) => ({
      ...r.booking,
      vehicle: r.vehicle,
      serviceName: r.serviceName,
      client: { email: r.userEmail, fullName: r.profileName },
    })),
  });
}
