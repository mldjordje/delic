import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export async function requireClientSession() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/prijava?next=%2Fdashboard");
  }
  return user;
}

export async function requireCompleteClientProfile() {
  const user = await requireClientSession();
  const db = getDb();
  const [profile] = await db
    .select({ fullName: schema.profiles.fullName })
    .from(schema.profiles)
    .where(eq(schema.profiles.userId, user.id))
    .limit(1);

  const fullNameOk = Boolean(String(profile?.fullName || "").trim());
  const phoneOk = Boolean(String(user.phone || "").trim());

  if (!fullNameOk || !phoneOk) {
    redirect("/profile?complete=1");
  }

  return { user, profile };
}

