import { ok } from "@/lib/api/http";
import { withCors, corsPreflightResponse } from "@/lib/api/cors";
import { clearSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  const pre = corsPreflightResponse(request);
  return pre || new Response(null, { status: 405 });
}

export async function POST(request: Request) {
  const pre = corsPreflightResponse(request);
  if (pre) {
    return pre;
  }
  const res = ok({ ok: true });
  clearSessionCookie(res);
  return withCors(request, res);
}
