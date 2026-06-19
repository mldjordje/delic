import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

async function verifyMiddlewareSession(token: string | undefined) {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return payload;
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
  const path = request.nextUrl.pathname;
  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  if (!path.startsWith("/admin") && !path.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifyMiddlewareSession(token);
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
