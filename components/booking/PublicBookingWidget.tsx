"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RefreshCw, Car, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BookingDateGrid } from "@/components/booking/BookingDateGrid";

type Vehicle = { id: string; make: string; year: number };
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

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const selectClass =
  "h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-1 focus:ring-offset-background " +
  "transition-colors hover:border-white/20";

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
  const [newLpgCertExpires, setNewLpgCertExpires] = useState("");
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
          if (t) { setTehnickiId(t.id); setTehnickiDuration(t.durationMin); }
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
    if (!r.ok) { setMessage({ tone: "warn", text: j?.message || "Greška pri učitavanju vozila." }); return; }
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
    if (!date || !tehnickiId) { setSlots([]); setSelectedStartAt(""); return; }
    void (async () => {
      setSlotsBusy(true); setMessage(null); setSelectedStartAt("");
      const r = await fetch(
        `/api/bookings/availability?date=${encodeURIComponent(date)}&serviceId=${encodeURIComponent(tehnickiId)}`,
        { credentials: "include" }
      );
      const j = await r.json().catch(() => null);
      setSlotsBusy(false);
      if (!r.ok) { setSlots([]); setMessage({ tone: "warn", text: j?.message || "Greška pri učitavanju termina." }); return; }
      setSlots((j?.slots as Slot[]) || []);
    })();
  }, [date, tehnickiId]);

  async function addVehicle(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!newMake.trim() || !newReg) { setMessage({ tone: "warn", text: "Marka i datum isteka registracije su obavezni." }); return; }
    if (!newPlateNumber.trim()) { setMessage({ tone: "warn", text: "Unesite registarsku oznaku." }); return; }
    if (!newFuelType) { setMessage({ tone: "warn", text: "Izaberite vrstu goriva." }); return; }
    if (newHasLpgOrMethane && !newLpgCertExpires) { setMessage({ tone: "warn", text: "Unesite datum isteka atesta za gas." }); return; }
    setBusy(true);
    const r = await fetch("/api/me/vehicles", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        make: newMake.trim(), plateNumber: newPlateNumber.trim().toUpperCase(),
        model: newModel.trim() || null, fuelType: newFuelType, year: newYear,
        registrationExpiresOn: newReg, hasLpgOrMethane: newHasLpgOrMethane,
        lpgMethaneCertificateExpiresOn: newHasLpgOrMethane ? newLpgCertExpires : null,
      }),
    });
    const j = await r.json().catch(() => null);
    setBusy(false);
    if (!r.ok) { setMessage({ tone: "warn", text: j?.message || "Greška pri čuvanju vozila." }); return; }
    setNewMake(""); setNewPlateNumber(""); setNewModel(""); setNewFuelType("");
    setNewReg(""); setNewHasLpgOrMethane(false); setNewLpgCertExpires("");
    setAddOpen(false);
    await loadVehicles();
    setVehicleId(j?.vehicle?.id || "");
    setMessage({ tone: "ok", text: "Vozilo je sačuvano." });
  }

  async function submitBooking() {
    if (!vehicleId || !selectedStartAt) return;
    setBusy(true); setMessage(null);
    const r = await fetch("/api/bookings", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId, startAt: selectedStartAt }),
    });
    const j = await r.json().catch(() => null);
    setBusy(false);
    if (!r.ok) { setMessage({ tone: "warn", text: j?.message || "Greška pri zakazivanju." }); return; }
    setSelectedStartAt("");
    setMessage({ tone: "ok", text: "Zahtev je poslat! Proverite email za potvrdu." });
  }

  const canSubmit = Boolean(vehicleId && tehnickiId && date && selectedStartAt && !busy);
  const availableSlots = slots.filter((s) => s.available);

  return (
    <motion.div
      className={cn("space-y-4", className)}
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* Loading */}
      {!authChecked ? (
        <motion.div variants={slideUp}>
          <div className="rounded-2xl border border-white/8 bg-white/4 p-8 text-center">
            <p className="text-sm text-muted-foreground">Učitavanje…</p>
          </div>
        </motion.div>
      ) : null}

      {/* Prijava */}
      {authChecked && !loggedIn ? (
        <motion.div variants={slideUp}>
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card/80 to-card/60 p-6 shadow-lg shadow-black/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <p className="text-lg font-semibold text-foreground">Prijavite se za zakazivanje</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Brza prijava Google nalogom — vozila i termini vezani su za vaš profil.
                </p>
              </div>
              <Button asChild size="lg" className="shrink-0 gap-2 font-semibold shadow-md shadow-primary/20">
                <a href={googleHref}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  Prijava Google nalogom
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* ─── KORAK 1 — USLUGA ─── */}
      <motion.div variants={slideUp}>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card/95 to-card/70 shadow-lg shadow-black/20 backdrop-blur-sm">
          {/* zlatna linija na vrhu */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <div className="p-6 sm:p-8">
            {/* header */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">Korak 1 / 3</span>
                  {tehnickiId && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      <Clock className="h-3 w-3" />
                      {tehnickiDuration} min
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                  Tehnički pregled vozila
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Kompletan tehnički pregled na modernoj traci — kontrolišemo sve vitalne sisteme
                  vašeg vozila po važećim propisima.
                </p>
              </div>
            </div>

            {/* checklist */}
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
              {[
                "Kočioni sistem",
                "Svetlosna oprema",
                "Upravljanje i ovjesi",
                "Emisija izduvnih gasova",
                "Identifikacija vozila",
                "Tahograf",
                "Karoserija i vidljivost",
                "Bezbednosni pojasevi",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <span className="text-xs text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>

            {!tehnickiId && authChecked ? (
              <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                Usluga trenutno nije dostupna. Pokušajte ponovo ili nas pozovite.
              </p>
            ) : null}
          </div>
        </div>
      </motion.div>

      {loggedIn ? (
        <>
          {/* ─── KORAK 2 — VOZILO ─── */}
          <motion.div variants={slideUp}>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card/95 to-card/70 shadow-lg shadow-black/20 backdrop-blur-sm">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary/70">Korak 2 / 3</div>
                    <h3 className="text-xl font-bold text-foreground sm:text-2xl">Vaše vozilo</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Izaberite registrovano vozilo ili dodajte novo.</p>
                  </div>
                  <div className="flex items-center gap-2 self-end">
                    <span className="text-xs text-muted-foreground">
                      {vehiclesBusy ? "Učitavam…" : `${vehicles.length} vozila`}
                    </span>
                    <button
                      type="button"
                      onClick={() => void loadVehicles()}
                      disabled={vehiclesBusy}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/8 hover:text-foreground transition-colors disabled:opacity-40"
                    >
                      <RefreshCw className={cn("h-4 w-4", vehiclesBusy && "animate-spin")} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
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
                  <button
                    type="button"
                    onClick={() => setAddOpen((v) => !v)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                      addOpen
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    {addOpen ? "Zatvori" : "Dodaj vozilo"}
                  </button>
                </div>

                <AnimatePresence>
                  {addOpen ? (
                    <motion.div
                      key="add-vehicle"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28 }}
                      className="overflow-hidden"
                    >
                      <form
                        onSubmit={addVehicle}
                        className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Novo vozilo
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="space-y-1.5">
                            <span className="text-xs font-medium text-muted-foreground">Marka *</span>
                            <Input value={newMake} onChange={(e) => setNewMake(e.target.value)} placeholder="npr. Volkswagen" className="h-11 bg-white/5 border-white/10" />
                          </label>
                          <label className="space-y-1.5">
                            <span className="text-xs font-medium text-muted-foreground">Model</span>
                            <Input value={newModel} onChange={(e) => setNewModel(e.target.value)} placeholder="Golf / Passat…" className="h-11 bg-white/5 border-white/10" />
                          </label>
                          <label className="space-y-1.5">
                            <span className="text-xs font-medium text-muted-foreground">Tablice *</span>
                            <Input value={newPlateNumber} onChange={(e) => setNewPlateNumber(e.target.value)} placeholder="NI-123-AB" className="h-11 bg-white/5 border-white/10" />
                          </label>
                          <label className="space-y-1.5">
                            <span className="text-xs font-medium text-muted-foreground">Godište</span>
                            <Input type="number" min={1950} max={new Date().getFullYear() + 1} value={newYear} onChange={(e) => setNewYear(Number(e.target.value))} className="h-11 bg-white/5 border-white/10" />
                          </label>
                          <label className="space-y-1.5">
                            <span className="text-xs font-medium text-muted-foreground">Gorivo *</span>
                            <select value={newFuelType} onChange={(e) => setNewFuelType(e.target.value)} className={selectClass}>
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
                            <span className="text-xs font-medium text-muted-foreground">Istek registracije *</span>
                            <Input type="date" value={newReg} onChange={(e) => setNewReg(e.target.value)} className="h-11 bg-white/5 border-white/10" />
                          </label>
                        </div>

                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/8 bg-white/3 p-3">
                          <input
                            id="lpg-check"
                            type="checkbox"
                            checked={newHasLpgOrMethane}
                            onChange={(e) => setNewHasLpgOrMethane(e.target.checked)}
                            className="h-4 w-4 accent-[hsl(var(--primary))]"
                          />
                          <span className="text-sm text-muted-foreground">Vozilo ima LPG/CNG (atest)</span>
                        </label>

                        <AnimatePresence>
                          {newHasLpgOrMethane ? (
                            <motion.label
                              key="lpg-expires"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="block space-y-1.5 overflow-hidden"
                            >
                              <span className="text-xs font-medium text-muted-foreground">Istek atesta za gas *</span>
                              <Input type="date" value={newLpgCertExpires} onChange={(e) => setNewLpgCertExpires(e.target.value)} className="h-11 bg-white/5 border-white/10" />
                            </motion.label>
                          ) : null}
                        </AnimatePresence>

                        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-white/8">
                          <Button type="submit" disabled={busy} className="font-semibold">
                            {busy ? "Čuvam…" : "Sačuvaj vozilo"}
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Ostale detalje možete dopuniti u Moj nalog.
                          </p>
                        </div>
                      </form>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* ─── KORAK 3 — DATUM & TERMIN ─── */}
          <motion.div variants={slideUp}>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card/95 to-card/70 shadow-lg shadow-black/20 backdrop-blur-sm">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <div className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary/70">Korak 3 / 3</div>
                  <h3 className="text-xl font-bold text-foreground sm:text-2xl">Datum i termin</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Izaberite datum, a zatim slobodan termin za Tehnički pregled (traka {tehnickiDuration} min).
                  </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
                  {/* Kalendar */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">Odaberite datum</p>
                    <BookingDateGrid serviceId={tehnickiId} value={date} onChange={(d) => setDate(d)} />
                    {date ? (
                      <p className="text-xs text-primary/80 font-medium">{dayLabel(date)}</p>
                    ) : null}
                  </div>

                  {/* Termini */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Slobodni termini</p>
                      {date ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs font-medium text-muted-foreground">
                          {slotsBusy ? "…" : `${availableSlots.length} slobodno`}
                        </span>
                      ) : null}
                    </div>

                    {slotsBusy ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Učitavam termine…
                      </div>
                    ) : !date ? (
                      <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-center">
                        <p className="text-sm text-muted-foreground">Prvo izaberite datum na kalendaru.</p>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-center">
                        <p className="text-sm text-muted-foreground">Nema slobodnih termina za taj dan.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                        {availableSlots.map((s) => {
                          const active = selectedStartAt === s.startAt;
                          return (
                            <motion.button
                              key={s.startAt}
                              type="button"
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => setSelectedStartAt(s.startAt)}
                              className={cn(
                                "rounded-xl border py-3 text-sm font-semibold transition-all duration-200",
                                active
                                  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30"
                                  : "border-white/10 bg-white/5 text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                              )}
                            >
                              {timeHHMM(s.startAt)}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {selectedStartAt ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/8 px-4 py-2.5"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-sm text-foreground">
                          Izabran termin:{" "}
                          <span className="font-bold text-primary">{timeHHMM(selectedStartAt)}</span>
                          {date ? `, ${dayLabel(date)}` : ""}
                        </p>
                      </motion.div>
                    ) : null}
                  </div>
                </div>

                {/* Submit */}
                <div className="border-t border-white/8 pt-5">
                  <div className="flex flex-wrap items-center gap-4">
                    <motion.div whileHover={{ scale: canSubmit ? 1.02 : 1 }} whileTap={{ scale: canSubmit ? 0.98 : 1 }}>
                      <Button
                        type="button"
                        size="lg"
                        onClick={() => void submitBooking()}
                        disabled={!canSubmit}
                        className={cn(
                          "gap-2 px-8 py-3 text-base font-bold transition-all",
                          canSubmit && "shadow-lg shadow-primary/25"
                        )}
                      >
                        {busy ? "Šaljem zahtev…" : "Pošalji zahtev"}
                        {!busy && <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </motion.div>
                    {!canSubmit && !busy ? (
                      <p className="text-sm text-muted-foreground">
                        {!vehicleId
                          ? "↑ Izaberite vozilo (korak 2)"
                          : !date
                            ? "Izaberite datum na kalendaru"
                            : "Izaberite termin iz liste iznad"}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}

      {/* Poruka */}
      <AnimatePresence>
        {message ? (
          <motion.div
            key="msg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-sm backdrop-blur-sm",
                message.tone === "ok"
                  ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/8 text-amber-400"
              )}
            >
              {message.tone === "ok"
                ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                : <span className="text-base leading-none mt-0.5">⚠</span>
              }
              {message.text}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
