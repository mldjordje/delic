"use client";

import { useEffect, useState } from "react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceRsd: number;
  isActive: boolean;
  sortOrder: number;
};

export default function AdminUslugePage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMin, setDurationMin] = useState(30);
  const [priceRsd, setPriceRsd] = useState(0);
  const [sortOrder, setSortOrder] = useState(0);
  const [editing, setEditing] = useState<Service | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDurationMin, setEditDurationMin] = useState(30);
  const [editPriceRsd, setEditPriceRsd] = useState(0);
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editSaving, setEditSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const r = await fetch("/api/admin/services", { credentials: "include" });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      setError(j?.message || "Greška");
      setLoading(false);
      return;
    }
    setItems((j?.services || []) as Service[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/admin/services", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || undefined,
        durationMin,
        priceRsd,
        sortOrder,
      }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      setError(j?.message || "Greška pri čuvanju");
      return;
    }
    setName("");
    setDescription("");
    setDurationMin(30);
    setPriceRsd(0);
    setSortOrder(0);
    await load();
  }

  async function toggleActive(s: Service) {
    setError(null);
    const r = await fetch(`/api/admin/services/${s.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      setError(j?.message || "Greška");
      return;
    }
    await load();
  }

  function openEdit(s: Service) {
    setEditing(s);
    setEditName(s.name);
    setEditDescription(s.description || "");
    setEditDurationMin(s.durationMin);
    setEditPriceRsd(s.priceRsd);
    setEditSortOrder(s.sortOrder);
    setEditIsActive(s.isActive);
  }

  async function saveEdit() {
    if (!editing) return;
    setError(null);
    setEditSaving(true);
    const r = await fetch(`/api/admin/services/${editing.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName.trim(),
        description: editDescription.trim() || null,
        durationMin: editDurationMin,
        priceRsd: editPriceRsd,
        sortOrder: editSortOrder,
        isActive: editIsActive,
      }),
    });
    const j = await r.json().catch(() => null);
    setEditSaving(false);
    if (!r.ok) {
      setError(j?.message || "Greška pri izmeni");
      return;
    }
    setEditing(null);
    await load();
  }

  async function remove(s: Service) {
    if (!confirm(`Obrisati uslugu „${s.name}”?`)) return;
    setError(null);
    const r = await fetch(`/api/admin/services/${s.id}`, { method: "DELETE", credentials: "include" });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      setError(j?.message || "Ne može se obrisati");
      return;
    }
    await load();
  }

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Usluge za zakazivanje</h2>
        <p style={{ color: "#94a3b8", maxWidth: 640 }}>
          Klijenti biraju uslugu pri zakazivanju. Trajanje određuje koliko dugo zauzima termin u kalendaru;
          cena se upisuje u zahtev (RSD).
        </p>

        <form
          onSubmit={create}
          style={{ display: "grid", gap: 12, marginTop: 20, maxWidth: 520 }}
        >
          <input
            className="admin-input-like"
            placeholder="Naziv (npr. Tehnički pregled)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#f8fafc",
            }}
          />
          <textarea
            placeholder="Opis (opciono)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#f8fafc",
            }}
          />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ color: "#94a3b8", fontSize: 14 }}>
              Trajanje (min)
              <input
                type="number"
                min={15}
                max={480}
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                style={{
                  display: "block",
                  marginTop: 4,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#f8fafc",
                  width: 120,
                }}
              />
            </label>
            <label style={{ color: "#94a3b8", fontSize: 14 }}>
              Cena (RSD)
              <input
                type="number"
                min={0}
                value={priceRsd}
                onChange={(e) => setPriceRsd(Number(e.target.value))}
                style={{
                  display: "block",
                  marginTop: 4,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#f8fafc",
                  width: 140,
                }}
              />
            </label>
            <label style={{ color: "#94a3b8", fontSize: 14 }}>
              Redosled
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                style={{
                  display: "block",
                  marginTop: 4,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#f8fafc",
                  width: 100,
                }}
              />
            </label>
          </div>
          <button type="submit" className="admin-template-link-btn" style={{ justifySelf: "start" }}>
            Dodaj uslugu
          </button>
        </form>

        {error ? (
          <p style={{ color: "#f87171", marginTop: 16 }}>{error}</p>
        ) : null}
      </section>

      <section className="admin-card">
        <h3 style={{ marginTop: 0 }}>Lista</h3>
        {loading ? <p style={{ color: "#94a3b8" }}>Učitavanje…</p> : null}
        {!loading && items.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>Nema usluga.</p>
        ) : null}
        <div className="admin-table-wrap" style={{ marginTop: 12 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Min</th>
                <th>Cena</th>
                <th>Aktivna</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.name}</strong>
                    {s.description ? (
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{s.description}</div>
                    ) : null}
                  </td>
                  <td>{s.durationMin}</td>
                  <td>{s.priceRsd.toLocaleString("sr-RS")}</td>
                  <td>
                    <span className={`admin-pill ${s.isActive ? "is-green" : ""}`}>
                      {s.isActive ? "da" : "ne"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="admin-template-link-btn"
                      onClick={() => openEdit(s)}
                      style={{ opacity: 0.95 }}
                    >
                      Izmeni
                    </button>{" "}
                    <button
                      type="button"
                      className="admin-template-link-btn"
                      onClick={() => void toggleActive(s)}
                    >
                      {s.isActive ? "Deaktiviraj" : "Aktiviraj"}
                    </button>{" "}
                    <button
                      type="button"
                      className="admin-template-link-btn"
                      onClick={() => void remove(s)}
                      style={{ opacity: 0.85 }}
                    >
                      Obriši
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editing ? (
        <div
          className="admin-card"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            left: 24,
            maxWidth: 860,
            marginLeft: "auto",
            zIndex: 60,
            boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          }}
        >
          <div className="flex-container response-999" style={{ justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h3 style={{ marginTop: 0, marginBottom: 6 }}>Izmena usluge</h3>
              <p style={{ marginTop: 0, color: "#94a3b8", fontSize: 14 }}>
                ID: <span style={{ color: "#e2e8f0" }}>{editing.id}</span>
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="admin-template-link-btn" onClick={() => void saveEdit()} disabled={editSaving}>
                {editSaving ? "Čuvam…" : "Sačuvaj"}
              </button>
              <button type="button" className="admin-template-link-btn" onClick={() => setEditing(null)}>
                Zatvori
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            <label style={{ color: "#94a3b8", fontSize: 14 }}>
              Naziv
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                style={{
                  display: "block",
                  marginTop: 4,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#f8fafc",
                  width: "100%",
                }}
              />
            </label>

            <label style={{ color: "#94a3b8", fontSize: 14 }}>
              Opis (opciono)
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                style={{
                  display: "block",
                  marginTop: 4,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#f8fafc",
                  width: "100%",
                }}
              />
            </label>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <label style={{ color: "#94a3b8", fontSize: 14 }}>
                Trajanje (min)
                <input
                  type="number"
                  min={15}
                  max={480}
                  value={editDurationMin}
                  onChange={(e) => setEditDurationMin(Number(e.target.value))}
                  style={{
                    display: "block",
                    marginTop: 4,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #334155",
                    background: "#0f172a",
                    color: "#f8fafc",
                    width: 140,
                  }}
                />
              </label>
              <label style={{ color: "#94a3b8", fontSize: 14 }}>
                Cena (RSD)
                <input
                  type="number"
                  min={0}
                  value={editPriceRsd}
                  onChange={(e) => setEditPriceRsd(Number(e.target.value))}
                  style={{
                    display: "block",
                    marginTop: 4,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #334155",
                    background: "#0f172a",
                    color: "#f8fafc",
                    width: 160,
                  }}
                />
              </label>
              <label style={{ color: "#94a3b8", fontSize: 14 }}>
                Redosled
                <input
                  type="number"
                  value={editSortOrder}
                  onChange={(e) => setEditSortOrder(Number(e.target.value))}
                  style={{
                    display: "block",
                    marginTop: 4,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #334155",
                    background: "#0f172a",
                    color: "#f8fafc",
                    width: 120,
                  }}
                />
              </label>
              <label style={{ color: "#94a3b8", fontSize: 14, display: "flex", alignItems: "center", gap: 10, marginTop: 22 }}>
                <input type="checkbox" checked={editIsActive} onChange={(e) => setEditIsActive(e.target.checked)} />
                Aktivna
              </label>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
