import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { AdminKalendarClient } from "@/components/AdminKalendarClient";

export default async function AdminKalendarPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session?.sub) {
    redirect("/prijava?next=/admin/kalendar");
  }
  const role = String(session.role || "");
  if (role !== "admin" && role !== "staff") {
    redirect("/prijava");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/admin" className="text-sm text-blue-300 hover:underline">
            ← Admin početna
          </Link>
        </div>
        <h1 className="text-3xl font-semibold text-white">Kalendar / dnevni pregled</h1>
        <p className="mt-2 text-slate-400">
          Pregled termina, izmena statusa i unos napomena nakon tehničkog pregleda.
        </p>
        <div className="mt-10">
          <AdminKalendarClient isAdmin={role === "admin"} />
        </div>
      </div>
    </main>
  );
}
