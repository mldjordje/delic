"use client";

import { useCallback, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";

type BookingRow = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  workerNotes: string | null;
  vehicle: { make: string; year: number };
  client: { email: string | null; phone: string | null; fullName: string | null };
};

const STATUS_COLOR: Record<string, string> = {
  pending: "#ca8a04",
  confirmed: "#2563eb",
  completed: "#16a34a",
  cancelled: "#6b7280",
  no_show: "#dc2626",
};

export default function AdminKalendarPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<{ id: string; title: string; start: string; end: string; backgroundColor?: string; extendedProps: { row: BookingRow } }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState<BookingRow | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [msg, setMsg] = useState("");

  const loadRange = useCallback(async (from: string, to: string) => {
    setLoading(true);
    setError("");
    const r = await fetch(
      `/api/admin/bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
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
        title: `${b.vehicle.make} · ${b.status}`,
        start: typeof b.startsAt === "string" ? b.startsAt : new Date(b.startsAt).toISOString(),
        end: typeof b.endsAt === "string" ? b.endsAt : new Date(b.endsAt).toISOString(),
        backgroundColor: STATUS_COLOR[b.status] || "#64748b",
        extendedProps: { row: b },
      }))
    );
  }, []);

  function handleEventClick(arg: EventClickArg) {
    const row = arg.event.extendedProps.row as BookingRow;
    if (!row) {
      return;
    }
    setActive(row);
    setNotes(row.workerNotes || "");
    setStatus(row.status);
    setMsg("");
  }

  async function saveDetail() {
    if (!active) {
      return;
    }
    setMsg("");
    const r = await fetch(`/api/admin/bookings/${active.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerNotes: notes, status }),
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

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <p style={{ marginTop: 0, color: "#94a3b8", fontSize: 14 }}>
          {loading ? "Učitavam termine za prikazani period…" : "Klik na termin za izmenu statusa i napomene radnika."}
        </p>
        {error ? <p style={{ color: "#f87171" }}>{error}</p> : null}
        <div style={{ minHeight: 640 }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            locale="sr"
            firstDay={1}
            slotMinTime="06:00:00"
            slotMaxTime="21:00:00"
            height="auto"
            events={events}
            eventClick={handleEventClick}
            datesSet={(arg) => {
              const from = arg.start.toISOString().slice(0, 10);
              const to = new Date(arg.end.getTime() - 86400000).toISOString().slice(0, 10);
              void loadRange(from, to);
            }}
          />
        </div>
      </section>

      {active ? (
        <div
          className="admin-card"
          style={{ position: "fixed", bottom: 24, right: 24, maxWidth: 420, zIndex: 50, boxShadow: "0 12px 40px rgba(0,0,0,0.45)" }}
        >
          <h3 style={{ marginTop: 0 }}>Termin</h3>
          <p style={{ fontSize: 14, color: "#94a3b8" }}>
            {active.client.fullName || active.client.email} · {active.vehicle.make}
          </p>
          <label className="admin-field">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="admin-input">
              <option value="pending">Na čekanju</option>
              <option value="confirmed">Potvrđeno</option>
              <option value="completed">Završeno</option>
              <option value="cancelled">Otkazano</option>
              <option value="no_show">Nije se pojavio</option>
            </select>
          </label>
          <label className="admin-field">
            <span>Napomena radnika</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="admin-input" rows={5} />
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="admin-template-link-btn" onClick={() => void saveDetail()}>
              Sačuvaj
            </button>
            <button type="button" className="admin-template-link-btn" onClick={() => setActive(null)}>
              Zatvori
            </button>
          </div>
          {msg ? <p style={{ marginTop: 8, fontSize: 14 }}>{msg}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
