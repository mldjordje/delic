import { and, desc, eq, ilike, or } from "drizzle-orm";
import { fail, ok } from "@/lib/api/http";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireStaffOrAdmin();
  if (auth.error) {
    return auth.error;
  }

  const url = new URL(request.url);
  const q = String(url.searchParams.get("q") || "").trim();
  if (q.length < 2) {
    return fail(400, "Parametar q (min 2 karaktera) je obavezan.");
  }

  const db = getDb();
  const like = `%${q}%`;

  const rows = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      phone: schema.users.phone,
      fullName: schema.profiles.fullName,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
    .where(
      and(
        eq(schema.users.role, "client"),
        or(
          ilike(schema.users.email, like),
          ilike(schema.users.phone, like),
          ilike(schema.profiles.fullName, like)
        )
      )
    )
    .orderBy(desc(schema.users.createdAt))
    .limit(20);

  return ok({ ok: true, clients: rows });
}

