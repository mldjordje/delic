import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

const createSchema = z.object({
  email: z.string().email(),
  role: z.enum(["staff", "client"]).default("staff"),
  fullName: z.string().trim().min(2).max(255).optional(),
});

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const db = getDb();
  const workers = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      phone: schema.users.phone,
      role: schema.users.role,
      lastLoginAt: schema.users.lastLoginAt,
      createdAt: schema.users.createdAt,
      fullName: schema.profiles.fullName,
    })
    .from(schema.users)
    .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
    .where(inArray(schema.users.role, ["staff", "admin"]))
    .orderBy(desc(schema.users.createdAt));

  return ok({ ok: true, workers });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await readJson(request);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Neispravan zahtev", parsed.error.flatten());
  }

  const email = parsed.data.email.trim().toLowerCase();
  const db = getDb();
  const now = new Date();

  const [existing] = await db
    .select({ id: schema.users.id, role: schema.users.role })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  let userId = existing?.id as string | undefined;
  if (!existing) {
    const [created] = await db
      .insert(schema.users)
      .values({
        email,
        role: parsed.data.role,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: schema.users.id });
    userId = created?.id;
  } else {
    // Never downgrade an admin via this endpoint.
    const nextRole = existing.role === "admin" ? "admin" : parsed.data.role;
    await db
      .update(schema.users)
      .set({ role: nextRole, updatedAt: now })
      .where(eq(schema.users.id, existing.id));
    userId = existing.id;
  }

  if (userId && parsed.data.fullName) {
    const [profile] = await db
      .select({ id: schema.profiles.id })
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, userId))
      .limit(1);

    if (!profile) {
      await db.insert(schema.profiles).values({
        userId,
        fullName: parsed.data.fullName,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await db
        .update(schema.profiles)
        .set({ fullName: parsed.data.fullName, updatedAt: now })
        .where(eq(schema.profiles.id, profile.id));
    }
  }

  // Return fresh list row
  const [worker] = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      phone: schema.users.phone,
      role: schema.users.role,
      lastLoginAt: schema.users.lastLoginAt,
      createdAt: schema.users.createdAt,
      fullName: schema.profiles.fullName,
    })
    .from(schema.users)
    .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
    .where(eq(schema.users.email, email))
    .limit(1);

  return ok({ ok: true, worker });
}

