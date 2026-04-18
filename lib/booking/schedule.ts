import type { GarageSettingsResolved } from "@/lib/booking/config";

export const WORKING_HOURS_SUMMARY =
  "Radni dani prema podešavanjima radnje, subota skraćeno, nedelja zatvorena.";

const BELGRADE_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Belgrade",
});

const BELGRADE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Belgrade",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const BELGRADE_OFFSET_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Belgrade",
  timeZoneName: "shortOffset",
});

export function toMinutes(timeValue: string) {
  const [hours, minutes] = String(timeValue || "")
    .split(":")
    .map(Number);
  return hours * 60 + minutes;
}

export function toBelgradeDateKey(value: string | Date) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return BELGRADE_DATE_FORMATTER.format(new Date(value));
}

function parseDateKey(value: string) {
  const [year, month, day] = String(value || "")
    .split("-")
    .map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function isSundayDateKey(dateKey: string) {
  const parsed = parseDateKey(dateKey);
  if (!parsed) {
    return false;
  }
  return parsed.getUTCDay() === 0;
}

function getBelgradeOffsetMinutes(dateValue: Date) {
  const parts = BELGRADE_OFFSET_FORMATTER.formatToParts(dateValue);
  const zonePart = parts.find((part) => part.type === "timeZoneName")?.value || "GMT+0";
  const match = zonePart.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/i);
  if (!match) {
    return 0;
  }
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  return sign * (hours * 60 + minutes);
}

export function parseDateAtTime(dateStr: string, timeStr: string, seconds = 0) {
  const [year, month, day] = String(dateStr)
    .split("-")
    .map((part) => Number(part));
  const [hours, minutes] = String(timeStr)
    .split(":")
    .map((part) => Number(part));

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return new Date(NaN);
  }

  let utcGuess = Date.UTC(year, month - 1, day, hours, minutes, Number(seconds || 0));

  for (let i = 0; i < 4; i += 1) {
    const offsetMinutes = getBelgradeOffsetMinutes(new Date(utcGuess));
    const adjustedUtc =
      Date.UTC(year, month - 1, day, hours, minutes, Number(seconds || 0)) -
      offsetMinutes * 60 * 1000;

    if (adjustedUtc === utcGuess) {
      break;
    }
    utcGuess = adjustedUtc;
  }

  return new Date(utcGuess);
}

export function getWorkingIntervalsForDate(
  dateKey: string,
  settings: Pick<
    GarageSettingsResolved,
    "workdayStart" | "workdayEnd" | "saturdayStart" | "saturdayEnd"
  >
): { start: string; end: string }[] {
  const parsed = parseDateKey(dateKey);
  if (!parsed) {
    return [];
  }
  const weekday = parsed.getUTCDay();
  if (weekday === 0) {
    return [];
  }
  if (weekday === 6) {
    return [{ start: settings.saturdayStart, end: settings.saturdayEnd }];
  }
  return [{ start: settings.workdayStart, end: settings.workdayEnd }];
}

export function getBelgradeClockMinutes(dateValue: Date) {
  const parts = BELGRADE_TIME_FORMATTER.formatToParts(dateValue);
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  return hour * 60 + minute;
}
