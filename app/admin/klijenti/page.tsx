"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  const [openId, setOpenId] = useState<string | null>(null);
  const [vehiclesByClient, setVehiclesByClient] = useState<Record<string, any[]>>({});
  const [vehiclesBusyId, setVehiclesBusyId] = useState<string | null>(null);

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

  async function toggleVehicles(clientId: string) {
    setErr("");
    setOpenId((prev) => (prev === clientId ? null : clientId));
    if (vehiclesByClient[clientId]) return;
    setVehiclesBusyId(clientId);
    const r = await fetch(`/api/admin/clients/${encodeURIComponent(clientId)}`, { credentials: "include" });
    const j = await r.json().catch(() => null);
    setVehiclesBusyId(null);
    if (!r.ok || !j?.ok) {
      setErr(j?.message || "Greška pri učitavanju vozila.");
      return;
    }
    setVehiclesByClient((prev) => ({ ...prev, [clientId]: (j.vehicles || []) as any[] }));
  }

  const filtered = rows.filter((c) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (
      (c.fullName || "").toLowerCase().includes(s) ||
      (c.email || "").toLowerCase().includes(s) ||
      (c.phone || "").toLowerCase().includes(s)
    );
  });

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
        {/* Mobile-first cards */}
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          {filtered.map((c) => {
            const opened = openId === c.id;
            const vehicles = vehiclesByClient[c.id] || null;
            const busy = vehiclesBusyId === c.id;
            return (
              <div
                key={c.id}
                className="admin-card"
                style={{
                  background: "rgba(12, 18, 29, 0.7)",
                  border: "1px solid rgba(217, 232, 248, 0.18)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 220 }}>
                    <p style={{ margin: 0, color: "#e2e8f0", fontWeight: 700 }}>
                      {c.fullName || c.email || "Klijent"}
                    </p>
                    <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: 13 }}>
                      {c.email || "—"} {c.phone ? `· ${c.phone}` : ""}
                    </p>
                    <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: 13 }}>
                      Vozila: <span style={{ color: "#e2e8f0" }}>{c.vehicleCount}</span>
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {c.phone ? (
                      <a className="admin-template-link-btn" href={`tel:${c.phone}`}>
                        Pozovi
                      </a>
                    ) : null}
                    <Link className="admin-template-link-btn" href={`/admin/klijenti/${c.id}`}>
                      Profil
                    </Link>
                    <button
                      type="button"
                      className="admin-template-link-btn"
                      onClick={() => void toggleVehicles(c.id)}
                    >
                      {opened ? "Sakrij vozila" : "Vidi vozila"}
                    </button>
                  </div>
                </div>

                {opened ? (
                  <div style={{ marginTop: 12 }}>
                    {busy ? (
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>Učitavam vozila…</p>
                    ) : null}
                    {!busy && vehicles && vehicles.length === 0 ? (
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>Nema vozila.</p>
                    ) : null}
                    {!busy && vehicles && vehicles.length ? (
                      <div style={{ display: "grid", gap: 8 }}>
                        {vehicles.map((v: any) => (
                          <div
                            key={v.id}
                            style={{
                              border: "1px solid rgba(255,255,255,0.10)",
                              background: "rgba(0,0,0,0.18)",
                              padding: "10px 12px",
                              borderRadius: 10,
                            }}
                          >
                            <p style={{ margin: 0, color: "#e2e8f0", fontSize: 13, fontWeight: 700 }}>
                              {v.make} {v.model ? `(${v.model})` : ""} ({v.year})
                            </p>
                            <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: 12 }}>
                              Tablice: {v.plateNumber || "—"} · Reg. do: {v.registrationExpiresOn || "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Desktop table (kept for large screens) */}
        <div style={{ overflowX: "auto", marginTop: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#94a3b8" }}>
                <th style={{ padding: 8 }}>Ime</th>
                <th style={{ padding: 8 }}>Email</th>
                <th style={{ padding: 8 }}>Telefon</th>
                <th style={{ padding: 8 }}>Vozila</th>
                <th style={{ padding: 8 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={{ padding: 8 }}>
                    <Link className="admin-template-link-btn" href={`/admin/klijenti/${c.id}`} style={{ padding: "6px 10px" }}>
                      {c.fullName || "—"}
                    </Link>
                  </td>
                  <td style={{ padding: 8 }}>{c.email || "—"}</td>
                  <td style={{ padding: 8 }}>{c.phone || "—"}</td>
                  <td style={{ padding: 8 }}>{c.vehicleCount}</td>
                  <td style={{ padding: 8, textAlign: "right" }}>
                    <button type="button" className="admin-template-link-btn" onClick={() => void toggleVehicles(c.id)}>
                      {openId === c.id ? "Sakrij vozila" : "Vidi vozila"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td style={{ padding: 8, color: "#94a3b8" }} colSpan={5}>
                    Nema rezultata.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

          {openId ? (
            <div style={{ marginTop: 10 }}>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
                Vozila za izabranog klijenta:
              </p>
              {vehiclesBusyId === openId ? (
                <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: 13 }}>Učitavam…</p>
              ) : null}
              {vehiclesByClient[openId] && vehiclesByClient[openId].length ? (
                <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                  {vehiclesByClient[openId].map((v: any) => (
                    <div key={v.id} style={{ border: "1px solid rgba(255,255,255,0.10)", padding: "10px 12px", borderRadius: 10 }}>
                      <strong style={{ color: "#e2e8f0" }}>
                        {v.make} {v.model ? `(${v.model})` : ""} ({v.year})
                      </strong>
                      <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 6 }}>
                        Tablice: {v.plateNumber || "—"} · Reg. do: {v.registrationExpiresOn || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
