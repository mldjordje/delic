"use client";

import { useCallback, useEffect, useState } from "react";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrls: string[];
  isPublished: boolean;
  createdAt: string;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState("");
  const [pub, setPub] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    const r = await fetch("/api/admin/blog", { credentials: "include" });
    const j = await r.json().catch(() => null);
    setLoading(false);
    if (!r.ok) {
      setErr(j?.message || "Greška");
      return;
    }
    setPosts((j?.posts || []) as Post[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    const imageUrls = images
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const r = await fetch("/api/admin/blog", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim(),
        content: content.trim(),
        imageUrls,
        isPublished: pub,
      }),
    });
    const j = await r.json().catch(() => null);
    setSaving(false);
    if (!r.ok) {
      setErr(j?.message || "Greška pri čuvanju");
      return;
    }
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setImages("");
    setPub(false);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Obrisati post?")) return;
    setErr("");
    const r = await fetch(`/api/admin/blog/${id}`, { method: "DELETE", credentials: "include" });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      setErr(j?.message || "Greška");
      return;
    }
    await load();
  }

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Blog</h2>
        <p style={{ color: "#94a3b8", maxWidth: 640, fontSize: 14 }}>Javne objave na /blog. Slike: jedan URL po liniji.</p>
        {err ? <p style={{ color: "#f87171" }}>{err}</p> : null}
        <form onSubmit={create} className="admin-field" style={{ display: "grid", gap: 12, maxWidth: 720 }}>
          <label>
            <span>Naslov</span>
            <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            <span>Slug (opciono)</span>
            <input className="admin-input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="automatizovano od naslova" />
          </label>
          <label>
            <span>Kratak opis (excerpt)</span>
            <textarea className="admin-input" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required />
          </label>
          <label>
            <span>Sadržaj</span>
            <textarea className="admin-input" rows={10} value={content} onChange={(e) => setContent(e.target.value)} required />
          </label>
          <label>
            <span>URL slike (jedan po redu)</span>
            <textarea className="admin-input" rows={3} value={images} onChange={(e) => setImages(e.target.value)} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} />
            Objavljeno
          </label>
          <button type="submit" className="admin-template-link-btn" disabled={saving}>
            {saving ? "Šaljem…" : "Sačuvaj post"}
          </button>
        </form>
      </section>

      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Sve objave</h2>
        {loading ? <p style={{ color: "#94a3b8" }}>Učitavanje…</p> : null}
        <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Naslov</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="admin-template-link-btn" style={{ display: "inline" }}>
                    {p.title}
                  </a>
                </td>
                <td>{p.isPublished ? "javno" : "nacrt"}</td>
                <td>
                  <button type="button" className="admin-template-link-btn" onClick={() => void remove(p.id)}>
                    Obriši
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
