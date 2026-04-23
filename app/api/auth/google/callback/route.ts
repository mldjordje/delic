import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db/client";
import {
  getBaseUrl,
  getGoogleOauthCookieOptions,
  getGoogleRedirectUri,
  GOOGLE_OAUTH_NEXT_COOKIE,
  GOOGLE_OAUTH_REDIRECT_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  hasGoogleConfig,
  sanitizeNextPath,
} from "@/lib/auth/google";
import {
  hasSessionSecret,
  setSessionCookie,
  signSessionToken,
} from "@/lib/auth/session";
import { mergeRoleForLogin } from "@/lib/auth/admin-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function loginRedirect(request: NextRequest, reason: string, nextPath = "/dashboard") {
  const url = new URL("/prijava", request.url);
  url.searchParams.set("reason", reason);
  url.searchParams.set("next", sanitizeNextPath(nextPath));
  return url;
}

function clearGoogleOauthCookies(response: NextResponse, host: string | null) {
  const cookieOptions = getGoogleOauthCookieOptions(host);
  response.cookies.set({ name: GOOGLE_OAUTH_STATE_COOKIE, value: "", ...cookieOptions, maxAge: 0 });
  response.cookies.set({ name: GOOGLE_OAUTH_NEXT_COOKIE, value: "", ...cookieOptions, maxAge: 0 });
  response.cookies.set({ name: GOOGLE_OAUTH_REDIRECT_COOKIE, value: "", ...cookieOptions, maxAge: 0 });
}

function redirectToLogin(request: NextRequest, reason: string, nextPath: string) {
  const response = NextResponse.redirect(loginRedirect(request, reason, nextPath));
  clearGoogleOauthCookies(response, request.headers.get("host"));
  return response;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const nextPath = sanitizeNextPath(request.cookies.get(GOOGLE_OAUTH_NEXT_COOKIE)?.value || "/dashboard");
  const expectedState = request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value || "";

  if (!hasGoogleConfig() || !hasSessionSecret()) {
    return redirectToLogin(
      request,
      hasGoogleConfig() ? "session-config-missing" : "google-config-missing",
      nextPath
    );
  }

  const error = url.searchParams.get("error");
  if (error) {
    return redirectToLogin(request, "google-denied", nextPath);
  }

  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  if (!code || !returnedState || !expectedState || returnedState !== expectedState) {
    return redirectToLogin(request, "google-state-invalid", nextPath);
  }

  const redirectUriForToken =
    request.cookies.get(GOOGLE_OAUTH_REDIRECT_COOKIE)?.value || getGoogleRedirectUri(request);

  try {
    const db = getDb();
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: redirectUriForToken,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text().catch(() => "");
      console.error("[google oauth] token exchange failed", tokenResponse.status, errBody);
      return redirectToLogin(request, "google-token-failed", nextPath);
    }

    const tokenData = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenData?.access_token) {
      return redirectToLogin(request, "google-token-failed", nextPath);
    }

    const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoResponse.ok) {
      return redirectToLogin(request, "google-userinfo-failed", nextPath);
    }

    const userInfo = (await userInfoResponse.json()) as {
      email?: string;
      name?: string;
      given_name?: string;
      family_name?: string;
    };

    const email = String(userInfo?.email || "").trim().toLowerCase();
    if (!email) {
      return redirectToLogin(request, "google-email-missing", nextPath);
    }

    const fullNameRaw =
      String(userInfo?.name || "").trim() ||
      [userInfo?.given_name, userInfo?.family_name].filter(Boolean).join(" ").trim();
    const fullName = fullNameRaw.slice(0, 255);

    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.email, email)))
      .limit(1);

    let user = existingUser;
    if (!user) {
      const [created] = await db
        .insert(schema.users)
        .values({
          email,
          role: mergeRoleForLogin(email, "client"),
        })
        .returning();
      user = created;
    }
    if (!user) {
      console.error("[google oauth] user insert/select missing row for", email);
      return redirectToLogin(request, "google-server-error", nextPath);
    }

    const now = new Date();
    const [updatedUser] = await db
      .update(schema.users)
      .set({
        lastLoginAt: now,
        updatedAt: now,
        role: mergeRoleForLogin(email, user.role),
      })
      .where(eq(schema.users.id, user.id))
      .returning();
    user = updatedUser || user;

    if (fullName) {
      // upsert profile.fullName (non-blocking if it already exists)
      const [existingProfile] = await db
        .select()
        .from(schema.profiles)
        .where(eq(schema.profiles.userId, user.id))
        .limit(1);

      if (!existingProfile) {
        await db.insert(schema.profiles).values({ userId: user.id, fullName });
      } else if (!existingProfile.fullName) {
        await db
          .update(schema.profiles)
          .set({ fullName, updatedAt: now })
          .where(eq(schema.profiles.id, existingProfile.id));
      }
    }

    const sessionPayload: Record<string, unknown> = {
      sub: String(user.id),
      role: user.role,
      email: user.email,
    };
    if (user.phone != null && String(user.phone).length > 0) {
      sessionPayload.phone = user.phone;
    }
    const token = await signSessionToken(sessionPayload);

    const [profileRow] = await db
      .select({ fullName: schema.profiles.fullName })
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, user.id))
      .limit(1);

    const isClient = user.role === "client";
    const isBackoffice = user.role === "admin" || user.role === "staff";
    const mustCompleteProfile =
      isClient && (!String(profileRow?.fullName || "").trim() || !String(user.phone || "").trim());

    let finalNextPath: string;
    if (mustCompleteProfile) {
      finalNextPath = "/profile?complete=1";
    } else if (isBackoffice && !sanitizeNextPath(nextPath).startsWith("/admin")) {
      finalNextPath = "/admin/kalendar";
    } else {
      finalNextPath = sanitizeNextPath(nextPath);
    }

    const successRedirect = new URL(finalNextPath, getBaseUrl(request));
    const response = NextResponse.redirect(successRedirect);
    const host = request.headers.get("host");
    setSessionCookie(response, token, host);
    clearGoogleOauthCookies(response, host);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code =
      err && typeof err === "object" && "code" in err ? String((err as { code: unknown }).code) : "";
    console.error("[google oauth] callback error:", message, code || "", err);
    return redirectToLogin(request, "google-server-error", nextPath);
  }
}

