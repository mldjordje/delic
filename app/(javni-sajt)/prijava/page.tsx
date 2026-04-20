import Link from "next/link";
import { Suspense } from "react";
import { PrijavaPageClient } from "@/components/PrijavaPageClient";

export default function PrijavaPage() {
  return (
    <main className="dark-bg-1">
      <div className="container top-bottom-padding-120">
        <div className="top-margin-20">
          <Link href="/" className="pointer-large xsmall-title-oswald text-color-4">
            ← Početna
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="dark-bg-2 top-bottom-padding-30 top-margin-20">
              <h2 className="medium-title text-color-4">Prijava</h2>
              <p className="top-margin-20 p-style-bold-up text-color-4">Učitavanje…</p>
            </div>
          }
        >
          <PrijavaPageClient />
        </Suspense>
      </div>
    </main>
  );
}
