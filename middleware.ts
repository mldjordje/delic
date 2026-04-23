import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  // Next.js Middleware runtime supports Web APIs, not Node crypto/jose. Buffer is available.
  // eslint-disable-next-line no-undef
  return Buffer.from(padded, "base64").toString("utf8");
}

function unsafeReadJwtPayload(token: string | undefined) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function unauthorized(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const u = request.nextUrl.clone();
  u.pathname = "/prijava";
  u.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(u);
}

function forbidden(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }
  const u = request.nextUrl.clone();
  u.pathname = "/admin/kalendar";
  return NextResponse.redirect(u);
}

const ADMIN_ONLY_PAGE_PREFIXES = [
  "/admin/dashboard",
  "/admin/klijenti",
  "/admin/radnici",
  "/admin/analitika",
  "/admin/media",
  "/admin/podesavanja",
  "/admin/istorija",
  "/admin/video",
  "/admin/usluge",
  "/admin/polovni",
];

const ADMIN_ONLY_API_PREFIXES = [
  "/api/admin/media",
  "/api/admin/stats",
  "/api/admin/clients",
  "/api/admin/garage-settings",
  "/api/admin/workers",
  "/api/admin/analytics",
  "/api/admin/services",
  "/api/admin/used-cars",
];

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  // Canonicalize apex → www to match production domain routing.
  // Avoid apex<->www redirect loops (platform redirect + middleware redirect).
  if (host.split(":")[0]?.toLowerCase() === "autodelic.com") {
    const url = request.nextUrl.clone();
    url.hostname = "www.autodelic.com";
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  const path = request.nextUrl.pathname;
  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  if (!path.startsWith("/admin") && !path.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = unsafeReadJwtPayload(token);
  if (!session?.sub) {
    return unauthorized(request);
  }

  const role = String(session.role || "");
  if (role !== "admin" && role !== "staff") {
    // If someone has a session but not an allowed backoffice role,
    // redirect them out of /admin to avoid an infinite redirect loop.
    return unauthorized(request);
  }

  const isAdminOnlyPage = ADMIN_ONLY_PAGE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
  const isAdminOnlyApi = ADMIN_ONLY_API_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

  if (role !== "admin" && (isAdminOnlyPage || isAdminOnlyApi)) {
    return forbidden(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
