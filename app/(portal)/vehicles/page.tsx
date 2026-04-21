import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCompleteClientProfile } from "@/lib/auth/profile-completion";
import { getDb, schema } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";
import { VehiclesClientExtras } from "@/components/portal/VehiclesClientExtras";
import { PortalHero } from "@/components/portal/PortalHero";
import { VehiclesListClient } from "@/components/portal/VehiclesListClient";

export default async function VehiclesPage() {
  const { user } = await requireCompleteClientProfile();
  const db = getDb();
  const vehicles = await db
    .select()
    .from(schema.vehicles)
    .where(eq(schema.vehicles.userId, user.id))
    .orderBy(desc(schema.vehicles.createdAt));

  return (
    <div className="space-y-6">
      <PortalHero
        eyebrow="My vehicles"
        title="Vehicles"
        description="A clean dashboard view of your important dates and certificates."
        imageSrc="/assets/images/tehnicki2.jpg"
        right={<VehiclesClientExtras />}
      />

      <VehiclesListClient vehicles={vehicles as any} />

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

