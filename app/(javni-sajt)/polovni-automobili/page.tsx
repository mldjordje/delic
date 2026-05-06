import { PolovniPublicClient } from "@/components/PolovniPublicClient";
import type { Metadata } from "next";
import { getPublicAppUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Polovni automobili Niš — proverena vozila",
  description:
    "Pogledajte ponudu proverenih polovnih automobila u Auto Deliću, Niš. Sva vozila prošla tehnički pregled. Branka Ćosića 3, Niš — pozovite +381 65 220 0739.",
  keywords: [
    "polovni automobili Niš",
    "kupovina polovnog automobila Niš",
    "proverena vozila Niš",
    "Auto Delić polovni automobili",
    "polovna vozila Niš prodaja",
  ],
  openGraph: {
    title: "Polovni automobili Niš — Auto Delić",
    description:
      "Proverena polovna vozila u Nišu. Tehnički pregledana, na jednom mestu.",
    url: "/polovni-automobili",
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
