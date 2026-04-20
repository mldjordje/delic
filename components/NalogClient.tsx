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
    <div className="flex-container response-999" style={{ flexDirection: "column", gap: 40 }}>
      <section id="profil" className="dark-bg-2 client-card client-card-wide" style={{ margin: 0 }}>
        <h3 className="medium-title text-color-4">Profil</h3>
        <form className="top-margin-30" onSubmit={saveProfile}>
          <div className="flex-container response-999" style={{ gap: 24, flexWrap: "wrap" }}>
            <label className="p-style-bold-up text-color-4" style={{ flex: "1 1 220px", display: "block" }}>
              Ime i prezime
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </label>
            <label className="p-style-bold-up text-color-4" style={{ flex: "1 1 220px", display: "block" }}>
              Telefon
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                style={{ marginTop: 8 }}
              />
            </label>
          </div>
          <div className="top-margin-30">
            <div className="border-btn-box border-btn-red pointer-large">
              <div className="border-btn-inner">
                <button type="submit" className="border-btn" data-text="Sačuvaj profil">
                  Sačuvaj profil
                </button>
              </div>
            </div>
          </div>
        </form>
        {error ? (
          <p className="top-margin-20 p-style-bold-up" style={{ color: "#fca5a5", marginBottom: 0 }}>
            {error}
          </p>
        ) : null}
      </section>

      <section id="vozila" className="dark-bg-2 client-card client-card-wide" style={{ margin: 0 }}>
        <h3 className="medium-title text-color-4">Moja vozila</h3>
        <ul className="top-margin-20" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {vehicles.map((v) => (
            <li
              key={v.id}
              className="p-style-bold-up text-color-4 top-margin-15"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "12px 16px",
              }}
            >
              {v.make} ({v.year}) — reg. do {v.registrationExpiresOn}
            </li>
          ))}
          {vehicles.length === 0 ? (
            <li className="p-style-bold-up text-color-4" style={{ opacity: 0.75 }}>
              Nema vozila — dodajte na stranici zakazivanja.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
