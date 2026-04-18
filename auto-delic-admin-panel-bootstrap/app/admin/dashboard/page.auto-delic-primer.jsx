/**
 * PRIMER kontrolne table za Auto Delić (zameni dashboard/page.jsx kada ukloniš
 * VIP, galeriju, estetske usluge iz baze).
 *
 * Zahteva u schema.js bar: users, bookings. Dodaj karticu za vozila kad uvezeš tabelu `vehicles`.
 */
import { count, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";

async function getStats() {
  const db = getDb();
  const [[{ value: bookingsCount }], [{ value: clientsCount }]] = await Promise.all([
    db.select({ value: count() }).from(schema.bookings),
    db.select({ value: count() }).from(schema.users).where(eq(schema.users.role, "client")),
  ]);

  return {
    bookings: bookingsCount || 0,
    clients: clientsCount || 0,
  };
}

export default async function AdminDashboardAutoDelicPage() {
  const stats = await getStats();

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div className="admin-card">
        <h2 style={{ marginTop: 0 }}>Pregled rada</h2>
        <div className="admin-card-grid">
          <div className="admin-card">
            <h3 style={{ marginTop: 0 }}>Termini (ukupno)</h3>
            <p style={{ fontSize: 28, marginBottom: 0 }}>{stats.bookings}</p>
          </div>
          <div className="admin-card">
            <h3 style={{ marginTop: 0 }}>Klijenti</h3>
            <p style={{ fontSize: 28, marginBottom: 0 }}>{stats.clients}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
