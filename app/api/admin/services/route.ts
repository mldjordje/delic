import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { created, fail, ok, readJson } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  durationMin: z.number().int().min(15).max(480),
  priceRsd: z.number().int().min(0).max(50_000_000),
  isActive: z.boolean().optional(),
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
    .from(schema.services)
    .orderBy(asc(schema.services.sortOrder), asc(schema.services.name));

  return ok({ ok: true, services: rows });
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
  const [row] = await db
    .insert(schema.services)
    .values({
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim() || null,
      durationMin: parsed.data.durationMin,
      priceRsd: parsed.data.priceRsd,
      isActive: parsed.data.isActive ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return created({ ok: true, service: row });
}
