---
name: sw-cache-staleness
description: Auto Delić PWA service worker caching has caused multiple stale-state bugs
metadata:
  type: project
---

`public/sw.js` (registered by `components/pwa/PwaRegistrar.tsx`) is the #1 suspect for "works on phone, broken/stale on laptop" or "stale data after deploy" bugs in this repo.

Originally it was **cache-first for every GET** (incl. navigations + JS), which caused:
- Admin sidebar stuck showing only staff nav (Kalendar + Termini) on previously-visited devices — old bundle never updated.
- Logout appearing not to work — cached authed pages served after the cookie was cleared.

Fixed (2026-06): rewrote SW to **network-first for navigations/RSC, cache-first only for immutable assets** (`/_next/static/`, `/assets/`, hashed files), cache name bumped to `autodelic-v3` (activate purges older caches). PwaRegistrar calls `reg.update()` and reloads once on `controllerchange` when a controller already existed.

**When touching SW caching: bump `VERSION` in `public/sw.js`** so old caches are purged, and never cache HTML/navigations or `/api/*`. The admin panel and client portal both rely on fresh navigations for auth/role correctness. Related: [[admin-sidebar-role-from-server]].
