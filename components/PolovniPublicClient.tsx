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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
        Učitavanje ponude…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-6 text-red-200">{error}</div>
    );
  }

  if (listings.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400">
        Trenutno nema aktivnih oglasa. Proverite uskoro ponovo.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {listings.map((l) => (
        <article
          key={l.id}
          className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 shadow-lg shadow-black/20 transition hover:border-emerald-500/30"
        >
          <div className="relative aspect-[16/10] bg-slate-950">
            {l.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={l.imageUrl}
                alt=""
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-600">Bez slike</div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 to-transparent px-4 pb-3 pt-10">
              <p className="text-lg font-semibold text-white">{l.title}</p>
              <p className="text-sm text-slate-300">
                {[l.make, l.year].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 p-5">
            <p className="text-2xl font-bold text-emerald-400">
              {l.priceRsd.toLocaleString("sr-RS")}{" "}
              <span className="text-base font-medium text-slate-400">RSD</span>
            </p>
            {l.mileageKm != null ? (
              <p className="text-sm text-slate-400">Kilometraža: {l.mileageKm.toLocaleString("sr-RS")} km</p>
            ) : null}
            {l.description ? (
              <p className="line-clamp-4 text-sm leading-relaxed text-slate-300">{l.description}</p>
            ) : null}
            {l.contactPhone ? (
              <a
                href={`tel:${l.contactPhone.replace(/\s/g, "")}`}
                className="mt-auto inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Pozovi: {l.contactPhone}
              </a>
            ) : (
              <p className="mt-auto text-xs text-slate-500">Kontakt preko salona — pozovite nas.</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
