import Link from "next/link";
import { ZakazivanjeClient } from "@/components/ZakazivanjeClient";

export const metadata = {
  title: "Online zakazivanje",
  description: "Zakažite termin u Auto Delić — izbor usluge, vozila i vremena.",
};

export default function ZakazivanjePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-sm text-emerald-400/90 hover:text-emerald-300">
            ← Početna
          </Link>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/polovni-automobili" className="text-slate-300 hover:text-white">
              Polovni automobili
            </Link>
            <Link href="/nalog" className="text-slate-300 hover:text-white">
              Moj nalog
            </Link>
            <Link href="/prijava?next=%2Fzakazivanje" className="text-slate-300 hover:text-white">
              Prijava
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <header className="mb-10 md:mb-14">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-500/90">Online zakazivanje</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white md:text-5xl">Zakažite termin</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            Izaberite uslugu (trajanje i cenu vidi ispod), zatim vozilo i slobodan termin. Posle prijave
            možete upravljati vozilima u delu „Moj nalog“.
          </p>
        </header>

        <ZakazivanjeClient />
      </div>
    </main>
  );
}
