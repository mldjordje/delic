import type { Metadata } from "next";
import { ZakazivanjeClient } from "@/components/ZakazivanjeClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicAppUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Online zakazivanje tehničkog pregleda — Niš",
  description:
    "Zakažite tehnički pregled vozila online u Auto Delić, Niš. Izaberite vozilo i slobodan termin — bez čekanja u redu.",
  alternates: { canonical: "/zakazivanje" },
  openGraph: {
    title: "Online zakazivanje tehničkog pregleda — Auto Delić, Niš",
    description: "Izaberite vozilo i slobodan termin za tehnički pregled. Brzo i online.",
    url: "/zakazivanje",
  },
};

export default function ZakazivanjePage() {
  const base = getPublicAppUrl();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Tehnički pregled vozila — online zakazivanje",
      serviceType: "Tehnički pregled vozila",
      areaServed: { "@type": "City", name: "Niš" },
      provider: {
        "@type": "AutoRepair",
        name: "Auto Delić — Tehnički pregled",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Bulevar Svetog cara Konstantina 67",
          addressLocality: "Niš",
          postalCode: "18000",
          addressCountry: "RS",
        },
        telephone: "+38162443050",
      },
      potentialAction: {
        "@type": "ReserveAction",
        target: `${base}/zakazivanje`,
        name: "Zakaži tehnički pregled",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Početna", item: `${base}/` },
        { "@type": "ListItem", position: 2, name: "Online zakazivanje", item: `${base}/zakazivanje` },
      ],
    },
  ];

  return (
    <main className="dark-bg-1">
      <JsonLd data={structuredData} />
      <div className="container top-bottom-padding-120">
        <div className="top-margin-20">
          <p className="small-title-oswald text-color-4">Online zakazivanje</p>
          <p
            className="p-style-bold-up text-height-20 top-margin-20 text-color-4"
            style={{ maxWidth: 640, marginTop: 16 }}
          >
            Zakazujete isključivo tehnički pregled vozila. Izaberite vozilo i slobodan termin.
            Nakon prijave, vozila upravljate u delu Moj nalog.
          </p>
        </div>

        <div className="top-margin-40">
          <ZakazivanjeClient />
        </div>
      </div>
    </main>
  );
}
