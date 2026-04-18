"use client";

import { useState } from "react";

export function PrijavaForm() {
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"id" | "otp">("id");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const r = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) {
      setMsg(j.message || "Greška");
      return;
    }
    setStep("otp");
    setMsg(j.devOtp ? `Dev kod: ${j.devOtp}` : "Kod je poslat na email.");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const r = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ identifier, code }),
    });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) {
      setMsg(j.message || "Greška");
      return;
    }
    window.location.href = "/nalog";
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
      <h1 className="text-2xl font-semibold text-white">Prijava</h1>
      <p className="mt-2 text-sm text-slate-400">
        Unesite email — dobijate OTP kod (bez lozinke). Telefon može posle povezivanja u nalogu.
      </p>

      {step === "id" ? (
        <form className="mt-6 space-y-4" onSubmit={requestOtp}>
          <label className="block text-sm text-slate-300">
            Email
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              type="email"
              required
              autoComplete="email"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Šaljem…" : "Pošalji kod"}
          </button>
        </form>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={verifyOtp}>
          <label className="block text-sm text-slate-300">
            Kod iz emaila
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? "Proveravam…" : "Prijavi me"}
          </button>
          <button
            type="button"
            className="w-full text-sm text-slate-400 underline"
            onClick={() => {
              setStep("id");
              setCode("");
              setMsg(null);
            }}
          >
            Nazad
          </button>
        </form>
      )}

      {msg ? <p className="mt-4 text-sm text-slate-300">{msg}</p> : null}
    </div>
  );
}
