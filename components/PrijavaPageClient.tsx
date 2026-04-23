"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

type Props = {
  /** Kanonski origin (npr. https://www.autodelic.com) da OAuth uvek krene na istom hostu kao callback. */
  oauthStartUrl?: string;
};

export function PrijavaPageClient({ oauthStartUrl }: Props) {
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

  const googleBase = (oauthStartUrl || "").trim().replace(/\/+$/, "");
  const googleHref = googleBase
    ? `${googleBase}/api/auth/google?next=${encodeURIComponent(nextPath)}`
    : `/api/auth/google?next=${encodeURIComponent(nextPath)}`;

  return (
    <div className="dark-bg-2 client-card">
      <h2 className="medium-title text-color-4">Prijava</h2>
      <p className="p-style-bold-up text-height-20 top-margin-20 text-color-4">
        Prijavite se Google nalogom, pa dopunite profil (ime i telefon) i unesite vozila.
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
          <span
            style={{
              display: "inline-block",
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.08)",
            }}
          />
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
