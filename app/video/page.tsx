import Link from "next/link";
import { VideoPublicClient } from "@/components/VideoPublicClient";

export default function VideoPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-blue-300 hover:underline">
          ← Početna
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-white">Video</h1>
        <p className="mt-2 text-slate-400">YouTube sadržaji koje dodaje administrator.</p>
        <VideoPublicClient />
      </div>
    </main>
  );
}
