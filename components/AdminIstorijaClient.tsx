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

export function AdminIstorijaClient() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<BookingRow[]>([]);

  useEffect(() => {
    const d = new Date();
    const end = d.toISOString().slice(0, 10);
    const start = new Date(d.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setFrom(start);
    setTo(end);
  }, []);

  async function load() {
    const r = await fetch(
      `/api/admin/bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      { credentials: "include" }
    );
    const j = await r.json();
    if (r.ok) {
      setRows(j.bookings || []);
    }
  }

  useEffect(() => {
    if (from && to) {
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
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

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="bg-slate-900 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-3 py-2">Termin</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Klijent</th>
              <th className="px-3 py-2">Vozilo</th>
              <th className="px-3 py-2">Napomena</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-t border-slate-800">
                <td className="px-3 py-2 whitespace-nowrap">
                  {new Date(b.startsAt).toLocaleString("sr-RS", { timeZone: "Europe/Belgrade" })}
                </td>
                <td className="px-3 py-2">{b.status}</td>
                <td className="px-3 py-2">
                  {b.client.fullName || ""} {b.client.email || ""}
                </td>
                <td className="px-3 py-2">
                  {b.vehicle.make} ({b.vehicle.year})
                </td>
                <td className="px-3 py-2 max-w-md">
                  {b.workerNotes ? (
                    <span className="line-clamp-3">{b.workerNotes}</span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
