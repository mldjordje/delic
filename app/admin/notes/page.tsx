"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  startsAt: string;
  status: string;
  inspectionResult: "passed" | "failed" | null;
  inspectionNote: string | null;
  followUpOn: string | null;
  followUpNote: string | null;
  followUpDone: boolean;
  serviceName: string;
  vehicle: { make: string; year: number; plateNumber?: string | null };
  client: { email: string | null; fullName: string | null; phone?: string | null };
};

type Filter = "all" | "passed" | "failed" | "followup";

type Draft = {
  inspectionResult: "passed" | "failed" | "";
  inspectionNote: string;
  followUpOn: string;
  followUpNote: string;
  followUpDone: boolean;
};

const MUTED = "#94a3b8";
const FG = "#e2e8f0";

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("sr-RS", {
    timeZone: "Europe/Belgrade",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString("sr-RS", { timeZone: "Europe/Belgrade" });
}

function daysUntil(d: string) {
  const ms = new Date(`${d}T00:00:00`).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function AdminNotesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  async function load() {
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
  }

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const passed = rows.filter((r) => r.inspectionResult === "passed").length;
    const failed = rows.filter((r) => r.inspectionResult === "failed").length;
    const followup = rows.filter((r) => r.followUpOn && !r.followUpDone).length;
    return { total: rows.length, passed, failed, followup };
  }, [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows
      .filter((r) => {
        if (filter === "passed") return r.inspectionResult === "passed";
        if (filter === "failed") return r.inspectionResult === "failed";
        if (filter === "followup") return Boolean(r.followUpOn) && !r.followUpDone;
        return true;
      })
      .filter((r) => {
        if (!s) return true;
        return (
          (r.client.fullName || "").toLowerCase().includes(s) ||
          (r.client.email || "").toLowerCase().includes(s) ||
          (r.vehicle.plateNumber || "").toLowerCase().includes(s) ||
          (r.vehicle.make || "").toLowerCase().includes(s)
        );
      });
  }, [rows, filter, q]);

  function startEdit(r: Row) {
    setToast(null);
    setEditId(r.id);
    setDraft({
      inspectionResult: r.inspectionResult ?? "",
      inspectionNote: r.inspectionNote ?? "",
      followUpOn: r.followUpOn ?? "",
      followUpNote: r.followUpNote ?? "",
      followUpDone: r.followUpDone,
    });
  }

  function cancelEdit() {
    setEditId(null);
    setDraft(null);
  }

  async function save(id: string) {
    if (!draft) return;
    if (!draft.inspectionResult) {
      setToast({ tone: "warn", text: "Izaberite rezultat (Položio / Nije položio)." });
      return;
    }
    if (!draft.inspectionNote.trim()) {
      setToast({ tone: "warn", text: "Napomena je obavezna." });
      return;
    }
    setSaving(true);
    const r = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inspectionResult: draft.inspectionResult,
        inspectionNote: draft.inspectionNote.trim(),
        followUpOn: draft.followUpOn ? draft.followUpOn : null,
        followUpNote: draft.followUpNote.trim() ? draft.followUpNote.trim() : null,
        followUpDone: draft.followUpDone,
      }),
    });
    const j = await r.json().catch(() => null);
    setSaving(false);
    if (!r.ok || !j?.ok) {
      setToast({ tone: "warn", text: j?.message || "Čuvanje nije uspelo." });
      return;
    }
    setToast({ tone: "ok", text: "Sačuvano." });
    cancelEdit();
    void load();
  }

  async function toggleFollowDone(r: Row) {
    setToast(null);
    const r2 = await fetch(`/api/admin/bookings/${r.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpDone: !r.followUpDone }),
    });
    if (!r2.ok) {
      setToast({ tone: "warn", text: "Nije uspelo." });
      return;
    }
    void load();
  }

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 6 }}>Napomene i praćenje</h2>
            <p style={{ color: MUTED, maxWidth: 640, fontSize: 14, margin: 0 }}>
              Rezultati završenih tehničkih pregleda. Izmenite rezultat/napomenu i
              postavite podsetnik (follow-up) za poziv klijentu ili istek registracije.
            </p>
          </div>
        </div>

        {/* Statistika */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginTop: 16 }}>
          <StatPill label="Ukupno" value={stats.total} color="#cbd5e1" />
          <StatPill label="Položili" value={stats.passed} color="#16a34a" />
          <StatPill label="Pali" value={stats.failed} color="#dc2626" />
          <StatPill label="Za praćenje" value={stats.followup} color="#ca8a04" />
        </div>

        {/* Filter + pretraga */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {([
              ["all", "Sve"],
              ["passed", "Položili"],
              ["failed", "Pali"],
              ["followup", "Za praćenje"],
            ] as [Filter, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: filter === key ? "1.5px solid #ffbf00" : "1.5px solid rgba(217,232,248,0.18)",
                  background: filter === key ? "rgba(255,191,0,0.14)" : "rgba(255,255,255,0.03)",
                  color: filter === key ? "#ffbf00" : MUTED,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            className="admin-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pretraga: klijent, tablice…"
            style={{ flex: "1 1 220px", maxWidth: 320 }}
          />
        </div>

        {toast ? (
          <div
            style={{
              marginTop: 14,
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 13,
              background: toast.tone === "ok" ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
              color: toast.tone === "ok" ? "#4ade80" : "#f87171",
              border: `1px solid ${toast.tone === "ok" ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)"}`,
            }}
          >
            {toast.text}
          </div>
        ) : null}

        {err ? <p style={{ color: "#f87171", marginTop: 12 }}>{err}</p> : null}
        {loading ? <p style={{ color: MUTED, marginTop: 12 }}>Učitavanje…</p> : null}
        {!loading && !filtered.length ? (
          <p style={{ color: MUTED, marginTop: 16 }}>Nema napomena za izabrani filter.</p>
        ) : null}

        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
          {filtered.map((b) => {
            const editing = editId === b.id;
            const passed = b.inspectionResult === "passed";
            const followPending = Boolean(b.followUpOn) && !b.followUpDone;
            const left = b.followUpOn ? daysUntil(b.followUpOn) : null;
            return (
              <div
                key={b.id}
                className="admin-card"
                style={{
                  background: "rgba(12, 18, 29, 0.6)",
                  border: `1px solid ${followPending ? "rgba(202,138,4,0.45)" : "rgba(148,163,184,0.22)"}`,
                  borderLeft: `4px solid ${b.inspectionResult === "passed" ? "#16a34a" : b.inspectionResult === "failed" ? "#dc2626" : "#475569"}`,
                }}
              >
                {/* Zaglavlje kartice */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, color: FG, fontWeight: 700 }}>
                      {b.vehicle.make} ({b.vehicle.year})
                      {b.vehicle.plateNumber ? <span style={{ color: MUTED }}> · {b.vehicle.plateNumber}</span> : null}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>
                      {b.client.fullName || b.client.email || "Klijent"}
                      {b.client.phone ? ` · ${b.client.phone}` : ""}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
                      {b.serviceName} · {fmtDateTime(b.startsAt)}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <Badge
                      text={passed ? "Položio" : b.inspectionResult === "failed" ? "Nije položio" : "—"}
                      color={passed ? "#16a34a" : b.inspectionResult === "failed" ? "#dc2626" : "#64748b"}
                    />
                    {!editing ? (
                      <button type="button" className="admin-template-link-btn" onClick={() => startEdit(b)} style={{ padding: "6px 12px" }}>
                        Izmeni
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Prikaz (van edita) */}
                {!editing ? (
                  <>
                    {b.inspectionNote ? (
                      <p style={{ margin: "12px 0 0", fontSize: 14, color: "#cbd5e1", whiteSpace: "pre-wrap" }}>
                        {b.inspectionNote}
                      </p>
                    ) : null}

                    {b.followUpOn ? (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "10px 12px",
                          borderRadius: 8,
                          background: b.followUpDone ? "rgba(22,163,74,0.08)" : "rgba(202,138,4,0.1)",
                          border: `1px solid ${b.followUpDone ? "rgba(22,163,74,0.3)" : "rgba(202,138,4,0.35)"}`,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontSize: 13, color: FG }}>
                          <span style={{ fontWeight: 700 }}>
                            {b.followUpDone ? "✓ Follow-up obavljen" : "⏰ Follow-up"}
                          </span>{" "}
                          · {fmtDate(b.followUpOn)}
                          {!b.followUpDone && left != null ? (
                            <span style={{ color: left <= 0 ? "#f87171" : left <= 7 ? "#fbbf24" : MUTED }}>
                              {" "}
                              ({left > 0 ? `još ${left} d` : left === 0 ? "danas" : `kasni ${-left} d`})
                            </span>
                          ) : null}
                          {b.followUpNote ? <div style={{ color: MUTED, marginTop: 4 }}>{b.followUpNote}</div> : null}
                        </div>
                        <button
                          type="button"
                          className="admin-template-link-btn"
                          onClick={() => void toggleFollowDone(b)}
                          style={{ padding: "6px 12px" }}
                        >
                          {b.followUpDone ? "Vrati u aktivno" : "Označi gotovo"}
                        </button>
                      </div>
                    ) : null}
                  </>
                ) : (
                  /* Edit forma */
                  draft ? (
                    <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
                      <div>
                        <Label>Rezultat pregleda</Label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
                          {([
                            ["passed", "✅ Položio", "#16a34a"],
                            ["failed", "❌ Nije položio", "#dc2626"],
                          ] as ["passed" | "failed", string, string][]).map(([val, label, color]) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setDraft({ ...draft, inspectionResult: val })}
                              style={{
                                padding: "10px 12px",
                                borderRadius: 8,
                                border: draft.inspectionResult === val ? `1.5px solid ${color}` : "1.5px solid rgba(255,255,255,0.08)",
                                background: draft.inspectionResult === val ? `${color}26` : "rgba(255,255,255,0.03)",
                                color: draft.inspectionResult === val ? color : MUTED,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <label className="admin-field" style={{ gap: 6, marginBottom: 0 }}>
                        <Label>Napomena</Label>
                        <textarea
                          className="admin-input"
                          rows={3}
                          value={draft.inspectionNote}
                          onChange={(e) => setDraft({ ...draft, inspectionNote: e.target.value })}
                          placeholder="Nalaz pregleda, primedbe, preporuke…"
                        />
                      </label>

                      <div
                        style={{
                          padding: "12px",
                          borderRadius: 8,
                          border: "1px dashed rgba(202,138,4,0.4)",
                          background: "rgba(202,138,4,0.06)",
                          display: "grid",
                          gap: 10,
                        }}
                      >
                        <Label>Follow-up / podsetnik (opciono)</Label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                          <label className="admin-field" style={{ gap: 6, marginBottom: 0, flex: "0 0 auto" }}>
                            <span style={{ fontSize: 12, color: MUTED }}>Datum</span>
                            <input
                              type="date"
                              className="admin-input"
                              value={draft.followUpOn}
                              onChange={(e) => setDraft({ ...draft, followUpOn: e.target.value })}
                            />
                          </label>
                          <label className="admin-field" style={{ gap: 6, marginBottom: 0, flex: "1 1 200px" }}>
                            <span style={{ fontSize: 12, color: MUTED }}>Razlog</span>
                            <input
                              className="admin-input"
                              value={draft.followUpNote}
                              onChange={(e) => setDraft({ ...draft, followUpNote: e.target.value })}
                              placeholder="npr. pozvati za ponovni pregled / ističe registracija"
                            />
                          </label>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: FG, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={draft.followUpDone}
                            onChange={(e) => setDraft({ ...draft, followUpDone: e.target.checked })}
                            style={{ width: 16, height: 16 }}
                          />
                          Follow-up je obavljen
                        </label>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => void save(b.id)}
                          disabled={saving}
                          style={{
                            flex: "1 1 140px",
                            padding: "10px 16px",
                            borderRadius: 8,
                            border: "none",
                            background: "#2563eb",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            opacity: saving ? 0.6 : 1,
                          }}
                        >
                          {saving ? "Čuvam…" : "Sačuvaj"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          style={{
                            padding: "10px 16px",
                            borderRadius: 8,
                            border: "1.5px solid rgba(255,255,255,0.12)",
                            background: "rgba(255,255,255,0.04)",
                            color: MUTED,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Otkaži
                        </button>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        border: "1px solid rgba(217,232,248,0.18)",
        background: "rgba(255,255,255,0.03)",
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color,
        background: `${color}1f`,
        border: `1px solid ${color}55`,
      }}
    >
      {text}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>
      {children}
    </span>
  );
}
