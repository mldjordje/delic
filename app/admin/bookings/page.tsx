"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import ManualBookingSheet, { type ManualService } from "@/components/admin/ManualBookingSheet";

type BookingRow = {
  id: string;
  startsAt: string;
  status: string;
  workerNotes: string | null;
  serviceName?: string;
  vehicle: { make: string; year: number; plateNumber?: string | null };
  client: { email: string | null; phone: string | null; fullName: string | null };
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Na čekanju" },
  { value: "confirmed", label: "Potvrđeno" },
  { value: "completed", label: "Završeno" },
  { value: "cancelled", label: "Otkazano" },
  { value: "no_show", label: "Nije se pojavio" },
];

function clientName(c: BookingRow["client"]) {
  const email = c.email && !c.email.endsWith("@bez-emaila.autodelic.invalid") ? c.email : null;
  return c.fullName || email || c.phone || "—";
}

export default function AdminBookingsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [services, setServices] = useState<ManualService[]>([]);

  useEffect(() => {
    const d = new Date();
    setTo(new Date(d.getTime() + 14 * 86400000).toISOString().slice(0, 10));
    const s = new Date(d.getTime() - 14 * 86400000);
    setFrom(s.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    function calc() {
      setIsMobile(window.innerWidth <= 640);
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/services").catch(() => null);
      const j = await r?.json().catch(() => null);
      if (r?.ok && j?.services) {
        setServices((j.services as ManualService[]).filter((s) => s.calendarEnabled));
      }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!from || !to) return;
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
    setRows(((j.bookings || []) as BookingRow[]).filter((b) => b.status !== "blocked"));
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const filtered = rows.filter((b) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    const hay = [
      b.client.fullName,
      b.client.email,
      b.client.phone,
      b.vehicle.make,
      b.vehicle.plateNumber,
      String(b.vehicle.year),
      b.status,
      b.serviceName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(s);
  });

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <div className="admin-page-actions" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Svi termini u periodu</h2>
          <button type="button" className="admin-add-btn" onClick={() => setCreateOpen(true)}>
            <Plus size={18} /> Ručni unos
          </button>
        </div>
        <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 0 }}>
          Radnik vidi samo današnji dan (API). Administrator bira opseg.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "auto auto 1fr auto", gap: 10, marginBottom: 16, alignItems: "end" }}>
          <label className="admin-field" style={{ marginBottom: 0 }}>
            <span>Od</span>
            <input type="date" className="admin-input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="admin-field" style={{ marginBottom: 0 }}>
            <span>Do</span>
            <input type="date" className="admin-input" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label className="admin-field" style={{ marginBottom: 0, gridColumn: isMobile ? "1 / -1" : undefined }}>
            <span>Pretraga</span>
            <input
              className="admin-input"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="klijent, telefon, tablice, status…"
            />
          </label>
          {!isMobile ? (
            <button type="button" className="admin-template-link-btn" onClick={() => void load()} disabled={loading}>
              Osveži
            </button>
          ) : null}
        </div>
        {msg ? <p style={{ fontSize: 14 }}>{msg}</p> : null}
        {loading ? <p style={{ color: "#94a3b8", fontSize: 14 }}>Učitavam…</p> : null}

        {isMobile ? (
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map((b) => (
              <BookingEditorCard key={b.id} b={b} onSave={patchRow} />
            ))}
          </div>
        ) : (
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
                {filtered.map((b) => (
                  <BookingEditorRow key={b.id} b={b} onSave={patchRow} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length === 0 ? <p style={{ color: "#64748b" }}>Nema termina.</p> : null}
      </section>

      <ManualBookingSheet open={createOpen} onClose={() => setCreateOpen(false)} services={services} onSaved={load} />
    </div>
  );
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("sr-RS", {
    timeZone: "Europe/Belgrade",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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
      <td style={{ padding: 8, whiteSpace: "nowrap" }}>{formatWhen(b.startsAt)}</td>
      <td style={{ padding: 8 }}>
        <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </td>
      <td style={{ padding: 8 }}>
        {clientName(b.client)}
        {b.client.phone ? <div style={{ color: "#64748b", fontSize: 12 }}>{b.client.phone}</div> : null}
      </td>
      <td style={{ padding: 8 }}>
        {b.vehicle.make} ({b.vehicle.year})
        {b.vehicle.plateNumber ? <div style={{ color: "#64748b", fontSize: 12 }}>{b.vehicle.plateNumber}</div> : null}
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

function BookingEditorCard({
  b,
  onSave,
}: {
  b: BookingRow;
  onSave: (id: string, status: string, workerNotes: string) => void;
}) {
  const [status, setStatus] = useState(b.status);
  const [workerNotes, setWorkerNotes] = useState(b.workerNotes || "");
  const dirty = status !== b.status || workerNotes !== (b.workerNotes || "");

  return (
    <article
      style={{
        border: "1px solid rgba(217,232,248,0.14)",
        borderRadius: 14,
        padding: 12,
        background: "rgba(217,232,248,0.03)",
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
        <strong style={{ fontSize: 15 }}>{formatWhen(b.startsAt)}</strong>
        {b.serviceName ? <span style={{ fontSize: 12, color: "#64748b" }}>{b.serviceName}</span> : null}
      </div>
      <div style={{ fontSize: 14 }}>
        {clientName(b.client)}
        {b.client.phone ? (
          <a href={`tel:${b.client.phone}`} style={{ marginLeft: 8, color: "#60a5fa", fontSize: 13 }}>
            {b.client.phone}
          </a>
        ) : null}
        <div style={{ color: "#94a3b8", fontSize: 13 }}>
          {b.vehicle.make} ({b.vehicle.year}){b.vehicle.plateNumber ? ` · ${b.vehicle.plateNumber}` : ""}
        </div>
      </div>
      <select className="admin-input" style={{ minHeight: 44, fontSize: 16 }} value={status} onChange={(e) => setStatus(e.target.value)}>
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <input
        className="admin-input"
        style={{ minHeight: 44, fontSize: 16 }}
        value={workerNotes}
        onChange={(e) => setWorkerNotes(e.target.value)}
        placeholder="Napomena radnika"
      />
      {dirty ? (
        <button
          type="button"
          onClick={() => onSave(b.id, status, workerNotes)}
          style={{ minHeight: 44, borderRadius: 10, border: 0, background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 15 }}
        >
          Sačuvaj
        </button>
      ) : null}
    </article>
  );
}
