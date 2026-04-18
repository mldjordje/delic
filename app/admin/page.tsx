import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminHomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session?.sub) {
    redirect("/prijava?next=/admin");
  }
  const role = String(session.role || "");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-semibold text-white">Admin — Auto Delić</h1>
        <p className="text-slate-400">
          Uloga: <span className="text-slate-200">{role}</span>
        </p>
        <ul className="space-y-3 text-lg">
          <li>
            <Link className="text-blue-300 underline" href="/admin/kalendar">
              Kalendar / dnevni pregled
            </Link>
          </li>
          {role === "admin" ? (
            <>
              <li>
                <Link className="text-blue-300 underline" href="/admin/istorija">
                  Svi termini i istorija
                </Link>
              </li>
              <li>
                <Link className="text-blue-300 underline" href="/admin/video">
                  Upravljanje YouTube video zapisima
                </Link>
              </li>
            </>
          ) : null}
        </ul>
        <LogoutButton />
      </div>
    </main>
  );
}
