import type { Metadata } from "next";
import { ZakazivanjeClient } from "@/components/ZakazivanjeClient";
import { getPublicAppUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Online zakazivanje tehničkog pregleda — Niš",
  description:
    "Zakažite tehnički pregled vozila online u Auto Delić, Niš. Odaberite vozilo, slobodan termin i potvrdite rezervaciju u par klikova.",
  keywords: [
    "zakazivanje tehničkog pregleda",
    "tehnički pregled online",
    "tehnički pregled Niš zakazivanje",
    "Auto Delić zakazivanje",
  ],
  openGraph: {
    title: "Online zakazivanje tehničkog pregleda — Auto Delić Niš",
    description:
      "Zakažite tehnički pregled vozila online. Odaberite vozilo i slobodan termin — brzo i jednostavno.",
    url: `${getPublicAppUrl()}/zakazivanje`,
    images: [{ url: "/assets/images/logonovi.png", width: 512, height: 512, alt: "Auto Delić" }],
  },
  alternates: { canonical: `${getPublicAppUrl()}/zakazivanje` },
};

export default function ZakazivanjePage() {
  return (
    <main className="dark-bg-1">
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
