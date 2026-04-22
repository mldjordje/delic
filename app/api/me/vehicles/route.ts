import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { created, fail, ok, readJson } from "@/lib/api/http";
import { requireUser } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) {
    return auth.error;
  }
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.vehicles)
    .where(eq(schema.vehicles.userId, auth.user.id))
    .orderBy(desc(schema.vehicles.createdAt));

  return ok({ ok: true, vehicles: rows });
}

const vehicleSchema = z.object({
  make: z.string().min(1).max(120),
  plateNumber: z.string().min(3).max(16).optional().nullable(),
  vin: z.string().min(8).max(32).optional().nullable(),
  fuelType: z.string().min(2).max(32).optional().nullable(),
  model: z.string().min(1).max(120).optional().nullable(),
  year: z.number().int().min(1950).max(new Date().getFullYear() + 1),
  registrationExpiresOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hasLpgOrMethane: z.boolean().optional().default(false),
  lpgMethaneCertificateExpiresOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error) {
    return auth.error;
  }
  const body = await readJson(request);
  const parsed = vehicleSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Neispravni podaci o vozilu", parsed.error.flatten());
  }

  const db = getDb();
  const [row] = await db
    .insert(schema.vehicles)
    .values({
      userId: auth.user.id,
      make: parsed.data.make,
      plateNumber: parsed.data.plateNumber ?? null,
      vin: parsed.data.vin ?? null,
      fuelType: parsed.data.fuelType ?? null,
      model: parsed.data.model ?? null,
      year: parsed.data.year,
      registrationExpiresOn: parsed.data.registrationExpiresOn,
      hasLpgOrMethane: parsed.data.hasLpgOrMethane ?? false,
      lpgMethaneCertificateExpiresOn: parsed.data.lpgMethaneCertificateExpiresOn ?? null,
    })
    .returning();

  return created({ ok: true, vehicle: row });
}
