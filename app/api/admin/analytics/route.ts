import { eq, sql } from "drizzle-orm";
import { ok } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const db = getDb();

  const days = 30;
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - (days - 1));
  fromDate.setHours(0, 0, 0, 0);

  const perDay = await db.execute<{
    day: string;
    total: string;
    pending: string;
    confirmed: string;
    completed: string;
    cancelled: string;
    no_show: string;
  }>(sql`
    select
      to_char(date_trunc('day', ${schema.bookings.startsAt}), 'YYYY-MM-DD') as day,
      count(*)::text as total,
      sum(case when ${schema.bookings.status} = 'pending' then 1 else 0 end)::text as pending,
      sum(case when ${schema.bookings.status} = 'confirmed' then 1 else 0 end)::text as confirmed,
      sum(case when ${schema.bookings.status} = 'completed' then 1 else 0 end)::text as completed,
      sum(case when ${schema.bookings.status} = 'cancelled' then 1 else 0 end)::text as cancelled,
      sum(case when ${schema.bookings.status} = 'no_show' then 1 else 0 end)::text as no_show
    from ${schema.bookings}
    where ${schema.bookings.startsAt} >= ${fromDate}
    group by 1
    order by 1 asc
  `);

  const statuses = await db.execute<{ status: string; total: string }>(sql`
    select ${schema.bookings.status}::text as status, count(*)::text as total
    from ${schema.bookings}
    group by 1
    order by 2 desc
  `);

  const byEmployee = await db.execute<{ employeeId: string; employeeName: string; total: string }>(sql`
    select
      ${schema.bookings.employeeId}::text as "employeeId",
      ${schema.employees.fullName}::text as "employeeName",
      count(*)::text as total
    from ${schema.bookings}
    left join ${schema.employees} on ${schema.employees.id} = ${schema.bookings.employeeId}
    where ${schema.bookings.startsAt} >= ${fromDate}
    group by 1, 2
    order by 3 desc
  `);

  return ok({
    ok: true,
    range: { days, from: fromDate.toISOString() },
    perDay: perDay.rows.map((r) => ({
      day: r.day,
      total: Number(r.total || 0),
      pending: Number(r.pending || 0),
      confirmed: Number(r.confirmed || 0),
      completed: Number(r.completed || 0),
      cancelled: Number(r.cancelled || 0),
      noShow: Number(r.no_show || 0),
    })),
    statuses: statuses.rows.map((r) => ({ status: r.status, total: Number(r.total || 0) })),
    byEmployee: byEmployee.rows.map((r) => ({
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      total: Number(r.total || 0),
    })),
  });
}

