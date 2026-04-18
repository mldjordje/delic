import { count, eq } from "drizzle-orm";
import { fail, ok } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const db = getDb();
  const [[{ value: bookingsTotal }], [{ value: clientsTotal }], [{ value: vehiclesTotal }]] =
    await Promise.all([
      db.select({ value: count() }).from(schema.bookings),
      db
        .select({ value: count() })
        .from(schema.users)
        .where(eq(schema.users.role, "client")),
      db.select({ value: count() }).from(schema.vehicles),
    ]);

  const [{ value: pendingStr }] = await db
    .select({ value: count() })
    .from(schema.bookings)
    .where(eq(schema.bookings.status, "pending"));

  return ok({
    ok: true,
    stats: {
      bookingsTotal: Number(bookingsTotal ?? 0),
      clientsTotal: Number(clientsTotal ?? 0),
      vehiclesTotal: Number(vehiclesTotal ?? 0),
      pendingBookings: Number(pendingStr ?? 0),
    },
  });
}
