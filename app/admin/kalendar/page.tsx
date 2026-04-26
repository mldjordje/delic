"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";

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
type ClientPick = { id: string; email: string | null; phone: string | null; fullName: string | null };
type VehiclePick = { id: string; make: string; year: number; registrationExpiresOn: string };

const STATUS_COLOR: Record<string, string> = {
  pending: "#ca8a04",
  confirmed: "#2563eb",
  completed: "#16a34a",
  cancelled: "#6b7280",
  no_show: "#dc2626",
  blocked: "#b45309",
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

  const [createOpen, setCreateOpen] = useState(false);
  const [createStartIso, setCreateStartIso] = useState<string>("");
  const [createEndIso, setCreateEndIso] = useState<string>("");
  const [createServices, setCreateServices] = useState<Service[]>([]);
  const [createServiceId, setCreateServiceId] = useState<string>("");
  const [clientQuery, setClientQuery] = useState("");
  const [clientBusy, setClientBusy] = useState(false);
  const [clientResults, setClientResults] = useState<ClientPick[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientPick | null>(null);
  const [vehiclesBusy, setVehiclesBusy] = useState(false);
  const [vehicles, setVehicles] = useState<VehiclePick[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [createNotes, setCreateNotes] = useState("");
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createOk, setCreateOk] = useState("");
  const [createMode, setCreateMode] = useState<"booking" | "block">("booking");
  const [blockReason, setBlockReason] = useState("");

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
        backgroundColor: STATUS_COLOR[b.status] || "#64748b",
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
        setCreateServiceId((prev) => {
          if (prev && cal.some((x) => x.id === prev)) return prev;
          return (cal[0]?.id as string) || "";
        });
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

  function openCreateFromSelection(startStr: string, endStr: string) {
    setCreateError("");
    setCreateOk("");
    setCreateNotes("");
    setSelectedClient(null);
    setClientQuery("");
    setClientResults([]);
    setVehicles([]);
    setSelectedVehicleId("");
    setCreateMode("booking");
    setBlockReason("");
    setCreateStartIso(startStr);
    setCreateEndIso(endStr);
    setCreateOpen(true);
  }

  function openCreateFromStart(startIso: string) {
    // use selected service duration if available, otherwise 30min
    const svc = createServices.find((s) => s.id === createServiceId) || null;
    const durationMin = svc?.durationMin || 30;
    const start = new Date(startIso);
    const end = new Date(start.getTime() + durationMin * 60 * 1000);
    openCreateFromSelection(start.toISOString(), end.toISOString());
  }

  async function searchClients(q: string) {
    const s = q.trim();
    if (s.length < 2) {
      setClientResults([]);
      return;
    }
    setClientBusy(true);
    const r = await fetch(`/api/admin/lookup/clients?q=${encodeURIComponent(s)}`, { credentials: "include" });
    const j = await r.json().catch(() => null);
    setClientBusy(false);
    if (!r.ok) {
      setCreateError(j?.message || "Greška pri pretrazi klijenata.");
      setClientResults([]);
      return;
    }
    setClientResults((j?.clients || []) as ClientPick[]);
  }

  async function loadVehiclesForClient(userId: string) {
    setVehiclesBusy(true);
    const r = await fetch(`/api/admin/lookup/vehicles?userId=${encodeURIComponent(userId)}`, { credentials: "include" });
    const j = await r.json().catch(() => null);
    setVehiclesBusy(false);
    if (!r.ok) {
      setCreateError(j?.message || "Greška pri učitavanju vozila klijenta.");
      setVehicles([]);
      return;
    }
    const list = (j?.vehicles || []) as VehiclePick[];
    setVehicles(list);
    setSelectedVehicleId(list[0]?.id || "");
  }

  useEffect(() => {
    const t = setTimeout(() => {
      void searchClients(clientQuery);
    }, 250);
    return () => clearTimeout(t);
  }, [clientQuery]);

  async function createBooking() {
    setCreateError("");
    setCreateOk("");
    if (createMode === "block") {
      if (!createStartIso || !createEndIso) {
        setCreateError("Nije izabran opseg vremena.");
        return;
      }
      setCreateSaving(true);
      const r = await fetch("/api/admin/blocked-slots", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startsAt: new Date(createStartIso).toISOString(),
          endsAt: new Date(createEndIso).toISOString(),
          reason: blockReason.trim() || null,
        }),
      });
      const j = await r.json().catch(() => null);
      setCreateSaving(false);
      if (!r.ok) {
        setCreateError(j?.message || "Greška pri blokadi termina.");
        return;
      }
      setCreateOk("Termin je blokiran.");
      const api = calendarRef.current?.getApi();
      const start = api?.view.activeStart;
      const endEx = api?.view.activeEnd;
      if (start && endEx) {
        const from = start.toISOString().slice(0, 10);
        const to = new Date(endEx.getTime() - 86400000).toISOString().slice(0, 10);
        await loadRange(from, to);
      }
      setCreateOpen(false);
      return;
    }
    if (!createServiceId) {
      setCreateError("Izaberite uslugu.");
      return;
    }
    if (!selectedClient?.id) {
      setCreateError("Izaberite klijenta.");
      return;
    }
    if (!selectedVehicleId) {
      setCreateError("Izaberite vozilo.");
      return;
    }
    if (!createStartIso) {
      setCreateError("Nije izabran start.");
      return;
    }

    setCreateSaving(true);
    const r = await fetch("/api/admin/bookings", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedClient.id,
        vehicleId: selectedVehicleId,
        serviceId: createServiceId,
        startsAt: new Date(createStartIso).toISOString(),
        status: "confirmed",
        workerNotes: createNotes.trim() || null,
      }),
    });
    const j = await r.json().catch(() => null);
    setCreateSaving(false);
    if (!r.ok) {
      setCreateError(j?.message || "Greška pri kreiranju termina.");
      return;
    }
    setCreateOk("Termin je kreiran.");

    const api = calendarRef.current?.getApi();
    const start = api?.view.activeStart;
    const endEx = api?.view.activeEnd;
    if (start && endEx) {
      const from = start.toISOString().slice(0, 10);
      const to = new Date(endEx.getTime() - 86400000).toISOString().slice(0, 10);
      await loadRange(from, to);
    }
    setCreateOpen(false);
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
        <p style={{ marginTop: 0, color: "#94a3b8", fontSize: 14 }}>
          {loading ? "Učitavam termine za prikazani period…" : "Klik na termin za izmenu statusa i napomene radnika."}
        </p>
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
                openCreateFromStart(arg.date.toISOString());
              }
            }}
            selectable={true}
            selectMirror={true}
            select={(arg) => {
              openCreateFromSelection(arg.startStr, arg.endStr);
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
              return ["clinic-fc-event", s ? `is-${s.replace("_", "-")}` : ""].filter(Boolean);
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
              bottom: 16, right: 16,
              left: isMobile ? 16 : "auto",
              width: isMobile ? "auto" : 480,
              maxHeight: "calc(100vh - 32px)",
              overflowY: "auto",
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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {([
                      { value: "pending",   label: "Na čekanju",       color: "#ca8a04", bg: "rgba(202,138,4,0.12)" },
                      { value: "confirmed", label: "Potvrđeno",         color: "#2563eb", bg: "rgba(37,99,235,0.12)" },
                      { value: "completed", label: "Završeno",          color: "#16a34a", bg: "rgba(22,163,74,0.12)" },
                      { value: "cancelled", label: "Otkazano",          color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
                      { value: "no_show",   label: "Nije se pojavio",   color: "#dc2626", bg: "rgba(220,38,38,0.12)" },
                    ] as const).map((s) => {
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

              {/* Akcije */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14 }}>
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

      {createOpen ? (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 54,
            }}
            onClick={() => setCreateOpen(false)}
          />
        <div
          className="admin-card"
          style={{
            position: "fixed",
            bottom: 16,
            left: 16,
            right: 16,
            maxWidth: 980,
            marginLeft: "auto",
            zIndex: 55,
            boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
            background: "rgba(12, 18, 29, 0.98)",
            border: "1px solid rgba(217, 232, 248, 0.22)",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
            maxHeight: "calc(100vh - 32px)",
            overflow: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-container response-999" style={{ justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h3 style={{ marginTop: 0 }}>Novi termin</h3>
              <p style={{ marginTop: 6, color: "#94a3b8", fontSize: 14 }}>
                Start: <span style={{ color: "#e2e8f0" }}>{new Date(createStartIso).toLocaleString("sr-RS")}</span>
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="admin-template-link-btn" onClick={() => void createBooking()} disabled={createSaving}>
                {createSaving ? "Kreiram…" : "Kreiraj"}
              </button>
              <button type="button" className="admin-template-link-btn" onClick={() => setCreateOpen(false)}>
                Zatvori
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            <label className="admin-field">
              <span>Tip</span>
              <select value={createMode} onChange={(e) => setCreateMode(e.target.value as any)} className="admin-input">
                <option value="booking">Zakazivanje</option>
                <option value="block">Blokada</option>
              </select>
            </label>

            <label className="admin-field">
              <span>Usluga</span>
              <select value={createServiceId} onChange={(e) => setCreateServiceId(e.target.value)} className="admin-input">
                {createServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMin} min)
                  </option>
                ))}
              </select>
            </label>

            {createMode === "booking" ? (
              <div className="admin-field">
                <span>Klijent (email / telefon / ime)</span>
                <input
                  className="admin-input"
                  value={clientQuery}
                  onChange={(e) => {
                    setClientQuery(e.target.value);
                    setCreateError("");
                  }}
                  placeholder="npr. ivan@gmail.com ili 064..."
                />
                <div style={{ marginTop: 8 }}>
                  {clientBusy ? <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>Tražim…</p> : null}
                  {!clientBusy && clientResults.length ? (
                    <div style={{ display: "grid", gap: 8 }}>
                      {clientResults.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="admin-template-link-btn"
                          onClick={() => {
                            setSelectedClient(c);
                            setClientResults([]);
                            void loadVehiclesForClient(c.id);
                          }}
                          style={{ justifyContent: "space-between", display: "flex" }}
                        >
                          <span>
                            {(c.fullName || c.email || c.phone || "Klijent")}{" "}
                            <span style={{ color: "#94a3b8" }}>
                              {c.email ? `· ${c.email}` : ""} {c.phone ? `· ${c.phone}` : ""}
                            </span>
                          </span>
                          <span style={{ opacity: 0.8 }}>Izaberi</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {selectedClient ? (
                    <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: 14 }}>
                      Izabran: <span style={{ color: "#e2e8f0" }}>{selectedClient.fullName || selectedClient.email || selectedClient.id}</span>
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <label className="admin-field">
                <span>Razlog (opciono)</span>
                <textarea value={blockReason} onChange={(e) => setBlockReason(e.target.value)} className="admin-input" rows={3} />
              </label>
            )}

            {createMode === "booking" ? (
              <label className="admin-field">
                <span>Vozilo</span>
                <select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} className="admin-input" disabled={!selectedClient || vehiclesBusy}>
                  {!selectedClient ? <option value="">— prvo izaberite klijenta —</option> : null}
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} ({v.year})
                    </option>
                  ))}
                </select>
                {vehiclesBusy ? <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: 14 }}>Učitavam vozila…</p> : null}
              </label>
            ) : null}

            {createMode === "booking" ? (
              <label className="admin-field">
                <span>Napomena radnika (opciono)</span>
                <textarea value={createNotes} onChange={(e) => setCreateNotes(e.target.value)} className="admin-input" rows={3} />
              </label>
            ) : null}
          </div>

          {createError ? <p style={{ color: "#f87171", marginTop: 12 }}>{createError}</p> : null}
          {createOk ? <p style={{ color: "#86efac", marginTop: 12 }}>{createOk}</p> : null}
        </div>
        </>
      ) : null}
    </div>
  );
}
