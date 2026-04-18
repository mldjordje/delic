import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Auto Delić</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Tehnički pregled vozila</h1>
        <p className="mt-4 text-lg text-slate-300">
          Novi sajt koristi Next.js API i Neon Postgres. Statički HTML iz starog hostinga nalazi se u{" "}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 text-sm">/legacy</code> (javni URL:{" "}
          <Link className="text-blue-300 underline" href="/legacy/online-zakazivanje.html">
            /legacy/online-zakazivanje.html
          </Link>
          ).
        </p>
        <ul className="mt-10 space-y-3 text-lg">
          <li>
            <Link className="text-blue-300 underline" href="/prijava">
              Prijava / registracija (OTP email)
            </Link>
          </li>
          <li>
            <Link className="text-blue-300 underline" href="/nalog">
              Moj nalog — vozila
            </Link>
          </li>
          <li>
            <Link className="text-blue-300 underline" href="/zakazivanje">
              Zakazivanje termina
            </Link>
          </li>
          <li>
            <Link className="text-blue-300 underline" href="/video">
              Video (YouTube)
            </Link>
          </li>
          <li>
            <Link className="text-blue-300 underline" href="/admin">
              Admin / radnici
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
