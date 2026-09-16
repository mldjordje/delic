"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import brandsData from "@/brands.json";
import "./manual-booking.css";

export type ManualService = {
  id: string;
  name: string;
  durationMin: number;
  calendarEnabled: boolean;
};

type ClientPick = { id: string; email: string | null; phone: string | null; fullName: string | null };
type VehiclePick = {
  id: string;
  make: string;
  model?: string | null;
  year: number;
  plateNumber?: string | null;
  registrationExpiresOn: string;
};
type Slot = { startAt: string; endAt: string; available: boolean };
type SavedEntry = { id: string; when: string; label: string };

const TZ = "Europe/Belgrade";
const PLACEHOLDER_DOMAIN = "bez-emaila.autodelic.invalid";
const BRAND_NAMES: string[] = (brandsData as { name: string }[]).map((b) => b.name);
const POPULAR_BRANDS = ["Volkswagen", "Opel", "Fiat", "Peugeot", "Renault", "Škoda", "Ford", "Audi", "BMW", "Toyota"];

/** YYYY-MM-DD u beogradskom vremenu. */
function belgradeDateKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function belgradeTime(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
}

function shiftDateKey(key: string, days: number) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12));
  return dt.toISOString().slice(0, 10);
}

function prettyDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return dt.toLocaleDateString("sr-Latn-RS", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

function addMinutesToTime(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function realEmail(email: string | null | undefined) {
  return email && !email.toLowerCase().endsWith(`@${PLACEHOLDER_DOMAIN}`) ? email : null;
}

function clientLabel(c: ClientPick) {
  return c.fullName || realEmail(c.email) || c.phone || "Klijent";
}

export default function ManualBookingSheet({
  open,
  onClose,
  services,
  initialStart,
  initialEnd,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  services: ManualService[];
  /** Klik na kalendar: početno vreme (i kraj za blokadu). */
  initialStart?: Date | null;
  initialEnd?: Date | null;
  onSaved: () => void | Promise<void>;
}) {
  const todayKey = belgradeDateKey(new Date());
  const [mode, setMode] = useState<"booking" | "block">("booking");
  const [dateKey, setDateKey] = useState(todayKey);
  const [time, setTime] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [allowOutside, setAllowOutside] = useState(false);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsBusy, setSlotsBusy] = useState(false);
  const [showAllSlots, setShowAllSlots] = useState(false);

  const [clientTab, setClientTab] = useState<"new" | "existing">("new");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClientPick[]>([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const [client, setClient] = useState<ClientPick | null>(null);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [phoneMatch, setPhoneMatch] = useState<ClientPick | null>(null);

  const [vehicles, setVehicles] = useState<VehiclePick[]>([]);
  const [vehiclesBusy, setVehiclesBusy] = useState(false);
  const [vehicleId, setVehicleId] = useState<string>("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [year, setYear] = useState("");
  const [regExp, setRegExp] = useState("");

  const [notes, setNotes] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [outsideHint, setOutsideHint] = useState(false);
  const [saved, setSaved] = useState<SavedEntry[]>([]);
  const [flash, setFlash] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const service = useMemo(() => services.find((s) => s.id === serviceId) || null, [services, serviceId]);
  const newVehicleMode = vehicleId === "" || vehicleId === "__new";

  const resetPerson = useCallback(() => {
    setClient(null);
    setQuery("");
    setResults([]);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setPhoneMatch(null);
    setVehicles([]);
    setVehicleId("");
    setMake("");
    setModel("");
    setPlate("");
    setYear("");
    setRegExp("");
    setNotes("");
    setBlockReason("");
    setError("");
    setOutsideHint(false);
  }, []);

  // Otvaranje: postavi datum/vreme iz klika na kalendar (ili danas).
  useEffect(() => {
    if (!open) return;
    resetPerson();
    setMode("booking");
    setClientTab("new");
    setAllowOutside(false);
    setShowAllSlots(false);
    setSaved([]);
    setFlash("");
    if (initialStart && !Number.isNaN(initialStart.getTime())) {
      setDateKey(belgradeDateKey(initialStart));
      setTime(belgradeTime(initialStart));
      const end = initialEnd && initialEnd > initialStart ? initialEnd : new Date(initialStart.getTime() + 30 * 60000);
      setBlockEnd(belgradeTime(end));
    } else {
      setDateKey(belgradeDateKey(new Date()));
      setTime("");
      setBlockEnd("");
    }
    setServiceId((prev) => (prev && services.some((s) => s.id === prev) ? prev : services[0]?.id || ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!serviceId && services[0]) setServiceId(services[0].id);
  }, [services, serviceId]);

  // Zaključaj skrol stranice dok je forma otvorena.
  useEffect(() => {
    if (!open) return;
    const main = document.querySelector<HTMLElement>(".admin-template-main");
    const prev = main?.style.overflowY;
    if (main) main.style.overflowY = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      if (main) main.style.overflowY = prev || "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const loadSlots = useCallback(async () => {
    if (!serviceId || !dateKey) return;
    setSlotsBusy(true);
    const r = await fetch(`/api/bookings/availability?date=${dateKey}&serviceId=${serviceId}`).catch(() => null);
    const j = await r?.json().catch(() => null);
    setSlotsBusy(false);
    setSlots(r?.ok && Array.isArray(j?.slots) ? (j.slots as Slot[]) : []);
  }, [serviceId, dateKey]);

  useEffect(() => {
    if (open && mode === "booking") void loadSlots();
  }, [open, mode, loadSlots]);

  // Pretraga postojećih klijenata.
  useEffect(() => {
    if (clientTab !== "existing") return;
    const s = query.trim();
    if (s.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearchBusy(true);
      const r = await fetch(`/api/admin/lookup/clients?q=${encodeURIComponent(s)}`, { credentials: "include" }).catch(() => null);
      const j = await r?.json().catch(() => null);
      setSearchBusy(false);
      setResults(r?.ok ? ((j?.clients || []) as ClientPick[]) : []);
    }, 250);
    return () => clearTimeout(t);
  }, [query, clientTab]);

  // Novi klijent: upozori ako telefon već postoji u bazi.
  useEffect(() => {
    const digits = newPhone.replace(/\D+/g, "");
    if (clientTab !== "new" || digits.length < 6) {
      setPhoneMatch(null);
      return;
    }
    const t = setTimeout(async () => {
      const r = await fetch(`/api/admin/lookup/clients?q=${encodeURIComponent(digits.slice(-6))}`, { credentials: "include" }).catch(() => null);
      const j = await r?.json().catch(() => null);
      const list = (r?.ok ? j?.clients || [] : []) as ClientPick[];
      const hit = list.find((c) => (c.phone || "").replace(/\D+/g, "").endsWith(digits.slice(-8))) || null;
      setPhoneMatch(hit);
    }, 350);
    return () => clearTimeout(t);
  }, [newPhone, clientTab]);

  async function pickClient(c: ClientPick) {
    setClient(c);
    setClientTab("existing");
    setResults([]);
    setPhoneMatch(null);
    setVehiclesBusy(true);
    setVehicles([]);
    const r = await fetch(`/api/admin/lookup/vehicles?userId=${encodeURIComponent(c.id)}`, { credentials: "include" }).catch(() => null);
    const j = await r?.json().catch(() => null);
    setVehiclesBusy(false);
    const list = (r?.ok ? j?.vehicles || [] : []) as VehiclePick[];
    setVehicles(list);
    setVehicleId(list[0]?.id || "__new");
  }

  function clearClient() {
    setClient(null);
    setVehicles([]);
    setVehicleId("");
  }

  const visibleSlots = useMemo(() => {
    if (showAllSlots) return slots;
    return slots.filter((s) => s.available);
  }, [slots, showAllSlots]);

  function validate(): string | null {
    if (!dateKey) return "Izaberite datum.";
    if (!/^\d{2}:\d{2}$/.test(time)) return "Izaberite vreme.";
    if (mode === "block") {
      if (!/^\d{2}:\d{2}$/.test(blockEnd) || blockEnd <= time) return "Kraj blokade mora biti posle početka.";
      return null;
    }
    if (!serviceId) return "Izaberite uslugu.";
    if (client) {
      if (newVehicleMode && !make.trim()) return "Unesite marku vozila.";
      return null;
    }
    if (newName.trim().length < 2) return "Unesite ime klijenta.";
    if (!make.trim()) return "Unesite marku vozila.";
    return null;
  }

  async function save(next: boolean) {
    setError("");
    setOutsideHint(false);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSaving(true);

    if (mode === "block") {
      const [y, m, d] = dateKey.split("-").map(Number);
      // Konverzija beogradskog vremena u ISO preko servera nije dostupna za blokade — računamo offset lokalno.
      const toIso = (hhmm: string) => {
        const [hh, mm] = hhmm.split(":").map(Number);
        const guess = new Date(Date.UTC(y, m - 1, d, hh, mm));
        const shown = belgradeTime(guess);
        const [sh, sm] = shown.split(":").map(Number);
        const offsetMin = sh * 60 + sm - (hh * 60 + mm);
        return new Date(guess.getTime() - offsetMin * 60000).toISOString();
      };
      const r = await fetch("/api/admin/blocked-slots", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startsAt: toIso(time), endsAt: toIso(blockEnd), reason: blockReason.trim() || null }),
      }).catch(() => null);
      const j = await r?.json().catch(() => null);
      setSaving(false);
      if (!r?.ok) {
        setError(j?.message || "Greška pri blokadi termina.");
        return;
      }
      await onSaved();
      onClose();
      return;
    }

    const payload: Record<string, unknown> = {
      serviceId,
      date: dateKey,
      time,
      status: "confirmed",
      allowOutsideHours: allowOutside,
      workerNotes: notes.trim() || null,
    };
    if (client) {
      payload.userId = client.id;
    } else {
      payload.newClient = {
        fullName: newName.trim(),
        phone: newPhone.trim() || null,
        email: newEmail.trim() || null,
      };
    }
    if (client && !newVehicleMode) {
      payload.vehicleId = vehicleId;
    } else {
      const y = Number(year);
      payload.newVehicle = {
        make: make.trim(),
        model: model.trim() || null,
        plateNumber: plate.trim() || null,
        year: Number.isFinite(y) && y >= 1950 && y <= 2100 ? y : null,
        registrationExpiresOn: regExp || null,
      };
    }

    const r = await fetch("/api/admin/bookings", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
    const j = await r?.json().catch(() => null);
    setSaving(false);
    if (!r?.ok) {
      setError(j?.message || "Greška pri kreiranju termina (proverite internet).");
      if (j?.details?.code === "OUTSIDE_HOURS") setOutsideHint(true);
      return;
    }

    const who = client ? clientLabel(client) : newName.trim();
    const car = client && !newVehicleMode
      ? vehicles.find((x) => x.id === vehicleId)?.make || ""
      : make.trim();
    const entry: SavedEntry = {
      id: j?.booking?.id || `${Date.now()}`,
      when: `${dateKey.slice(8, 10)}.${dateKey.slice(5, 7)}. ${time}`,
      label: [who, car].filter(Boolean).join(" · "),
    };
    setSaved((prev) => [entry, ...prev]);
    setFlash(j?.reusedClient ? `Sačuvano — klijent već postoji, termin je vezan za njega.` : "Sačuvano.");
    void onSaved();

    if (!next) {
      onClose();
      return;
    }
    // Sledeći unos: isti dan i usluga, vreme pomereno za trajanje usluge.
    resetPerson();
    setClientTab("new");
    setTime((t) => addMinutesToTime(t, service?.durationMin || 30));
    void loadSlots();
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => nameRef.current?.focus(), 150);
  }

  if (!open) return null;

  const dayChips = [
    { key: todayKey, label: "Danas" },
    { key: shiftDateKey(todayKey, 1), label: "Sutra" },
    { key: shiftDateKey(todayKey, 2), label: "Prekosutra" },
  ];

  return (
    <div className="mb-sheet-root" role="dialog" aria-modal="true" aria-label="Ručni unos termina">
      <button type="button" className="mb-sheet-backdrop" aria-label="Zatvori" onClick={onClose} />
      <div className="mb-sheet">
        <header className="mb-sheet-head">
          <div className="mb-seg" role="tablist">
            <button type="button" role="tab" aria-selected={mode === "booking"} className={mode === "booking" ? "is-on" : ""} onClick={() => setMode("booking")}>
              Novi termin
            </button>
            <button type="button" role="tab" aria-selected={mode === "block"} className={mode === "block" ? "is-on" : ""} onClick={() => setMode("block")}>
              Blokada
            </button>
          </div>
          <button type="button" className="mb-icon-btn" onClick={onClose} aria-label="Zatvori">
            <X size={20} />
          </button>
        </header>

        <div className="mb-sheet-body" ref={bodyRef}>
          {flash ? (
            <div className="mb-flash" role="status">
              <Check size={16} /> {flash}
              {saved.length ? <span className="mb-flash-count">Uneto: {saved.length}</span> : null}
            </div>
          ) : null}

          {/* 1. KADA */}
          <section className="mb-section">
            <h4 className="mb-h">
              <span className="mb-step">1</span> Kada
            </h4>
            <div className="mb-date-row">
              <button type="button" className="mb-icon-btn" aria-label="Prethodni dan" onClick={() => setDateKey((k) => shiftDateKey(k, -1))}>
                <ChevronLeft size={20} />
              </button>
              <label className="mb-date">
                <input type="date" value={dateKey} onChange={(e) => e.target.value && setDateKey(e.target.value)} />
                <span>{prettyDate(dateKey)}</span>
              </label>
              <button type="button" className="mb-icon-btn" aria-label="Sledeći dan" onClick={() => setDateKey((k) => shiftDateKey(k, 1))}>
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="mb-chips">
              {dayChips.map((c) => (
                <button key={c.key} type="button" className={`mb-chip ${dateKey === c.key ? "is-on" : ""}`} onClick={() => setDateKey(c.key)}>
                  {c.label}
                </button>
              ))}
            </div>

            {mode === "booking" ? (
              <>
                {services.length > 1 ? (
                  <div className="mb-chips" style={{ marginTop: 12 }}>
                    {services.map((s) => (
                      <button key={s.id} type="button" className={`mb-chip ${serviceId === s.id ? "is-on" : ""}`} onClick={() => setServiceId(s.id)}>
                        {s.name} · {s.durationMin} min
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="mb-sub">
                  <span>Slobodni termini</span>
                  <button type="button" className="mb-link" onClick={() => setShowAllSlots((v) => !v)}>
                    {showAllSlots ? "Samo slobodni" : "Prikaži sve"}
                  </button>
                </div>
                {slotsBusy ? <p className="mb-muted">Učitavam…</p> : null}
                {!slotsBusy && visibleSlots.length === 0 ? (
                  <p className="mb-muted">Nema slobodnih termina za ovaj dan — unesite vreme ručno.</p>
                ) : null}
                <div className="mb-slots">
                  {visibleSlots.map((s) => {
                    const t = belgradeTime(new Date(s.startAt));
                    return (
                      <button
                        key={s.startAt}
                        type="button"
                        className={`mb-slot ${time === t ? "is-on" : ""} ${s.available ? "" : "is-taken"}`}
                        onClick={() => setTime(t)}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                <div className="mb-grid2" style={{ marginTop: 10 }}>
                  <label className="mb-field">
                    <span>Tačno vreme</span>
                    <input type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} />
                  </label>
                  <label className="mb-check">
                    <input type="checkbox" checked={allowOutside} onChange={(e) => setAllowOutside(e.target.checked)} />
                    <span>Van radnog vremena</span>
                  </label>
                </div>
              </>
            ) : (
              <div className="mb-grid2" style={{ marginTop: 12 }}>
                <label className="mb-field">
                  <span>Od</span>
                  <input type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} />
                </label>
                <label className="mb-field">
                  <span>Do</span>
                  <input type="time" step={300} value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} />
                </label>
                <label className="mb-field mb-span2">
                  <span>Razlog (opciono)</span>
                  <input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="npr. pauza, servis opreme…" />
                </label>
              </div>
            )}
          </section>

          {mode === "booking" ? (
            <>
              {/* 2. KLIJENT */}
              <section className="mb-section">
                <h4 className="mb-h">
                  <span className="mb-step">2</span> Klijent
                </h4>
                {client ? (
                  <div className="mb-picked">
                    <div>
                      <strong>{clientLabel(client)}</strong>
                      <small>{[client.phone, realEmail(client.email)].filter(Boolean).join(" · ") || "bez kontakta"}</small>
                    </div>
                    <button type="button" className="mb-link" onClick={clearClient}>
                      Promeni
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-seg mb-seg-full">
                      <button type="button" className={clientTab === "new" ? "is-on" : ""} onClick={() => setClientTab("new")}>
                        <Plus size={15} /> Novi klijent
                      </button>
                      <button type="button" className={clientTab === "existing" ? "is-on" : ""} onClick={() => setClientTab("existing")}>
                        <Search size={15} /> Postojeći
                      </button>
                    </div>

                    {clientTab === "new" ? (
                      <div className="mb-grid2">
                        <label className="mb-field mb-span2">
                          <span>Ime i prezime *</span>
                          <input
                            ref={nameRef}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            autoComplete="off"
                            autoCapitalize="words"
                            enterKeyHint="next"
                            placeholder="Petar Petrović"
                          />
                        </label>
                        <label className="mb-field mb-span2">
                          <span>Telefon</span>
                          <input
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            type="tel"
                            inputMode="tel"
                            autoComplete="off"
                            enterKeyHint="next"
                            placeholder="06x xxx xxxx"
                          />
                        </label>
                        {phoneMatch ? (
                          <div className="mb-warn mb-span2">
                            <span>
                              Ovaj broj već ima: <strong>{clientLabel(phoneMatch)}</strong>
                            </span>
                            <button type="button" className="mb-chip is-on" onClick={() => void pickClient(phoneMatch)}>
                              Koristi
                            </button>
                          </div>
                        ) : null}
                        <label className="mb-field mb-span2">
                          <span>Email (opciono)</span>
                          <input
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            type="email"
                            inputMode="email"
                            autoComplete="off"
                            autoCapitalize="none"
                            placeholder="ako ga klijent ima"
                          />
                        </label>
                      </div>
                    ) : (
                      <>
                        <label className="mb-field">
                          <span>Ime, telefon ili email</span>
                          <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            type="search"
                            autoComplete="off"
                            placeholder="min. 2 slova"
                            autoFocus
                          />
                        </label>
                        {searchBusy ? <p className="mb-muted">Tražim…</p> : null}
                        {!searchBusy && query.trim().length >= 2 && results.length === 0 ? (
                          <p className="mb-muted">
                            Nema rezultata.{" "}
                            <button
                              type="button"
                              className="mb-link"
                              onClick={() => {
                                if (/\d{4,}/.test(query)) setNewPhone(query.trim());
                                else setNewName(query.trim());
                                setClientTab("new");
                              }}
                            >
                              Unesi kao novog
                            </button>
                          </p>
                        ) : null}
                        <div className="mb-results">
                          {results.map((c) => (
                            <button key={c.id} type="button" className="mb-result" onClick={() => void pickClient(c)}>
                              <strong>{clientLabel(c)}</strong>
                              <small>{[c.phone, realEmail(c.email)].filter(Boolean).join(" · ") || "—"}</small>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </section>

              {/* 3. VOZILO */}
              <section className="mb-section">
                <h4 className="mb-h">
                  <span className="mb-step">3</span> Vozilo
                </h4>
                {client ? (
                  <>
                    {vehiclesBusy ? <p className="mb-muted">Učitavam vozila…</p> : null}
                    <div className="mb-results">
                      {vehicles.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          className={`mb-result ${vehicleId === v.id ? "is-on" : ""}`}
                          onClick={() => setVehicleId(v.id)}
                        >
                          <strong>
                            {v.make} {v.model || ""} ({v.year})
                          </strong>
                          <small>{v.plateNumber || "bez tablice"}</small>
                        </button>
                      ))}
                      {!vehiclesBusy ? (
                        <button type="button" className={`mb-result ${newVehicleMode ? "is-on" : ""}`} onClick={() => setVehicleId("__new")}>
                          <strong>
                            <Plus size={14} /> Novo vozilo
                          </strong>
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : null}

                {!client || (newVehicleMode && !vehiclesBusy) ? (
                  <div className="mb-grid2" style={{ marginTop: client ? 12 : 0 }}>
                    <label className="mb-field">
                      <span>Marka *</span>
                      <input
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                        list="mb-brands"
                        autoComplete="off"
                        autoCapitalize="words"
                        placeholder="npr. Golf → Volkswagen"
                      />
                    </label>
                    <label className="mb-field">
                      <span>Model</span>
                      <input value={model} onChange={(e) => setModel(e.target.value)} autoComplete="off" placeholder="npr. Golf 7" />
                    </label>
                    {!make ? (
                      <div className="mb-chips mb-span2">
                        {POPULAR_BRANDS.map((b) => (
                          <button key={b} type="button" className="mb-chip is-small" onClick={() => setMake(b)}>
                            {b}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <label className="mb-field">
                      <span>Tablice</span>
                      <input
                        value={plate}
                        onChange={(e) => setPlate(e.target.value.toUpperCase())}
                        autoComplete="off"
                        autoCapitalize="characters"
                        placeholder="NI 123-AB"
                      />
                    </label>
                    <label className="mb-field">
                      <span>Godište</span>
                      <input value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="2015" />
                    </label>
                    <label className="mb-field mb-span2">
                      <span>Registracija ističe (opciono — podrazumevano datum termina)</span>
                      <input type="date" value={regExp} onChange={(e) => setRegExp(e.target.value)} />
                    </label>
                    <datalist id="mb-brands">
                      {BRAND_NAMES.map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </div>
                ) : null}
              </section>

              {/* 4. NAPOMENA */}
              <section className="mb-section">
                <label className="mb-field">
                  <span>Napomena (opciono)</span>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="npr. plin, dolazi ranije…" />
                </label>
              </section>

              {saved.length ? (
                <section className="mb-section">
                  <h4 className="mb-h">Uneto sada ({saved.length})</h4>
                  <ul className="mb-saved">
                    {saved.map((s) => (
                      <li key={s.id}>
                        <Check size={14} /> <b>{s.when}</b> {s.label}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          ) : null}
        </div>

        <footer className="mb-sheet-foot">
          {error ? (
            <div className="mb-error" role="alert">
              {error}
              {outsideHint ? (
                <button type="button" className="mb-link" onClick={() => { setAllowOutside(true); setError(""); setOutsideHint(false); }}>
                  Dozvoli
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="mb-summary">
            {prettyDate(dateKey)} · <b>{time || "--:--"}</b>
            {mode === "block" ? ` – ${blockEnd || "--:--"}` : service ? ` · ${service.name}` : ""}
          </div>
          <div className="mb-actions">
            {mode === "booking" ? (
              <>
                <button type="button" className="mb-btn mb-btn-primary" disabled={saving} onClick={() => void save(true)}>
                  {saving ? "Čuvam…" : "Sačuvaj i sledeći"}
                </button>
                <button type="button" className="mb-btn" disabled={saving} onClick={() => void save(false)}>
                  Sačuvaj
                </button>
              </>
            ) : (
              <button type="button" className="mb-btn mb-btn-primary" disabled={saving} onClick={() => void save(false)}>
                {saving ? "Čuvam…" : "Blokiraj"}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
