"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BookingDateGrid } from "@/components/booking/BookingDateGrid";

type Vehicle = {
  id: string;
  make: string;
  year: number;
  registrationExpiresOn: string;
  hasLpgOrMethane: boolean;
  lpgMethaneCertificateExpiresOn: string | null;
};

type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceRsd: number;
};

type Slot = { startAt: string; endAt: string; available: boolean };

type Step = "vehicle" | "service" | "time";

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
  // date: YYYY-MM-DD
  const d = new Date(`${date}T12:00:00.000Z`);
  return d.toLocaleDateString("sr-RS", {
    timeZone: "Europe/Belgrade",
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function badgeTone(daysLeft: number) {
  if (daysLeft <= 14) return "border-destructive/50 text-destructive";
  if (daysLeft <= 30) return "border-primary/50 text-primary";
  return "border-border text-muted-foreground";
}

export function BookingFlow() {
  const [step, setStep] = useState<Step>("vehicle");

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string>("");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string>("");

  const [date, setDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedStartAt, setSelectedStartAt] = useState<string>("");

  const [busy, setBusy] = useState(false);
  const [slotsBusy, setSlotsBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || null,
    [services, serviceId]
  );
  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === vehicleId) || null,
    [vehicles, vehicleId]
  );

  useEffect(() => {
    void (async () => {
      const [rs, rv] = await Promise.all([
        fetch("/api/services").catch(() => null),
        fetch("/api/me/vehicles", { credentials: "include" }).catch(() => null),
      ]);

      if (rs) {
        const js = await rs.json().catch(() => null);
        if (rs.ok && js?.services?.length) {
          const list = js.services as Service[];
          setServices(list);
          setServiceId((prev) => prev || list[0].id);
        }
      }

      if (rv) {
        const vj = await rv.json().catch(() => null);
        if (rv.ok && vj?.vehicles) {
          const list = vj.vehicles as Vehicle[];
          setVehicles(list);
          setVehicleId((prev) => prev || list[0]?.id || "");
        }
      }
    })();
  }, []);

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
        setMessage({ tone: "warn", text: j?.message || "Greška pri terminima." });
        return;
      }
      setSlots((j?.slots as Slot[]) || []);
    })();
  }, [date, serviceId]);

  async function submit() {
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
    setMessage({ tone: "ok", text: "Zahtev je poslat. Proverite email." });
    setSelectedStartAt("");
  }

  const canGoService = Boolean(vehicleId);
  const canGoTime = Boolean(vehicleId && serviceId);
  const canSubmit = Boolean(vehicleId && serviceId && date && selectedStartAt && !busy);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={step === "vehicle" ? "default" : "outline"}
          onClick={() => setStep("vehicle")}
        >
          1. Vehicle
        </Button>
        <Button
          type="button"
          variant={step === "service" ? "default" : "outline"}
          onClick={() => canGoService && setStep("service")}
          disabled={!canGoService}
        >
          2. Service
        </Button>
        <Button
          type="button"
          variant={step === "time" ? "default" : "outline"}
          onClick={() => canGoTime && setStep("time")}
          disabled={!canGoTime}
        >
          3. Time
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {step === "vehicle" ? (
          <motion.div
            key="vehicle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Choose a vehicle</p>
                <p className="mt-1 text-sm text-muted-foreground">We’ll use it for the booking and reminders.</p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setStep("service")} disabled={!canGoService}>
                Continue
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {vehicles.map((v) => {
                const active = vehicleId === v.id;
                const daysLeft = Math.ceil(
                  (new Date(v.registrationExpiresOn).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <button
                    key={v.id}
                    type="button"
                    className={cn(
                      "glass rounded-lg p-4 text-left transition-colors",
                      active ? "ring-2 ring-ring" : "hover:bg-accent/20"
                    )}
                    onClick={() => setVehicleId(v.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{v.make}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{v.year}</p>
                      </div>
                      <span className={cn("rounded-md border px-2 py-1 text-xs", badgeTone(daysLeft))}>
                        Reg {daysLeft > 0 ? `${daysLeft}d` : "expired"}
                      </span>
                    </div>
                    {v.hasLpgOrMethane ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        LPG: {v.lpgMethaneCertificateExpiresOn ? v.lpgMethaneCertificateExpiresOn : "—"}
                      </p>
                    ) : null}
                  </button>
                );
              })}

              {vehicles.length === 0 ? (
                <Card className="glass p-4 md:col-span-2">
                  <p className="text-sm font-medium">No vehicles yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add a vehicle first (we’ll add this in the Vehicles page next).
                  </p>
                </Card>
              ) : null}
            </div>
          </motion.div>
        ) : null}

        {step === "service" ? (
          <motion.div
            key="service"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Choose a service</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedVehicle ? `${selectedVehicle.make} (${selectedVehicle.year})` : "—"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep("vehicle")}>
                  Back
                </Button>
                <Button type="button" variant="secondary" onClick={() => setStep("time")} disabled={!serviceId}>
                  Continue
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {services.map((s) => {
                const active = serviceId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={cn(
                      "glass rounded-lg p-4 text-left transition-colors",
                      active ? "ring-2 ring-ring" : "hover:bg-accent/20"
                    )}
                    onClick={() => setServiceId(s.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{s.name}</p>
                        {s.description ? (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                        ) : null}
                      </div>
                      <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                        {s.durationMin}m
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">{formatMoneyRsd(s.priceRsd)}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}

        {step === "time" ? (
          <motion.div
            key="time"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Pick date & time</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedService ? `${selectedService.name} · ${selectedService.durationMin} min` : "—"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep("service")}>
                  Back
                </Button>
                <Button type="button" onClick={() => void submit()} disabled={!canSubmit}>
                  {busy ? "Sending…" : "Send request"}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[280px_1fr]">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Date</p>
                <BookingDateGrid serviceId={serviceId} value={date} onChange={(d) => setDate(d)} />
                {date ? (
                  <p className="text-xs text-muted-foreground">{dayLabel(date)}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Choose a day to see slots.</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Available slots</p>
                  <p className="text-xs text-muted-foreground">
                    {slotsBusy ? "Loading…" : `${slots.filter((s) => s.available).length} available`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {slots
                    .filter((s) => s.available)
                    .map((s) => {
                      const active = selectedStartAt === s.startAt;
                      return (
                        <Button
                          key={s.startAt}
                          type="button"
                          variant={active ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedStartAt(s.startAt)}
                        >
                          {timeHHMM(s.startAt)}
                        </Button>
                      );
                    })}
                  {!slotsBusy && date && slots.filter((s) => s.available).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No slots available for this day. Try another date.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {message ? (
              <div
                className={cn(
                  "glass rounded-lg p-4 text-sm",
                  message.tone === "ok" ? "border border-emerald-500/30" : "border border-amber-500/30"
                )}
              >
                {message.text}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

