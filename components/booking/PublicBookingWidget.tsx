"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BookingDateGrid } from "@/components/booking/BookingDateGrid";

type Vehicle = {
  id: string;
  make: string;
  year: number;
};

type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceRsd: number;
};

type Slot = { startAt: string; endAt: string; available: boolean };

const googleHref = `/api/auth/google?next=${encodeURIComponent("/dashboard")}`;

function formatMoneyRsd(value: number) {
  if (!value) return "Cena po dogovoru";
  return `${value.toLocaleString("sr-RS")} RSD`;
}

function timeHHMM(iso: string) {
  return new Date(iso).toLocaleTimeString("sr-RS", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Belgrade",
  });
}

function dayLabel(date: string) {
  const d = new Date(`${date}T12:00:00.000Z`);
  return d.toLocaleDateString("sr-RS", {
    timeZone: "Europe/Belgrade",
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function PublicBookingWidget({ className }: { className?: string }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState("");

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedStartAt, setSelectedStartAt] = useState<string>("");

  const [newMake, setNewMake] = useState("");
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [newPlateNumber, setNewPlateNumber] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newFuelType, setNewFuelType] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newVin, setNewVin] = useState("");
  const [newEngineCc, setNewEngineCc] = useState<number | "">("");
  const [newPowerKw, setNewPowerKw] = useState<number | "">("");
  const [newReg, setNewReg] = useState("");
  const [newHasLpgOrMethane, setNewHasLpgOrMethane] = useState(false);
  const [newLpgMethaneCertificateExpiresOn, setNewLpgMethaneCertificateExpiresOn] = useState("");

  const [message, setMessage] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [slotsBusy, setSlotsBusy] = useState(false);
  const [vehiclesBusy, setVehiclesBusy] = useState(false);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || null,
    [services, serviceId]
  );

  useEffect(() => {
    void (async () => {
      const rs = await fetch("/api/services").catch(() => null);
      if (rs) {
        const js = await rs.json().catch(() => null);
        if (rs.ok && js?.services?.length) {
          const list = js.services as Service[];
          setServices(list);
          setServiceId((prev) => prev || list[0].id);
        }
      }

      const rp = await fetch("/api/me/profile", { credentials: "include" }).catch(() => null);
      setLoggedIn(Boolean(rp?.ok));
      setAuthChecked(true);
    })();
  }, []);

  async function loadVehicles() {
    setVehiclesBusy(true);
    const r = await fetch("/api/me/vehicles", { credentials: "include" });
    const j = await r.json().catch(() => null);
    setVehiclesBusy(false);
    if (!r.ok) {
      setMessage({ tone: "warn", text: j?.message || "Greška pri učitavanju vozila." });
      return;
    }
    const list = (j?.vehicles || []) as Vehicle[];
    setVehicles(list);
    setVehicleId((prev) => prev || list[0]?.id || "");
  }

  useEffect(() => {
    if (!loggedIn || !authChecked) return;
    void loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when session becomes available
  }, [loggedIn, authChecked]);

  useEffect(() => {
    if (!date || !serviceId) {
      setSlots([]);
      setSelectedStartAt("");
      return;
    }
    void (async () => {
      setSlotsBusy(true);
      setMessage(null);
      setSelectedStartAt("");
      const r = await fetch(
        `/api/bookings/availability?date=${encodeURIComponent(date)}&serviceId=${encodeURIComponent(serviceId)}`,
        { credentials: "include" }
      );
      const j = await r.json().catch(() => null);
      setSlotsBusy(false);
      if (!r.ok) {
        setSlots([]);
        setMessage({ tone: "warn", text: j?.message || "Greška pri učitavanju termina." });
        return;
      }
      setSlots((j?.slots as Slot[]) || []);
    })();
  }, [date, serviceId]);

  async function addVehicle(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!newMake.trim() || !newReg) {
      setMessage({ tone: "warn", text: "Marka i datum isteka registracije su obavezni." });
      return;
    }
    if (!newPlateNumber.trim()) {
      setMessage({ tone: "warn", text: "Unesite registarsku oznaku." });
      return;
    }
    if (!newFuelType) {
      setMessage({ tone: "warn", text: "Izaberite vrstu goriva." });
      return;
    }
    if (!newColor.trim()) {
      setMessage({ tone: "warn", text: "Unesite boju vozila." });
      return;
    }
    if (newEngineCc === "" || newEngineCc <= 0) {
      setMessage({ tone: "warn", text: "Unesite zapreminu motora (cc)." });
      return;
    }
    if (newPowerKw === "" || newPowerKw <= 0) {
      setMessage({ tone: "warn", text: "Unesite snagu motora (kW)." });
      return;
    }
    if (newHasLpgOrMethane && !newLpgMethaneCertificateExpiresOn) {
      setMessage({ tone: "warn", text: "Unesite datum isteka atesta za gas." });
      return;
    }
    setBusy(true);
    const r = await fetch("/api/me/vehicles", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        make: newMake.trim(),
        plateNumber: newPlateNumber.trim().toUpperCase(),
        model: newModel.trim() || null,
        fuelType: newFuelType,
        color: newColor.trim(),
        vin: newVin.trim() || null,
        engineCc: newEngineCc,
        powerKw: String(newPowerKw),
        year: newYear,
        registrationExpiresOn: newReg,
        hasLpgOrMethane: newHasLpgOrMethane,
        lpgMethaneCertificateExpiresOn: newHasLpgOrMethane ? newLpgMethaneCertificateExpiresOn : null,
      }),
    });
    const j = await r.json().catch(() => null);
    setBusy(false);
    if (!r.ok) {
      setMessage({ tone: "warn", text: j?.message || "Greška pri čuvanju vozila." });
      return;
    }
    setNewMake("");
    setNewPlateNumber("");
    setNewModel("");
    setNewFuelType("");
    setNewColor("");
    setNewVin("");
    setNewEngineCc("");
    setNewPowerKw("");
    await loadVehicles();
    setVehicleId(j?.vehicle?.id || "");
    setMessage({ tone: "ok", text: "Vozilo je sačuvano." });
  }

  async function submitBooking() {
    if (!vehicleId || !serviceId || !selectedStartAt) return;
    setBusy(true);
    setMessage(null);
    const r = await fetch("/api/bookings", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId,
        serviceId,
        startAt: selectedStartAt,
      }),
    });
    const j = await r.json().catch(() => null);
    setBusy(false);
    if (!r.ok) {
      setMessage({ tone: "warn", text: j?.message || "Greška pri zakazivanju." });
      return;
    }
    setSelectedStartAt("");
    setMessage({ tone: "ok", text: "Zahtev je poslat. Proverite email." });
  }

  const canSeeBookingFlow = Boolean(loggedIn);
  const canSubmit = Boolean(vehicleId && serviceId && date && selectedStartAt && !busy);

  return (
    <div className={cn("space-y-4", className)}>
      {!authChecked ? (
        <Card className="glass p-5">
          <p className="text-sm text-muted-foreground">Učitavanje…</p>
        </Card>
      ) : null}

      {authChecked && !loggedIn ? (
        <Card className="glass p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Prijavite se da zakažete</p>
              <p className="text-sm text-muted-foreground" style={{ maxWidth: 680 }}>
                Zakazivanje je vezano za vaš nalog i vozila. Prijava je brza — Google nalog, a vozila možete kasnije
                menjati u delu „Moj nalog”.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <a href={googleHref}>Prijava Google nalogom</a>
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="glass p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold">1. Izaberite uslugu</p>
            <p className="text-sm text-muted-foreground">Trajanje i cena važe za izabrani termin.</p>
          </div>
          {selectedService ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selectedService.durationMin} min</span> ·{" "}
              {formatMoneyRsd(selectedService.priceRsd)}
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {services.map((s) => {
            const active = serviceId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                className={cn(
                  "rounded-sm border p-4 text-left transition-colors",
                  "bg-background/40 hover:bg-accent/30",
                  active
                    ? "border-primary/70 ring-2 ring-primary/45 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]"
                    : "border-border"
                )}
                onClick={() => {
                  setServiceId(s.id);
                  setSelectedStartAt("");
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{s.name}</p>
                    {s.description ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                    {s.durationMin}m
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{formatMoneyRsd(s.priceRsd)}</p>
              </button>
            );
          })}
          {services.length === 0 ? (
            <p className="text-sm text-destructive md:col-span-2">Nema aktivnih usluga. Kontaktirajte salon.</p>
          ) : null}
        </div>
      </Card>

      {canSeeBookingFlow ? (
        <>
          <Card className="glass p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold">2. Vozilo</p>
                <p className="text-sm text-muted-foreground">Izaberite vozilo ili dodajte novo.</p>
              </div>
              <div className="text-xs text-muted-foreground">{vehiclesBusy ? "Učitavam…" : `${vehicles.length} vozila`}</div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <label className="space-y-2">
                <span className="text-xs text-muted-foreground">Vaše vozilo</span>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className={cn(
                    "h-10 w-full rounded-md border border-input bg-background/40 px-3 text-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  )}
                >
                  <option value="">— izaberite —</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} ({v.year})
                    </option>
                  ))}
                </select>
              </label>
              <Button type="button" variant="secondary" onClick={() => void loadVehicles()} disabled={vehiclesBusy}>
                Osveži
              </Button>
            </div>

            <details className="mt-4 rounded-lg border border-border/60 bg-background/20 p-4">
              <summary className="cursor-pointer select-none text-sm font-medium">Dodaj vozilo</summary>
              <form className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_140px_200px_auto]" onSubmit={addVehicle}>
                <label className="space-y-2">
                  <span className="text-xs text-muted-foreground">Marka</span>
                  <Input value={newMake} onChange={(e) => setNewMake(e.target.value)} placeholder="npr. Volkswagen" />
                </label>
                <label className="space-y-2">
                  <span className="text-xs text-muted-foreground">Tablice</span>
                  <Input value={newPlateNumber} onChange={(e) => setNewPlateNumber(e.target.value)} placeholder="NI-123-AB" />
                </label>
                <label className="space-y-2">
                  <span className="text-xs text-muted-foreground">Godište</span>
                  <Input
                    type="number"
                    min={1950}
                    max={new Date().getFullYear() + 1}
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs text-muted-foreground">Istek registracije</span>
                  <Input type="date" value={newReg} onChange={(e) => setNewReg(e.target.value)} />
                </label>
                <div className="md:pt-6">
                  <Button type="submit" disabled={busy}>
                    {busy ? "Čuvam…" : "Sačuvaj"}
                  </Button>
                </div>
              </form>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs text-muted-foreground">Model (opciono)</span>
                  <Input value={newModel} onChange={(e) => setNewModel(e.target.value)} placeholder="Golf / Passat..." />
                </label>
                <label className="space-y-2">
                  <span className="text-xs text-muted-foreground">Gorivo</span>
                  <select
                    value={newFuelType}
                    onChange={(e) => setNewFuelType(e.target.value)}
                    className={cn(
                      "h-10 w-full rounded-md border border-input bg-background/40 px-3 text-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    )}
                  >
                    <option value="">— izaberite —</option>
                    <option value="petrol">Benzin</option>
                    <option value="diesel">Dizel</option>
                    <option value="hybrid">Hibrid</option>
                    <option value="ev">Električno</option>
                    <option value="lpg">LPG</option>
                    <option value="cng">CNG</option>
                    <option value="other">Drugo</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-xs text-muted-foreground">Boja</span>
                  <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="npr. crna" />
                </label>
                <label className="space-y-2">
                  <span className="text-xs text-muted-foreground">Zapremina (cc)</span>
                  <Input
                    type="number"
                    min={50}
                    value={newEngineCc}
                    onChange={(e) => setNewEngineCc(e.target.value ? Number(e.target.value) : "")}
                    placeholder="npr. 1968"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs text-muted-foreground">Snaga (kW)</span>
                  <Input
                    type="number"
                    min={1}
                    value={newPowerKw}
                    onChange={(e) => setNewPowerKw(e.target.value ? Number(e.target.value) : "")}
                    placeholder="npr. 110"
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs text-muted-foreground">VIN (opciono)</span>
                  <Input value={newVin} onChange={(e) => setNewVin(e.target.value)} placeholder="npr. WVWZZZ..." />
                </label>

                <div className="md:col-span-2 flex items-center gap-2 rounded-md border border-border/60 bg-background/20 p-3">
                  <input
                    id="newHasLpg"
                    type="checkbox"
                    checked={newHasLpgOrMethane}
                    onChange={(e) => setNewHasLpgOrMethane(e.target.checked)}
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  <label htmlFor="newHasLpg" className="cursor-pointer text-sm text-muted-foreground">
                    Vozilo ima LPG/CNG (atest)
                  </label>
                </div>

                {newHasLpgOrMethane ? (
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs text-muted-foreground">Istek atesta za gas</span>
                    <Input
                      type="date"
                      value={newLpgMethaneCertificateExpiresOn}
                      onChange={(e) => setNewLpgMethaneCertificateExpiresOn(e.target.value)}
                    />
                  </label>
                ) : null}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Ako niste sigurni za cc/kW, pogledajte saobraćajnu dozvolu ili specifikaciju vozila.
              </p>
            </details>
          </Card>

          <Card className="glass p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold">3. Datum i termin</p>
                <p className="text-sm text-muted-foreground">
                  Slotovi su računati za izabranu uslugu{" "}
                  {selectedService ? (
                    <span className="font-medium text-foreground">
                      ({selectedService.durationMin} min)
                    </span>
                  ) : null}
                  .
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={() => void submitBooking()} disabled={!canSubmit}>
                  {busy ? "Šaljem…" : "Pošalji zahtev"}
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[280px_1fr]">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Datum</p>
                <BookingDateGrid
                  serviceId={serviceId}
                  value={date}
                  onChange={(d) => setDate(d)}
                />
                {date ? <p className="text-xs text-muted-foreground">{dayLabel(date)}</p> : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Slobodni termini</p>
                  <p className="text-xs text-muted-foreground">
                    {slotsBusy ? "…" : `${slots.filter((s) => s.available).length} slobodno`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {slotsBusy ? (
                    <p className="text-sm text-muted-foreground">Učitavam slobodne termine…</p>
                  ) : null}
                  {slots
                    .filter((s) => s.available)
                    .map((s) => {
                      const active = selectedStartAt === s.startAt;
                      return (
                        <Button
                          key={s.startAt}
                          type="button"
                          size="sm"
                          variant={active ? "default" : "outline"}
                          onClick={() => setSelectedStartAt(s.startAt)}
                        >
                          {timeHHMM(s.startAt)}
                        </Button>
                      );
                    })}
                  {!slotsBusy && date && slots.filter((s) => s.available).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nema slobodnih termina za taj dan.</p>
                  ) : null}
                  {!slotsBusy && !date ? (
                    <p className="text-sm text-muted-foreground">Prvo izaberite datum.</p>
                  ) : null}
                </div>
                {selectedStartAt ? (
                  <p className="text-xs text-muted-foreground">
                    Izabran termin: <span className="font-medium text-foreground">{timeHHMM(selectedStartAt)}</span>
                  </p>
                ) : null}
              </div>
            </div>
          </Card>
        </>
      ) : null}

      {message ? (
        <Card
          className={cn(
            "glass p-4 text-sm",
            message.tone === "ok" ? "border border-emerald-500/30" : "border border-amber-500/30"
          )}
        >
          {message.text}
        </Card>
      ) : null}
    </div>
  );
}

