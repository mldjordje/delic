"use client";

import { useEffect, useState } from "react";

type Settings = {
  autoConfirmBookings: boolean;
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
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/admin/garage-settings", { credentials: "include" });
      const j = await r.json().catch(() => null);
      if (r.ok && j?.settings) {
        setS({
          autoConfirmBookings: j.settings.autoConfirmBookings ?? true,
          slotMinutes: j.settings.slotMinutes,
          bookingWindowDays: j.settings.bookingWindowDays,
          workdayStart: j.settings.workdayStart,
          workdayEnd: j.settings.workdayEnd,
          saturdayStart: j.settings.saturdayStart,
          saturdayEnd: j.settings.saturdayEnd,
        });
      } else {
        setError(j?.message || "Podešavanja nije moguće učitati.");
      }
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!s) {
      return;
    }
    setMsg("");
    setSaving(true);
    const r = await fetch("/api/admin/garage-settings", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    const j = await r.json().catch(() => null);
    setSaving(false);
    if (!r.ok) {
      setMsg(j?.message || "Greška");
      return;
    }
    setMsg("Sačuvano.");
  }

  if (!s && error) {
    return <div className="admin-card" style={{ color: "#f87171" }}>{error}</div>;
  }

  if (!s) {
    return <p style={{ color: "#94a3b8" }}>Učitavanje podešavanja…</p>;
  }

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2 style={{ marginTop: 0, marginBottom: 6 }}>Podešavanja zakazivanja</h2>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>
          Kontrolišite potvrdu termina, trajanje slotova i radno vreme u lokalnom vremenu (Beograd).
        </p>
        <form onSubmit={save} style={{ maxWidth: 480 }} className="admin-stack">
          <label
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 18,
              padding: "16px",
              borderRadius: 12,
              border: `1px solid ${s.autoConfirmBookings ? "rgba(22,163,74,0.4)" : "rgba(148,163,184,0.22)"}`,
              background: s.autoConfirmBookings ? "rgba(22,163,74,0.08)" : "rgba(255,255,255,0.03)",
              cursor: "pointer",
            }}
          >
            <span>
              <strong style={{ display: "block", color: "#e2e8f0", fontSize: 14 }}>Automatska potvrda termina</strong>
              <small style={{ display: "block", color: "#94a3b8", marginTop: 4, lineHeight: 1.45 }}>
                {s.autoConfirmBookings
                  ? "Novi online termini su odmah potvrđeni."
                  : "Novi online termini čekaju ručnu potvrdu administratora."}
              </small>
            </span>
            <span
              aria-hidden="true"
              style={{
                width: 48,
                height: 26,
                padding: 3,
                borderRadius: 999,
                background: s.autoConfirmBookings ? "#16a34a" : "#475569",
                display: "flex",
                justifyContent: s.autoConfirmBookings ? "flex-end" : "flex-start",
                flexShrink: 0,
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,.35)" }} />
            </span>
            <input
              type="checkbox"
              checked={s.autoConfirmBookings}
              onChange={(e) => setS({ ...s, autoConfirmBookings: e.target.checked })}
              style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
            />
          </label>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 15 }}>Radno vreme i slotovi</h3>
            <p style={{ margin: "0 0 14px", color: "#94a3b8", fontSize: 13 }}>Određuje termine dostupne klijentima.</p>
          </div>
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
          <button type="submit" className="admin-template-link-btn" disabled={saving} style={{ justifyContent: "center", minHeight: 42 }}>
            {saving ? "Čuvam…" : "Sačuvaj podešavanja"}
          </button>
          {msg ? <p style={{ margin: 0, color: msg === "Sačuvano." ? "#4ade80" : "#f87171" }}>{msg}</p> : null}
        </form>
      </section>
    </div>
  );
}
