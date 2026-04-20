import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { created, fail, ok, readJson } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

const createSchema = z.object({
  title: z.string().min(1).max(255),
  make: z.string().max(120).optional().nullable(),
  year: z.number().int().min(1950).max(2035).optional().nullable(),
  priceRsd: z.number().int().min(0).max(500_000_000),
  mileageKm: z.number().int().min(0).optional().nullable(),
  description: z.string().max(20000).optional().nullable(),
  imageUrl: z
    .union([z.string().url().max(2000), z.literal("")])
    .optional()
    .nullable(),
  contactPhone: z.string().max(32).optional().nullable(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(schema.usedCarListings)
    .orderBy(desc(schema.usedCarListings.sortOrder), desc(schema.usedCarListings.createdAt));

  return ok({ ok: true, listings: rows });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const body = await readJson(request);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Neispravan zahtev", parsed.error.flatten());
  }

  const db = getDb();
  const now = new Date();
  const img =
    parsed.data.imageUrl && String(parsed.data.imageUrl).trim() !== ""
      ? String(parsed.data.imageUrl).trim()
      : null;

  const [row] = await db
    .insert(schema.usedCarListings)
    .values({
      title: parsed.data.title.trim(),
      make: parsed.data.make?.trim() || null,
      year: parsed.data.year ?? null,
      priceRsd: parsed.data.priceRsd,
      mileageKm: parsed.data.mileageKm ?? null,
      description: parsed.data.description?.trim() || null,
      imageUrl: img,
      contactPhone: parsed.data.contactPhone?.trim() || null,
      isPublished: parsed.data.isPublished ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return created({ ok: true, listing: row });
}
