import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireCompleteClientProfile } from "@/lib/auth/profile-completion";
import { getDb, schema } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";
import { PortalHero } from "@/components/portal/PortalHero";

const STATUS_SR: Record<string, string> = {
  pending: "Na čekanju",
  confirmed: "Potvrđeno",
  completed: "Završeno",
  cancelled: "Otkazano",
  no_show: "Nije se pojavio",
};

export default async function DashboardPage() {
  const { user } = await requireCompleteClientProfile();

  const db = getDb();
  const vehicles = await db
    .select()
    .from(schema.vehicles)
    .where(eq(schema.vehicles.userId, user.id))
    .orderBy(desc(schema.vehicles.createdAt));

  const bookings = await db
    .select({
      booking: schema.bookings,
      vehicle: schema.vehicles,
      service: schema.services,
    })
    .from(schema.bookings)
    .innerJoin(schema.vehicles, eq(schema.bookings.vehicleId, schema.vehicles.id))
    .innerJoin(schema.services, eq(schema.bookings.serviceId, schema.services.id))
    .where(eq(schema.bookings.userId, user.id))
    .orderBy(desc(schema.bookings.startsAt));

  const now = Date.now();
  const upcoming = bookings.find((b) => new Date(b.booking.startsAt).getTime() > now) || null;
  const history = bookings.filter((b) => new Date(b.booking.startsAt).getTime() <= now).slice(0, 5);

  return (
    <div className="space-y-6">
      <PortalHero
        eyebrow="Korisnički portal"
        title="Pregled"
        description="Vaša vozila, termini i napomene servisera — sve na jednom mestu."
        imageSrc="/assets/images/tehnickinocu.jpg"
        right={
          <>
            <Button asChild>
              <Link href="/bookings/new">Zakaži termin</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/vehicles">Vozila</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Vozila</CardTitle>
            <CardDescription>
              {vehicles.length
                ? `Ukupno: ${vehicles.length}`
                : "Dodajte vozilo kako biste mogli da zakažete termin."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/vehicles">Otvori</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader>
            <CardTitle>Termini</CardTitle>
            <CardDescription>
              {upcoming
                ? `Sledeći: ${new Date(upcoming.booking.startsAt).toLocaleString("sr-RS", {
                    timeZone: "Europe/Belgrade",
                    weekday: "short",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Nema zakazanih termina."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild variant="secondary">
              <Link href="/bookings/new">Zakaži</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/bookings">Svi termini</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass md:col-span-2">
          <CardHeader>
            <CardTitle>Sledeći termin</CardTitle>
            <CardDescription>Detalji vašeg narednog termina.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcoming ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Usluga: </span>
                  <span className="font-medium">{upcoming.service.name}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Vozilo: </span>
                  <span className="font-medium">
                    {upcoming.vehicle.make} ({upcoming.vehicle.year})
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Vreme: </span>
                  <span className="font-medium">
                    {new Date(upcoming.booking.startsAt).toLocaleString("sr-RS", {
                      timeZone: "Europe/Belgrade",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Status: </span>
                  <span className="font-medium">
                    {STATUS_SR[upcoming.booking.status] ?? upcoming.booking.status}
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Nemate zakazan termin.</p>
                <Button asChild>
                  <Link href="/bookings/new">Zakaži termin</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Istorija</CardTitle>
            <CardDescription>Poslednjih 5 poseta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.length ? (
              history.map((h) => (
                <div key={h.booking.id} className="rounded-md border bg-background/30 p-3">
                  <p className="text-sm font-medium">{h.service.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(h.booking.startsAt).toLocaleDateString("sr-RS", {
                      timeZone: "Europe/Belgrade",
                    })}{" "}
                    · {h.vehicle.make} ({h.vehicle.year})
                  </p>
                  {h.booking.workerNotes ? (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-3">
                      Napomena servisera: {h.booking.workerNotes}
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
