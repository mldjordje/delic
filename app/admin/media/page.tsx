"use client";

import { useEffect, useState } from "react";

type Video = {
  id: string;
  youtubeUrl: string;
  title: string;
  isPublished: boolean;
};

export default function AdminMediaPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/media/videos", { credentials: "include" });
    const j = await r.json();
    if (r.ok) {
      setVideos(j.videos || []);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const r = await fetch("/api/admin/media/videos", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, youtubeUrl: url, isPublished: true }),
    });
    const j = await r.json();
    if (!r.ok) {
      setMsg(j.message || "Greška");
      return;
    }
    setTitle("");
    setUrl("");
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Obrisati video?")) {
      return;
    }
    await fetch(`/api/admin/media/videos/${id}`, { method: "DELETE", credentials: "include" });
    await load();
  }

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>YouTube video</h2>
        <form className="admin-stack" onSubmit={add} style={{ maxWidth: 520 }}>
          <label className="admin-field">
            <span>Naslov</span>
            <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="admin-field">
            <span>URL</span>
            <input
              className="admin-input"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="admin-template-link-btn">
            Dodaj
          </button>
          {msg ? <p style={{ color: "#f87171" }}>{msg}</p> : null}
        </form>
      </section>
      <section className="admin-card">
        <h3 style={{ marginTop: 0 }}>Lista</h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {videos.map((v) => (
            <li
              key={v.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div>
                <strong>{v.title}</strong>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{v.youtubeUrl}</div>
              </div>
              <button type="button" className="admin-template-link-btn" onClick={() => void remove(v.id)}>
                Obriši
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
