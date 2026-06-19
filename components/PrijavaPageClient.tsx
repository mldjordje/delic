"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

type Props = {
  /** Kanonski origin (npr. https://www.autodelic.com) da OAuth uvek krene na istom hostu kao callback. */
  oauthStartUrl?: string;
};

export function PrijavaPageClient({ oauthStartUrl }: Props) {
  const sp = useSearchParams();
  const nextPath = sp.get("next") || "/dashboard";
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

  const googleBase = (oauthStartUrl || "").trim().replace(/\/+$/, "");
  const googleHref = googleBase
    ? `${googleBase}/api/auth/google?next=${encodeURIComponent(nextPath)}`
    : `/api/auth/google?next=${encodeURIComponent(nextPath)}`;

  return (
    <div className="dark-bg-2 client-card">
      <p className="client-eyebrow">Vaš Auto Delić nalog</p>
      <h2 className="medium-title text-color-4">Prijavite se</h2>
      <p className="p-style-bold-up text-height-20 top-margin-20 text-color-4">
        Jedna prijava vodi vas direktno u deo sistema koji pripada vašem nalogu.
        Korisnici mogu da upravljaju vozilima i terminima.
      </p>

      {message ? (
        <div className="client-alert">
          <p className="p-style-bold-up text-color-4" style={{ margin: 0 }}>
            {message}
          </p>
        </div>
      ) : null}

      <div className="top-margin-30">
        <a href={googleHref} className="client-google-btn pointer-large">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.62.39 3.15 1.04 4.55l3.35-2.62Z" />
            <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
          </svg>
          Nastavi pomoću Google naloga
        </a>
      </div>
      <p className="client-login-note">
        Posle prijave automatski otvaramo odgovarajući deo aplikacije.
      </p>
    </div>
  );
}
