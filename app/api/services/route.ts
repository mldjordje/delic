import { asc, eq } from "drizzle-orm";
import { ok } from "@/lib/api/http";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

/** Javna lista aktivnih usluga za zakazivanje. */
export async function GET() {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.isActive, true))
    .orderBy(asc(schema.services.sortOrder), asc(schema.services.name));

  return ok({
    ok: true,
    services: rows.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      durationMin: s.durationMin,
      sortOrder: s.sortOrder,
      slug: s.slug,
      calendarEnabled: s.calendarEnabled,
    })),
  });
}
