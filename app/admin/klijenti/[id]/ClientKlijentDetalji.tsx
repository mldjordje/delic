"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ClientDto = {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  createdAt: string;
};

type VehicleDto = {
  id: string;
  make: string;
  model: string | null;
  year: number;
  plateNumber: string | null;
  registrationExpiresOn: string;
  vin: string | null;
};

type BookingDto = {
  id: string;
  startsAt: string;
  status: string;
  workerNotes: string | null;
  serviceName: string | null;
  vehicle: { make: string; year: number } | null;
};

export function ClientKlijentDetalji({ id }: { id: string }) {
  const [client, setClient] = useState<ClientDto | null>(null);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    void (async () => {
      setBusy(true);
      setErr("");
      const r = await fetch(`/api/admin/clients/${encodeURIComponent(id)}`, { credentials: "include" });
      const j = await r.json().catch(() => null);
      setBusy(false);
      if (!r.ok || !j?.ok) {
        setErr(j?.message || "Greška pri učitavanju.");
        return;
      }
      setClient(j.client as ClientDto);
      setVehicles((j.vehicles || []) as VehicleDto[]);
      setBookings((j.bookings || []) as BookingDto[]);
    })();
  }, [id]);

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <div
          className="flex-container response-999"
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ marginTop: 0 }}>Klijent</h2>
            <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 8, marginBottom: 0 }}>
              Detalji profila, vozila i istorija termina.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link className="admin-template-link-btn" href="/admin/klijenti">
              ← Nazad
            </Link>
          </div>
        </div>

        {busy ? <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 14 }}>Učitavam…</p> : null}
        {err ? <p style={{ color: "#f87171", marginTop: 14 }}>{err}</p> : null}

        {!busy && !err && client ? (
          <div style={{ marginTop: 14, display: "grid", gap: 16 }}>
            <div className="admin-card" style={{ background: "rgba(12, 18, 29, 0.65)" }}>
              <h3 style={{ marginTop: 0 }}>Kontakt</h3>
              <p style={{ marginTop: 8, color: "#e2e8f0" }}>{client.fullName || "—"}</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                {client.phone ? (
                  <a className="admin-template-link-btn" href={`tel:${client.phone}`}>
                    Pozovi
                  </a>
                ) : null}
                {client.phone ? (
                  <a className="admin-template-link-btn" href={`sms:${client.phone}`}>
                    Pošalji poruku
                  </a>
                ) : null}
                {client.email ? (
                  <a className="admin-template-link-btn" href={`mailto:${client.email}`}>
                    Email
                  </a>
                ) : null}
              </div>
              <p style={{ marginTop: 10, color: "#94a3b8", fontSize: 14 }}>
                Email: {client.email || "—"} · Telefon: {client.phone || "—"}
              </p>
            </div>

            <div className="admin-card" style={{ background: "rgba(12, 18, 29, 0.65)" }}>
              <h3 style={{ marginTop: 0 }}>Vozila</h3>
              {vehicles.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 14 }}>Nema vozila.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: "#94a3b8" }}>
                        <th style={{ padding: 8 }}>Vozilo</th>
                        <th style={{ padding: 8 }}>Tablice</th>
                        <th style={{ padding: 8 }}>Reg. do</th>
                        <th style={{ padding: 8 }}>VIN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((v) => (
                        <tr key={v.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                          <td style={{ padding: 8 }}>
                            {v.make} {v.model ? `(${v.model})` : ""} ({v.year})
                          </td>
                          <td style={{ padding: 8 }}>{v.plateNumber || "—"}</td>
                          <td style={{ padding: 8 }}>{v.registrationExpiresOn || "—"}</td>
                          <td style={{ padding: 8 }}>{v.vin || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-card" style={{ background: "rgba(12, 18, 29, 0.65)" }}>
              <h3 style={{ marginTop: 0 }}>Istorija termina</h3>
              {bookings.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 14 }}>Nema termina.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: "#94a3b8" }}>
                        <th style={{ padding: 8 }}>Vreme</th>
                        <th style={{ padding: 8 }}>Usluga</th>
                        <th style={{ padding: 8 }}>Vozilo</th>
                        <th style={{ padding: 8 }}>Status</th>
                        <th style={{ padding: 8 }}>Napomena radnika</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                          <td style={{ padding: 8 }}>
                            {new Date(b.startsAt).toLocaleString("sr-RS", { timeZone: "Europe/Belgrade" })}
                          </td>
                          <td style={{ padding: 8 }}>{b.serviceName || "—"}</td>
                          <td style={{ padding: 8 }}>
                            {b.vehicle?.make ? `${b.vehicle.make} (${b.vehicle.year})` : "—"}
                          </td>
                          <td style={{ padding: 8 }}>{b.status}</td>
                          <td style={{ padding: 8 }}>{b.workerNotes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

