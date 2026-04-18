import Link from "next/link";
import { ZakazivanjeClient } from "@/components/ZakazivanjeClient";

export default function ZakazivanjePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <Link href="/nalog" className="text-sm text-blue-300 hover:underline">
          ← Moj nalog
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-white">Zakazivanje</h1>
        <p className="mt-2 text-slate-400">
          Jedan termin traje tačno 30 minuta, bez pauze između slotova. Nakon slanja dobijate potvrdu na email.
        </p>
        <div className="mt-8">
          <ZakazivanjeClient />
        </div>
      </div>
    </main>
  );
}
