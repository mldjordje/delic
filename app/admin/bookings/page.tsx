"use client";

import { useEffect, useState } from "react";

type BookingRow = {
  id: string;
  startsAt: string;
  status: string;
  workerNotes: string | null;
  vehicle: { make: string; year: number };
  client: { email: string | null; phone: string | null; fullName: string | null };
};

export default function AdminBookingsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const d = new Date();
    setTo(d.toISOString().slice(0, 10));
    const s = new Date(d.getTime() - 14 * 86400000);
    setFrom(s.toISOString().slice(0, 10));
  }, []);

  async function load() {
    setLoading(true);
    setMsg("");
    const r = await fetch(
      `/api/admin/bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      { credentials: "include" }
    );
    const j = await r.json();
    setLoading(false);
    if (!r.ok) {
      setMsg(j?.message || "Greška");
      return;
    }
    setRows(j.bookings || []);
  }

  useEffect(() => {
    if (from && to) {
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  async function patchRow(id: string, status: string, workerNotes: string) {
    setMsg("");
    const r = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, workerNotes }),
    });
    const j = await r.json();
    if (!r.ok) {
      setMsg(j?.message || "Greška");
      return;
    }
    setMsg("Sačuvano.");
    await load();
  }

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Svi termini u periodu</h2>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>
          Radnik vidi samo današnji dan (API). Administrator bira opseg.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <label className="admin-field" style={{ marginBottom: 0 }}>
            <span>Od</span>
            <input type="date" className="admin-input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="admin-field" style={{ marginBottom: 0 }}>
            <span>Do</span>
            <input type="date" className="admin-input" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <button type="button" className="admin-template-link-btn" onClick={() => void load()} disabled={loading}>
            Osveži
          </button>
        </div>
        {msg ? <p style={{ fontSize: 14 }}>{msg}</p> : null}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#94a3b8" }}>
                <th style={{ padding: 8 }}>Termin</th>
                <th style={{ padding: 8 }}>Status</th>
                <th style={{ padding: 8 }}>Klijent</th>
                <th style={{ padding: 8 }}>Vozilo</th>
                <th style={{ padding: 8 }}>Napomena</th>
                <th style={{ padding: 8 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <BookingEditorRow key={b.id} b={b} onSave={patchRow} />
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 ? <p style={{ color: "#64748b" }}>Nema termina.</p> : null}
      </section>
    </div>
  );
}

function BookingEditorRow({
  b,
  onSave,
}: {
  b: BookingRow;
  onSave: (id: string, status: string, workerNotes: string) => void;
}) {
  const [status, setStatus] = useState(b.status);
  const [workerNotes, setWorkerNotes] = useState(b.workerNotes || "");

  return (
    <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <td style={{ padding: 8, whiteSpace: "nowrap" }}>
        {new Date(b.startsAt).toLocaleString("sr-RS", { timeZone: "Europe/Belgrade" })}
      </td>
      <td style={{ padding: 8 }}>
        <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Na čekanju</option>
          <option value="confirmed">Potvrđeno</option>
          <option value="completed">Završeno</option>
          <option value="cancelled">Otkazano</option>
          <option value="no_show">Nije se pojavio</option>
        </select>
      </td>
      <td style={{ padding: 8 }}>{b.client.fullName || b.client.email || "—"}</td>
      <td style={{ padding: 8 }}>
        {b.vehicle.make} ({b.vehicle.year})
      </td>
      <td style={{ padding: 8, minWidth: 200 }}>
        <input
          className="admin-input"
          value={workerNotes}
          onChange={(e) => setWorkerNotes(e.target.value)}
          placeholder="Napomena radnika"
        />
      </td>
      <td style={{ padding: 8 }}>
        <button type="button" className="admin-template-link-btn" onClick={() => onSave(b.id, status, workerNotes)}>
          Sačuvaj
        </button>
      </td>
    </tr>
  );
}
