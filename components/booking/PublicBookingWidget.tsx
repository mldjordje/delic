"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
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

type Slot = { startAt: string; endAt: string; available: boolean };

const googleHref = `/api/auth/google?next=${encodeURIComponent("/dashboard")}`;

const TEH_SLUG = "tehnicki-pregled";

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

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } },
};

export function PublicBookingWidget({ className }: { className?: string }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const [tehnickiId, setTehnickiId] = useState("");
  const [tehnickiDuration, setTehnickiDuration] = useState(30);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState("");

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedStartAt, setSelectedStartAt] = useState<string>("");

  const [addOpen, setAddOpen] = useState(false);
  const [newMake, setNewMake] = useState("");
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [newPlateNumber, setNewPlateNumber] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newFuelType, setNewFuelType] = useState("");
  const [newReg, setNewReg] = useState("");
  const [newHasLpgOrMethane, setNewHasLpgOrMethane] = useState(false);
  const [newLpgMethaneCertificateExpiresOn, setNewLpgMethaneCertificateExpiresOn] = useState("");

  const [message, setMessage] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [slotsBusy, setSlotsBusy] = useState(false);
  const [vehiclesBusy, setVehiclesBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const rs = await fetch("/api/services").catch(() => null);
      if (rs) {
        const js = await rs.json().catch(() => null);
        if (rs.ok && js?.services?.length) {
          const list = js.services as { id: string; slug: string | null; durationMin: number; calendarEnabled: boolean }[];
          const t =
            list.find((s) => s.calendarEnabled && s.slug === TEH_SLUG) ||
            list.find((s) => s.calendarEnabled);
          if (t) {
            setTehnickiId(t.id);
            setTehnickiDuration(t.durationMin);
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, authChecked]);

  useEffect(() => {
    if (!date || !tehnickiId) {
      setSlots([]);
      setSelectedStartAt("");
      return;
    }
    void (async () => {
      setSlotsBusy(true);
      setMessage(null);
      setSelectedStartAt("");
      const r = await fetch(
        `/api/bookings/availability?date=${encodeURIComponent(date)}&serviceId=${encodeURIComponent(tehnickiId)}`,
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
  }, [date, tehnickiId]);

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
    setNewReg("");
    setNewHasLpgOrMethane(false);
    setNewLpgMethaneCertificateExpiresOn("");
    setAddOpen(false);
    await loadVehicles();
    setVehicleId(j?.vehicle?.id || "");
    setMessage({ tone: "ok", text: "Vozilo je sačuvano." });
  }

  async function submitBooking() {
    if (!vehicleId || !selectedStartAt) return;
    setBusy(true);
    setMessage(null);
    const r = await fetch("/api/bookings", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId,
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
  const canSubmit = Boolean(vehicleId && tehnickiId && date && selectedStartAt && !busy);

  const selectClass = cn(
    "h-10 w-full rounded-md border border-input bg-background/40 px-3 text-sm",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  );

  return (
    <div className={cn("space-y-3", className)}>
      {!authChecked ? (
        <Card className="glass p-5">
          <p className="text-sm text-muted-foreground">Učitavanje…</p>
        </Card>
      ) : null}

      {authChecked && !loggedIn ? (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="glass p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Prijavite se da zakažete</p>
                <p className="text-sm text-muted-foreground max-w-lg">
                  Zakazivanje je vezano za vaš nalog i vozila. Prijava je brza — Google nalog.
                </p>
              </div>
              <Button asChild size="lg" className="shrink-0">
                <a href={googleHref}>Prijava Google nalogom</a>
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : null}

      {/* Korak 1 — Usluga */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
        <Card className="glass overflow-hidden">
          <div className="flex items-start gap-4 p-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary ring-1 ring-primary/30">
              1
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">Usluga</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Zakazujete isključivo{" "}
                <span className="font-semibold text-foreground">Tehnički pregled vozila</span>
                {tehnickiId
                  ? ` — trajanje na traci: ${tehnickiDuration} min.`
                  : " — učitavanje…"}
              </p>
              {!tehnickiId && authChecked ? (
                <p className="mt-2 text-sm text-destructive">
                  Usluga nije dostupna. Pokušajte kasnije ili nas pozovite.
                </p>
              ) : null}
            </div>
          </div>
        </Card>
      </motion.div>

      {canSeeBookingFlow ? (
        <>
          {/* Korak 2 — Vozilo */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <Card className="glass overflow-hidden">
              <div className="flex items-start gap-4 p-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary ring-1 ring-primary/30">
                  2
                </div>
                <div className="flex-1 min-w-0 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">Vozilo</p>
                      <p className="text-sm text-muted-foreground">Izaberite vozilo ili dodajte novo.</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        {vehiclesBusy ? "Učitavam…" : `${vehicles.length} vozila`}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void loadVehicles()}
                        disabled={vehiclesBusy}
                        className="h-7 w-7 p-0"
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5", vehiclesBusy && "animate-spin")} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <select
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                      className={cn(selectClass, "flex-1")}
                    >
                      <option value="">— izaberite vozilo —</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.make} ({v.year})
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 shrink-0"
                      onClick={() => setAddOpen((v) => !v)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {addOpen ? "Zatvori" : "Dodaj vozilo"}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {addOpen ? (
                      <motion.div
                        key="add-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <form
                          className="rounded-lg border border-border/50 bg-background/20 p-4 space-y-3"
                          onSubmit={addVehicle}
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Novo vozilo
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="space-y-1.5">
                              <span className="text-xs text-muted-foreground">Marka *</span>
                              <Input
                                value={newMake}
                                onChange={(e) => setNewMake(e.target.value)}
                                placeholder="npr. Volkswagen"
                              />
                            </label>
                            <label className="space-y-1.5">
                              <span className="text-xs text-muted-foreground">Model</span>
                              <Input
                                value={newModel}
                                onChange={(e) => setNewModel(e.target.value)}
                                placeholder="Golf / Passat…"
                              />
                            </label>
                            <label className="space-y-1.5">
                              <span className="text-xs text-muted-foreground">Tablice *</span>
                              <Input
                                value={newPlateNumber}
                                onChange={(e) => setNewPlateNumber(e.target.value)}
                                placeholder="NI-123-AB"
                              />
                            </label>
                            <label className="space-y-1.5">
                              <span className="text-xs text-muted-foreground">Godište</span>
                              <Input
                                type="number"
                                min={1950}
                                max={new Date().getFullYear() + 1}
                                value={newYear}
                                onChange={(e) => setNewYear(Number(e.target.value))}
                              />
                            </label>
                            <label className="space-y-1.5">
                              <span className="text-xs text-muted-foreground">Gorivo *</span>
                              <select
                                value={newFuelType}
                                onChange={(e) => setNewFuelType(e.target.value)}
                                className={selectClass}
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
                            <label className="space-y-1.5">
                              <span className="text-xs text-muted-foreground">Istek registracije *</span>
                              <Input
                                type="date"
                                value={newReg}
                                onChange={(e) => setNewReg(e.target.value)}
                              />
                            </label>
                          </div>

                          <div className="flex items-center gap-2 rounded-md border border-border/40 bg-background/20 p-2.5">
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

                          <AnimatePresence>
                            {newHasLpgOrMethane ? (
                              <motion.label
                                key="lpg-date"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="block space-y-1.5 overflow-hidden"
                              >
                                <span className="text-xs text-muted-foreground">Istek atesta za gas *</span>
                                <Input
                                  type="date"
                                  value={newLpgMethaneCertificateExpiresOn}
                                  onChange={(e) => setNewLpgMethaneCertificateExpiresOn(e.target.value)}
                                />
                              </motion.label>
                            ) : null}
                          </AnimatePresence>

                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <Button type="submit" disabled={busy}>
                              {busy ? "Čuvam…" : "Sačuvaj vozilo"}
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              Ostale detalje možete dopuniti u „Moj nalog".
                            </p>
                          </div>
                        </form>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Korak 3 — Datum i termin */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
            <Card className="glass overflow-hidden">
              <div className="flex items-start gap-4 p-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary ring-1 ring-primary/30">
                  3
                </div>
                <div className="flex-1 min-w-0 space-y-4">
                  <div>
                    <p className="font-semibold text-foreground">Datum i termin</p>
                    <p className="text-sm text-muted-foreground">
                      Slotovi za Tehnički pregled (traka {tehnickiDuration} min).
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-[280px_1fr]">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Datum</p>
                      <BookingDateGrid
                        serviceId={tehnickiId}
                        value={date}
                        onChange={(d) => setDate(d)}
                      />
                      {date ? (
                        <p className="text-xs text-muted-foreground">{dayLabel(date)}</p>
                      ) : null}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">Slobodni termini</p>
                        <p className="text-xs text-muted-foreground">
                          {slotsBusy ? "…" : `${slots.filter((s) => s.available).length} slobodno`}
                        </p>
                      </div>

                      {slotsBusy ? (
                        <p className="text-sm text-muted-foreground">Učitavam termine…</p>
                      ) : !date ? (
                        <p className="text-sm text-muted-foreground">Prvo izaberite datum.</p>
                      ) : slots.filter((s) => s.available).length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nema slobodnih termina za taj dan.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {slots
                            .filter((s) => s.available)
                            .map((s) => {
                              const active = selectedStartAt === s.startAt;
                              return (
                                <motion.div
                                  key={s.startAt}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.96 }}
                                >
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={active ? "default" : "outline"}
                                    onClick={() => setSelectedStartAt(s.startAt)}
                                  >
                                    {timeHHMM(s.startAt)}
                                  </Button>
                                </motion.div>
                              );
                            })}
                        </div>
                      )}

                      {selectedStartAt ? (
                        <p className="text-xs text-muted-foreground">
                          Izabran:{" "}
                          <span className="font-semibold text-foreground">
                            {timeHHMM(selectedStartAt)}
                          </span>
                          {date ? `, ${dayLabel(date)}` : ""}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t border-border/40 pt-4">
                    <Button
                      type="button"
                      size="lg"
                      onClick={() => void submitBooking()}
                      disabled={!canSubmit}
                      className="min-w-[160px]"
                    >
                      {busy ? "Šaljem…" : "Pošalji zahtev"}
                    </Button>
                    {!canSubmit && !busy ? (
                      <p className="text-xs text-muted-foreground">
                        {!vehicleId
                          ? "Izaberite vozilo."
                          : !date
                            ? "Izaberite datum."
                            : !selectedStartAt
                              ? "Izaberite termin."
                              : ""}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      ) : null}

      <AnimatePresence>
        {message ? (
          <motion.div
            key="msg"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={cn(
                "glass p-4 text-sm",
                message.tone === "ok"
                  ? "border border-emerald-500/40 text-emerald-400"
                  : "border border-amber-500/40 text-amber-400"
              )}
            >
              {message.text}
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
