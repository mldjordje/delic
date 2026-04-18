import { count, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const db = getDb();
  const [[{ value: bookingsTotal }], [{ value: clientsTotal }], [{ value: vehiclesTotal }], [{ value: pending }]] =
    await Promise.all([
      db.select({ value: count() }).from(schema.bookings),
      db
        .select({ value: count() })
        .from(schema.users)
        .where(eq(schema.users.role, "client")),
      db.select({ value: count() }).from(schema.vehicles),
      db
        .select({ value: count() })
        .from(schema.bookings)
        .where(eq(schema.bookings.status, "pending")),
    ]);

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Kontrolna tabla</h2>
        <p style={{ color: "#94a3b8" }}>Pregled za vlasnika / glavnog administratora.</p>
        <div className="admin-card-grid">
          <div className="admin-card">
            <h3 style={{ marginTop: 0, fontSize: 16 }}>Termini (ukupno)</h3>
            <p style={{ fontSize: 32, margin: 0 }}>{Number(bookingsTotal ?? 0)}</p>
          </div>
          <div className="admin-card">
            <h3 style={{ marginTop: 0, fontSize: 16 }}>Klijenti</h3>
            <p style={{ fontSize: 32, margin: 0 }}>{Number(clientsTotal ?? 0)}</p>
          </div>
          <div className="admin-card">
            <h3 style={{ marginTop: 0, fontSize: 16 }}>Vozila u bazi</h3>
            <p style={{ fontSize: 32, margin: 0 }}>{Number(vehiclesTotal ?? 0)}</p>
          </div>
          <div className="admin-card">
            <h3 style={{ marginTop: 0, fontSize: 16 }}>Zahtevi na čekanju</h3>
            <p style={{ fontSize: 32, margin: 0 }}>{Number(pending ?? 0)}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
