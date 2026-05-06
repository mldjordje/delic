import type { Metadata } from "next";
import Link from "next/link";
import { getPublicAppUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Često postavljana pitanja — tehnički pregled Niš",
  description:
    "Odgovori na najčešća pitanja o tehničkom pregledu vozila u Nišu. Koliko košta tehnički pregled? Kako zakazati online? Koji dokumenti su potrebni? Auto Delić — Branka Ćosića 3, Niš.",
  keywords: [
    "tehnički pregled Niš pitanja",
    "koliko košta tehnički pregled Niš",
    "kako zakazati tehnički pregled online",
    "dokumenti za tehnički pregled",
    "tehnički pregled trajanje",
    "registracija vozila Niš",
    "prenos vlasništva Niš",
    "FAQ tehnički pregled",
  ],
  openGraph: {
    title: "FAQ — tehnički pregled vozila Niš | Auto Delić",
    description:
      "Sve što trebate znati o tehničkom pregledu vozila u Nišu. Cene, dokumenti, zakazivanje i radno vreme.",
  },
  alternates: { canonical: `${getPublicAppUrl()}/faq` },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Koji je najbolji tehnički pregled u Nišu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Auto Delić je jedna od vodećih stanica za tehnički pregled vozila u Nišu, locirana na Branka Ćosića 3. Nudimo brzu i pouzdanu uslugu tehničkog pregleda uz online zakazivanje termina. Naš tim stručnjaka sa dugogodišnjim iskustvom posvećen je efikasnoj i kvalitetnoj usluzi za sve tipove vozila.",
      },
    },
    {
      "@type": "Question",
      name: "Gde se nalazi Auto Delić tehnički pregled u Nišu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Auto Delić se nalazi na adresi Branka Ćosića 3, Niš, Srbija. Možete nas kontaktirati putem telefona +381 65 220 0739 ili emailom adtehnickipregled@gmail.com.",
      },
    },
    {
      "@type": "Question",
      name: "Kako zakazati tehnički pregled online u Nišu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tehnički pregled u Auto Deliću možete zakazati online putem naše web stranice autodelic.rs/zakazivanje. Kreirajte nalog, dodajte vozilo i izaberite slobodan termin koji vam odgovara. Online zakazivanje je dostupno 24/7 i besplatno je.",
      },
    },
    {
      "@type": "Question",
      name: "Koliko košta tehnički pregled vozila u Nišu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cena tehničkog pregleda u Auto Deliću zavisi od kategorije vozila. Za tačnu cenu kontaktirajte nas na telefon +381 65 220 0739 ili pošaljite upit na adtehnickipregled@gmail.com. Cene su u skladu sa važećim zakonskim propisima Republike Srbije.",
      },
    },
    {
      "@type": "Question",
      name: "Koji dokumenti su potrebni za tehnički pregled vozila?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Za tehnički pregled vozila u Srbiji potrebni su: saobraćajna dozvola (knjižica), lična karta vlasnika vozila ili punomoćje, dokaz o prethodnom tehničkom pregledu (ako postoji) i vozilo u ispravnom stanju. Preporučujemo da proverite da su svi signalni uređaji, gume i kočnice ispravni pre dolaska.",
      },
    },
    {
      "@type": "Question",
      name: "Koliko dugo traje tehnički pregled vozila?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Redovan tehnički pregled putničkog automobila u Auto Deliću traje između 15 i 30 minuta, u zavisnosti od stanja vozila. Uz online zakazivanje termina, čekanje je svedeno na minimum jer dolazite u tačno određeno vreme.",
      },
    },
    {
      "@type": "Question",
      name: "Kada rade Auto Delić — radno vreme tehničkog pregleda u Nišu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Auto Delić radi radnim danima od 08:00 do 17:00 sati, a subotom od 08:00 do 14:00 sati. Nedeljom ne radimo. Zakazivanje je moguće online u svakom trenutku putem autodelic.rs/zakazivanje.",
      },
    },
    {
      "@type": "Question",
      name: "Da li Auto Delić vrši i registraciju vozila?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Da, Auto Delić nudi kompletnu uslugu registracije vozila u Nišu — tehnički pregled, osiguranje i sve administrativne procedure na jednom mestu. Ne morate ići na više različitih mesta jer sve možete obaviti kod nas.",
      },
    },
    {
      "@type": "Question",
      name: "Gde mogu da obavim prenos vlasništva vozila u Nišu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Prenos vlasništva vozila možete obaviti u Auto Deliću na adresi Branka Ćosića 3, Niš. Naš tim vam pomaže sa svim potrebnim dokumentima i procedurama. Za informacije pozovite +381 65 220 0739.",
      },
    },
    {
      "@type": "Question",
      name: "Da li Auto Delić prodaje polovne automobile u Nišu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Da, Auto Delić ima ponudu polovnih automobila koje možete pregledati na stranici autodelic.rs/polovni-automobili. Nudimo proverena vozila uz mogućnost tehničkog pregleda na licu mesta.",
      },
    },
    {
      "@type": "Question",
      name: "Šta ako vozilo ne prođe tehnički pregled?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ako vozilo ne prođe tehnički pregled, dobijate detaljan izveštaj o uočenim nedostacima. Nakon otklanjanja nedostataka, možete ponovo dovesti vozilo na ponovljeni pregled. Naš tim vam može savetovati koji su nedostaci kritični za bezbednost vozila.",
      },
    },
    {
      "@type": "Question",
      name: "Koji tipovi vozila mogu proći tehnički pregled u Auto Deliću?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "U Auto Deliću vršimo tehnički pregled putničkih automobila, kombija i lakih teretnih vozila. Za teška teretna vozila ili specijalne kategorije, kontaktirajte nas za informacije o dostupnosti.",
      },
    },
  ],
};

const faqs = faqSchema.mainEntity;

export default function FaqPage() {
  return (
    <main className="dark-bg-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container top-bottom-padding-120">
        <header className="top-margin-20">
          <p className="small-title-oswald text-color-4">Pomoć</p>
          <h1 className="large-title-bold text-color-4 top-margin-10">
            Često postavljana pitanja
          </h1>
          <p
            className="p-style-bold-up text-height-20 top-margin-20 text-color-4"
            style={{ maxWidth: 640, opacity: 0.85 }}
          >
            Odgovori na najčešća pitanja o tehničkom pregledu vozila, zakazivanju,
            dokumentima i uslugama Auto Delića u Nišu.
          </p>
        </header>

        {/* Brz kontakt bar */}
        <div
          className="top-margin-40"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: "20px 28px",
            maxWidth: 680,
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "center",
          }}
        >
          <span className="p-style-bold-up text-color-4" style={{ opacity: 0.7, flexShrink: 0 }}>
            Brzi kontakt:
          </span>
          <a
            href="tel:+381652200739"
            className="p-style-bold-up text-color-4"
            style={{ fontWeight: 700 }}
          >
            +381 65 220 0739
          </a>
          <a
            href="mailto:adtehnickipregled@gmail.com"
            className="p-style-bold-up text-color-4"
            style={{ opacity: 0.85 }}
          >
            adtehnickipregled@gmail.com
          </a>
          <span className="p-style-bold-up text-color-4" style={{ opacity: 0.7 }}>
            Branka Ćosića 3, Niš
          </span>
        </div>

        {/* FAQ Lista */}
        <div className="top-margin-60" style={{ maxWidth: 780 }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: 28,
                marginTop: 28,
              }}
              itemScope
              itemType="https://schema.org/Question"
            >
              <h2
                className="p-style-bold-up text-color-4"
                style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 10 }}
                itemProp="name"
              >
                {faq.name}
              </h2>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p
                  className="p-style-bold-up text-height-20 text-color-4"
                  style={{ opacity: 0.85 }}
                  itemProp="text"
                >
                  {faq.acceptedAnswer.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="top-margin-60" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/zakazivanje" className="border-btn-box border-btn-red animsition-link">
            <span className="border-btn" data-text="Zakaži online" style={{ padding: "12px 28px" }}>
              Zakaži online
            </span>
          </Link>
          <a href="tel:+381652200739" className="border-btn-box">
            <span className="border-btn text-color-4" data-text="Pozovite nas" style={{ padding: "12px 28px" }}>
              Pozovite nas
            </span>
          </a>
        </div>
      </div>
    </main>
  );
}
