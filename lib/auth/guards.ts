import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { fail } from "@/lib/api/http";
import { getDb, schema } from "@/lib/db/client";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
  role: "client" | "staff" | "admin";
};

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = await verifySessionToken(token);
  if (!payload?.sub) {
    return null;
  }

  const db = getDb();
  const [user] = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      phone: schema.users.phone,
      role: schema.users.role,
    })
    .from(schema.users)
    .where(eq(schema.users.id, String(payload.sub)))
    .limit(1);

  if (!user) {
    return null;
  }

  return user as AuthUser;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null as AuthUser | null, error: fail(401, "Unauthorized") };
  }
  return { user, error: null as null };
}

export async function requireStaffOrAdmin() {
  const session = await requireUser();
  if (session.error) {
    return session;
  }
  if (session.user.role !== "staff" && session.user.role !== "admin") {
    return { user: null, error: fail(403, "Potreban pristup radnika ili administratora") };
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.error) {
    return session;
  }
  if (session.user.role !== "admin") {
    return { user: null, error: fail(403, "Potreban pristup administratora") };
  }
  return session;
}
