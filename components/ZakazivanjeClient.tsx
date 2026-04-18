"use client";

import { useEffect, useState } from "react";

type Vehicle = {
  id: string;
  make: string;
  year: number;
};

type Slot = { startAt: string; endAt: string; available: boolean };

export function ZakazivanjeClient() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [newMake, setNewMake] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newReg, setNewReg] = useState("");

  async function ensureAuth() {
    const r = await fetch("/api/me/profile", { credentials: "include" });
    if (!r.ok) {
      window.location.href = "/prijava";
      return false;
    }
    return true;
  }

  async function loadVehicles() {
    const r = await fetch("/api/me/vehicles", { credentials: "include" });
    const j = await r.json();
    if (r.ok) {
      setVehicles(j.vehicles || []);
      if (j.vehicles?.[0]?.id) {
        setVehicleId(j.vehicles[0].id);
      }
    }
  }

  useEffect(() => {
    void (async () => {
      if (!(await ensureAuth())) {
        return;
      }
      await loadVehicles();
    })();
  }, []);

  useEffect(() => {
    if (!date) {
      return;
    }
    void (async () => {
      setLoading(true);
      setSelectedStart(null);
      const r = await fetch(`/api/bookings/availability?date=${encodeURIComponent(date)}`, {
        credentials: "include",
      });
      const j = await r.json();
      setLoading(false);
      if (!r.ok) {
        setMsg(j.message || "Greška pri terminima");
        setSlots([]);
        return;
      }
      setSlots(j.slots || []);
      setMsg(null);
    })();
  }, [date]);

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
    if (!vehicleId || !selectedStart) {
      setMsg("Izaberite vozilo i termin.");
      return;
    }
    setLoading(true);
    const r = await fetch("/api/bookings", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId,
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
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold text-white">Dodaj vozilo</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={addVehicle}>
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="Marka"
            value={newMake}
            onChange={(e) => setNewMake(e.target.value)}
          />
          <input
            type="number"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            value={newYear}
            onChange={(e) => setNewYear(Number(e.target.value))}
          />
          <input
            type="date"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            value={newReg}
            onChange={(e) => setNewReg(e.target.value)}
          />
          <div className="md:col-span-3">
            <button
              type="submit"
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
            >
              Sačuvaj vozilo
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold text-white">Termin (30 min)</h2>
        <form className="mt-4 space-y-4" onSubmit={submitBooking}>
          <label className="block text-sm text-slate-300">
            Vozilo
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
            >
              <option value="">— izaberite —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} ({v.year})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            Datum
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <div className="text-sm text-slate-400">
            {loading ? "Učitavam slobodne termine…" : null}
          </div>

          <div className="flex flex-wrap gap-2">
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
                    className={`rounded-full border px-3 py-1 text-sm ${
                      active
                        ? "border-emerald-400 bg-emerald-600 text-white"
                        : "border-slate-600 text-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
          </div>

          <button
            type="submit"
            disabled={loading || !selectedStart}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            Pošalji zahtev
          </button>
        </form>
        {msg ? <p className="mt-4 text-sm text-slate-200">{msg}</p> : null}
      </section>
    </div>
  );
}
