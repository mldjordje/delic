import { randomBytes } from "crypto";

export const GOOGLE_OAUTH_STATE_COOKIE = "autodelic_google_oauth_state";
export const GOOGLE_OAUTH_NEXT_COOKIE = "autodelic_google_oauth_next";
/** Mora biti identičan pri /authorize i pri /token — čuva se u cookie tokom flow-a. */
export const GOOGLE_OAUTH_REDIRECT_COOKIE = "autodelic_google_oauth_redirect_uri";

const PRODUCTION_FALLBACK_BASE_URL = "https://autodelic.com";

export function getGoogleOauthCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    domain: process.env.NODE_ENV === "production" ? ".autodelic.com" : undefined,
    path: "/",
  };
}

export function sanitizeNextPath(nextPath: string | null | undefined) {
  if (!nextPath || typeof nextPath !== "string") return "/";
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) return "/";
  return nextPath;
}

function normalizeUrlValue(value: unknown) {
  const normalized = String(value || "").trim().replace(/\/+$/, "");
  if (!normalized) return "";
  try {
    return new URL(normalized).toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
}

function isLocalhostUrl(value: string) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname);
  } catch {
    return false;
  }
}

function getConfiguredBaseUrl() {
  const candidates = [
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeUrlValue(candidate);
    if (!normalized) continue;
    if (process.env.NODE_ENV === "production" && isLocalhostUrl(normalized)) continue;
    return normalized;
  }

  if (process.env.NODE_ENV === "production") return PRODUCTION_FALLBACK_BASE_URL;
  return "";
}

function getRequestBaseUrl(request: Request) {
  try {
    return new URL(request.url).origin.replace(/\/+$/, "");
  } catch {
    // Fall through to forwarded headers when request.url is unavailable.
  }

  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV === "production" ? "https" : "http");
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host");

  if (!host) return `${proto}://localhost:3000`;
  return `${proto}://${host}`;
}

export function getBaseUrl(request: Request) {
  const requestBaseUrl = getRequestBaseUrl(request);
  if (requestBaseUrl) return requestBaseUrl;

  const configuredBaseUrl = getConfiguredBaseUrl();
  if (configuredBaseUrl) return configuredBaseUrl;

  return PRODUCTION_FALLBACK_BASE_URL;
}

export function getGoogleRedirectUri(request: Request) {
  const configuredRedirectUri = normalizeUrlValue(process.env.GOOGLE_REDIRECT_URI);
  const requestBaseUrl = getRequestBaseUrl(request);
  const requestHost = requestBaseUrl ? new URL(requestBaseUrl).hostname : "";

  if (configuredRedirectUri && requestHost && !requestHost.endsWith(".vercel.app")) {
    return configuredRedirectUri;
  }
  return `${getBaseUrl(request)}/api/auth/google/callback`;
}

export function createGoogleOauthState() {
  return randomBytes(24).toString("hex");
}

export function hasGoogleConfig() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function buildGoogleAuthUrl(request: Request, state: string, redirectUri?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is missing.");

  const resolvedRedirect = redirectUri ?? getGoogleRedirectUri(request);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: resolvedRedirect,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

