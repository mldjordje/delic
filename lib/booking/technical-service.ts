import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";

/** U URL-u / bazi: jedinstvena oznaka za uslugu tehničkog pregleda. */
export const TEHNICKI_PREGLED_SLUG = "tehnicki-pregled";

const TEHNICKI_PREGLED_NAME = "Tehnički pregled";

/**
 * Usluga koja je jedina dostupna u javnom formularu za zakazivanje.
 */
export async function getTehnickiPregledService() {
  const db = getDb();
  const bySlug = await db
    .select()
    .from(schema.services)
    .where(
      and(
        eq(schema.services.slug, TEHNICKI_PREGLED_SLUG),
        eq(schema.services.isActive, true),
        eq(schema.services.calendarEnabled, true)
      )
    )
    .limit(1);
  if (bySlug[0]) {
    return bySlug[0];
  }
  const byName = await db
    .select()
    .from(schema.services)
    .where(
      and(
        eq(schema.services.name, TEHNICKI_PREGLED_NAME),
        eq(schema.services.isActive, true),
        eq(schema.services.calendarEnabled, true)
      )
    )
    .limit(1);
  return byName[0] ?? null;
}
