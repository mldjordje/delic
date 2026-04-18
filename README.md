# Auto Delić — tehnički pregled (Next.js + Neon)

Next.js 15 (App Router), Drizzle ORM, Neon Postgres, OTP prijava emailom, zakazivanje u slotovima od **30 minuta**, uloge **client / staff / admin**, YouTube video zapisi iz baze.

## Struktura

| Putanja | Opis |
|--------|------|
| `app/` | Rute (UI + `app/api/*`) |
| `lib/db/schema.ts` | Drizzle šema |
| `lib/booking/` | Dostupnost termina, `pg_advisory` lock pri kreiranju |
| `lib/auth/` | OTP, JWT cookie `autodelic_session` |
| `public/legacy/` | Statički HTML/CSS/slike starog sajta (kopija) |
| `scripts/seed.ts` | Podrazumevani zaposleni + `garage_settings` |
| `app/admin/admin-template.css` | Stilovi admin panela (iz `auto-delic-admin-panel-bootstrap`) |

### Admin panel — vlasnik vs radnik

Jedan **admin UI** (`AdminShellAutoDelic`), ali **meni i API** zavise od uloge:

| Uloga (`users.role`) | Šta vidi |
|---------------------|----------|
| **`staff`** | Kalendar, Termini — API vraća samo **današnji** dan za listu termina. Nema kontrolne table, klijenata, analitike, videa, podešavanja. |
| **`admin`** | Sve: kontrolna tabla, klijenti, analitika, YouTube, podešavanja radnog vremena/slotova. |

## Lokalno

1. Kopiraj `env.example` u `.env.local` i popuni `POSTGRES_URL`, `AUTH_JWT_SECRET` (≥32), `AUTH_OTP_SALT`, opciono `RESEND_API_KEY`.
2. `npm install`
3. Šema na bazu: `npm run db:push` (ili `db:generate` + `db:migrate` ako preferiraš migracije).
4. Seed: `npm run db:seed`
5. `npm run dev` — [http://localhost:3000](http://localhost:3000)

### Glavni admin nalog

Nakon prve prijave OTP-om, u bazi postavi ulogu:

```sql
UPDATE users SET role = 'admin' WHERE email = 'tvoj@email.com';
```

Za radnika: `role = 'staff'`.

## Vercel + Neon

1. Kreiraj Neon bazu i poveži je sa Vercel projektom (ili zalepi `POSTGRES_URL` u Environment Variables).
2. Postavi iste promenljive kao u `env.example` (posebno `AUTH_*`, `NEXT_PUBLIC_APP_URL` na produkcioni URL).
3. Deploy — `npm run build` se izvršava na Vercelu sa tim env-om.

## Legacy HTML

Statički fajlovi su u **`public/legacy/`** (npr. `/legacy/online-zakazivanje.html`). Forma koristi `fetch` ka istom originu: `/api/bookings/availability`, `/api/bookings` (sa kolačićem sesije — korisnik mora biti ulogovan na Next sajtu).

Ako HTML ostane na starom domenu, postavi `NEXT_PUBLIC_APP_URL` na Vercel URL i u legacy skripti koristi taj URL za `fetch`, ili dodaj `CORS_ALLOWED_ORIGINS` (API već podržava CORS za navedene origine).

## API (kratko)

| Ruta | Opis |
|------|------|
| `POST /api/auth/request-otp` | Pošalji OTP |
| `POST /api/auth/verify-otp` | Prijava, postavlja cookie |
| `POST /api/auth/logout` | Odjava |
| `GET/PATCH /api/me/profile` | Profil |
| `GET/POST /api/me/vehicles` | Vozila |
| `PATCH/DELETE /api/me/vehicles/[id]` | |
| `GET /api/me/bookings` | Termini klijenta |
| `GET /api/bookings/availability?date=YYYY-MM-DD` | Slotovi |
| `POST /api/bookings` | `{ vehicleId, startAt }` |
| `POST /api/bookings/[id]/cancel` | |
| `GET /api/admin/bookings?from=&to=` | Za staff samo današnji dan |
| `PATCH /api/admin/bookings/[id]` | Status, `workerNotes` |
| `GET /api/media/videos` | Javni YouTube redovi |
| `GET/POST /api/admin/media/videos` | Admin CRUD |
| `PATCH/DELETE /api/admin/media/videos/[id]` | |
| `GET /api/admin/me` | Uloga za admin shell |
| `GET /api/admin/stats` | Statistika (samo admin) |
| `GET /api/admin/clients` | Lista klijenata (samo admin) |
| `GET/PATCH /api/admin/garage-settings` | Radno vreme / slotovi (samo admin) |

## Middleware

`middleware.ts` štiti `/admin/*` i `/api/admin/*`: samo `staff` i `admin`.

Samo **`admin`**: `/admin/dashboard`, `/admin/klijenti`, `/admin/analitika`, `/admin/media`, `/admin/podesavanja`, `/api/admin/media/*`, `/api/admin/stats`, `/api/admin/clients`, `/api/admin/garage-settings`.

Redirecti: `/admin/video` → `/admin/media`, `/admin/istorija` → `/admin/bookings`.
