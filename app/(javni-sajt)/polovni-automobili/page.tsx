import type { Metadata } from "next";
import { PolovniPublicClient } from "@/components/PolovniPublicClient";
import { getPublicAppUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Polovni automobili — Niš",
  description:
    "Pregled ponude polovnih vozila u Auto Delić, Niš. Razne marke, godišta i cenovni rangovi. Za detalje pozovite nas ili pišite putem kontakt stranice.",
  keywords: [
    "polovni automobili Niš",
    "polovna vozila Niš",
    "Auto Delić automobili",
    "kupovina polovnog automobila Niš",
  ],
  openGraph: {
    title: "Polovni automobili — Auto Delić Niš",
    description:
      "Ponuda polovnih vozila raznih marki i godišta. Kontaktirajte Auto Delić u Nišu za detalje i cene.",
    url: `${getPublicAppUrl()}/polovni-automobili`,
    images: [{ url: "/assets/images/logonovi.png", width: 512, height: 512, alt: "Auto Delić" }],
  },
  alternates: { canonical: `${getPublicAppUrl()}/polovni-automobili` },
};

export default function PolovniAutomobiliPage() {
  return (
    <main className="dark-bg-1">
      <div className="container top-bottom-padding-120">
        <header className="top-margin-20">
          <p className="small-title-oswald text-color-4">Ponuda</p>
          <h2 className="large-title-bold text-color-4 top-margin-10">
            <span className="overlay-loading2 overlay-light-bg-1">Polovni automobili</span>
          </h2>
          <p className="p-style-bold-up text-height-20 top-margin-20 text-color-4" style={{ maxWidth: 640 }}>
            Pregled vozila koja Auto Delić nudi ili posreduje. Za više informacija pozovite nas ili pišite preko
            kontakt stranice.
          </p>
        </header>

        <PolovniPublicClient />
      </div>
    </main>
  );
}
