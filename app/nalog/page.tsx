import Link from "next/link";
import { NalogClient } from "@/components/NalogClient";

export default function NalogPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm text-blue-300 hover:underline">
            ← Početna
          </Link>
          <Link
            href="/zakazivanje"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Zakazivanje
          </Link>
        </div>
        <h1 className="text-3xl font-semibold text-white">Moj nalog</h1>
        <p className="mt-2 text-slate-400">Upravljanje profilom i pregled vozila.</p>
        <div className="mt-8">
          <NalogClient />
        </div>
      </div>
    </main>
  );
}
