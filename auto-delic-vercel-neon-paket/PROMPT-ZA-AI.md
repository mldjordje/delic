# Prompt za Cursor (zalepi u Auto Delić / `autodelic` folder)

**Uputstvo:** Otvori ovaj projekat u Cursoru kao root folder. Zatim kopiraj **ceo blok ispod** (od „KONTEKST“ do kraja) u novi Agent chat.

---

## KONTEKST

Radim na projektu **Auto Delić — tehnički pregled vozila**. Trenutno u produkciji imam **HTML stranice + PHP backend na cPanelu**. Novi stack je:

- **Next.js** (App Router) na **Vercelu**
- Baza: **Neon Postgres** (connection string preko Vercel env)
- Po potrebi **Vercel Blob** za fajlove (slike, dokumenta), ne upload na stari hosting

**Važno:** Postojeće **HTML stranice treba da ostanu** (isti izgled/sadržaj). PHP logiku zamenjujemo Next API rutama i bazom na Neonu.

Ako u istom repou pored Next projekta postoji folder **`auto-delic-tehnicki-bootstrap/`** (iz Dr Igić reference projekta: OTP prijava, zakazivanje, konflikti, admin booking API, Drizzle šema, YouTube linkovi), **integriši `copied-from-drigic/`** kao polaznu tačku. Ako ga nema, implementiraj iste zahteve od nule. U svakom slučaju prilagodi brend (**Auto Delić**, tehnički pregled, vozila), ukloni estetsku medicinu iz booking logike i pojednostavi na **fiksno 30 minuta** po terminu bez pauze između slotova.

## FUNKCIONALNI ZAHTEVI (mora sve)

1. **Klijentski nalog:** registracija/prijava — ime i prezime, email, telefon; kasnije upravljanje vozilima i terminima.
2. **Moja vozila:** više vozila po korisniku — marka, kubikaža, kW, godište, datum isteka registracije, plin/metan, datum isteka atesta za plin/metan.
3. **Online zakazivanje:** izbor vozila + slobodan termin; pravila: 30 min, bez pauze između, automatsko blokiranje, bez duplog zakazivanja, potvrda klijentu.
4. **Admin — radnici:** poseban pristup; dnevni raspored; otvaranje termina/vozila; posle završetka **napomena** (popravke, upozorenja, saveti, tehničke primedbe).
5. **Glavni admin:** svi termini, status, napomene radnika, pregled po danima, istorija.
6. **Video:** admin dodaje **YouTube** linkove; prikaz na sajtu bez uploada fajlova.

## HTML + hosting strategija

- Stavi postojeće HTML (i css/js/slike) u Next **`public/`** tako da URL-ovi ostanu što bliže starim (npr. `public/index.html` → `/index.html`, ili `public/legacy/...`).
- Gde god je bilo `action="*.php"` ili server-side PHP, zameni sa **klijentskim `fetch`** ka **`/api/...`** na istom Next sajtu.
- Ako HTML privremeno ostane na **cPanelu** a API na **Vercelu**, implementiraj **CORS** na API-ju za tačan domen cPanel sajta i dokumentuj potrebne env promenljive (`NEXT_PUBLIC_API_URL` na frontu ili apsolutni URL u fetch). Preferenca: sve na jednom domenu (Vercel) da izbegnemo CORS.

## Tehnički zadaci za implementaciju

1. Inicijalizuj ili uskladi **Next.js 15** projekat sa TypeScript ili JavaScript kako već postoji u bootstrapu; uključi **Drizzle ORM** + migracije ka Neonu.
2. Uvezi/adaptiraj šemu: korisnici, profili, vozila, rezervacije (vezane za `vehicle_id`), statusi, `worker_notes`, opciono uloga `staff` pored `admin`.
3. Podesi **`slot_minutes = 30`** u podešavanjima radnog vremena (i env).
4. Implementiraj API rute za auth, vozila, dostupnost termina, kreiranje rezervacije (sa transakcijom / lock protiv race condition).
5. Admin UI: kalendar/dnevni pregled, detalj termina, unos napomena; super-admin pregled istorije.
6. Javna stranica ili sekcija za **YouTube embed** iz baze.
7. **Middleware** za zaštitu `/admin` i `/api/admin` prema ulozi.
8. Dokumentuj **env** u `env.example` i kratko **README** za deploy na Vercel + povezivanje Neona.

## Šta da ne radiš

- Ne ostavljaj zavisnosti od PHP/cPanel baze.
- Ne uvodi estetsku medicinu / hijaluronsku logiku iz starog bootstrapa — zameni jednostavnim tehničkim pregledom.
- Ne traži od mene da ručno pokrećem komande ako možeš ti: predloži ili izvrši `npm install`, `drizzle-kit`, migracije, gde je bezbedno.

## ISHOD

Na kraju želim: radi lokalno (`npm run dev`), migracije primenjene na Neon, jasna struktura foldera, i objašnjenje gde su HTML fajlovi i kako se zovu API rute koje HTML koristi.

**Kreni od pregleda trenutnog stanja foldera, pa plan pa implementacija.**

---

*(Kraj prompta — iznad kopiraj od „KONTEKST“ pa do ovog reda.)*
