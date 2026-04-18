import { eq } from "drizzle-orm";
import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api/http";
import { requireUser } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) {
    return auth.error;
  }
  const db = getDb();
  const [profile] = await db
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.userId, auth.user.id))
    .limit(1);
  const [userRow] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, auth.user.id))
    .limit(1);

  return ok({
    ok: true,
    profile: profile || null,
    user: userRow,
  });
}

const patchSchema = z.object({
  fullName: z.string().min(2).max(255).optional(),
  phone: z.string().min(6).max(32).optional(),
});

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if (auth.error) {
    return auth.error;
  }
  const body = await readJson(request);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Neispravan zahtev", parsed.error.flatten());
  }

  const db = getDb();

  if (parsed.data.phone !== undefined) {
    await db
      .update(schema.users)
      .set({ phone: parsed.data.phone, updatedAt: new Date() })
      .where(eq(schema.users.id, auth.user.id));
  }

  if (parsed.data.fullName !== undefined) {
    const [existing] = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, auth.user.id))
      .limit(1);

    if (existing) {
      await db
        .update(schema.profiles)
        .set({ fullName: parsed.data.fullName, updatedAt: new Date() })
        .where(eq(schema.profiles.id, existing.id));
    } else {
      await db.insert(schema.profiles).values({
        userId: auth.user.id,
        fullName: parsed.data.fullName,
      });
    }
  }

  const [profile] = await db
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.userId, auth.user.id))
    .limit(1);

  const [userRow] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, auth.user.id))
    .limit(1);

  return ok({
    ok: true,
    profile,
    user: userRow,
  });
}
