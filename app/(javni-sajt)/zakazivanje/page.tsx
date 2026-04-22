import dynamic from "next/dynamic";

const ZakazivanjeClient = dynamic(
  () => import("@/components/ZakazivanjeClient").then((m) => m.ZakazivanjeClient),
  { ssr: false, loading: () => <p className="p-style-bold-up text-color-4 top-margin-20">Učitavanje…</p> }
);

export const metadata = {
  title: "Online zakazivanje — tehnički pregled",
  description: "Zakažite termin tehničkog pregleda u Auto Delić — vozilo i slobodan slot.",
  openGraph: { title: "Online zakazivanje — Auto Delić" },
};

export default function ZakazivanjePage() {
  return (
    <main className="dark-bg-1">
      <div className="container top-bottom-padding-120">
        <header className="top-margin-20">
          <p className="small-title-oswald text-color-4">Online zakazivanje</p>
          <h2 className="large-title-bold text-color-4 top-margin-10">
            <span className="overlay-loading2 overlay-light-bg-1">Zakažite termin</span>
          </h2>
          <p className="p-style-bold-up text-height-20 top-margin-20 text-color-4" style={{ maxWidth: 640 }}>
            Zakazujete isključivo tehnički pregled vozila. Izaberite vozilo i slobodan termin. Nakon prijave, vozila
            upravljate u delu „Moj nalog“.
          </p>
        </header>

        <ZakazivanjeClient />
      </div>
    </main>
  );
}
