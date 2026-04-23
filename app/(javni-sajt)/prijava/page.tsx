import Link from "next/link";
import { Suspense } from "react";
import { headers } from "next/headers";
import { PrijavaPageClient } from "@/components/PrijavaPageClient";

function oauthStartUrlFromHeaders(headerList: Headers) {
  const hostHeader =
    headerList.get("x-forwarded-host")?.split(",")[0]?.trim() || headerList.get("host") || "";
  const proto = (headerList.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https").replace(
    /:$/,
    ""
  );
  try {
    const origin = new URL(`${proto}://${hostHeader}`).origin;
    const hn = new URL(origin).hostname.toLowerCase();
    if (hn === "autodelic.com" || hn === "www.autodelic.com") return "https://www.autodelic.com";
    return origin;
  } catch {
    return "";
  }
}

export default async function PrijavaPage() {
  const headerList = await headers();
  const oauthStartUrl = oauthStartUrlFromHeaders(headerList);

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
          <PrijavaPageClient oauthStartUrl={oauthStartUrl || undefined} />
        </Suspense>
      </div>
    </main>
  );
}
