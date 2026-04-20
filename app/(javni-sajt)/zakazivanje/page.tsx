import { ZakazivanjeClient } from "@/components/ZakazivanjeClient";

export const metadata = {
  title: "Online zakazivanje",
  description: "Zakažite termin u Auto Delić — izbor usluge, vozila i vremena.",
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
            Izaberite uslugu (trajanje i cenu vidi ispod), zatim vozilo i slobodan termin. Posle prijave možete
            upravljati vozilima u delu „Moj nalog“.
          </p>
        </header>

        <ZakazivanjeClient />
      </div>
    </main>
  );
}
