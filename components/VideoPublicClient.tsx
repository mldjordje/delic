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
    <div className="mt-10 space-y-10">
      {videos.map((v) => {
        const embed = toYouTubeEmbedUrl(v.youtubeUrl);
        return (
          <section key={v.id} className="space-y-3">
            <h2 className="text-xl font-medium text-white">{v.title}</h2>
            {embed ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-black">
                <iframe
                  className="h-full w-full"
                  src={embed}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="text-sm text-amber-400">Neispravan YouTube link.</p>
            )}
          </section>
        );
      })}
      {videos.length === 0 ? <p className="text-slate-500">Trenutno nema objavljenih video zapisa.</p> : null}
    </div>
  );
}
