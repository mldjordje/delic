import { eq } from "drizzle-orm";
import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api/http";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

const patchSchema = z.object({
  reason: z.string().max(1000).optional().nullable(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireStaffOrAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const body = await readJson(request);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail(400, "Neispravan zahtev", parsed.error.flatten());

  const db = getDb();
  const [existing] = await db.select().from(schema.blockedSlots).where(eq(schema.blockedSlots.id, id)).limit(1);
  if (!existing) return fail(404, "Blokada nije pronađena.");

  const [row] = await db
    .update(schema.blockedSlots)
    .set({ ...(parsed.data.reason !== undefined ? { reason: parsed.data.reason } : {}), updatedAt: new Date() })
    .where(eq(schema.blockedSlots.id, id))
    .returning();

  return ok({ ok: true, blocked: row });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireStaffOrAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const db = getDb();
  const [existing] = await db.select().from(schema.blockedSlots).where(eq(schema.blockedSlots.id, id)).limit(1);
  if (!existing) return fail(404, "Blokada nije pronađena.");

  await db.delete(schema.blockedSlots).where(eq(schema.blockedSlots.id, id));
  return ok({ ok: true });
}

