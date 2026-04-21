import { z } from "zod";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { created, fail, ok, readJson } from "@/lib/api/http";
import { requireStaffOrAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";
import { findConflicts, lockEmployeeSchedule } from "@/lib/booking/engine";
import { getDefaultEmployee } from "@/lib/booking/config";

export const runtime = "nodejs";

const createSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  reason: z.string().max(1000).optional().nullable(),
});

export async function GET(request: Request) {
  const auth = await requireStaffOrAdmin();
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!from || !to) return fail(400, "Parametri from i to (YYYY-MM-DD) su obavezni.");

  const start = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T23:59:59.000Z`);

  const employee = await getDefaultEmployee();
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.blockedSlots)
    .where(and(eq(schema.blockedSlots.employeeId, employee.id), gte(schema.blockedSlots.startsAt, start), lte(schema.blockedSlots.startsAt, end)))
    .orderBy(desc(schema.blockedSlots.startsAt));

  return ok({ ok: true, blocked: rows });
}

export async function POST(request: Request) {
  const auth = await requireStaffOrAdmin();
  if (auth.error) return auth.error;

  const body = await readJson(request);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return fail(400, "Neispravan zahtev", parsed.error.flatten());

  const employee = await getDefaultEmployee();
  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(parsed.data.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    return fail(400, "Neispravan opseg vremena.");
  }

  const db = getDb();
  let createdRow: typeof schema.blockedSlots.$inferSelect | undefined;

  try {
    await db.transaction(async (tx) => {
      await lockEmployeeSchedule(tx, employee.id);

      const conflicts = await findConflicts({
        employeeId: employee.id,
        startsAt,
        endsAt,
        tx,
      });
      if (conflicts.length) {
        throw new Error("SLOT_TAKEN");
      }

      const [row] = await tx
        .insert(schema.blockedSlots)
        .values({
          employeeId: employee.id,
          startsAt,
          endsAt,
          reason: parsed.data.reason || null,
          createdByUserId: auth.user.id,
        })
        .returning();
      createdRow = row;
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "SLOT_TAKEN") return fail(409, "Termin je zauzet.");
    console.error(e);
    return fail(500, "Greška pri blokadi termina.");
  }

  return created({ ok: true, blocked: createdRow });
}

