"use client";

import { useEffect, useState } from "react";
import { toYouTubeEmbedUrl } from "@/lib/youtube";

type Video = { id: string; youtubeUrl: string; title: string };

export function VideoPublicClient() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/media/videos");
      const j = await r.json();
      if (r.ok) {
        setVideos(j.videos || []);
      }
    })();
  }, []);

  return (
    <div className="flex-container response-999" style={{ flexDirection: "column", gap: 48 }}>
      {videos.map((v) => {
        const embed = toYouTubeEmbedUrl(v.youtubeUrl);
        return (
          <section key={v.id} className="dark-bg-2 client-card client-card-wide" style={{ margin: 0 }}>
            <h3 className="medium-title text-color-4">{v.title}</h3>
            {embed ? (
              <div className="client-video-embed">
                <iframe
                  src={embed}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="top-margin-20 p-style-bold-up red-color">Neispravan YouTube link.</p>
            )}
          </section>
        );
      })}
      {videos.length === 0 ? (
        <p className="p-style-bold-up text-color-4" style={{ opacity: 0.75 }}>
          Trenutno nema objavljenih video zapisa.
        </p>
      ) : null}
    </div>
  );
}
