# Auto Delić — paket za migraciju (cPanel HTML/PHP → Next.js + Neon + Vercel)

Ovaj folder zalepi u koren novog (ili postojećeg) **Auto Delić** repozitorijuma kao referencu dok gradiš Next aplikaciju.

**Preporuka:** U isti repo iskopiraj i **`auto-delic-tehnicki-bootstrap/`** (iz ovog `drigic` repozitorijuma) da bi prompt za AI imao konkretan kod za spajanje. Ako ostaješ samo na ovom paketu, i dalje koristi `PROMPT-ZA-AI.md` — radi i bez bootstrapa.

## Kontekst

| Staro | Novo |
|--------|------|
| HTML stranice na cPanelu | **Iste HTML datoteke** — uglavnom u Next `public/` (ili host na cPanelu i samo API na Vercelu) |
| PHP backend | **Next.js Route Handlers** (`app/api/...`) na Vercelu |
| MySQL na hostingu (tipično) | **Neon Postgres** (connection string u Vercel env) |
| Fajlovi na disku | Po potrebi **Vercel Blob** ili ostatak na cPanelu |

## Gde je kod za tehnički pregled / zakazivanje

U ovom repou (`drigic`) već postoji izdvojeni paket:

- **`../auto-delic-tehnicki-bootstrap/`** — kopirani moduli (auth, booking, admin, šema), `README.md` i `PREDLOG-SHEME.sql`.

Taj bootstrap koristi kao polaznu tačku za biznis logiku; ovaj paket objašnjava **kako to spojiti sa postojećim HTML-om i hostingom**.

## Dva uobičajena modela

### A) Jedan sajt na Vercelu (preporuka za novi projekat)

- Sve `.html` (i asseti) prebaciš u `public/` npr. `public/legacy/index.html` → URL `/legacy/index.html`, ili preimenuješ u čiste rute kroz `rewrites` u `next.config.js`.
- Forme koje su imale `action="submit.php"` menjaš u **`fetch('/api/...')`** ka istom domenu (nema CORS problema).
- PHP skripte više ne postoje; logika je u Next API rutama.

### B) HTML i dalje na cPanelu, samo API na Vercelu

- Stranice ostaju na `autodelic.rs` (cPanel).
- API je npr. `https://app.autodelic.rs` ili `https://autodelic.vercel.app`.
- U HTML/JS koristiš **apsolutan URL** do API-ja; na Next API uključi **CORS** (`Access-Control-Allow-Origin`) za domen cPanel sajta, ili šalješ zahteve preko server-side proxy-ja na cPanelu (PHP „most“ dok ne pređeš potpuno na Next).

Detalji i primer fetch poziva: **`PROMPT-ZA-AI.md`** (sekcija koju AI treba da ispoštuje).

## Neon + Vercel

1. Napravi bazu na [Neon](https://neon.tech), kopiraj connection string (često `POSTGRES_URL` ili `DATABASE_URL`).
2. U Vercel projektu: **Settings → Environment Variables** — iste promenljive za Production / Preview.
3. Lokalno: `.env.local` (ne commitovati).

Primer promenljivih: **`env.example`**.

## Glavni deliverable za Cursor

Otvori **`PROMPT-ZA-AI.md`**, kopiraj ceo sadržaj u novi Cursor chat u folderu gde će živeti Next projekat (npr. `autodelic/`).
