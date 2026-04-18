import { NextResponse } from "next/server";
import { env, getPublicAppUrl } from "@/lib/env";

function parseAllowedOrigins(): Set<string> {
  const raw = String(env.CORS_ALLOWED_ORIGINS || "").trim();
  const set = new Set<string>();
  const primary = getPublicAppUrl().replace(/\/$/, "");
  set.add(primary);
  if (raw) {
    raw.split(",").forEach((part) => {
      const o = part.trim().replace(/\/$/, "");
      if (o) set.add(o);
    });
  }
  return set;
}

export function withCors(request: Request, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin");
  if (!origin) {
    return response;
  }
  const allowed = parseAllowedOrigins();
  if (!allowed.has(origin)) {
    return response;
  }
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Vary", "Origin");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

export function corsPreflightResponse(request: Request): NextResponse | null {
  if (request.method !== "OPTIONS") {
    return null;
  }
  const origin = request.headers.get("origin");
  const allowed = parseAllowedOrigins();
  if (!origin || !allowed.has(origin)) {
    return new NextResponse(null, { status: 403 });
  }
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Max-Age", "86400");
  return new NextResponse(null, { status: 204, headers });
}
