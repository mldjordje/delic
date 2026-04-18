import { count, desc, eq } from "drizzle-orm";
import { ok } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const db = getDb();
  const clients = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      phone: schema.users.phone,
      fullName: schema.profiles.fullName,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
    .where(eq(schema.users.role, "client"))
    .orderBy(desc(schema.users.createdAt));

  const vehicleRows = await db
    .select({
      userId: schema.vehicles.userId,
      c: count(),
    })
    .from(schema.vehicles)
    .groupBy(schema.vehicles.userId);

  const vehicleByUser = new Map(vehicleRows.map((r) => [r.userId, Number(r.c)]));

  return ok({
    ok: true,
    clients: clients.map((c) => ({
      ...c,
      vehicleCount: vehicleByUser.get(c.id) ?? 0,
    })),
  });
}
