import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { PortalShell } from "@/components/portal/PortalShell";

export const runtime = "nodejs";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/prijava?next=%2Fdashboard");
  }

  const db = getDb();
  const [profile] = await db
    .select({ fullName: schema.profiles.fullName })
    .from(schema.profiles)
    .where(eq(schema.profiles.userId, user.id))
    .limit(1);

  const userLabel = profile?.fullName || user.email || "Client";

  return <PortalShell userLabel={userLabel}>{children}</PortalShell>;
}

