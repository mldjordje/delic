"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import { Plus } from "lucide-react";
import { bookingCalendarColor } from "@/lib/booking/calendar-presentation";
import ManualBookingSheet from "@/components/admin/ManualBookingSheet";

type BookingRow = {
  id: string;
  userId: string;
  startsAt: string;
  endsAt: string;
  status: string;
  workerNotes: string | null;
  inspectionResult: "passed" | "failed" | null;
  inspectionNote: string | null;
  vehicle: { make: string; year: number; plateNumber?: string | null; registrationExpiresOn?: string };
  serviceName?: string;
  client: { email: string | null; phone: string | null; fullName: string | null };
};

type Service = {
  id: string;
  name: string;
  durationMin: number;
  description: string | null;
  calendarEnabled: boolean;
};

export default function AdminKalendarPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [events, setEvents] = useState<{ id: string; title: string; start: string; end: string; backgroundColor?: string; extendedProps: { row: BookingRow } }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState<BookingRow | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [inspectionResult, setInspectionResult] = useState<"" | "passed" | "failed">("");
  const [inspectionNote, setInspectionNote] = useState("");
  const [msg, setMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [autoConfirmBookings, setAutoConfirmBookings] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [createStart, setCreateStart] = useState<Date | null>(null);
  const [createEnd, setCreateEnd] = useState<Date | null>(null);
  const [createServices, setCreateServices] = useState<Service[]>([]);

  useEffect(() => {
    function calc() {
      setIsMobile(window.innerWidth <= 640);
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const loadRange = useCallback(async (from: string, to: string) => {
    setLoading(true);
    setError("");
    const r = await fetch(
      `/api/admin/bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&calendar=1`,
      { credentials: "include" }
    );
    const j = await r.json();
    setLoading(false);
    if (!r.ok || !j?.ok) {
      setError(j?.message || "Greška pri učitavanju.");
      setEvents([]);
      return;
    }
    const rows: BookingRow[] = j.bookings || [];
    setEvents(
      rows.map((b) => ({
        id: b.id,
        title: `${b.vehicle.make}${b.serviceName ? ` · ${b.serviceName}` : ""} · ${b.status}`,
        start: typeof b.startsAt === "string" ? b.startsAt : new Date(b.startsAt).toISOString(),
        end: typeof b.endsAt === "string" ? b.endsAt : new Date(b.endsAt).toISOString(),
        backgroundColor: bookingCalendarColor(b.status, b.inspectionResult),
        extendedProps: { row: b },
      }))
    );
  }, []);

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/services").catch(() => null);
      const j = await r?.json().catch(() => null);
      if (r?.ok && j?.services) {
        const cal = (j.services as Service[]).filter((s) => s.calendarEnabled);
        setCreateServices(cal);
      }
    })();
  }, []);

  // /admin/kalendar?unos=1 (donja navigacija) odmah otvara ručni unos.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("unos") === "1") {
      setCreateStart(null);
      setCreateEnd(null);
      setCreateOpen(true);
      params.delete("unos");
      const qs = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    }
  }, []);

  // Dugme „Unos” u donjoj navigaciji dok smo već na kalendaru.
  useEffect(() => {
    function onNew() {
      setActive(null);
      setCreateStart(null);
      setCreateEnd(null);
      setCreateOpen(true);
    }
    window.addEventListener("admin:new-booking", onNew);
    return () => window.removeEventListener("admin:new-booking", onNew);
  }, []);

  const reloadVisible = useCallback(async () => {
    const api = calendarRef.current?.getApi();
    const start = api?.view.activeStart;
    const endEx = api?.view.activeEnd;
    if (start && endEx) {
      const from = start.toISOString().slice(0, 10);
      const to = new Date(endEx.getTime() - 86400000).toISOString().slice(0, 10);
      await loadRange(from, to);
    }
  }, [loadRange]);

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/admin/garage-settings", { credentials: "include" }).catch(() => null);
      const j = await r?.json().catch(() => null);
      if (r?.ok && typeof j?.settings?.autoConfirmBookings === "boolean") {
        setAutoConfirmBookings(j.settings.autoConfirmBookings);
      }
    })();
  }, []);

  function handleEventClick(arg: EventClickArg) {
    const row = arg.event.extendedProps.row as BookingRow;
    if (!row) return;
    setActive(row);
    setNotes(row.workerNotes || "");
    setStatus(row.status);
    setInspectionResult(
      row.inspectionResult === "passed" || row.inspectionResult === "failed" ? row.inspectionResult : ""
    );
    setInspectionNote(row.inspectionNote || "");
    setMsg("");
    setDeleteConfirm(false);
  }

  async function saveDetail() {
    if (!active) {
      return;
    }
    setMsg("");
    if (status === "completed") {
      if (!inspectionResult || !inspectionNote.trim()) {
        setMsg("Za završen termin unesite rezultat pregleda i napomenu.");
        return;
      }
    }
    const r = await fetch(`/api/admin/bookings/${active.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerNotes: notes,
        status,
        ...(status === "completed"
          ? { inspectionResult, inspectionNote: inspectionNote.trim() }
          : { inspectionResult: null, inspectionNote: null }),
      }),
    });
    const j = await r.json();
    if (!r.ok) {
      setMsg(j?.message || "Greška");
      return;
    }
    setMsg("Sačuvano.");
    const api = calendarRef.current?.getApi();
    const start = api?.view.activeStart;
    const endEx = api?.view.activeEnd;
    if (start && endEx) {
      const from = start.toISOString().slice(0, 10);
      const to = new Date(endEx.getTime() - 86400000).toISOString().slice(0, 10);
      await loadRange(from, to);
    }
    setActive(null);
  }

  async function deleteBooking() {
    if (!active) return;
    setDeleting(true);
    setMsg("");
    const r = await fetch(`/api/admin/bookings/${active.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const j = await r.json().catch(() => null);
    setDeleting(false);
    if (!r.ok) {
      setMsg(j?.message || "Greška pri brisanju.");
      setDeleteConfirm(false);
      return;
    }
    const api = calendarRef.current?.getApi();
    const start = api?.view.activeStart;
    const endEx = api?.view.activeEnd;
    if (start && endEx) {
      const from = start.toISOString().slice(0, 10);
      const to = new Date(endEx.getTime() - 86400000).toISOString().slice(0, 10);
      await loadRange(from, to);
    }
    setActive(null);
    setDeleteConfirm(false);
  }

  function openCreate(start: Date | null, end: Date | null = null) {
    setCreateStart(start);
    setCreateEnd(end);
    setCreateOpen(true);
  }

  const linkBtnStyle: React.CSSProperties = {
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#94a3b8",
    textDecoration: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <div className="admin-page-actions">
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
            {loading
              ? "Učitavam termine za prikazani period…"
              : isMobile
                ? "Tap na termin za izmenu, na prazno polje za novi."
                : "Klik na termin za izmenu, na prazno polje za novi termin."}
          </p>
          <button type="button" className="admin-add-btn" onClick={() => openCreate(null)}>
            <Plus size={18} /> Ručni unos
          </button>
        </div>
        {error ? <p style={{ color: "#f87171" }}>{error}</p> : null}
        <div className={`clinic-fc-wrap${isMobile ? " is-mobile-stage" : ""}`} style={{ marginTop: 10 }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: isMobile ? "timeGridDay,timeGridWeek,dayGridMonth" : "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            locale="sr"
            firstDay={1}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            height="auto"
            events={events}
            eventClick={handleEventClick}
            dateClick={(arg) => {
              // Make every slot clickable (not just drag-select)
              if (arg.dateStr) {
                openCreate(arg.date);
              }
            }}
            selectable={true}
            selectMirror={true}
            select={(arg) => {
              openCreate(arg.start, arg.end);
            }}
            unselectAuto={false}
            datesSet={(arg) => {
              const from = arg.start.toISOString().slice(0, 10);
              const to = new Date(arg.end.getTime() - 86400000).toISOString().slice(0, 10);
              void loadRange(from, to);
            }}
            eventClassNames={(arg) => {
              const row = (arg.event.extendedProps as any)?.row as BookingRow | undefined;
              const s = String(row?.status || "");
              return [
                "clinic-fc-event",
                s ? `is-${s.replace("_", "-")}` : "",
                row?.inspectionResult ? `is-${row.inspectionResult}` : "",
              ].filter(Boolean);
            }}
          />
        </div>
      </section>

      {active ? (
        <>
          {/* Overlay */}
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 49 }}
            onClick={() => { setActive(null); setDeleteConfirm(false); }}
          />

          {/* Panel */}
          <div
            style={{
              position: "fixed",
              // Na mobilnom podigni panel iznad donje admin navigacije (fiksna, ~64px)
              // da dugme „Sačuvaj promene” ne ostane skriveno ispod nje.
              bottom: isMobile ? "calc(92px + env(safe-area-inset-bottom, 0px))" : 16,
              right: 16,
              left: isMobile ? 16 : "auto",
              width: isMobile ? "auto" : 480,
              maxHeight: isMobile
                ? "calc(100dvh - 108px - env(safe-area-inset-bottom, 0px))"
                : "calc(100vh - 32px)",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              zIndex: 50,
              background: "rgba(10, 15, 25, 0.98)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {/* Header */}
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b", marginBottom: 4 }}>
                    Termin
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>
                    {new Date(active.startsAt).toLocaleString("sr-RS", { timeZone: "Europe/Belgrade", weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </div>
                  {active.serviceName ? (
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{active.serviceName}</div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => { setActive(null); setDeleteConfirm(false); }}
                  style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, color: "#94a3b8", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Klijent + vozilo */}
              {active.status !== "blocked" ? (
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{active.client.fullName || "—"}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{active.client.email || "—"}</div>
                      {active.client.phone ? <div style={{ fontSize: 12, color: "#64748b" }}>{active.client.phone}</div> : null}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {active.client.phone ? (
                        <a href={`tel:${active.client.phone}`} style={linkBtnStyle}>📞 Pozovi</a>
                      ) : null}
                      {active.client.phone ? (
                        <a href={`sms:${active.client.phone}`} style={linkBtnStyle}>💬 SMS</a>
                      ) : null}
                      {active.userId ? (
                        <a href={`/admin/klijenti/${active.userId}`} style={linkBtnStyle}>👤 Profil</a>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
                    🚗 <span style={{ color: "#94a3b8" }}>{active.vehicle.make} ({active.vehicle.year})</span>
                    {active.vehicle.plateNumber ? <span> · {active.vehicle.plateNumber}</span> : null}
                    {active.vehicle.registrationExpiresOn ? <span style={{ color: "#475569" }}> · reg. do {active.vehicle.registrationExpiresOn}</span> : null}
                  </div>
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#94a3b8" }}>
                  Blokada: {active.workerNotes || "—"}
                </div>
              )}

              {/* Status dugmad */}
              {active.status !== "blocked" ? (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569", marginBottom: 8 }}>Status</div>
                  {autoConfirmBookings && active.status === "confirmed" ? (
                    <div style={{ marginBottom: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.28)", color: "#60a5fa", fontSize: 12, fontWeight: 600 }}>
                      Automatski potvrđen termin
                    </div>
                  ) : null}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {([
                      { value: "pending",   label: "Na čekanju",       color: "#64748b", bg: "rgba(100,116,139,0.12)" },
                      { value: "confirmed", label: "Potvrđeno",         color: "#2563eb", bg: "rgba(37,99,235,0.12)" },
                      { value: "completed", label: "Završeno",          color: "#16a34a", bg: "rgba(22,163,74,0.12)" },
                      { value: "cancelled", label: "Otkazano",          color: "#d97706", bg: "rgba(217,119,6,0.12)" },
                      { value: "no_show",   label: "Nije se pojavio",   color: "#7c3aed", bg: "rgba(124,58,237,0.12)" },
                    ] as const)
                      .filter((item) => !(autoConfirmBookings && item.value === "confirmed"))
                      .map((s) => {
                      const isActive = status === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => {
                            setStatus(s.value);
                            if (s.value !== "completed") { setInspectionResult(""); setInspectionNote(""); }
                          }}
                          style={{
                            padding: "9px 12px",
                            borderRadius: 8,
                            border: isActive ? `1.5px solid ${s.color}` : "1.5px solid rgba(255,255,255,0.07)",
                            background: isActive ? s.bg : "rgba(255,255,255,0.03)",
                            color: isActive ? s.color : "#64748b",
                            fontSize: 12,
                            fontWeight: isActive ? 700 : 500,
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.15s",
                          }}
                        >
                          {isActive ? "✓ " : ""}{s.label}
                        </button>
                      );
                      })}
                  </div>
                </div>
              ) : null}

              {/* Inspekcija — samo kad je Završeno */}
              {status === "completed" ? (
                <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#16a34a" }}>Rezultat tehničkog pregleda</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {([
                      { value: "passed", label: "✅ Položio",    color: "#16a34a", bg: "rgba(22,163,74,0.15)" },
                      { value: "failed", label: "❌ Nije položio", color: "#dc2626", bg: "rgba(220,38,38,0.15)" },
                    ] as const).map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setInspectionResult(r.value)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: inspectionResult === r.value ? `1.5px solid ${r.color}` : "1.5px solid rgba(255,255,255,0.07)",
                          background: inspectionResult === r.value ? r.bg : "rgba(255,255,255,0.03)",
                          color: inspectionResult === r.value ? r.color : "#64748b",
                          fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={inspectionNote}
                    onChange={(e) => setInspectionNote(e.target.value)}
                    className="admin-input"
                    rows={2}
                    placeholder="Napomena o pregledu (obavezno)…"
                    style={{ marginTop: 2 }}
                  />
                </div>
              ) : null}

              {/* Napomena radnika */}
              <label className="admin-field" style={{ gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569" }}>Napomena radnika</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="admin-input" rows={3} placeholder="Interna napomena…" />
              </label>

              {/* Poruka */}
              {msg ? (
                <div style={{ fontSize: 13, padding: "8px 12px", borderRadius: 8, background: msg === "Sačuvano." ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)", color: msg === "Sačuvano." ? "#4ade80" : "#f87171", border: `1px solid ${msg === "Sačuvano." ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)"}` }}>
                  {msg}
                </div>
              ) : null}

              {/* Akcije — zalepljene za dno panela da „Sačuvaj” bude uvek vidljiv
                  (i iznad donje mobilne navigacije), bez potrebe za skrolom. */}
              <div
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  margin: "0 -20px -14px",
                  padding: "14px 20px calc(14px + env(safe-area-inset-bottom, 0px))",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(10, 15, 25, 0.98)",
                }}
              >
                <button
                  type="button"
                  onClick={() => void saveDetail()}
                  style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  Sačuvaj promene
                </button>

                {deleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => void deleteBooking()}
                    disabled={deleting}
                    style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid #dc2626", background: "rgba(220,38,38,0.2)", color: "#f87171", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    {deleting ? "Brišem…" : "Potvrdi brisanje"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(true)}
                    style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    Obriši
                  </button>
                )}
              </div>

            </div>
          </div>
        </>
      ) : null}

      <ManualBookingSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        services={createServices}
        initialStart={createStart}
        initialEnd={createEnd}
        onSaved={reloadVisible}
      />
    </div>
  );
}
