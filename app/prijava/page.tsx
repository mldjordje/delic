import Link from "next/link";
import { Suspense } from "react";
import { PrijavaPageClient } from "@/components/PrijavaPageClient";

export default function PrijavaPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-300 hover:underline">
            ← Početna
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl">
              <h1 className="text-2xl font-semibold">Prijava</h1>
              <p className="mt-3 text-sm text-slate-300">Učitavanje…</p>
            </div>
          }
        >
          <PrijavaPageClient />
        </Suspense>
      </div>
    </main>
  );
}
