import Link from "next/link";
import { PolovniPublicClient } from "@/components/PolovniPublicClient";

export const metadata = {
  title: "Polovni automobili",
  description: "Ponuda polovnih vozila — Auto Delić",
};

export default function PolovniAutomobiliPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-sm text-emerald-400/90 hover:text-emerald-300">
            ← Početna
          </Link>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/zakazivanje" className="text-slate-300 hover:text-white">
              Zakazivanje
            </Link>
            <Link href="/prijava" className="text-slate-300 hover:text-white">
              Prijava
            </Link>
            <Link href="/nalog" className="text-slate-300 hover:text-white">
              Moj nalog
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14">
        <header className="mb-12 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-500/90">Ponuda</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white md:text-5xl">Polovni automobili</h1>
          <p className="mt-4 text-lg text-slate-400">
            Pregled vozila koja Auto Delić nudi ili posreduje. Za više informacija pozovite nas ili pišite preko
            kontakt stranice.
          </p>
        </header>

        <PolovniPublicClient />
      </div>
    </main>
  );
}
