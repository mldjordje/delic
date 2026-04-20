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
    <div>
      <p className="p-style-bold-up text-height-20 text-color-4">
        Unesite email — dobijate OTP kod (bez lozinke). Telefon može posle povezivanja u nalogu.
      </p>

      {step === "id" ? (
        <form className="top-margin-30" onSubmit={requestOtp}>
          <label className="p-style-bold-up text-color-4" style={{ display: "block" }}>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </label>
          <div className="top-margin-30">
            <div className="border-btn-box border-btn-red pointer-large">
              <div className="border-btn-inner">
                <button type="submit" className="border-btn" data-text={loading ? "Šaljem…" : "Pošalji kod"} disabled={loading}>
                  {loading ? "Šaljem…" : "Pošalji kod"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <form className="top-margin-30" onSubmit={verifyOtp}>
          <label className="p-style-bold-up text-color-4" style={{ display: "block" }}>
            Kod iz emaila
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              required
              style={{ marginTop: 8, letterSpacing: "0.2em" }}
            />
          </label>
          <div className="top-margin-30">
            <div className="border-btn-box border-btn-red pointer-large">
              <div className="border-btn-inner">
                <button type="submit" className="border-btn" data-text={loading ? "Proveravam…" : "Prijavi me"} disabled={loading}>
                  {loading ? "Proveravam…" : "Prijavi me"}
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="pointer-large xsmall-title-oswald text-color-4 top-margin-20"
            style={{ background: "none", border: 0, cursor: "pointer", textDecoration: "underline" }}
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

      {msg ? (
        <p className="top-margin-20 p-style-bold-up text-color-4" style={{ marginBottom: 0 }}>
          {msg}
        </p>
      ) : null}
    </div>
  );
}
