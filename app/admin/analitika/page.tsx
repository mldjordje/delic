"use client";

import { useEffect, useState } from "react";

export default function AdminAnalitikaPage() {
  const [analytics, setAnalytics] = useState<{
    range: { days: number; from: string };
    perDay: Array<{
      day: string;
      total: number;
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      noShow: number;
    }>;
    statuses: Array<{ status: string; total: number }>;
    byEmployee: Array<{ employeeId: string; employeeName: string; total: number }>;
  } | null>(null);
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

      const ra = await fetch("/api/admin/analytics", { credentials: "include" });
      const ja = await ra.json();
      if (ra.ok && ja?.perDay) {
        setAnalytics(ja);
      }
    })();
  }, []);

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Analitika</h2>
        <p style={{ color: "#94a3b8" }}>
          Pregled termina iz baze (poslednjih {analytics?.range?.days ?? 30} dana) + agregati po statusu i
          po traci/radniku.
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

      <section className="admin-card">
        <h3 style={{ marginTop: 0 }}>Po statusu (ukupno)</h3>
        {analytics ? (
          <div className="admin-table-wrap">
            <table className="admin-table" style={{ minWidth: 520 }}>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Ukupno</th>
                </tr>
              </thead>
              <tbody>
                {analytics.statuses.map((s) => (
                  <tr key={s.status}>
                    <td>{s.status}</td>
                    <td><strong>{s.total}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Učitavanje…</p>
        )}
      </section>

      <section className="admin-card">
        <h3 style={{ marginTop: 0 }}>Termini po danu (poslednjih {analytics?.range?.days ?? 30} dana)</h3>
        {analytics ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Dan</th>
                  <th>Ukupno</th>
                  <th>Pending</th>
                  <th>Confirmed</th>
                  <th>Completed</th>
                  <th>Cancelled</th>
                  <th>No show</th>
                </tr>
              </thead>
              <tbody>
                {analytics.perDay.map((d) => (
                  <tr key={d.day}>
                    <td style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{d.day}</td>
                    <td><strong>{d.total}</strong></td>
                    <td>{d.pending}</td>
                    <td>{d.confirmed}</td>
                    <td>{d.completed}</td>
                    <td>{d.cancelled}</td>
                    <td>{d.noShow}</td>
                  </tr>
                ))}
                {analytics.perDay.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ color: "#94a3b8" }}>
                      Nema termina u izabranom opsegu.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Učitavanje…</p>
        )}
      </section>

      <section className="admin-card">
        <h3 style={{ marginTop: 0 }}>Po traci / radniku (poslednjih {analytics?.range?.days ?? 30} dana)</h3>
        {analytics ? (
          <div className="admin-table-wrap">
            <table className="admin-table" style={{ minWidth: 520 }}>
              <thead>
                <tr>
                  <th>Traka / Radnik</th>
                  <th>Ukupno</th>
                </tr>
              </thead>
              <tbody>
                {analytics.byEmployee.map((e) => (
                  <tr key={e.employeeId}>
                    <td>{e.employeeName || e.employeeId}</td>
                    <td><strong>{e.total}</strong></td>
                  </tr>
                ))}
                {analytics.byEmployee.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ color: "#94a3b8" }}>
                      Nema podataka.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Učitavanje…</p>
        )}
      </section>
    </div>
  );
}
