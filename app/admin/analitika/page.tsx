"use client";

import { useEffect, useState } from "react";

export default function AdminAnalitikaPage() {
  const [stats, setStats] = useState<{
    bookingsTotal: number;
    clientsTotal: number;
    vehiclesTotal: number;
    pendingBookings: number;
  } | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/admin/stats", { credentials: "include" });
      const j = await r.json();
      if (r.ok && j?.stats) {
        setStats(j.stats);
      }
    })();
  }, []);

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Analitika</h2>
        <p style={{ color: "#94a3b8" }}>
          Osnovni brojevi iz baze. Kasnije možete dodati grafike (npr. termini po danima) i povezati sa
          Google Analytics za saobraćaj na javnom sajtu.
        </p>
        {stats ? (
          <ul style={{ lineHeight: 1.8 }}>
            <li>Ukupno termina: <strong>{stats.bookingsTotal}</strong></li>
            <li>Klijenti: <strong>{stats.clientsTotal}</strong></li>
            <li>Vozila: <strong>{stats.vehiclesTotal}</strong></li>
            <li>Na čekanju: <strong>{stats.pendingBookings}</strong></li>
          </ul>
        ) : (
          <p>Učitavanje…</p>
        )}
      </section>
    </div>
  );
}
