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

const googleHref = `/api/auth/google?next=${encodeURIComponent("/dashboard")}`;

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
      <div className="dark-bg-2 client-card client-card-wide top-margin-20">
        <p className="p-style-bold-up text-color-4">Učitavanje…</p>
      </div>
    );
  }

  return (
    <div className="flex-container response-999" style={{ flexDirection: "column", gap: 36 }}>
      {!loggedIn ? (
        <section className="dark-bg-2 client-card client-card-wide" style={{ margin: 0 }}>
          <h3 className="medium-title text-color-4">Prijavite se da zakažete</h3>
          <p className="p-style-bold-up text-height-20 top-margin-20 text-color-4" style={{ maxWidth: 640 }}>
            Zakazivanje je vezano za vaš nalog i vozila. Prijava je brza —{" "}
            <strong className="red-color">Sign in with Google</strong>, zatim dopunite profil i vozila u odeljku
            „Moj nalog”.
          </p>
          <div className="top-margin-30 flex-container response-999" style={{ gap: 16, flexWrap: "wrap" }}>
            <a href={googleHref} className="client-google-btn pointer-large">
              Sign in with Google
            </a>
          </div>
        </section>
      ) : null}

      <section className="dark-bg-2 client-card client-card-wide" style={{ margin: 0 }}>
        <div className="flex-container response-999" style={{ justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h3 className="medium-title text-color-4">1. Izaberite uslugu</h3>
            <p className="p-style-bold-up text-color-4 top-margin-10" style={{ opacity: 0.85 }}>
              Trajanje i cena važe za izabrani termin.
            </p>
          </div>
          {selectedService ? (
            <p className="small-title-oswald red-color">
              {selectedService.durationMin} min ·{" "}
              {selectedService.priceRsd > 0
                ? `${selectedService.priceRsd.toLocaleString("sr-RS")} RSD`
                : "Cena po dogovoru / u salunu"}
            </p>
          ) : null}
        </div>

        <div className="client-service-grid">
          {services.map((s) => {
            const active = serviceId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                className={`client-service-pick${active ? " is-active" : ""}`}
                onClick={() => {
                  setServiceId(s.id);
                  setSelectedStart(null);
                }}
              >
                <span className="small-title-oswald text-color-4" style={{ display: "block" }}>
                  {s.name}
                </span>
                {s.description ? (
                  <span className="p-style-bold-up text-color-4 top-margin-10" style={{ display: "block", opacity: 0.85 }}>
                    {s.description}
                  </span>
                ) : null}
                <span className="xsmall-title-oswald text-color-4 top-margin-15" style={{ display: "block", opacity: 0.7 }}>
                  {s.durationMin} min
                  {s.priceRsd > 0 ? ` · ${s.priceRsd.toLocaleString("sr-RS")} RSD` : ""}
                </span>
              </button>
            );
          })}
        </div>
        {services.length === 0 ? (
          <p className="top-margin-20 p-style-bold-up red-color">Nema aktivnih usluga. Kontaktirajte salun.</p>
        ) : null}
      </section>

      {loggedIn ? (
        <>
          <section className="dark-bg-2 client-card client-card-wide" style={{ margin: 0 }}>
            <h3 className="medium-title text-color-4">2. Vozilo</h3>
            <p className="p-style-bold-up text-color-4 top-margin-10" style={{ opacity: 0.85 }}>
              Izaberite registrovano vozilo ili dodajte novo.
            </p>

            <label className="p-style-bold-up text-color-4 top-margin-30" style={{ display: "block" }}>
              Vaše vozilo
              <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} style={{ marginTop: 8, width: "100%", maxWidth: 480 }}>
                <option value="">— izaberite —</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} ({v.year})
                  </option>
                ))}
              </select>
            </label>

            <details className="top-margin-30" style={{ border: "1px solid rgba(255,255,255,0.1)", padding: 16 }}>
              <summary className="pointer-large small-title-oswald text-color-4" style={{ cursor: "pointer" }}>
                Dodaj vozilo
              </summary>
              <form className="top-margin-20 flex-container response-999" style={{ gap: 12, flexWrap: "wrap" }} onSubmit={addVehicle}>
                <input placeholder="Marka" value={newMake} onChange={(e) => setNewMake(e.target.value)} style={{ flex: "1 1 160px" }} />
                <input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(Number(e.target.value))}
                  style={{ flex: "0 0 100px" }}
                />
                <input type="date" value={newReg} onChange={(e) => setNewReg(e.target.value)} style={{ flex: "1 1 160px" }} />
                <div style={{ flex: "1 1 100%" }}>
                  <div className="border-btn-box border-btn-red pointer-large">
                    <div className="border-btn-inner">
                      <button type="submit" className="border-btn" data-text="Sačuvaj vozilo">
                        Sačuvaj vozilo
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </details>
          </section>

          <section className="dark-bg-2 client-card client-card-wide" style={{ margin: 0 }}>
            <h3 className="medium-title text-color-4">3. Datum i termin</h3>
            <p className="p-style-bold-up text-color-4 top-margin-10" style={{ opacity: 0.85 }}>
              Prikazani su slobodni slotovi za izabranu uslugu (trajanje {selectedService?.durationMin ?? "—"} min).
            </p>

            <label className="p-style-bold-up text-color-4 top-margin-30" style={{ display: "block" }}>
              Datum
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ marginTop: 8, maxWidth: 280 }} />
            </label>

            <p className="top-margin-15 xsmall-title-oswald text-color-4" style={{ opacity: 0.65 }}>
              {slotsLoading ? "Učitavam slobodne termine…" : null}
            </p>

            <div className="client-slot-row">
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
                      className={`client-slot-btn${active ? " is-active" : ""}`}
                      onClick={() => setSelectedStart(s.startAt)}
                    >
                      {t}
                    </button>
                  );
                })}
            </div>

            <form className="top-margin-30" onSubmit={submitBooking}>
              <div className="border-btn-box border-btn-red pointer-large">
                <div className="border-btn-inner">
                  <button
                    type="submit"
                    className="border-btn"
                    data-text={loading ? "Šaljem…" : "Pošalji zahtev za termin"}
                    disabled={loading || !selectedStart || !vehicleId || !serviceId}
                  >
                    {loading ? "Šaljem…" : "Pošalji zahtev za termin"}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </>
      ) : null}

      {msg ? (
        <div className={msg.includes("poslat") ? "client-msg-ok" : "client-msg-warn"}>
          <p className="p-style-bold-up text-color-4" style={{ margin: 0 }}>
            {msg}
          </p>
        </div>
      ) : null}
    </div>
  );
}
