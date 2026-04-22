import { z } from "zod";
import { eq } from "drizzle-orm";
import { fail, ok, readJson } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

const patchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional().nullable(),
  durationMin: z.number().int().min(15).max(480).optional(),
  slug: z.string().min(1).max(255).optional().nullable(),
  calendarEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
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
  const [existing] = await db.select().from(schema.services).where(eq(schema.services.id, id)).limit(1);
  if (!existing) {
    return fail(404, "Usluga nije pronađena.");
  }

  const now = new Date();
  const d = parsed.data;
  const [row] = await db
    .update(schema.services)
    .set({
      ...(d.name !== undefined ? { name: d.name.trim() } : {}),
      ...(d.description !== undefined ? { description: d.description?.trim() || null } : {}),
      ...(d.durationMin !== undefined ? { durationMin: d.durationMin } : {}),
      ...(d.slug !== undefined ? { slug: d.slug?.trim() || null } : {}),
      ...(d.calendarEnabled !== undefined ? { calendarEnabled: d.calendarEnabled } : {}),
      ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
      ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
      updatedAt: now,
    })
    .where(eq(schema.services.id, id))
    .returning();

  return ok({ ok: true, service: row });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const { id } = await ctx.params;
  const db = getDb();

  const [b] = await db
    .select({ id: schema.bookings.id })
    .from(schema.bookings)
    .where(eq(schema.bookings.serviceId, id))
    .limit(1);

  if (b) {
    return fail(409, "Ne može se obrisati usluga koja ima zakazane termine. Deaktiviraj je.");
  }

  await db.delete(schema.services).where(eq(schema.services.id, id));
  return ok({ ok: true });
}
