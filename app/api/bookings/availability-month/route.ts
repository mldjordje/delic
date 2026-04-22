import { z } from "zod";
import { fail, ok } from "@/lib/api/http";
import { withCors, corsPreflightResponse } from "@/lib/api/cors";
import { getDb, schema } from "@/lib/db/client";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { getDefaultEmployee, getGarageSettings } from "@/lib/booking/config";
import { buildDaySlots } from "@/lib/booking/engine";
import { getTehnickiPregledService } from "@/lib/booking/technical-service";
import { getWorkingIntervalsForDate, parseDateAtTime } from "@/lib/booking/schedule";

export const runtime = "nodejs";

const qSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
  serviceId: z.string().uuid().optional(),
});

export async function OPTIONS(request: Request) {
  return corsPreflightResponse(request) || new Response(null, { status: 405 });
}

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
}

export async function GET(request: Request) {
  const pre = corsPreflightResponse(request);
  if (pre) {
    return pre;
  }

  const url = new URL(request.url);
  const sp = url.searchParams.get("serviceId") || "";
  const parsed = qSchema.safeParse({
    month: url.searchParams.get("month") || "",
    serviceId: sp || undefined,
  });
  if (!parsed.success) {
    return withCors(request, fail(400, "Parametar month (YYYY-MM) je obavezan."));
  }

  let serviceId = parsed.data.serviceId;
  if (!serviceId) {
    const t = await getTehnickiPregledService();
    if (!t) {
      return withCors(request, fail(500, "Usluga tehničkog pregleda nije podešena."));
    }
    serviceId = t.id;
  }

  const [yyyy, mm] = parsed.data.month.split("-").map((x) => Number(x));
  const monthIndex0 = mm - 1;
  if (!yyyy || monthIndex0 < 0 || monthIndex0 > 11) {
    return withCors(request, fail(400, "Neispravan month format."));
  }

  const db = getDb();
  const settings = await getGarageSettings();
  const employee = await getDefaultEmployee();

  const [svc] = await db
    .select()
    .from(schema.services)
    .where(and(eq(schema.services.id, serviceId), eq(schema.services.isActive, true)))
    .limit(1);

  if (!svc) {
    return withCors(request, fail(400, "Usluga nije pronađena ili je neaktivna."));
  }

  const totalDurationMin = svc.durationMin;
  const slotMinutes = settings.slotMinutes;

  const firstDateKey = `${parsed.data.month}-01`;
  const dim = daysInMonth(yyyy, monthIndex0);
  const lastDateKey = `${parsed.data.month}-${String(dim).padStart(2, "0")}`;

  const start = parseDateAtTime(firstDateKey, "00:00");
  const end = parseDateAtTime(lastDateKey, "23:59", 59);

  const bookingRows = await db
    .select({
      startsAt: schema.bookings.startsAt,
      endsAt: schema.bookings.endsAt,
    })
    .from(schema.bookings)
    .innerJoin(schema.services, eq(schema.bookings.serviceId, schema.services.id))
    .where(
      and(
        eq(schema.services.calendarEnabled, true),
        eq(schema.bookings.employeeId, employee.id),
        inArray(schema.bookings.status, ["pending", "confirmed"]),
        gte(schema.bookings.startsAt, start),
        lte(schema.bookings.startsAt, end)
      )
    );

  const byDate = new Map<string, { startsAt: Date | string; endsAt: Date | string }[]>();
  for (const b of bookingRows) {
    const d = new Date(b.startsAt);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const da = String(d.getUTCDate()).padStart(2, "0");
    const key = `${y}-${m}-${da}`;
    const arr = byDate.get(key) || [];
    arr.push(b);
    byDate.set(key, arr);
  }

  const days = Array.from({ length: dim }).map((_, i) => {
    const day = i + 1;
    const dateKey = `${parsed.data.month}-${String(day).padStart(2, "0")}`;
    const workingIntervals = getWorkingIntervalsForDate(dateKey, settings);
    const slots = buildDaySlots({
      date: dateKey,
      totalDurationMin,
      slotMinutes,
      existingBookings: byDate.get(dateKey) || [],
      workingIntervals,
    });
    const availableCount = slots.filter((s) => s.available).length;
    return { date: dateKey, availableCount };
  });

  return withCors(
    request,
    ok({
      ok: true,
      month: parsed.data.month,
      serviceId,
      totalDurationMin,
      slotMinutes,
      days,
    })
  );
}

