"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PrijavaForm } from "@/components/PrijavaForm";

export function PrijavaPageClient() {
  const sp = useSearchParams();
  const nextPath = sp.get("next") || "/nalog";
  const reason = sp.get("reason");

  const message = useMemo(() => {
    switch (reason) {
      case "google-config-missing":
        return "Google prijava nije podešena (nedostaje GOOGLE_CLIENT_ID ili GOOGLE_CLIENT_SECRET na Vercelu).";
      case "session-config-missing":
        return "Prijava nije dostupna (nedostaje AUTH_JWT_SECRET na Vercelu).";
      case "google-denied":
        return "Google prijava je otkazana.";
      case "google-token-failed":
        return "Google prijava nije uspela (razmena koda za token). Proveri da su u Google Cloud Console tačno podešeni redirect URI-ji i da GOOGLE_CLIENT_SECRET na Vercelu odgovara istom OAuth klijentu.";
      case "google-userinfo-failed":
        return "Google prijava nije uspela (čitanje profila). Pokušaj ponovo za minut.";
      case "google-server-error":
        return "Greška na serveru pri završetku prijave (baza ili sesija). Proveri na Vercelu POSTGRES_URL/DATABASE_URL i da su migracije primenjene na Neon; zatim redeploy.";
      case "google-auth-failed":
        return "Google prijava nije uspela. Pokušaj ponovo; ako se ponavlja, proveri Vercel logs za api/auth/google/callback.";
      case "google-state-invalid":
        return "Sesija prijave je istekla. Pokušaj ponovo.";
      case "google-email-missing":
        return "Google nalog nije vratio email (potreban je email).";
      default:
        return null;
    }
  }, [reason]);

  const googleHref = `/api/auth/google?next=${encodeURIComponent(nextPath)}`;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl">
      <h1 className="text-2xl font-semibold">Prijava</h1>
      <p className="mt-1 text-sm text-slate-300">
        Prijavite se Google nalogom, pa dopunite profil i unesite vozila.
      </p>

      {message ? (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {message}
        </div>
      ) : null}

      <div className="mt-5">
        <a
          href={googleHref}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100"
        >
          <span className="inline-block h-5 w-5 rounded-full bg-slate-900/10" />
          Sign in with Google
        </a>
      </div>

      <div className="my-6 border-t border-slate-800" />

      <div className="text-sm text-slate-300">Ako želiš, može i OTP prijava (privremeno).</div>

      <div className="mt-3">
        <PrijavaForm />
      </div>
    </div>
  );
}

