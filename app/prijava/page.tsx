import Link from "next/link";
import { PrijavaForm } from "@/components/PrijavaForm";

export default function PrijavaPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-300 hover:underline">
            ← Početna
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl">
          <h1 className="text-2xl font-semibold">Prijava</h1>
          <p className="mt-1 text-sm text-slate-300">
            Prijavite se Google nalogom, pa dopunite profil i unesite vozila.
          </p>

          <div className="mt-5">
            <a
              href="/api/auth/google?next=/nalog"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              <span className="inline-block h-5 w-5 rounded-full bg-slate-900/10" />
              Sign in with Google
            </a>
          </div>

          <div className="my-6 border-t border-slate-800" />

          <div className="text-sm text-slate-300">
            Ako želiš, može i OTP prijava (privremeno).
          </div>

          <div className="mt-3">
            <PrijavaForm />
          </div>
        </div>
      </div>
    </main>
  );
}
