"use client";

import { useEffect, useState } from "react";

type Listing = {
  id: string;
  title: string;
  make: string | null;
  year: number | null;
  priceRsd: number;
  mileageKm: number | null;
  description: string | null;
  imageUrl: string | null;
  contactPhone: string | null;
};

export function PolovniPublicClient() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/used-cars");
      const j = await r.json().catch(() => null);
      if (!r.ok) {
        setError(j?.message || "Greška pri učitavanju");
        setLoading(false);
        return;
      }
      setListings((j?.listings || []) as Listing[]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="dark-bg-2 client-card client-card-wide top-margin-20">
        <p className="p-style-bold-up text-color-4">Učitavanje ponude…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-msg-warn">
        <p className="p-style-bold-up text-color-4" style={{ margin: 0 }}>
          {error}
        </p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <p className="p-style-bold-up text-color-4 dark-bg-2 top-bottom-padding-40 content-padding-l-r-20" style={{ opacity: 0.85 }}>
        Trenutno nema aktivnih oglasa. Proverite uskoro ponovo.
      </p>
    );
  }

  return (
    <div className="client-polovni-grid">
      {listings.map((l) => (
        <article key={l.id} className="client-polovni-card pointer-large">
          <div className="client-polovni-card-img">
            {l.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={l.imageUrl} alt="" />
            ) : (
              <div
                className="p-style-bold-up text-color-4"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  opacity: 0.45,
                }}
              >
                Bez slike
              </div>
            )}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "12px 16px",
                background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
              }}
            >
              <span className="small-title-oswald text-color-4" style={{ display: "block" }}>
                {l.title}
              </span>
              <span className="xsmall-title-oswald text-color-4" style={{ opacity: 0.85 }}>
                {[l.make, l.year].filter(Boolean).join(" · ") || "—"}
              </span>
            </div>
          </div>
          <div className="top-bottom-padding-30 content-padding-l-r-20" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <p className="large-title-bold red-color" style={{ fontSize: "1.75rem", margin: 0 }}>
              {l.priceRsd.toLocaleString("sr-RS")}{" "}
              <span className="xsmall-title-oswald text-color-4" style={{ fontWeight: 400 }}>
                RSD
              </span>
            </p>
            {l.mileageKm != null ? (
              <p className="p-style-bold-up text-color-4" style={{ opacity: 0.85 }}>
                Kilometraža: {l.mileageKm.toLocaleString("sr-RS")} km
              </p>
            ) : null}
            {l.description ? (
              <p className="p-style-bold-up text-color-4" style={{ opacity: 0.9, lineHeight: 1.5 }}>
                {l.description.length > 280 ? `${l.description.slice(0, 280)}…` : l.description}
              </p>
            ) : null}
            {l.contactPhone ? (
              <div className="top-margin-20">
                <div className="border-btn-box border-btn-red pointer-large">
                  <div className="border-btn-inner">
                    <a href={`tel:${l.contactPhone.replace(/\s/g, "")}`} className="border-btn" data-text={`Pozovi: ${l.contactPhone}`}>
                      Pozovi: {l.contactPhone}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <p className="xsmall-title-oswald text-color-4 top-margin-auto" style={{ opacity: 0.65, marginTop: "auto" }}>
                Kontakt preko salona — pozovite nas.
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
