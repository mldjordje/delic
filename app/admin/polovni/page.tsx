"use client";

import { useEffect, useState } from "react";

type Listing = {
  id: string;
  title: string;
  make: string | null;
  year: number | null;
  priceRsd: number;
  mileageKm: number | null;
  description: string | null;
  imageUrl: string | null;
  contactPhone: string | null;
  isPublished: boolean;
  sortOrder: number;
};

export default function AdminPolovniPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [make, setMake] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [priceRsd, setPriceRsd] = useState(0);
  const [mileageKm, setMileageKm] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [contactPhone, setContactPhone] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  async function load() {
    setLoading(true);
    setError(null);
    const r = await fetch("/api/admin/used-cars", { credentials: "include" });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      setError(j?.message || "Greška");
      setLoading(false);
      return;
    }
    setItems((j?.listings || []) as Listing[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function uploadImage(file: File | null) {
    if (!file) return;
    setError(null);
    setUploadBusy(true);
    const fd = new FormData();
    fd.set("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", credentials: "include", body: fd });
    const j = await r.json().catch(() => null);
    setUploadBusy(false);
    if (!r.ok) {
      setError(j?.message || "Greška pri otpremanju slike");
      return;
    }
    if (j?.url && typeof j.url === "string") {
      setImageUrl(j.url);
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/admin/used-cars", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        make: make.trim() || null,
        year: year === "" ? null : year,
        priceRsd,
        mileageKm: mileageKm === "" ? null : mileageKm,
        description: description.trim() || null,
        imageUrl: imageUrl.trim() || null,
        contactPhone: contactPhone.trim() || null,
        sortOrder,
      }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      setError(j?.message || "Greška pri čuvanju");
      return;
    }
    setTitle("");
    setMake("");
    setYear("");
    setPriceRsd(0);
    setMileageKm("");
    setDescription("");
    setImageUrl("");
    setContactPhone("");
    setSortOrder(0);
    await load();
  }

  async function togglePublished(l: Listing) {
    setError(null);
    const r = await fetch(`/api/admin/used-cars/${l.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !l.isPublished }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      setError(j?.message || "Greška");
      return;
    }
    await load();
  }

  async function remove(l: Listing) {
    if (!confirm(`Obrisati oglas „${l.title}”?`)) return;
    setError(null);
    const r = await fetch(`/api/admin/used-cars/${l.id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) {
      const j = await r.json().catch(() => null);
      setError(j?.message || "Greška");
      return;
    }
    await load();
  }

  const inputStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#f8fafc",
    width: "100%",
  };

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Polovni automobili</h2>
        <p style={{ color: "#94a3b8", maxWidth: 640 }}>
          Oglasi se prikazuju na javnoj stranici <strong>/polovni-automobili</strong>. Otpremite sliku (JPEG, PNG,
          WebP do 8 MB) ili unesite pun URL slike.
        </p>

        <form onSubmit={create} style={{ display: "grid", gap: 12, marginTop: 20, maxWidth: 640 }}>
          <input
            placeholder="Naslov oglasa"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={inputStyle}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input placeholder="Marka / model" value={make} onChange={(e) => setMake(e.target.value)} style={inputStyle} />
            <input
              type="number"
              placeholder="Godište"
              value={year}
              onChange={(e) => setYear(e.target.value === "" ? "" : Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <input
              type="number"
              placeholder="Cena (RSD)"
              min={0}
              value={priceRsd}
              onChange={(e) => setPriceRsd(Number(e.target.value))}
              required
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Kilometraža (km)"
              value={mileageKm}
              onChange={(e) => setMileageKm(e.target.value === "" ? "" : Number(e.target.value))}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Redosled"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: uploadBusy ? "wait" : "pointer" }}>
              <span style={{ color: "#94a3b8", fontSize: 14 }}>Otpremi sliku</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadBusy}
                onChange={(e) => void uploadImage(e.target.files?.[0] ?? null)}
                style={{ maxWidth: "100%" }}
              />
            </label>
            {uploadBusy ? <span style={{ color: "#94a3b8", fontSize: 14 }}>Otpremanje…</span> : null}
          </div>
          <input
            placeholder="URL slike (https://...) — opciono ako ste otpremili fajl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Kontakt telefon (opciono)"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            style={inputStyle}
          />
          <textarea
            placeholder="Opis"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ ...inputStyle, minHeight: 100 }}
          />
          <button type="submit" className="admin-template-link-btn" style={{ justifySelf: "start" }}>
            Objavi oglas
          </button>
        </form>

        {error ? <p style={{ color: "#f87171", marginTop: 16 }}>{error}</p> : null}
      </section>

      <section className="admin-card">
        <h3 style={{ marginTop: 0 }}>Oglasi</h3>
        {loading ? <p style={{ color: "#94a3b8" }}>Učitavanje…</p> : null}
        {!loading && items.length === 0 ? <p style={{ color: "#94a3b8" }}>Nema oglasa.</p> : null}
        <div className="admin-table-wrap" style={{ marginTop: 12 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Oglas</th>
                <th>Cena</th>
                <th>Javno</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((l) => (
                <tr key={l.id}>
                  <td>
                    <strong>{l.title}</strong>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      {[l.make, l.year].filter(Boolean).join(" · ")}
                    </div>
                  </td>
                  <td>{l.priceRsd.toLocaleString("sr-RS")} RSD</td>
                  <td>
                    <span className={`admin-pill ${l.isPublished ? "is-green" : ""}`}>
                      {l.isPublished ? "da" : "ne"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button type="button" className="admin-template-link-btn" onClick={() => void togglePublished(l)}>
                      {l.isPublished ? "Skini sa sajta" : "Objavi"}
                    </button>{" "}
                    <button type="button" className="admin-template-link-btn" onClick={() => void remove(l)}>
                      Obriši
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
