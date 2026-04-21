"use client";

import { useEffect, useState } from "react";

type ClientRow = {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  vehicleCount: number;
  createdAt: string;
};

export default function AdminKlijentiPage() {
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/admin/clients", { credentials: "include" });
      const j = await r.json();
      if (!r.ok) {
        setErr(j?.message || "Greška");
        return;
      }
      setRows(j.clients || []);
    })();
  }, []);

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Klijenti</h2>
        <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 8 }}>
          Pretraga po imenu, email-u ili telefonu.
        </p>
        {err ? <p style={{ color: "#f87171" }}>{err}</p> : null}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          <label className="admin-field" style={{ marginBottom: 0, flex: "1 1 320px" }}>
            <span>Pretraga</span>
            <input
              className="admin-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="npr. Marko, 064..., mail@..."
            />
          </label>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#94a3b8" }}>
                <th style={{ padding: 8 }}>Ime</th>
                <th style={{ padding: 8 }}>Email</th>
                <th style={{ padding: 8 }}>Telefon</th>
                <th style={{ padding: 8 }}>Vozila</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((c) => {
                  const s = q.trim().toLowerCase();
                  if (!s) return true;
                  return (
                    (c.fullName || "").toLowerCase().includes(s) ||
                    (c.email || "").toLowerCase().includes(s) ||
                    (c.phone || "").toLowerCase().includes(s)
                  );
                })
                .map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={{ padding: 8 }}>{c.fullName || "—"}</td>
                  <td style={{ padding: 8 }}>{c.email || "—"}</td>
                  <td style={{ padding: 8 }}>{c.phone || "—"}</td>
                  <td style={{ padding: 8 }}>{c.vehicleCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
