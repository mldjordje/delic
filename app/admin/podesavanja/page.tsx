"use client";

import { useEffect, useState } from "react";

type Settings = {
  slotMinutes: number;
  bookingWindowDays: number;
  workdayStart: string;
  workdayEnd: string;
  saturdayStart: string;
  saturdayEnd: string;
};

export default function AdminPodesavanjaPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/admin/garage-settings", { credentials: "include" });
      const j = await r.json();
      if (r.ok && j?.settings) {
        setS({
          slotMinutes: j.settings.slotMinutes,
          bookingWindowDays: j.settings.bookingWindowDays,
          workdayStart: j.settings.workdayStart,
          workdayEnd: j.settings.workdayEnd,
          saturdayStart: j.settings.saturdayStart,
          saturdayEnd: j.settings.saturdayEnd,
        });
      }
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!s) {
      return;
    }
    setMsg("");
    const r = await fetch("/api/admin/garage-settings", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    const j = await r.json();
    if (!r.ok) {
      setMsg(j?.message || "Greška");
      return;
    }
    setMsg("Sačuvano.");
  }

  if (!s) {
    return <p style={{ color: "#94a3b8" }}>Učitavanje podešavanja…</p>;
  }

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Radno vreme i slotovi</h2>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>
          Tehnički pregled: podrazumevano 30 min po terminu. Radno vreme u lokalnom vremenu (Beograd) za generisanje
          slotova.
        </p>
        <form onSubmit={save} style={{ maxWidth: 480 }} className="admin-stack">
          <label className="admin-field">
            <span>Slot (minuti)</span>
            <input
              type="number"
              className="admin-input"
              value={s.slotMinutes}
              onChange={(e) => setS({ ...s, slotMinutes: Number(e.target.value) })}
              min={15}
              max={120}
            />
          </label>
          <label className="admin-field">
            <span>Prozor zakazivanja (dana unapred)</span>
            <input
              type="number"
              className="admin-input"
              value={s.bookingWindowDays}
              onChange={(e) => setS({ ...s, bookingWindowDays: Number(e.target.value) })}
              min={1}
              max={90}
            />
          </label>
          <label className="admin-field">
            <span>Radni dani — od</span>
            <input
              className="admin-input"
              value={s.workdayStart}
              onChange={(e) => setS({ ...s, workdayStart: e.target.value })}
              placeholder="08:00"
            />
          </label>
          <label className="admin-field">
            <span>Radni dani — do</span>
            <input
              className="admin-input"
              value={s.workdayEnd}
              onChange={(e) => setS({ ...s, workdayEnd: e.target.value })}
              placeholder="22:00"
            />
          </label>
          <label className="admin-field">
            <span>Subota — od</span>
            <input
              className="admin-input"
              value={s.saturdayStart}
              onChange={(e) => setS({ ...s, saturdayStart: e.target.value })}
            />
          </label>
          <label className="admin-field">
            <span>Subota — do</span>
            <input
              className="admin-input"
              value={s.saturdayEnd}
              onChange={(e) => setS({ ...s, saturdayEnd: e.target.value })}
            />
          </label>
          <button type="submit" className="admin-template-link-btn">
            Sačuvaj
          </button>
          {msg ? <p>{msg}</p> : null}
        </form>
      </section>
    </div>
  );
}
