"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditVehicleDialog, type VehicleEdit } from "@/components/portal/EditVehicleDialog";

export function VehiclesListClient({ vehicles }: { vehicles: VehicleEdit[] }) {
  const router = useRouter();
  const now = Date.now();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {vehicles.map((v) => {
        const regMs = new Date(v.registrationExpiresOn).getTime();
        const regDaysLeft = Math.ceil((regMs - now) / (1000 * 60 * 60 * 24));
        const regTone =
          regDaysLeft <= 14 ? "border-destructive/40" : regDaysLeft <= 30 ? "border-primary/40" : "border-border";

        const lpgMs = v.lpgMethaneCertificateExpiresOn ? new Date(v.lpgMethaneCertificateExpiresOn).getTime() : null;
        const lpgDaysLeft = lpgMs ? Math.ceil((lpgMs - now) / (1000 * 60 * 60 * 24)) : null;

        return (
          <Card key={v.id} className={`glass ${regTone}`}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle>{v.make}</CardTitle>
                  <CardDescription>{v.year}</CardDescription>
                </div>
                <EditVehicleDialog
                  vehicle={v}
                  onSaved={() => {
                    router.refresh();
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border bg-background/30 p-3">
                <p className="text-xs text-muted-foreground">Osnovno</p>
                <p className="mt-1 text-sm font-medium">
                  {v.plateNumber ? v.plateNumber : "—"} · {v.fuelType ? v.fuelType : "—"}
                </p>
                {v.model ? <p className="mt-1 text-xs text-muted-foreground">Model: {v.model}</p> : null}
              </div>

              <div className="rounded-md border bg-background/30 p-3">
                <p className="text-xs text-muted-foreground">Istek registracije</p>
                <p className="mt-1 text-sm font-medium">
                  {v.registrationExpiresOn}{" "}
                  <span className="text-xs text-muted-foreground">({regDaysLeft > 0 ? `još ${regDaysLeft} d` : "istekla"})</span>
                </p>
              </div>

              {v.hasLpgOrMethane ? (
                <div className="rounded-md border bg-background/30 p-3">
                  <p className="text-xs text-muted-foreground">Gas / attest</p>
                  <p className="mt-1 text-sm font-medium">
                    {v.lpgMethaneCertificateExpiresOn || "—"}{" "}
                    {lpgDaysLeft != null ? (
                      <span className="text-xs text-muted-foreground">({lpgDaysLeft > 0 ? `još ${lpgDaysLeft} d` : "istekao"})</span>
                    ) : null}
                  </p>
                </div>
              ) : null}

              <Button asChild variant="outline" size="sm">
                <Link href="/bookings/new">Zakaži za ovo vozilo</Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

