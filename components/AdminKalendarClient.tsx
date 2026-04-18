"use client";

import { useEffect, useState } from "react";

type BookingRow = {
  id: string;
  startsAt: string;
  status: string;
  workerNotes: string | null;
  vehicle: { make: string; year: number };
  client: { email: string | null; phone: string | null; fullName: string | null };
};

export function AdminKalendarClient({ isAdmin }: { isAdmin: boolean }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [selected, setSelected] = useState<BookingRow | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [msg, setMsg] = useState<string | null>(null);

  function defaultRange() {
    const d = new Date();
    const iso = d.toISOString().slice(0, 10);
    setFrom(iso);
    setTo(iso);
  }

  useEffect(() => {
    defaultRange();
  }, []);

  async function load() {
    setMsg(null);
    const r = await fetch(
      `/api/admin/bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      { credentials: "include" }
    );
    const j = await r.json();
    if (!r.ok) {
      setMsg(j.message || "Greška");
      return;
    }
    setRows(j.bookings || []);
  }

  useEffect(() => {
    if (!from || !to) {
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load when range changes
  }, [from, to]);

  async function saveBooking() {
    if (!selected) {
      return;
    }
    setMsg(null);
    const r = await fetch(`/api/admin/bookings/${selected.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerNotes: notes,
        status,
      }),
    });
    const j = await r.json();
    if (!r.ok) {
      setMsg(j.message || "Greška");
      return;
    }
    setMsg("Sačuvano.");
    await load();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        {isAdmin ? (
          <div className="mb-4 flex flex-wrap gap-3">
            <label className="text-sm text-slate-300">
              Od
              <input
                type="date"
                className="ml-2 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label className="text-sm text-slate-300">
              Do
              <input
                type="date"
                className="ml-2 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="rounded bg-slate-700 px-3 py-1 text-sm text-white"
              onClick={() => void load()}
            >
              Osveži
            </button>
          </div>
        ) : (
          <p className="mb-4 text-sm text-slate-400">
            Prikaz za današnji dan (uloga radnika). Administrator vidi širi opseg.
          </p>
        )}

        <ul className="space-y-2">
          {rows.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                  selected?.id === b.id
                    ? "border-blue-500 bg-slate-900"
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-600"
                }`}
                onClick={() => {
                  setSelected(b);
                  setNotes(b.workerNotes || "");
                  setStatus(b.status);
                }}
              >
                <div className="font-medium text-white">
                  {new Date(b.startsAt).toLocaleString("sr-RS", { timeZone: "Europe/Belgrade" })}{" "}
                  — {b.status}
                </div>
                <div className="text-slate-400">
                  {b.vehicle.make} · {b.client.fullName || b.client.email || "klijent"}
                </div>
              </button>
            </li>
          ))}
        </ul>
        {rows.length === 0 ? <p className="text-slate-500">Nema termina u opsegu.</p> : null}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold text-white">Detalj termina</h2>
        {selected ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-400">
              {selected.client.fullName && <span>{selected.client.fullName} · </span>}
              {selected.client.email} {selected.client.phone}
            </p>
            <label className="block text-sm text-slate-300">
              Status
              <select
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {isAdmin ? <option value="pending">Na čekanju</option> : null}
                <option value="confirmed">Potvrđeno</option>
                <option value="completed">Završeno</option>
                {isAdmin ? (
                  <>
                    <option value="cancelled">Otkazano</option>
                    <option value="no_show">Nije se pojavio</option>
                  </>
                ) : null}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              Napomena radnika (pregled, saveti, upozorenja)
              <textarea
                className="mt-1 min-h-[140px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
              onClick={() => void saveBooking()}
            >
              Sačuvaj
            </button>
            {msg ? <p className="text-sm text-slate-300">{msg}</p> : null}
          </div>
        ) : (
          <p className="mt-4 text-slate-500">Izaberite termin sa liste.</p>
        )}
      </div>
    </div>
  );
}
