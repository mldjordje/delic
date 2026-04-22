import { z } from "zod";
import { fail, ok } from "@/lib/api/http";
import { withCors, corsPreflightResponse } from "@/lib/api/cors";
import { getAvailabilityByDay } from "@/lib/booking/engine";
import { getTehnickiPregledService } from "@/lib/booking/technical-service";

export const runtime = "nodejs";

const qSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Opciono; podrazumevano tehnički pregled. */
  serviceId: z.string().uuid().optional(),
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
  const serviceParam = url.searchParams.get("serviceId") || "";
  const parsed = qSchema.safeParse({
    date: url.searchParams.get("date") || "",
    serviceId: serviceParam || undefined,
  });
  if (!parsed.success) {
    return withCors(
      request,
      fail(400, "Parametar date (YYYY-MM-DD) je obavezan.")
    );
  }

  let serviceId = parsed.data.serviceId;
  if (!serviceId) {
    const t = await getTehnickiPregledService();
    if (!t) {
      return withCors(request, fail(500, "Usluga tehničkog pregleda nije podešena."));
    }
    serviceId = t.id;
  }

  try {
    const data = await getAvailabilityByDay(parsed.data.date, serviceId);
    return withCors(request, ok({ ok: true, ...data }));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "INVALID_SERVICE") {
      return withCors(request, fail(400, "Usluga nije pronađena ili je neaktivna."));
    }
    console.error(e);
    return withCors(request, fail(500, "Greška pri učitavanju termina."));
  }
}
