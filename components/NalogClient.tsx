"use client";

import { useEffect, useState } from "react";

type Vehicle = {
  id: string;
  make: string;
  year: number;
  registrationExpiresOn: string;
  plateNumber: string | null;
  model: string | null;
  fuelType: string | null;
  color: string | null;
  vin: string | null;
  engineCc: number | null;
  powerKw: string | null;
  hasLpgOrMethane: boolean;
  lpgMethaneCertificateExpiresOn: string | null;
};

type Booking = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  workerNotes: string | null;
  service: { id: string; name: string; durationMin: number; priceRsd: number };
  vehicle: Vehicle;
};

function fmtDate(srDate: string | null | undefined) {
  if (!srDate) return "";
  // input is YYYY-MM-DD
  const d = new Date(`${srDate}T12:00:00.000Z`);
  return d.toLocaleDateString("sr-RS", { timeZone: "Europe/Belgrade" });
}

function daysUntil(srDate: string) {
  const target = new Date(`${srDate}T12:00:00.000Z`).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function NalogClient() {
  const [profile, setProfile] = useState<{ fullName: string | null } | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsBusy, setBookingsBusy] = useState(false);
  const [vehicleFilterId, setVehicleFilterId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

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
    await loadVehicles();
  }

  async function loadVehicles() {
    const rv = await fetch("/api/me/vehicles", { credentials: "include" });
    const vj = await rv.json().catch(() => null);
    if (rv.ok) {
      const list = ((vj?.vehicles as Vehicle[]) || []) as Vehicle[];
      setVehicles(list);
      setVehicleFilterId((prev) => prev || list[0]?.id || "");
    }
  }

  async function loadBookings(vehicleId?: string) {
    setBookingsBusy(true);
    const url = vehicleId ? `/api/me/bookings?vehicleId=${encodeURIComponent(vehicleId)}` : "/api/me/bookings";
    const rb = await fetch(url, { credentials: "include" });
    const bj = await rb.json().catch(() => null);
    setBookingsBusy(false);
    if (!rb.ok) {
      setBookings([]);
      return;
    }
    setBookings((bj?.bookings || []) as Booking[]);
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!vehicleFilterId) {
      setBookings([]);
      return;
    }
    void loadBookings(vehicleFilterId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleFilterId]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
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
    setMsg({ tone: "ok", text: "Profil je sačuvan." });
  }

  async function addVehicle(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!newMake.trim() || !newReg) {
      setMsg({ tone: "warn", text: "Marka i datum isteka registracije su obavezni." });
      return;
    }
    if (!newPlateNumber.trim()) {
      setMsg({ tone: "warn", text: "Unesite registarsku oznaku." });
      return;
    }
    if (!newFuelType) {
      setMsg({ tone: "warn", text: "Izaberite vrstu goriva." });
      return;
    }
    if (!newColor.trim()) {
      setMsg({ tone: "warn", text: "Unesite boju vozila." });
      return;
    }
    if (newEngineCc === "" || newEngineCc <= 0) {
      setMsg({ tone: "warn", text: "Unesite zapreminu motora (cc)." });
      return;
    }
    if (newPowerKw === "" || newPowerKw <= 0) {
      setMsg({ tone: "warn", text: "Unesite snagu motora (kW)." });
      return;
    }
    if (newHasLpgOrMethane && !newLpgMethaneCertificateExpiresOn) {
      setMsg({ tone: "warn", text: "Unesite datum isteka atesta za gas." });
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
      setMsg({ tone: "warn", text: j?.message || "Greška pri čuvanju vozila." });
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
    setNewReg("");
    setNewHasLpgOrMethane(false);
    setNewLpgMethaneCertificateExpiresOn("");
    setAddOpen(false);
    await loadVehicles();
    setMsg({ tone: "ok", text: "Vozilo je sačuvano." });
  }

  return (
    <div className="flex-container response-999" style={{ flexDirection: "column", gap: 40 }}>
      <section id="profil" className="dark-bg-2 client-card client-card-wide" style={{ margin: 0 }}>
        <h3 className="medium-title text-color-4">Profil</h3>
        <form className="top-margin-30" onSubmit={saveProfile}>
          <div className="client-form-row">
            <label className="client-field">
              <span className="client-label">Ime i prezime</span>
              <input
                className="client-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="npr. Marko Marković"
                autoComplete="name"
              />
              <span className="client-help">Kako želite da se vodi na zakazivanju.</span>
            </label>
            <label className="client-field">
              <span className="client-label">Telefon</span>
              <input
                className="client-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="+381 6X XXX XXXX"
                autoComplete="tel"
              />
              <span className="client-help">Koristimo za potvrdu termina i kontakt.</span>
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
        {msg && msg.tone === "ok" ? (
          <p className="top-margin-20 p-style-bold-up" style={{ color: "#86efac", marginBottom: 0 }}>
            {msg.text}
          </p>
        ) : null}
      </section>

      <section id="vozila" className="dark-bg-2 client-card client-card-wide" style={{ margin: 0 }}>
        <div className="flex-container response-999" style={{ justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h3 className="medium-title text-color-4" style={{ margin: 0 }}>
            Moja vozila
          </h3>
          <div className="border-btn-box border-btn-red pointer-large" style={{ marginTop: 0 }}>
            <div className="border-btn-inner">
              <button
                type="button"
                className="border-btn"
                data-text={addOpen ? "Zatvori" : "Dodaj vozilo"}
                onClick={() => setAddOpen((v) => !v)}
              >
                {addOpen ? "Zatvori" : "Dodaj vozilo"}
              </button>
            </div>
          </div>
        </div>

        {addOpen ? (
          <form className="top-margin-30" onSubmit={addVehicle}>
            <div className="client-form-row">
              <label className="client-field">
                <span className="client-label">Marka</span>
                <input className="client-input" value={newMake} onChange={(e) => setNewMake(e.target.value)} placeholder="npr. Volkswagen" />
              </label>
              <label className="client-field">
                <span className="client-label">Tablice</span>
                <input className="client-input" value={newPlateNumber} onChange={(e) => setNewPlateNumber(e.target.value)} placeholder="NI-123-AB" />
              </label>
              <label className="client-field">
                <span className="client-label">Godište</span>
                <input
                  className="client-input"
                  type="number"
                  min={1950}
                  max={new Date().getFullYear() + 1}
                  value={newYear}
                  onChange={(e) => setNewYear(Number(e.target.value))}
                />
              </label>
              <label className="client-field">
                <span className="client-label">Istek registracije</span>
                <input className="client-input" type="date" value={newReg} onChange={(e) => setNewReg(e.target.value)} />
              </label>
            </div>

            <div className="client-form-row top-margin-20">
              <label className="client-field">
                <span className="client-label">Model (opciono)</span>
                <input className="client-input" value={newModel} onChange={(e) => setNewModel(e.target.value)} placeholder="Golf / Passat..." />
              </label>
              <label className="client-field">
                <span className="client-label">Gorivo</span>
                <select className="client-select" value={newFuelType} onChange={(e) => setNewFuelType(e.target.value)}>
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
              <label className="client-field">
                <span className="client-label">Boja</span>
                <input className="client-input" value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="npr. crna" />
              </label>
              <label className="client-field">
                <span className="client-label">Zapremina (cc)</span>
                <input
                  className="client-input"
                  type="number"
                  min={50}
                  value={newEngineCc}
                  onChange={(e) => setNewEngineCc(e.target.value ? Number(e.target.value) : "")}
                  placeholder="npr. 1968"
                />
              </label>
              <label className="client-field">
                <span className="client-label">Snaga (kW)</span>
                <input
                  className="client-input"
                  type="number"
                  min={1}
                  value={newPowerKw}
                  onChange={(e) => setNewPowerKw(e.target.value ? Number(e.target.value) : "")}
                  placeholder="npr. 110"
                />
              </label>
              <label className="client-field" style={{ flexBasis: "100%" }}>
                <span className="client-label">VIN (opciono)</span>
                <input className="client-input" value={newVin} onChange={(e) => setNewVin(e.target.value)} placeholder="npr. WVWZZZ..." />
              </label>
            </div>

            <div className="top-margin-20" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                id="newHasLpg"
                type="checkbox"
                checked={newHasLpgOrMethane}
                onChange={(e) => setNewHasLpgOrMethane(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <label htmlFor="newHasLpg" className="p-style-bold-up text-color-4" style={{ margin: 0, cursor: "pointer" }}>
                Vozilo ima LPG/CNG (atest)
              </label>
            </div>
            {newHasLpgOrMethane ? (
              <div className="top-margin-20">
                <label className="client-field" style={{ maxWidth: 320 }}>
                  <span className="client-label">Istek atesta za gas</span>
                  <input
                    className="client-input"
                    type="date"
                    value={newLpgMethaneCertificateExpiresOn}
                    onChange={(e) => setNewLpgMethaneCertificateExpiresOn(e.target.value)}
                  />
                </label>
              </div>
            ) : null}

            <div className="top-margin-30" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div className="border-btn-box border-btn-red pointer-large" style={{ marginTop: 0 }}>
                <div className="border-btn-inner">
                  <button type="submit" className="border-btn" data-text={busy ? "Čuvam…" : "Sačuvaj vozilo"} disabled={busy}>
                    {busy ? "Čuvam…" : "Sačuvaj vozilo"}
                  </button>
                </div>
              </div>
              <p className="p-style-bold-up text-color-4" style={{ opacity: 0.7, margin: 0 }}>
                Ako niste sigurni za cc/kW, pogledajte saobraćajnu dozvolu ili specifikaciju vozila.
              </p>
            </div>
          </form>
        ) : null}

        {msg && msg.tone === "warn" ? (
          <p className="top-margin-20 p-style-bold-up" style={{ color: "#fbbf24", marginBottom: 0 }}>
            {msg.text}
          </p>
        ) : null}

        <hr className="client-divider" />

        {vehicles.length ? (
          <>
            <label className="client-field" style={{ maxWidth: 520 }}>
              <span className="client-label">Izaberite vozilo</span>
              <select className="client-select" value={vehicleFilterId} onChange={(e) => setVehicleFilterId(e.target.value)}>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model ? `(${v.model})` : ""} {v.plateNumber ? `— ${v.plateNumber}` : ""} ({v.year})
                  </option>
                ))}
              </select>
              <span className="client-help">Za izabrano vozilo prikazujemo detalje i istoriju zakazivanja.</span>
            </label>

            {vehicles
              .filter((v) => v.id === vehicleFilterId)
              .map((v) => {
                const dLeft = v.registrationExpiresOn ? daysUntil(v.registrationExpiresOn) : 9999;
                const regTone = dLeft < 0 ? "bad" : dLeft <= 30 ? "warn" : "ok";
                return (
                  <div key={v.id} className="top-margin-30">
                    <p className="p-style-bold-up text-color-4" style={{ marginBottom: 0 }}>
                      {v.make} {v.model ? v.model : ""} ({v.year}) {v.plateNumber ? `— ${v.plateNumber}` : ""}
                    </p>
                    <div className="client-kpi">
                      <span className={`client-pill is-${regTone}`}>Registracija do: {fmtDate(v.registrationExpiresOn)}</span>
                      {typeof dLeft === "number" ? (
                        <span className={`client-pill is-${regTone}`}>
                          {dLeft < 0 ? `Istekla pre ${Math.abs(dLeft)} dana` : `Ističe za ${dLeft} dana`}
                        </span>
                      ) : null}
                      {v.fuelType ? <span className="client-pill">Gorivo: {v.fuelType}</span> : null}
                      {v.color ? <span className="client-pill">Boja: {v.color}</span> : null}
                      {v.engineCc ? <span className="client-pill">Motor: {v.engineCc} cc</span> : null}
                      {v.powerKw ? <span className="client-pill">Snaga: {v.powerKw} kW</span> : null}
                      {v.hasLpgOrMethane ? (
                        <span className={`client-pill ${v.lpgMethaneCertificateExpiresOn ? "" : "is-warn"}`}>
                          Gas (atest): {v.lpgMethaneCertificateExpiresOn ? fmtDate(v.lpgMethaneCertificateExpiresOn) : "nije unet"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}

            <hr className="client-divider" />

            <h3 className="medium-title text-color-4" style={{ marginTop: 0 }}>
              Istorija zakazivanja
            </h3>
            {bookingsBusy ? (
              <p className="p-style-bold-up text-color-4" style={{ opacity: 0.75 }}>
                Učitavam istoriju…
              </p>
            ) : null}
            {!bookingsBusy && bookings.length === 0 ? (
              <p className="p-style-bold-up text-color-4" style={{ opacity: 0.75 }}>
                Nema zakazivanja za izabrano vozilo.
              </p>
            ) : null}
            <ul className="top-margin-20" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {bookings.map((b) => (
                <li
                  key={b.id}
                  className="top-margin-15"
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    padding: "14px 16px",
                    background: "rgba(0,0,0,0.18)",
                  }}
                >
                  <p className="p-style-bold-up text-color-4" style={{ margin: 0 }}>
                    {new Date(b.startsAt).toLocaleString("sr-RS", { timeZone: "Europe/Belgrade" })} — {b.service?.name}
                  </p>
                  <div className="client-kpi">
                    <span className="client-pill">Status: {b.status}</span>
                    <span className="client-pill">
                      Trajanje: {b.service?.durationMin} min · Cena: {b.service?.priceRsd?.toLocaleString("sr-RS")} RSD
                    </span>
                  </div>
                  {b.workerNotes ? (
                    <p className="p-style-bold-up text-color-4 top-margin-15" style={{ opacity: 0.9 }}>
                      Napomena servisera: {b.workerNotes}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="p-style-bold-up text-color-4 top-margin-20" style={{ opacity: 0.75 }}>
            Nemate vozila — dodajte ga ovde ili na stranici zakazivanja.
          </p>
        )}
      </section>
    </div>
  );
}
