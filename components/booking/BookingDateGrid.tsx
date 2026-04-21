"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DayAvailability = { date: string; availableCount: number };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function ymKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function parseYm(ym: string) {
  const [y, m] = ym.split("-").map((x) => Number(x));
  return { y, mIndex0: m - 1 };
}

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function weekdayMonFirst(d: Date) {
  // JS: 0 Sun ... 6 Sat -> 0 Mon ... 6 Sun
  return (d.getDay() + 6) % 7;
}

function monthLabelSr(ym: string) {
  const { y, mIndex0 } = parseYm(ym);
  const d = new Date(Date.UTC(y, mIndex0, 1, 12, 0, 0));
  return d.toLocaleDateString("sr-RS", { month: "long", year: "numeric", timeZone: "Europe/Belgrade" });
}

function tone(availableCount: number) {
  if (availableCount >= 6) return "many";
  if (availableCount >= 1) return "limited";
  return "none";
}

export function BookingDateGrid({
  serviceId,
  value,
  onChange,
  className,
}: {
  serviceId: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  className?: string;
}) {
  const initialYm = useMemo(() => {
    if (value) return value.slice(0, 7);
    return ymKey(new Date());
  }, [value]);

  const [month, setMonth] = useState(initialYm);
  const [busy, setBusy] = useState(false);
  const [days, setDays] = useState<DayAvailability[]>([]);

  useEffect(() => {
    if (!serviceId) return;
    void (async () => {
      setBusy(true);
      const r = await fetch(
        `/api/bookings/availability-month?month=${encodeURIComponent(month)}&serviceId=${encodeURIComponent(serviceId)}`
      );
      const j = await r.json().catch(() => null);
      setBusy(false);
      if (!r.ok) {
        setDays([]);
        return;
      }
      setDays((j?.days || []) as DayAvailability[]);
    })();
  }, [month, serviceId]);

  useEffect(() => {
    if (!value) return;
    const ym = value.slice(0, 7);
    if (ym && ym !== month) setMonth(ym);
  }, [value, month]);

  const dayMap = useMemo(() => new Map(days.map((d) => [d.date, d.availableCount])), [days]);
  const { y, mIndex0 } = useMemo(() => parseYm(month), [month]);
  const dim = useMemo(() => daysInMonth(y, mIndex0), [y, mIndex0]);
  const first = useMemo(() => new Date(y, mIndex0, 1), [y, mIndex0]);
  const startOffset = useMemo(() => weekdayMonFirst(first), [first]);

  const cells = useMemo(() => {
    const result: { date: string | null; day: number | null; count: number }[] = [];
    for (let i = 0; i < startOffset; i++) result.push({ date: null, day: null, count: 0 });
    for (let d = 1; d <= dim; d++) {
      const date = `${month}-${pad2(d)}`;
      const count = dayMap.get(date) ?? 0;
      result.push({ date, day: d, count });
    }
    // fill to full weeks
    while (result.length % 7 !== 0) result.push({ date: null, day: null, count: 0 });
    return result;
  }, [startOffset, dim, month, dayMap]);

  function shiftMonth(delta: number) {
    const { y, mIndex0 } = parseYm(month);
    const d = new Date(y, mIndex0 + delta, 1);
    setMonth(ymKey(d));
  }

  const weekdayLabels = ["pon", "uto", "sre", "čet", "pet", "sub", "ned"];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" size="sm" onClick={() => shiftMonth(-1)} disabled={busy}>
          Prethodni
        </Button>
        <p className="text-sm font-medium text-foreground">{monthLabelSr(month)}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => shiftMonth(1)} disabled={busy}>
          Sledeći
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekdayLabels.map((w) => (
          <div key={w} className="px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((c, idx) => {
          if (!c.date) {
            return <div key={`empty-${idx}`} className="h-12 rounded-md border border-border/40 bg-background/10" />;
          }

          const active = value === c.date;
          const t = tone(c.count);
          const bar =
            t === "many"
              ? "bg-emerald-400/70"
              : t === "limited"
                ? "bg-amber-400/70"
                : "bg-rose-400/55";

          return (
            <button
              key={c.date}
              type="button"
              onClick={() => onChange(c.date!)}
              className={cn(
                "h-12 rounded-md border px-2 text-left text-xs transition-colors",
                "bg-background/20 hover:bg-accent/20",
                active ? "border-ring ring-1 ring-ring" : "border-border/50"
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn("font-semibold", active ? "text-foreground" : "text-muted-foreground")}>{c.day}</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-background/30">
                <div className={cn("h-1.5 rounded-full", bar)} style={{ width: `${Math.min(100, (c.count / 8) * 100)}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-8 rounded-full bg-emerald-400/70" />
          Više slobodnih termina
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-8 rounded-full bg-amber-400/70" />
          Ograničena dostupnost
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-8 rounded-full bg-rose-400/55" />
          Nema slobodnih termina
        </div>
      </div>
    </div>
  );
}

