import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCompleteClientProfile } from "@/lib/auth/profile-completion";
import { getDb, schema } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";
import { BookingsClientActions } from "@/components/portal/BookingsClientActions";
import { PortalHero } from "@/components/portal/PortalHero";

const STATUS_SR: Record<string, string> = {
  pending: "Na čekanju",
  confirmed: "Potvrđeno",
  completed: "Završeno",
  cancelled: "Otkazano",
  no_show: "Nije se pojavio",
};

export default async function BookingsPage() {
  const { user } = await requireCompleteClientProfile();

  const db = getDb();
  const rows = await db
    .select({
      booking: schema.bookings,
      vehicle: schema.vehicles,
      serviceName: schema.services.name,
    })
    .from(schema.bookings)
    .innerJoin(schema.vehicles, eq(schema.bookings.vehicleId, schema.vehicles.id))
    .innerJoin(schema.services, eq(schema.bookings.serviceId, schema.services.id))
    .where(eq(schema.bookings.userId, user.id))
    .orderBy(desc(schema.bookings.startsAt));

  const now = Date.now();
  const upcoming = rows.filter((r) => new Date(r.booking.startsAt).getTime() > now);
  const history = rows.filter((r) => new Date(r.booking.startsAt).getTime() <= now);

  return (
    <div className="space-y-6">
      <PortalHero
        eyebrow="Termini"
        title="Moji termini"
        description="Predstojeći termini, istorija i napomene servisera."
        imageSrc="/assets/images/tehnicki3.jpg"
        right={
          <Button asChild>
            <Link href="/bookings/new">Zakaži termin</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Predstojeći</CardTitle>
            <CardDescription>Vaši naredni termini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length ? (
              upcoming.map((r) => (
                <div key={r.booking.id} className="rounded-lg border bg-background/30 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{r.serviceName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(r.booking.startsAt).toLocaleString("sr-RS", {
                          timeZone: "Europe/Belgrade",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.vehicle.make} ({r.vehicle.year}) ·{" "}
                        {STATUS_SR[r.booking.status] ?? r.booking.status}
                      </p>
                    </div>
                    <BookingsClientActions bookingId={r.booking.id} status={r.booking.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nema predstojećih termina.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Istorija</CardTitle>
            <CardDescription>Prethodne posete i napomene servisera.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.length ? (
              history.map((r) => (
                <div key={r.booking.id} className="rounded-lg border bg-background/30 p-4">
                  <p className="text-sm font-semibold">{r.serviceName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.booking.startsAt).toLocaleDateString("sr-RS", { timeZone: "Europe/Belgrade" })} ·{" "}
                    {r.vehicle.make} ({r.vehicle.year}) ·{" "}
                    {STATUS_SR[r.booking.status] ?? r.booking.status}
                  </p>
                  {r.booking.workerNotes ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Napomena servisera: {r.booking.workerNotes}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Još nema istorije.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
