import { and, asc, eq } from "drizzle-orm";
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
  const userId = String(url.searchParams.get("userId") || "").trim();
  if (!userId) {
    return fail(400, "Parametar userId je obavezan.");
  }

  const db = getDb();
  const vehicles = await db
    .select()
    .from(schema.vehicles)
    .where(and(eq(schema.vehicles.userId, userId)))
    .orderBy(asc(schema.vehicles.createdAt));

  return ok({ ok: true, vehicles });
}

