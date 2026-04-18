# Auto Delić — bootstrap iz Dr Igić aplikacije

Ovaj folder je **izdvojeni paket** iz repozitorijuma `drigic` (Next.js + Drizzle + Postgres + OTP prijava). Namena je da ga iskopirate u novi projekat (npr. „Auto Delić — tehnički pregled“) i da na njemu nastavite razvoj prema vašoj specifikaciji.

## Šta je unutra

| Putanja | Značenje |
|--------|----------|
| `copied-from-drigic/` | Stvarni fajlovi iz `drigic` — autentifikacija, zakazivanje, admin API za rezervacije, notifikacije, šema baze, konfiguracija Drizzle, primeri admin/klijentskih stranica. |
| `PREDLOG-SHEME.sql` | **Nije** iz produkcije — predlog novih tabela/kolona za vozila i napomene radnika (za tehnički pregled). |

## Mapiranje vaših zahteva (1–6) na ovaj kod

### 1. Klijentski nalog (registracija i prijava)

U `drigic` nema klasične lozinke: korisnik unosi **email ili telefon**, dobija **OTP kod** (email), verifikuje ga i dobija sesiju (JWT u cookie-ju).

- API: `app/api/auth/request-otp`, `app/api/auth/verify-otp`, `app/api/auth/logout` (+ opciono Google u istom folderu).
- Sesija: `lib/auth/session.js`, `lib/auth/otp.js`.
- Zaštita ruta: `lib/auth/guards.js` (`requireUser`, `requireAdmin`).
- UI primeri: `components/forms/OtpLoginPanel.jsx`, `components/forms/PrijavaClient.jsx`, stranica `app/prijava/page.jsx`.

**Ime, prezime, email, telefon:** u šemi je `users` (email, telefon) + `profiles.full_name`. Pri registraciji profil možete dopuniti kroz `app/api/me/profile` i `components/common/ProfileSetupGate.jsx` (u punoj aplikaciji).

### 2. Stranica „Moja vozila“

U **Dr Igić** aplikaciji **nema** tabele vozila. U `PREDLOG-SHEME.sql` je predlog tabele `vehicles` (marka, kubikaža, kW, godište, istek registracije, plin/metan, istek atesta). Povezivanje: `vehicles.user_id → users.id`.

### 3. Online zakazivanje (30 min, bez pauze, bez duplog termina)

Logika je u:

- `lib/booking/engine.js` — slotovi, preklapanja (`isOverlapping`), `findConflicts`, transakcija sa `pg_advisory` lock-om u `app/api/bookings/route.js`.
- `lib/booking/schedule.js` — radno vreme po danima (Beograd timezone), nedelja/prepodnevi u punoj aplikaciji idu kroz dodatne tabele.
- `lib/booking/config.js` — `clinic_settings.slot_minutes` (fallback iz env).

Za **fiksno 30 minuta** po terminu: u bazi (`clinic_settings`) i/ili env podesite **`slot_minutes = 30`**. U `lib/env.js` postoji `CLINIC_SLOT_MINUTES` (podrazumevano 15 u kodu — **promeniti za Auto Delić**).

**Izbor vozila:** proširite `POST /api/bookings` da prima `vehicleId` i čuva ga u novoj koloni (vidi `PREDLOG-SHEME.sql`). Trenutno booking veže `user_id` + usluge (`booking_items`); za tehnički pregled možete pojednostaviti na jednu „uslugu“ u seed-u ili zameniti `booking_items` jednim tipom pregleda.

### 4. Admin panel — radnici na tehničkom

U `drigic` postoji samo uloga **`admin`** u `role` enum-u (`lib/db/schema.js`). Za radnike predlog:

- proširiti enum na npr. `client | staff | admin`, ili
- odvojena tabela `staff_users` + login istim OTP mehanizmom.

**Dnevni raspored + detalj termina + napomena:** polazište su:

- `app/api/admin/bookings/route.js` — lista i izmene rezervacija.
- `app/admin/kalendar/page.jsx` — primer kalendara (FullCalendar u `package.json`).

Napomenu posle pregleda možete čuvati u novoj koloni npr. `worker_notes` ili `inspection_notes` na `bookings` (u predlogu SQL-a).

### 5. Glavni admin dashboard

Reference: `app/admin/analitika/page.jsx` + agregacije nad `bookings` (statusi: `pending`, `confirmed`, `completed`, … u `booking_status` enum-u). Prilagoditi upite za „pregled po danima“ i istoriju.

### 6. Admin stranica za video (YouTube)

- Šema: `video_links` u `lib/db/schema.js` (`youtube_url`, `title`, `is_published`).
- Admin UI primer: `app/admin/media/page.jsx`.
- API: `app/api/admin/media/videos/route.js`, javno `app/api/media/videos/route.js`.
- Prikaz na sajtu: `components/homes/home-5/VideoGalleryFeed.jsx` (parsiranje YouTube URL-a i embed).

## Kako iskoristiti paket u novom projektu

1. Napravite novi Next.js projekat (preporuka: ista major verzija kao u `copied-from-drigic/package.json`).
2. Iskopirajte sadržaj `copied-from-drigic/` u koren novog projekta (ili spajajte fajlove pažljivo).
3. Podesite `jsconfig.json` / `tsconfig.json` sa aliasom `@/*` kao u originalu.
4. Instalirajte zavisnosti iz kopiranog `package.json` (prilagodite verzije po potrebi).
5. Postavite `.env` (baza, `AUTH_JWT_SECRET`, `AUTH_OTP_SALT`, Resend za email, itd. — vidi `lib/env.js`).
6. Primena migracija: u `drigic` su u folderu `drizzle/` u glavnom repou — ovde je samo `drizzle.config.js`; **migracije treba preuzeti iz glavnog repozitorijuma** ili generisati nove nakon što u `schema.js` dodate vozila i kolone.
7. Uskladite brending u `lib/site.js` i email šablone u `lib/notifications/booking-email.js`.

## Važne napomene

- **Domen:** kod je vezan za kliniku (usluge, hijaluronski brendovi u `engine.js`). Za tehnički pregled ćete **pojednostaviti** `resolveQuote` / `booking_items` ili zameniti jednim fiksnim trajanjem od 30 min.
- **Middleware** (`middleware.js` u kopiji): štiti `/admin` i `/api/admin` — samo `role === "admin"`. Za `staff` dodajte poseban matcher ili proveru u API-ju.
- **Notifikacije** uključuju email + opcioni web push (`lib/notifications/push.js`); za minimalan MVP možete isključiti slanje dok ne podesite ključeve.

## Sledeći koraci u razvoju (preporuka)

1. Migracija baze: `vehicles` + `bookings.vehicle_id` + napomene radnika.
2. API rute: `GET/POST /api/me/vehicles` (CRUD).
3. Stranica klijenta: lista vozila + forma zakazivanja sa izborom vozila.
4. Uloga `staff` + ograničen UI (samo dnevni raspored i unos napomene).

Folder **`auto-delic-tehnicki-bootstrap`** možete slobodno kopirati van ovog repozitorijuma — ceo sadržaj je namerno izdvojen radi prenosa u novi projekat.
