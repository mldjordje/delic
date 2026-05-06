import { ZakazivanjeClient } from "@/components/ZakazivanjeClient";
import type { Metadata } from "next";
import { getPublicAppUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Online zakazivanje tehničkog pregleda — Niš",
  description:
    "Zakažite termin tehničkog pregleda vozila online — Auto Delić, Branka Ćosića 3, Niš. Brzo, jednostavno i besplatno zakazivanje 24/7. Izaberite datum i vreme koje vam odgovara.",
  keywords: [
    "zakazivanje tehničkog pregleda online Niš",
    "online zakazivanje tehnički pregled",
    "termin tehnički pregled Niš",
    "Auto Delić zakazivanje",
    "tehnički pregled Niš online",
  ],
  openGraph: {
    title: "Online zakazivanje tehničkog pregleda — Auto Delić Niš",
    description:
      "Zakažite termin tehničkog pregleda u Nišu online, 24/7. Branka Ćosića 3.",
    url: "/zakazivanje",
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
