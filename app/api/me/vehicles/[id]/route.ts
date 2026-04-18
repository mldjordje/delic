import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api/http";
import { requireUser } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

const patchSchema = z.object({
  make: z.string().min(1).max(120).optional(),
  engineCc: z.number().int().positive().optional().nullable(),
  powerKw: z.string().optional().nullable(),
  year: z.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
  registrationExpiresOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  hasLpgOrMethane: z.boolean().optional(),
  lpgMethaneCertificateExpiresOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth.error) {
    return auth.error;
  }
  const { id } = await context.params;
  const body = await readJson(request);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Neispravni podaci", parsed.error.flatten());
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(schema.vehicles)
    .where(and(eq(schema.vehicles.id, id), eq(schema.vehicles.userId, auth.user.id)))
    .limit(1);

  if (!existing) {
    return fail(404, "Vozilo nije pronađeno.");
  }

  const patch = parsed.data;
  const [row] = await db
    .update(schema.vehicles)
    .set({
      ...(patch.make !== undefined ? { make: patch.make } : {}),
      ...(patch.engineCc !== undefined ? { engineCc: patch.engineCc } : {}),
      ...(patch.powerKw !== undefined ? { powerKw: patch.powerKw } : {}),
      ...(patch.year !== undefined ? { year: patch.year } : {}),
      ...(patch.registrationExpiresOn !== undefined
        ? { registrationExpiresOn: patch.registrationExpiresOn }
        : {}),
      ...(patch.hasLpgOrMethane !== undefined
        ? { hasLpgOrMethane: patch.hasLpgOrMethane }
        : {}),
      ...(patch.lpgMethaneCertificateExpiresOn !== undefined
        ? { lpgMethaneCertificateExpiresOn: patch.lpgMethaneCertificateExpiresOn }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(schema.vehicles.id, id))
    .returning();

  return ok({ ok: true, vehicle: row });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth.error) {
    return auth.error;
  }
  const { id } = await context.params;
  const db = getDb();

  const [existing] = await db
    .select()
    .from(schema.vehicles)
    .where(and(eq(schema.vehicles.id, id), eq(schema.vehicles.userId, auth.user.id)))
    .limit(1);

  if (!existing) {
    return fail(404, "Vozilo nije pronađeno.");
  }

  await db.delete(schema.vehicles).where(eq(schema.vehicles.id, id));
  return ok({ ok: true });
}
