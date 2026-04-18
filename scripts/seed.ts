/**
 * Jednokratno: podrazumevani zaposleni (traka) + podešavanja radnje.
 * Pokretanje: npm run db:seed (zahteva POSTGRES_URL u okruženju)
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";

const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!url) {
  throw new Error("Set POSTGRES_URL or DATABASE_URL");
}

const pool = new Pool({ connectionString: url });
const db = drizzle({ client: pool, schema });

async function main() {
  const slug = process.env.GARAGE_DEFAULT_EMPLOYEE_SLUG || "auto-delic-lane-1";
  const [existing] = await db
    .select()
    .from(schema.employees)
    .where(eq(schema.employees.slug, slug))
    .limit(1);

  if (!existing) {
    await db.insert(schema.employees).values({
      fullName: "Tehnički pregled — traka 1",
      slug,
      isActive: true,
    });
    console.log("Inserted default employee:", slug);
  } else {
    console.log("Employee already exists:", slug);
  }

  const [settings] = await db.select().from(schema.garageSettings).limit(1);
  if (!settings) {
    await db.insert(schema.garageSettings).values({
      slotMinutes: 30,
      bookingWindowDays: 31,
      workdayStart: "08:00",
      workdayEnd: "17:00",
      saturdayStart: "08:00",
      saturdayEnd: "14:00",
    });
    console.log("Inserted garage_settings (30 min slotovi).");
  } else {
    console.log("garage_settings already present.");
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
