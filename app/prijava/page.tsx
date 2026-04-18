import Link from "next/link";
import { PrijavaForm } from "@/components/PrijavaForm";

export default function PrijavaPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <div className="mb-8 text-center">
        <Link href="/" className="text-sm text-blue-300 hover:underline">
          ← Početna
        </Link>
      </div>
      <PrijavaForm />
    </main>
  );
}
