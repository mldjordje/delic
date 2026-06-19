# Auto Delić prijava i UI/UX polish

## Cilj

Zadržati `/prijava` kao jedini Google OAuth ulaz, bez javnog razdvajanja klijenata i zaposlenih. Nakon autentifikacije sistem korisnika usmerava prema ulozi, dok javni interfejs ostaje jednostavan i ne otkriva poseban ulaz za zaposlene.

## Tok prijave

- Korisnik bez aktivne sesije na `/prijava` vidi neutralnu Google prijavu namenjenu vlasniku naloga.
- Korisnik sa aktivnom `client` sesijom automatski ide na `/dashboard`.
- Korisnik sa aktivnom `staff` ili `admin` sesijom automatski ide na `/admin/kalendar`.
- Google OAuth callback zadržava postojeću adresu i konfiguraciju.
- Serverska autorizacija ostaje jedini izvor istine; UI i URL ne dodeljuju privilegije.
- Javni meni koristi jednu stavku „Moj nalog“ umesto paralelnih stavki „Prijava“ i „Moj nalog“.

## Vizuelni polish javnog dela

- Povećati kontrast teksta, labela, placeholdera, polja i kartica prema WCAG AA smernicama.
- Posebno proveriti forme za profil i vozila, uključujući native `select` opcije i polja za datum.
- Uvesti jasna hover, focus-visible, active, disabled i error stanja bez pomeranja rasporeda.
- Standardizovati razmake, minimalnu visinu kontrola i mobilni raspored.
- Stranica prijave jasno objašnjava da isti nalog otvara odgovarajući deo sistema, bez pominjanja skrivenog admin ulaza.
- Poštovati `prefers-reduced-motion` i zadržati standardni sistemski kursor.

## Mobilna navigacija admin panela

- Na telefonima prikazati fiksnu donju navigaciju sa stavkama: „Kalendar“, „Termini“, „Javni sajt“ i „Meni“.
- „Meni“ otvara postojeći sidebar sa svim modulima dozvoljenim trenutnoj ulozi.
- Aktivna stavka mora biti vizuelno i semantički označena.
- Navigacija koristi postojeću Lucide familiju ikona, tekstualne labele i dodirne površine od najmanje 44 px.
- Sadržaj dobija donji razmak koji sprečava da ga fiksna navigacija prekrije, uz podršku za `safe-area-inset-bottom`.
- Desktop sidebar i postojeća kontrola pristupa ostaju nepromenjeni.

## Email potvrda

- Potvrda termina koristi personalizovani pozdrav i prikazuje datum, vreme, vozilo, registarsku oznaku, adresu i kontakt.
- Poruka traži dolazak 10 minuta ranije i navodi da korisnik može kontaktirati firmu radi izmene termina ili važne napomene.
- Tekstualna i HTML verzija nose isti sadržaj.
- Dinamičke vrednosti u HTML-u moraju biti escapovane.

## Greške i sigurnost

- Istekla ili nevažeća sesija prikazuje prijavu umesto petlje preusmeravanja.
- OAuth greške ostaju vidljive i napisane razumljivim jezikom.
- Admin rute i API rute nastavljaju da proveravaju `staff/admin` privilegije na serveru.
- Ne dodaje se javno dugme, tekst ili link namenjen zaposlenima.

## Provera

- Proveriti role-based preusmeravanja za gosta, klijenta, radnika i administratora.
- Proveriti da javni meni nema duplirane ili zaposlene-only ulaze.
- Proveriti prijavu i forme tastaturom, mobilni raspored, fokus i kontrast.
- Proveriti mobilnu admin navigaciju na uskom viewportu i da ne prekriva sadržaj.
- Pokrenuti lint/type check i produkcioni build.
- Testirati generisani tekst i HTML emaila sa reprezentativnim podacima.
