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
        {err ? <p style={{ color: "#f87171" }}>{err}</p> : null}
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
              {rows.map((c) => (
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
