import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCompleteClientProfile } from "@/lib/auth/profile-completion";
import { getDb, schema } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";
import { VehiclesClientExtras } from "@/components/portal/VehiclesClientExtras";

export default async function VehiclesPage() {
  const { user } = await requireCompleteClientProfile();
  const db = getDb();
  const vehicles = await db
    .select()
    .from(schema.vehicles)
    .where(eq(schema.vehicles.userId, user.id))
    .orderBy(desc(schema.vehicles.createdAt));

  const now = Date.now();

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Vehicles</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Card-based view with key dates and highlights.
            </p>
          </div>
          <VehiclesClientExtras />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {vehicles.map((v) => {
          const regMs = new Date(v.registrationExpiresOn).getTime();
          const regDaysLeft = Math.ceil((regMs - now) / (1000 * 60 * 60 * 24));
          const regTone =
            regDaysLeft <= 14 ? "border-destructive/40" : regDaysLeft <= 30 ? "border-primary/40" : "border-border";

          const lpgMs = v.lpgMethaneCertificateExpiresOn
            ? new Date(v.lpgMethaneCertificateExpiresOn).getTime()
            : null;
          const lpgDaysLeft = lpgMs ? Math.ceil((lpgMs - now) / (1000 * 60 * 60 * 24)) : null;

          return (
            <Card key={v.id} className={`glass ${regTone}`}>
              <CardHeader>
                <CardTitle>{v.make}</CardTitle>
                <CardDescription>{v.year}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md border bg-background/30 p-3">
                  <p className="text-xs text-muted-foreground">Registration expiry</p>
                  <p className="mt-1 text-sm font-medium">
                    {v.registrationExpiresOn}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({regDaysLeft > 0 ? `${regDaysLeft}d left` : "expired"})
                    </span>
                  </p>
                </div>

                {v.hasLpgOrMethane ? (
                  <div className="rounded-md border bg-background/30 p-3">
                    <p className="text-xs text-muted-foreground">Gas / attest</p>
                    <p className="mt-1 text-sm font-medium">
                      {v.lpgMethaneCertificateExpiresOn || "—"}{" "}
                      {lpgDaysLeft != null ? (
                        <span className="text-xs text-muted-foreground">
                          ({lpgDaysLeft > 0 ? `${lpgDaysLeft}d left` : "expired"})
                        </span>
                      ) : null}
                    </p>
                  </div>
                ) : null}

                <Button asChild variant="outline" size="sm">
                  <Link href="/bookings/new">Book with this vehicle</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {vehicles.length === 0 ? (
        <Card className="glass">
          <CardHeader>
            <CardTitle>No vehicles yet</CardTitle>
            <CardDescription>Add your first vehicle to start booking.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use “Add vehicle” to create one.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

