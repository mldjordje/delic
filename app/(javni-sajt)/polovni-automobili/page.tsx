import { PolovniPublicClient } from "@/components/PolovniPublicClient";

export const metadata = {
  title: "Polovni automobili",
  description: "Ponuda polovnih vozila — Auto Delić",
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
