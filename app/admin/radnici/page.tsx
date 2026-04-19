"use client";

import { useEffect, useMemo, useState } from "react";

type Worker = {
  id: string;
  email: string;
  role: "admin" | "staff" | "client";
  fullName: string | null;
  phone: string | null;
  createdAt: string;
  lastLoginAt: string | null;
};

export default function AdminRadniciPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    const r = await fetch("/api/admin/workers", { credentials: "include" });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      setError(j?.message || "Greška pri učitavanju");
      setLoading(false);
      return;
    }
    setWorkers((j?.workers || []) as Worker[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const adminCount = useMemo(
    () => workers.filter((w) => w.role === "admin").length,
    [workers]
  );

  async function addStaff(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/admin/workers", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        fullName: fullName.trim() || undefined,
        role: "staff",
      }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      setError(j?.message || "Greška pri dodavanju radnika");
      return;
    }
    setEmail("");
    setFullName("");
    await load();
  }

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Radnici</h2>
        <p style={{ color: "#94a3b8" }}>
          Dodaj radnika (email) koji može da se prijavi na admin deo i vidi{" "}
          <strong>Kalendar</strong> i <strong>Termine</strong>. Vlasnik (admin)
          ima pun pristup.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="admin-metric-pill">Admin naloga: {adminCount}</div>
          <div className="admin-metric-pill">
            Radnika: {workers.filter((w) => w.role === "staff").length}
          </div>
        </div>

        <form onSubmit={addStaff} style={{ marginTop: 18 }}>
          <div className="admin-card-grid">
            <label>
              Email radnika
              <input
                className="admin-inline-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="radnik@gmail.com"
                required
              />
            </label>
            <label>
              Ime i prezime (opciono)
              <input
                className="admin-inline-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="npr. Marko Marković"
              />
            </label>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button className="admin-template-link-btn" type="submit">
              Dodaj / dodeli ulogu radnika
            </button>
            <button
              className="admin-template-link-btn"
              type="button"
              onClick={() => void load()}
            >
              Osveži
            </button>
          </div>
        </form>

        {error ? <p style={{ marginTop: 12, color: "#fecaca" }}>{error}</p> : null}
      </section>

      <section className="admin-card">
        <h3 style={{ marginTop: 0 }}>Lista</h3>
        {loading ? (
          <p>Učitavanje…</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Uloga</th>
                  <th>Ime</th>
                  <th>Telefon</th>
                  <th>Poslednja prijava</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                      {w.email}
                    </td>
                    <td>
                      <span className={`admin-pill ${w.role === "admin" ? "is-green" : "is-blue"}`}>
                        {w.role}
                      </span>
                    </td>
                    <td>{w.fullName || "—"}</td>
                    <td>{w.phone || "—"}</td>
                    <td>{w.lastLoginAt ? new Date(w.lastLoginAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {workers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ color: "#94a3b8" }}>
                      Nema radnika. Dodaj prvog gore.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

