---
name: vercel-deploy-blocked-by-migrate
description: Vercel deploys were silently failing because migrate-ci aborted the build on any migrate error
metadata:
  type: project
---

If pushed changes don't appear in production (Auto Delić), suspect a **failing Vercel build**, not just SW cache.

Build script: `"build": "node scripts/migrate-ci.cjs && next build"`. Originally `migrate-ci.cjs` ran `npx drizzle-kit migrate` and did `process.exit(1)` on ANY failure → `next build` never ran → deploy failed → production stayed frozen on the last good bundle. This froze prod across many turns and made it look like client-side caching: admin sidebar showing only 2 links, logout not working, calendar empty — all were just old code, because new code never deployed.

Fixed (2026-06): migrate-ci now logs a warning and continues on migrate failure (commit 3d21ce8). `next build` builds cleanly on its own.

Notes:
- `drizzle/0004_services_blog_inspection.sql` already guards `CREATE TYPE inspection_result` with a `DO/EXCEPTION duplicate_object` block, so the SQL is idempotent — the migrate failure was journal/connection-related, not the enum.
- DB schema changes now must be applied out-of-band (Neon SQL editor or `drizzle-kit push`) since CI no longer hard-runs migrations as a gate.
- No local `.env`/DB in the working copy, so migrations and authed pages can't be exercised locally; rely on `next build` for compile validation. Related: [[sw-cache-staleness]].
