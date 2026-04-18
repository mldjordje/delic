"use client";

import { useEffect, useState } from "react";

type Vehicle = {
  id: string;
  make: string;
  year: number;
  registrationExpiresOn: string;
};

export function NalogClient() {
  const [profile, setProfile] = useState<{ fullName: string | null } | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  async function load() {
    const r = await fetch("/api/me/profile", { credentials: "include" });
    const j = await r.json();
    if (!r.ok) {
      window.location.href = "/prijava";
      return;
    }
    setProfile(j.profile);
    setFullName(j.profile?.fullName || "");
    const u = j.user;
    setPhone(u?.phone || "");
    const rv = await fetch("/api/me/vehicles", { credentials: "include" });
    const vj = await rv.json();
    if (rv.ok) {
      setVehicles(vj.vehicles || []);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/me/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone }),
    });
    const j = await r.json();
    if (!r.ok) {
      setError(j.message || "Greška");
      return;
    }
    setProfile(j.profile);
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-xl font-semibold text-white">Profil</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={saveProfile}>
          <label className="text-sm text-slate-300">
            Ime i prezime
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>
          <label className="text-sm text-slate-300">
            Telefon
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Sačuvaj
            </button>
          </div>
        </form>
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-xl font-semibold text-white">Moja vozila</h2>
        <ul className="mt-4 space-y-2 text-slate-300">
          {vehicles.map((v) => (
            <li key={v.id} className="flex justify-between rounded-lg border border-slate-800 px-3 py-2">
              <span>
                {v.make} ({v.year}) — reg. do {v.registrationExpiresOn}
              </span>
            </li>
          ))}
          {vehicles.length === 0 ? <li className="text-slate-500">Nema vozila — dodajte na stranici zakazivanja.</li> : null}
        </ul>
      </section>
    </div>
  );
}
