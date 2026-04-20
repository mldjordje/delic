import { z } from "zod";
import { eq } from "drizzle-orm";
import { fail, ok, readJson } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

const patchSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  make: z.string().max(120).optional().nullable(),
  year: z.number().int().min(1950).max(2035).optional().nullable(),
  priceRsd: z.number().int().min(0).max(500_000_000).optional(),
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

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const { id } = await ctx.params;
  const body = await readJson(request);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Neispravan zahtev", parsed.error.flatten());
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(schema.usedCarListings)
    .where(eq(schema.usedCarListings.id, id))
    .limit(1);
  if (!existing) {
    return fail(404, "Oglas nije pronađen.");
  }

  const d = parsed.data;
  let imageUrl: string | null | undefined;
  if ("imageUrl" in d) {
    const v = d.imageUrl;
    imageUrl = v && String(v).trim() !== "" ? String(v).trim() : null;
  }

  const [row] = await db
    .update(schema.usedCarListings)
    .set({
      ...(d.title !== undefined ? { title: d.title.trim() } : {}),
      ...(d.make !== undefined ? { make: d.make?.trim() || null } : {}),
      ...(d.year !== undefined ? { year: d.year } : {}),
      ...(d.priceRsd !== undefined ? { priceRsd: d.priceRsd } : {}),
      ...(d.mileageKm !== undefined ? { mileageKm: d.mileageKm } : {}),
      ...(d.description !== undefined ? { description: d.description?.trim() || null } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(d.contactPhone !== undefined ? { contactPhone: d.contactPhone?.trim() || null } : {}),
      ...(d.isPublished !== undefined ? { isPublished: d.isPublished } : {}),
      ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
      updatedAt: new Date(),
    })
    .where(eq(schema.usedCarListings.id, id))
    .returning();

  return ok({ ok: true, listing: row });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const { id } = await ctx.params;
  const db = getDb();
  await db.delete(schema.usedCarListings).where(eq(schema.usedCarListings.id, id));
  return ok({ ok: true });
}
