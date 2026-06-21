/* App-shell SW. Network-first za navigacije (uvek sveže) + cache-first za
   immutable asset-e. Stara verzija je bila cache-first za SVE GET zahteve, pa
   je zaglavljivala stari admin app-shell i prikazivala keširane prijavljene
   stranice i posle odjave. */
const VERSION = "autodelic-v4";
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_FALLBACK = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        cache.addAll([
          OFFLINE_FALLBACK,
          "/assets/css/style.css",
          "/assets/css/plugins.css",
          "/assets/images/logonovi.png",
        ])
      )
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
      .catch(() => undefined)
  );
});

function isImmutableAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/assets/") ||
    /\.(?:css|js|png|jpe?g|gif|svg|webp|avif|woff2?|ico|ttf)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // API se nikad ne kešira (uklj. /api/auth/logout).
  if (url.pathname.startsWith("/api/")) return;

  const accept = req.headers.get("accept") || "";
  const isNavigation =
    req.mode === "navigate" ||
    req.destination === "document" ||
    accept.includes("text/html") ||
    url.searchParams.has("_rsc") ||
    req.headers.has("rsc");

  // Navigacije / RSC payload: uvek sa mreže; keš samo kao offline rezerva.
  if (isNavigation) {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match(req).then((hit) => hit || caches.match(OFFLINE_FALLBACK))
      )
    );
    return;
  }

  // Hash-ovani/immutable asseti: cache-first.
  if (isImmutableAsset(url)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, copy)).catch(() => undefined);
            return res;
          })
      )
    );
    return;
  }

  // Ostalo: stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(req, copy)).catch(() => undefined);
          return res;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
