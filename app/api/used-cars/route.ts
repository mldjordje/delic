import { desc, eq } from "drizzle-orm";
import { ok } from "@/lib/api/http";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

/** Javni oglasi polovnih automobila. */
export async function GET() {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.usedCarListings)
    .where(eq(schema.usedCarListings.isPublished, true))
    .orderBy(desc(schema.usedCarListings.sortOrder), desc(schema.usedCarListings.createdAt));

  return ok({
    ok: true,
    listings: rows.map((l) => ({
      id: l.id,
      title: l.title,
      make: l.make,
      year: l.year,
      priceRsd: l.priceRsd,
      mileageKm: l.mileageKm,
      description: l.description,
      imageUrl: l.imageUrl,
      contactPhone: l.contactPhone,
    })),
  });
}
