import { NextResponse } from "next/server";
import { withCors, corsPreflightResponse } from "@/lib/api/cors";
import { clearSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  const pre = corsPreflightResponse(request);
  return pre || new Response(null, { status: 405 });
}

function buildLogoutRedirect(request: Request) {
  // 303 → posle POST-a pređi na GET /prijava (bez prikaza/preuzimanja JSON-a
  // na telefonu). Briše sesijski kolačić na istom response-u.
  const res = NextResponse.redirect(new URL("/prijava", request.url), { status: 303 });
  clearSessionCookie(res, request.headers.get("host"));
  // Spreči keširanje odjave (browser i SW).
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}

export async function POST(request: Request) {
  const pre = corsPreflightResponse(request);
  if (pre) {
    return pre;
  }
  return withCors(request, buildLogoutRedirect(request));
}

// Dozvoli i GET (direktan link / fallback) — isto ponašanje.
export async function GET(request: Request) {
  return buildLogoutRedirect(request);
}
