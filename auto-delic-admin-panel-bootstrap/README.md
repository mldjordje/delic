# Auto Delić — admin panel (dizajn + stranice iz Dr Igić reference)

Folder možeš da iskopiraš u Next projekat (`app/admin`, `components/admin`) i da prilagodiš API i šemu.

## Šta je u paketu

| Sadržaj | Opis |
|--------|------|
| **`app/admin/admin-template.css`** | Kompletan vizuelni stil sidebara, kartica, top bar-a (tamna tema). |
| **`components/admin/AdminShell.jsx`** | Originalni shell sa i18n (`LocaleProvider`). |
| **`components/admin/AdminShellAutoDelic.jsx`** | **Preporuka za Auto Delić** — ista struktura, srpski tekstovi, uži meni (kalendar, tabla, termini, klijenti, analitika, video, podešavanja). |
| **`app/admin/layout.auto-delic.example.jsx`** | Primer `layout.jsx` koji koristi `AdminShellAutoDelic`. |
| **Stranice** | `kalendar`, `bookings`, `dashboard`, `analitika`, `klijenti` (+ `[id]`), `media`, `podesavanja`, `page.jsx` (redirect na kalendar), `head.jsx`. |
| **`dashboard/page.auto-delic-primer.jsx`** | Jednostavnija kontrolna tabla (bez VIP/galerije) — zameni `dashboard/page.jsx` kad budeš spreman. |

## Mapiranje na tehnički pregled

| Potreba | Stranica / komponenta |
|--------|------------------------|
| Dnevni / nedeljni raspored | `kalendar/page.jsx` (FullCalendar) |
| Lista svih termina + status + napomene | `bookings/page.jsx` |
| Glavni pregled brojki | `dashboard` (original ili `page.auto-delic-primer.jsx`) |
| Saobraćaj / stranice sajta | `analitika/page.jsx` — opciono za servis; možeš pojednostaviti |
| Klijenti | `klijenti/page.jsx`, `klijenti/[id]/page.jsx` |
| YouTube | `media/page.jsx` |
| Slot minuti, prozor zakazivanja, radno vreme | `podesavanja/page.jsx` — **vezano za kliniku** (usluge, kategorije); izvuci samo deo za `clinic_settings` ili napravi novu rutu `/admin/radno-vreme` |

## npm zavisnosti (pored Next / React)

```json
{
  "@fullcalendar/core": "^6.1.17",
  "@fullcalendar/daygrid": "^6.1.17",
  "@fullcalendar/interaction": "^6.1.17",
  "@fullcalendar/react": "^6.1.17",
  "@fullcalendar/timegrid": "^6.1.17"
}
```

## Integracija

1. Iskopiraj `app/admin` i `components/admin` u projekat (spoji sa postojećim ako već imaš `admin`).
2. U `app/admin/layout.jsx` koristi **`AdminShellAutoDelic`** (vidi `layout.auto-delic.example.jsx`) ili zadrži `AdminShell` ali onda **moraš** imati `LocaleProvider` u root `layout.jsx` kao u Dr Igić projektu.
3. Uključi **`import "./admin-template.css"`** u `app/admin/layout.jsx`.
4. Podesi **`middleware`** da štiti `/admin` (kao u `auto-delic-tehnicki-bootstrap`).
5. API rute koje stranice zovu (moraš ih imati ili prilagoditi):  
   `GET/PATCH /api/admin/bookings`, `GET /api/admin/blocks`, `GET /api/services`, `GET/POST ...` za kalendar; klijenti ` /api/admin/clients`; media ` /api/admin/media/...`; podešavanja ` /api/admin/clinic-settings`, ` /api/admin/service-metadata`; notifikacije ` /api/me/notifications` (za zvonce).  
   Kopiraj odgovarajuće rute iz glavnog `drigic` repozitorijuma ili iz `auto-delic-tehnicki-bootstrap/copied-from-drigic` gde postoje.

## Napomene

- **`kalendar/page.jsx`** je velik i vezan za **usluge, blokade, kreiranje termina od strane admina** — prilagodi polja (npr. izbor vozila umesto usluga) kad uvedeš šemu za vozila.
- **`podesavanja/page.jsx`** uključuje kategorije usluga i „body areas“ iz klinike; za čisti tehnički pregled razmotri odvojenu stranicu samo za radno vreme i `slot_minutes`.
- **`klijenti`** koristi API koji vraća i „beauty pass“ podatke — ukloni taj deo UI-a ako ga nemaš u bazi.

## Original

Izvorno iz: `drigic` (Dr Igić Clinic), Next.js App Router.
