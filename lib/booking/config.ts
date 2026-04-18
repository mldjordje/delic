import { desc, eq, and } from "drizzle-orm";
import { env } from "@/lib/env";
import { getDb, schema } from "@/lib/db/client";
import { WORKING_HOURS_SUMMARY } from "@/lib/booking/schedule";

export type GarageSettingsResolved = {
  slotMinutes: number;
  bookingWindowDays: number;
  workdayStart: string;
  workdayEnd: string;
  saturdayStart: string;
  saturdayEnd: string;
  workingHoursSummary: string;
};

export async function getGarageSettings(): Promise<GarageSettingsResolved> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.garageSettings)
    .orderBy(desc(schema.garageSettings.createdAt))
    .limit(1);

  return {
    slotMinutes: row?.slotMinutes ?? env.CLINIC_SLOT_MINUTES,
    bookingWindowDays: row?.bookingWindowDays ?? env.CLINIC_BOOKING_WINDOW_DAYS,
    workdayStart: row?.workdayStart ?? env.CLINIC_WORKDAY_START,
    workdayEnd: row?.workdayEnd ?? env.CLINIC_WORKDAY_END,
    saturdayStart: row?.saturdayStart ?? env.CLINIC_SATURDAY_START,
    saturdayEnd: row?.saturdayEnd ?? env.CLINIC_SATURDAY_END,
    workingHoursSummary: WORKING_HOURS_SUMMARY,
  };
}

export async function getDefaultEmployee() {
  const db = getDb();
  const slug = env.GARAGE_DEFAULT_EMPLOYEE_SLUG;
  const [employee] = await db
    .select()
    .from(schema.employees)
    .where(and(eq(schema.employees.slug, slug), eq(schema.employees.isActive, true)))
    .limit(1);

  if (employee) {
    return employee;
  }

  const [inserted] = await db
    .insert(schema.employees)
    .values({
      fullName: "Tehnički pregled — traka 1",
      slug,
      isActive: true,
    })
    .returning();

  return inserted;
}
