"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  startsAt: string;
  inspectionResult: "passed" | "failed" | null;
  inspectionNote: string | null;
  serviceName: string;
  vehicle: { make: string; year: number; plateNumber?: string | null };
  client: { email: string | null; fullName: string | null };
};

export default function AdminNotesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setErr("");
      const r = await fetch("/api/admin/inspection-notes", { credentials: "include" });
      const j = await r.json().catch(() => null);
      setLoading(false);
      if (!r.ok) {
        setErr(j?.message || "Nemate pristup ili greška pri učitavanju.");
        return;
      }
      setRows((j?.items || []) as Row[]);
    })();
  }, []);

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Napomene — tehnički pregled</h2>
        <p style={{ color: "#94a3b8", maxWidth: 720, fontSize: 14 }}>
          Pregled završenih termina sa unetim rezultatima. Unos je obavezan pri označavanju termina kao završenog.
        </p>
        {err ? <p style={{ color: "#f87171", marginTop: 12 }}>{err}</p> : null}
        {loading ? <p style={{ color: "#94a3b8" }}>Učitavanje…</p> : null}
        {!loading && !rows.length ? <p style={{ color: "#94a3b8" }}>Još nema unetih napomena posle pregleda.</p> : null}
        <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
          {rows.map((b) => (
            <div
              key={b.id}
              style={{
                border: "1px solid rgba(148, 163, 184, 0.35)",
                borderRadius: 10,
                padding: 14,
                background: "rgba(15, 23, 42, 0.45)",
              }}
            >
              <p style={{ margin: 0, color: "#e2e8f0", fontWeight: 600 }}>
                {b.serviceName} — {b.vehicle.make} ({b.vehicle.year})
                {b.vehicle.plateNumber ? ` · ${b.vehicle.plateNumber}` : ""}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 14, color: "#94a3b8" }}>
                {new Date(b.startsAt).toLocaleString("sr-RS", { timeZone: "Europe/Belgrade" })} ·{" "}
                {b.client.fullName || b.client.email || "Klijent"}
              </p>
              <p style={{ margin: "10px 0 0", fontSize: 14, color: "#e2e8f0" }}>
                Rezultat:{" "}
                {b.inspectionResult === "passed" ? "Položio" : b.inspectionResult === "failed" ? "Nije položio" : "—"}
              </p>
              {b.inspectionNote ? (
                <p style={{ margin: "8px 0 0", fontSize: 14, color: "#cbd5e1", whiteSpace: "pre-wrap" }}>
                  {b.inspectionNote}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
