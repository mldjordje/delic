import type { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";

export const SESSION_COOKIE_NAME = "autodelic_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

/**
 * Deljenje sesije između apex i www na autodelic.com.
 * Ne postavljaj Domain na *.vercel.app — pregledač/Next odbijaju ili bacaju grešku.
 */
export function sessionCookieDomain(hostHeader: string | null | undefined) {
  if (process.env.NODE_ENV !== "production") return undefined;
  if (!hostHeader) return undefined;
  const h = hostHeader.split(":")[0].toLowerCase();
  if (h.endsWith(".vercel.app")) return undefined;
  if (h === "autodelic.com" || h.endsWith(".autodelic.com")) return ".autodelic.com";
  return undefined;
}

export function hasSessionSecret() {
  return Boolean(env.AUTH_JWT_SECRET);
}

function getSecret() {
  if (!hasSessionSecret()) {
    throw new Error("AUTH_JWT_SECRET is missing.");
  }
  return new TextEncoder().encode(env.AUTH_JWT_SECRET);
}

export async function signSessionToken(payload: Record<string, unknown>) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_TTL_SECONDS)
    .sign(getSecret());
}

export async function verifySessionToken(token: string | undefined) {
  if (!token || !hasSessionSecret()) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, token: string, hostHeader?: string | null) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: sessionCookieDomain(hostHeader),
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse, hostHeader?: string | null) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: sessionCookieDomain(hostHeader),
    path: "/",
    maxAge: 0,
  });
}
