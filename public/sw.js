/* NON-CACHING service worker.
   Ranije verzije su keširale navigacije/JS i trajno zaglavljivale stari build
   (npr. admin sidebar sa 2 linka na desktopu). Ovaj SW NE kešira ništa — samo
   omogućava instalaciju PWA (zahteva fetch handler) i pri aktivaciji briše sve
   stare keševe i jednom reload-uje otvorene prozore da bi zaglavljeni klijenti
   odmah dobili svež sadržaj sa mreže. */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const hadOldCaches = keys.length > 0;
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.clients.claim();

      // Ako je postojao stari (cache-first) SW sa keševima, prinudno osveži
      // sve otvorene prozore — tako zaglavljeni desktop dobije nov build bez
      // ručnog hard-refresh-a. Na čistim klijentima (bez keševa) ne diramo.
      if (hadOldCaches) {
        const clients = await self.clients.matchAll({ type: "window" });
        for (const client of clients) {
          try {
            client.navigate(client.url);
          } catch {
            /* ignore */
          }
        }
      }
    })()
  );
});

// Prazan fetch handler — bez respondWith → čist mrežni prolaz (bez keširanja).
// Prisutan je samo da bi PWA ostao instalabilan.
self.addEventListener("fetch", () => {});
