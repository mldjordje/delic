import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { AdminIstorijaClient } from "@/components/AdminIstorijaClient";

export default async function AdminIstorijaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session?.sub) {
    redirect("/prijava?next=/admin/istorija");
  }
  if (String(session.role) !== "admin") {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm text-blue-300 hover:underline">
          ← Admin početna
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-white">Istorija termina</h1>
        <p className="mt-2 text-slate-400">Pregled svih rezervacija po periodu (samo glavni admin).</p>
        <div className="mt-10">
          <AdminIstorijaClient />
        </div>
      </div>
    </main>
  );
}
