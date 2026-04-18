"use client";

import { useEffect, useState } from "react";

type Video = {
  id: string;
  youtubeUrl: string;
  title: string;
  isPublished: boolean;
};

export function AdminVideoClient() {
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
    await fetch(`/api/admin/media/videos/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await load();
  }

  return (
    <div className="space-y-8">
      <form className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-6" onSubmit={add}>
        <h2 className="text-lg font-semibold text-white">Novi YouTube link</h2>
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          placeholder="Naslov"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Dodaj
        </button>
        {msg ? <p className="text-sm text-red-400">{msg}</p> : null}
      </form>

      <ul className="space-y-2">
        {videos.map((v) => (
          <li
            key={v.id}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm"
          >
            <div>
              <div className="font-medium text-white">{v.title}</div>
              <div className="text-slate-500">{v.youtubeUrl}</div>
            </div>
            <button
              type="button"
              className="text-red-400 hover:underline"
              onClick={() => void remove(v.id)}
            >
              Obriši
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
