import Link from "next/link";
import { NalogClient } from "@/components/NalogClient";

export default function NalogPage() {
  return (
    <main className="dark-bg-1">
      <div className="container top-bottom-padding-120">
        <div
          className="flex-container response-999 top-margin-20"
          style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}
        >
          <Link href="/" className="pointer-large xsmall-title-oswald text-color-4">
            ← Početna
          </Link>
          <div className="border-btn-box border-btn-red pointer-large">
            <div className="border-btn-inner">
              <Link href="/zakazivanje" className="border-btn" data-text="Zakazivanje">
                Zakazivanje
              </Link>
            </div>
          </div>
        </div>
        <h2 className="large-title-bold text-color-4">
          <span className="overlay-loading2 overlay-light-bg-1">Moj nalog</span>
        </h2>
        <p className="p-style-bold-up text-height-20 top-margin-20 text-color-4">Upravljanje profilom i pregled vozila.</p>
        <div className="top-margin-40">
          <NalogClient />
        </div>
      </div>
    </main>
  );
}
