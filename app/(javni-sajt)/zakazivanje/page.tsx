import { ZakazivanjeClient } from "@/components/ZakazivanjeClient";

export const metadata = {
  title: "Online zakazivanje — tehnički pregled",
  description: "Zakažite termin tehničkog pregleda u Auto Delić — vozilo i slobodan slot.",
  openGraph: { title: "Online zakazivanje — Auto Delić" },
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
