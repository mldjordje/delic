"use client";

import { useEffect, useMemo, useState } from "react";

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

const googleHref = `/api/auth/google?next=${encodeURIComponent("/zakazivanje")}`;

export function ZakazivanjeClient() {
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState("");

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);

  const [newMake, setNewMake] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newReg, setNewReg] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );

  useEffect(() => {
    void (async () => {
      const rs = await fetch("/api/services");
      const js = await rs.json().catch(() => null);
      if (rs.ok && js?.services?.length) {
        const list = js.services as Service[];
        setServices(list);
        setServiceId((prev) => prev || list[0].id);
      }

      const rp = await fetch("/api/me/profile", { credentials: "include" });
      setLoggedIn(rp.ok);
      setAuthChecked(true);
    })();
  }, []);

  async function loadVehicles() {
    const r = await fetch("/api/me/vehicles", { credentials: "include" });
    const j = await r.json();
    if (r.ok) {
      setVehicles(j.vehicles || []);
      if (j.vehicles?.[0]?.id && !vehicleId) {
        setVehicleId(j.vehicles[0].id);
      }
    }
  }

  useEffect(() => {
    if (!loggedIn || !authChecked) {
      return;
    }
    void loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when session becomes available
  }, [loggedIn, authChecked]);

  useEffect(() => {
    if (!date || !serviceId) {
      setSlots([]);
      setSelectedStart(null);
      return;
    }
    void (async () => {
      setSlotsLoading(true);
      setSelectedStart(null);
      const r = await fetch(
        `/api/bookings/availability?date=${encodeURIComponent(date)}&serviceId=${encodeURIComponent(serviceId)}`,
        { credentials: "include" }
      );
      const j = await r.json();
      setSlotsLoading(false);
      if (!r.ok) {
        setMsg(j.message || "Greška pri terminima");
        setSlots([]);
        return;
      }
      setSlots(j.slots || []);
      setMsg(null);
    })();
  }, [date, serviceId]);

  async function addVehicle(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!newMake || !newReg) {
      setMsg("Marka i datum isteka registracije su obavezni.");
      return;
    }
    const r = await fetch("/api/me/vehicles", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        make: newMake,
        year: newYear,
        registrationExpiresOn: newReg,
        hasLpgOrMethane: false,
      }),
    });
    const j = await r.json();
    if (!r.ok) {
      setMsg(j.message || "Greška");
      return;
    }
    setNewMake("");
    await loadVehicles();
    setVehicleId(j.vehicle.id);
  }

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!vehicleId || !selectedStart || !serviceId) {
      setMsg("Izaberite uslugu, vozilo i termin.");
      return;
    }
    setLoading(true);
    const r = await fetch("/api/bookings", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId,
        serviceId,
        startAt: selectedStart,
      }),
    });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) {
      setMsg(j.message || "Greška");
      return;
    }
    setMsg("Zahtev je poslat. Proverite email.");
    setSelectedStart(null);
  }

  if (!authChecked) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center text-slate-400">
        Učitavanje…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {!loggedIn ? (
        <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950 p-8 md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <h2 className="text-2xl font-semibold text-white">Prijavite se da zakažete</h2>
          <p className="mt-3 max-w-xl text-slate-300">
            Zakazivanje je vezano za vaš nalog i vozila. Prijava je brza —{" "}
            <strong className="text-white">Sign in with Google</strong>, zatim dopunite profil i vozila u
            odeljku „Moj nalog”.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={googleHref}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-black/20 hover:bg-slate-100"
            >
              Sign in with Google
            </a>
            <a
              href="/prijava?next=%2Fzakazivanje"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-600 px-6 py-3.5 text-sm font-medium text-slate-200 hover:border-slate-400"
            >
              Prijava (OTP)
            </a>
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">1. Izaberite uslugu</h2>
            <p className="mt-1 text-sm text-slate-400">Trajanje i cena važe za izabrani termin.</p>
          </div>
          {selectedService ? (
            <p className="text-sm text-emerald-400/90">
              {selectedService.durationMin} min ·{" "}
              {selectedService.priceRsd > 0
                ? `${selectedService.priceRsd.toLocaleString("sr-RS")} RSD`
                : "Cena po dogovoru / u salunu"}
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {services.map((s) => {
            const active = serviceId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setServiceId(s.id);
                  setSelectedStart(null);
                }}
                className={`rounded-2xl border p-5 text-left transition ${
                  active
                    ? "border-emerald-500/60 bg-emerald-950/30 ring-2 ring-emerald-500/40"
                    : "border-slate-700 bg-slate-950/50 hover:border-slate-500"
                }`}
              >
                <p className="font-semibold text-white">{s.name}</p>
                {s.description ? <p className="mt-2 text-sm text-slate-400">{s.description}</p> : null}
                <p className="mt-3 text-xs text-slate-500">
                  {s.durationMin} min
                  {s.priceRsd > 0 ? ` · ${s.priceRsd.toLocaleString("sr-RS")} RSD` : ""}
                </p>
              </button>
            );
          })}
        </div>
        {services.length === 0 ? (
          <p className="mt-4 text-sm text-amber-200/90">Nema aktivnih usluga. Kontaktirajte salun.</p>
        ) : null}
      </section>

      {loggedIn ? (
        <>
          <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-white">2. Vozilo</h2>
            <p className="mt-1 text-sm text-slate-400">Izaberite registrovano vozilo ili dodajte novo.</p>

            <label className="mt-6 block text-sm text-slate-300">
              Vaše vozilo
              <select
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              >
                <option value="">— izaberite —</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} ({v.year})
                  </option>
                ))}
              </select>
            </label>

            <details className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <summary className="cursor-pointer text-sm font-medium text-slate-300">Dodaj vozilo</summary>
              <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={addVehicle}>
                <input
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  placeholder="Marka"
                  value={newMake}
                  onChange={(e) => setNewMake(e.target.value)}
                />
                <input
                  type="number"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  value={newYear}
                  onChange={(e) => setNewYear(Number(e.target.value))}
                />
                <input
                  type="date"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  value={newReg}
                  onChange={(e) => setNewReg(e.target.value)}
                />
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
                  >
                    Sačuvaj vozilo
                  </button>
                </div>
              </form>
            </details>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-white">3. Datum i termin</h2>
            <p className="mt-1 text-sm text-slate-400">
              Prikazani su slobodni slotovi za izabranu uslugu (trajanje {selectedService?.durationMin ?? "—"}{" "}
              min).
            </p>

            <label className="mt-6 block text-sm text-slate-300">
              Datum
              <input
                type="date"
                className="mt-2 w-full max-w-xs rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <div className="mt-4 text-sm text-slate-500">
              {slotsLoading ? "Učitavam slobodne termine…" : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {slots
                .filter((s) => s.available)
                .map((s) => {
                  const t = new Date(s.startAt).toLocaleTimeString("sr-RS", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Europe/Belgrade",
                  });
                  const active = selectedStart === s.startAt;
                  return (
                    <button
                      key={s.startAt}
                      type="button"
                      onClick={() => setSelectedStart(s.startAt)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "border-emerald-400 bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                          : "border-slate-600 text-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
            </div>

            <form className="mt-8" onSubmit={submitBooking}>
              <button
                type="submit"
                disabled={loading || !selectedStart || !vehicleId || !serviceId}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-500 hover:to-teal-500 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
              >
                {loading ? "Šaljem…" : "Pošalji zahtev za termin"}
              </button>
            </form>
          </section>
        </>
      ) : null}

      {msg ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            msg.includes("poslat")
              ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-100"
              : "border-amber-500/30 bg-amber-950/30 text-amber-100"
          }`}
        >
          {msg}
        </div>
      ) : null}
    </div>
  );
}
