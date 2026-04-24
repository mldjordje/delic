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
  const [uploadBusy, setUploadBusy] = useState(false);

  const imageList = images
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  function removeImageUrl(url: string) {
    setImages((prev) =>
      prev
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s && s !== url)
        .join("\n"),
    );
  }

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

  async function uploadImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    setErr("");
    setUploadBusy(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("folder", "blog");
        const r = await fetch("/api/admin/upload", { method: "POST", credentials: "include", body: fd });
        const j = await r.json().catch(() => null);
        if (!r.ok) {
          throw new Error(j?.message || "Greška pri otpremanju slike");
        }
        if (j?.url && typeof j.url === "string") {
          setImages((prev) => {
            const line = j.url.trim();
            if (!line) return prev;
            const next = prev.trim();
            return next ? `${next}\n${line}` : line;
          });
        }
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Greška pri otpremanju slike");
    } finally {
      setUploadBusy(false);
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    const r = await fetch("/api/admin/blog", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim(),
        content: content.trim(),
        imageUrls: imageList,
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
        <p style={{ color: "#94a3b8", maxWidth: 640, fontSize: 14 }}>Javne objave na /blog. Slike: jedan URL po liniji ili otpremanje fajla.</p>
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
          {imageList.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>
                Preview ({imageList.length}) — kliknite “Ukloni” da izbacite URL iz liste.
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: 12,
                }}
              >
                {imageList.map((u) => (
                  <div
                    key={u}
                    style={{
                      border: "1px solid rgba(148,163,184,0.25)",
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "rgba(2,6,23,0.5)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} loading="lazy" />
                    <div style={{ padding: 10, display: "grid", gap: 8 }}>
                      <div style={{ fontSize: 11, color: "#94a3b8", wordBreak: "break-all", lineHeight: 1.3 }}>{u}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <a
                          href={u}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-template-link-btn"
                          style={{ display: "inline-flex", padding: "8px 10px" }}
                        >
                          Otvori
                        </a>
                        <button
                          type="button"
                          className="admin-template-link-btn"
                          onClick={() => removeImageUrl(u)}
                          style={{ display: "inline-flex", padding: "8px 10px" }}
                        >
                          Ukloni
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <label style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ color: "#94a3b8", fontSize: 14 }}>Otpremi slike</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              disabled={uploadBusy || saving}
              onChange={(e) => void uploadImages(e.target.files)}
              style={{ maxWidth: "100%" }}
            />
            {uploadBusy ? <span style={{ color: "#94a3b8", fontSize: 14 }}>Otpremanje…</span> : null}
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
