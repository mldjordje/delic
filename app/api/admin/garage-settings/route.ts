import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.garageSettings)
    .orderBy(desc(schema.garageSettings.createdAt))
    .limit(1);

  return ok({ ok: true, settings: row || null });
}

const patchSchema = z.object({
  slotMinutes: z.number().int().min(15).max(120).optional(),
  bookingWindowDays: z.number().int().min(1).max(90).optional(),
  workdayStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  workdayEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  saturdayStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  saturdayEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const body = await readJson(request);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Neispravni podaci", parsed.error.flatten());
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(schema.garageSettings)
    .orderBy(desc(schema.garageSettings.createdAt))
    .limit(1);

  if (!existing) {
    const [inserted] = await db
      .insert(schema.garageSettings)
      .values({
        slotMinutes: parsed.data.slotMinutes ?? 30,
        bookingWindowDays: parsed.data.bookingWindowDays ?? 31,
        workdayStart: parsed.data.workdayStart ?? "08:00",
        workdayEnd: parsed.data.workdayEnd ?? "22:00",
        saturdayStart: parsed.data.saturdayStart ?? "08:00",
        saturdayEnd: parsed.data.saturdayEnd ?? "14:00",
      })
      .returning();
    return ok({ ok: true, settings: inserted });
  }

  const [row] = await db
    .update(schema.garageSettings)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(schema.garageSettings.id, existing.id))
    .returning();

  return ok({ ok: true, settings: row });
}
