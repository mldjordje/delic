import { z } from "zod";
import { fail, ok } from "@/lib/api/http";
import { withCors, corsPreflightResponse } from "@/lib/api/cors";
import { getAvailabilityByDay } from "@/lib/booking/engine";

export const runtime = "nodejs";

const qSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function OPTIONS(request: Request) {
  return corsPreflightResponse(request) || new Response(null, { status: 405 });
}

export async function GET(request: Request) {
  const pre = corsPreflightResponse(request);
  if (pre) {
    return pre;
  }

  const url = new URL(request.url);
  const parsed = qSchema.safeParse({ date: url.searchParams.get("date") || "" });
  if (!parsed.success) {
    return withCors(request, fail(400, "Parametar date (YYYY-MM-DD) je obavezan."));
  }

  try {
    const data = await getAvailabilityByDay(parsed.data.date);
    return withCors(request, ok({ ok: true, ...data }));
  } catch (e) {
    console.error(e);
    return withCors(request, fail(500, "Greška pri učitavanju termina."));
  }
}
