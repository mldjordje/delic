import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { getDefaultEmployee, getGarageSettings } from "@/lib/booking/config";
import {
  getBelgradeClockMinutes,
  getWorkingIntervalsForDate,
  parseDateAtTime,
  toBelgradeDateKey,
  toMinutes,
} from "@/lib/booking/schedule";

export const INSPECTION_DURATION_MIN = 30;

export function addMinutes(dateValue: Date, minutes: number) {
  return new Date(dateValue.getTime() + minutes * 60 * 1000);
}

export function isWithinBookingWindow(dateValue: Date, bookingWindowDays: number) {
  const now = new Date();
  const max = addMinutes(now, bookingWindowDays * 24 * 60);
  return dateValue >= now && dateValue <= max;
}

function isOverlapping(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

function normalizeDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function isMissingRelationError(e: unknown) {
  // Postgres: 42P01 = undefined_table (relation does not exist)
  // Some drivers expose it as { code }, some only in message.
  const anyErr = e as any;
  const code = typeof anyErr?.code === "string" ? anyErr.code : "";
  const msg = typeof anyErr?.message === "string" ? anyErr.message : "";
  return code === "42P01" || msg.toLowerCase().includes("relation") && msg.toLowerCase().includes("does not exist");
}

function isWithinWorkingIntervals(
  startAt: Date,
  durationMin: number,
  workingIntervals: { start: string; end: string }[]
) {
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) {
    return false;
  }
  const end = addMinutes(start, durationMin);
  const startMin = getBelgradeClockMinutes(start);
  const endMin = getBelgradeClockMinutes(end);

  return workingIntervals.some((interval) => {
    const dayStartMinutes = toMinutes(interval.start);
    const dayEndMinutes = toMinutes(interval.end);
    return startMin >= dayStartMinutes && endMin <= dayEndMinutes;
  });
}

export async function isWithinWorkHours(startAt: Date, durationMin: number) {
  const settings = await getGarageSettings();
  const dateKey = toBelgradeDateKey(startAt);
  const workingIntervals = getWorkingIntervalsForDate(dateKey, settings);
  return isWithinWorkingIntervals(startAt, durationMin, workingIntervals);
}

export function buildDaySlots({
  date,
  totalDurationMin,
  slotMinutes,
  existingBookings,
  workingIntervals,
}: {
  date: string;
  totalDurationMin: number;
  slotMinutes: number;
  existingBookings: { startsAt: Date | string; endsAt: Date | string }[];
  workingIntervals: { start: string; end: string }[];
}) {
  const slots: {
    startAt: string;
    endAt: string;
    available: boolean;
  }[] = [];

  for (const interval of workingIntervals) {
    const dayStartMinutes = toMinutes(interval.start);
    const dayEndMinutes = toMinutes(interval.end);

    for (
      let cursor = dayStartMinutes;
      cursor + totalDurationMin <= dayEndMinutes;
      cursor += slotMinutes
    ) {
      const hh = String(Math.floor(cursor / 60)).padStart(2, "0");
      const mm = String(cursor % 60).padStart(2, "0");
      const slotStart = parseDateAtTime(date, `${hh}:${mm}`);
      const slotEnd = addMinutes(slotStart, totalDurationMin);

      const conflict = existingBookings.some((booking) =>
        isOverlapping(
          slotStart,
          slotEnd,
          new Date(booking.startsAt),
          new Date(booking.endsAt)
        )
      );
      const isPast = slotStart.getTime() <= Date.now();

      slots.push({
        startAt: slotStart.toISOString(),
        endAt: slotEnd.toISOString(),
        available: !conflict && !isPast,
      });
    }
  }

  return slots;
}

export async function findConflicts({
  employeeId,
  startsAt,
  endsAt,
  tx,
  excludeBookingId,
}: {
  employeeId: string;
  startsAt: Date | string;
  endsAt: Date | string;
  tx?: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];
  excludeBookingId?: string;
}) {
  const db = (tx || getDb()) as ReturnType<typeof getDb>;
  const startsAtDate = normalizeDate(startsAt);
  const endsAtDate = normalizeDate(endsAt);

  if (Number.isNaN(startsAtDate.getTime()) || Number.isNaN(endsAtDate.getTime())) {
    throw new Error("Invalid date range for conflict check.");
  }

  const bookingRows = await db
    .select({
      id: schema.bookings.id,
      startsAt: schema.bookings.startsAt,
      endsAt: schema.bookings.endsAt,
    })
    .from(schema.bookings)
    .where(
      and(
        eq(schema.bookings.employeeId, employeeId),
        inArray(schema.bookings.status, ["pending", "confirmed"]),
        lte(schema.bookings.startsAt, endsAtDate),
        gte(schema.bookings.endsAt, startsAtDate)
      )
    )
    .limit(50);

  let blockedRows: { id: string; startsAt: Date; endsAt: Date }[] = [];
  try {
    blockedRows = await db
      .select({
        id: schema.blockedSlots.id,
        startsAt: schema.blockedSlots.startsAt,
        endsAt: schema.blockedSlots.endsAt,
      })
      .from(schema.blockedSlots)
      .where(
        and(
          eq(schema.blockedSlots.employeeId, employeeId),
          lte(schema.blockedSlots.startsAt, endsAtDate),
          gte(schema.blockedSlots.endsAt, startsAtDate)
        )
      )
      .limit(50);
  } catch (e) {
    // Backwards-compatible: if migration for blocked_slots isn't applied yet, treat as no blocks.
    if (!isMissingRelationError(e)) {
      throw e;
    }
  }

  const requestedStart = startsAtDate;
  const requestedEnd = endsAtDate;

  const allRows = [...bookingRows, ...blockedRows];

  return allRows.filter((booking) => {
    if (excludeBookingId && booking.id === excludeBookingId) {
      return false;
    }
    return isOverlapping(
      requestedStart,
      requestedEnd,
      new Date(booking.startsAt),
      new Date(booking.endsAt)
    );
  });
}

export async function getAvailabilityByDay(date: string, serviceId: string) {
  const settings = await getGarageSettings();
  const employee = await getDefaultEmployee();
  const db = getDb();

  const [svc] = await db
    .select()
    .from(schema.services)
    .where(and(eq(schema.services.id, serviceId), eq(schema.services.isActive, true)))
    .limit(1);

  if (!svc) {
    throw new Error("INVALID_SERVICE");
  }

  const totalDurationMin = svc.durationMin;
  const slotMinutes = settings.slotMinutes;

  const startOfDay = parseDateAtTime(date, "00:00");
  const endOfDay = parseDateAtTime(date, "23:59", 59);
  const workingIntervals = getWorkingIntervalsForDate(date, settings);

  const existingBookings = await db
    .select({
      startsAt: schema.bookings.startsAt,
      endsAt: schema.bookings.endsAt,
    })
    .from(schema.bookings)
    .where(
      and(
        eq(schema.bookings.employeeId, employee.id),
        inArray(schema.bookings.status, ["pending", "confirmed"]),
        gte(schema.bookings.startsAt, startOfDay),
        lte(schema.bookings.startsAt, endOfDay)
      )
    );

  let blocked: { startsAt: Date; endsAt: Date }[] = [];
  try {
    blocked = await db
      .select({
        startsAt: schema.blockedSlots.startsAt,
        endsAt: schema.blockedSlots.endsAt,
      })
      .from(schema.blockedSlots)
      .where(
        and(
          eq(schema.blockedSlots.employeeId, employee.id),
          gte(schema.blockedSlots.startsAt, startOfDay),
          lte(schema.blockedSlots.startsAt, endOfDay)
        )
      );
  } catch (e) {
    // Backwards-compatible: if migration for blocked_slots isn't applied yet, treat as no blocks.
    if (!isMissingRelationError(e)) {
      throw e;
    }
  }

  const slots = buildDaySlots({
    date,
    totalDurationMin,
    slotMinutes,
    existingBookings: [...existingBookings, ...blocked],
    workingIntervals,
  });

  return {
    date,
    serviceId,
    serviceName: svc.name,
    servicePriceRsd: svc.priceRsd,
    totalDurationMin,
    slotMinutes,
    slots,
  };
}

export async function userHasOverlappingBooking(userId: string, startsAt: Date, endsAt: Date) {
  const db = getDb();
  const rows = await db
    .select({ id: schema.bookings.id })
    .from(schema.bookings)
    .where(
      and(
        eq(schema.bookings.userId, userId),
        inArray(schema.bookings.status, ["pending", "confirmed"]),
        lte(schema.bookings.startsAt, endsAt),
        gte(schema.bookings.endsAt, startsAt)
      )
    )
    .limit(1);
  return rows.length > 0;
}

export function lockEmployeeSchedule(
  tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0],
  employeeId: string
) {
  return tx.execute(
    sql`SELECT pg_advisory_xact_lock(hashtextextended(${employeeId}::text, 0))`
  );
}
