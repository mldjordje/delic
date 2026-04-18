import { and, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api/http";
import { withCors, corsPreflightResponse } from "@/lib/api/cors";
import { env } from "@/lib/env";
import { getDb, schema } from "@/lib/db/client";
import {
  generateOtpCode,
  hashOtpCode,
  hasOtpSalt,
  normalizeIdentifier,
} from "@/lib/auth/otp";
import { sendOtpEmail } from "@/lib/auth/email";

export const runtime = "nodejs";

const OTP_WINDOW_MIN = 15;
const OTP_MAX_PER_WINDOW = 4;
const OTP_COOLDOWN_SEC = 45;

const payloadSchema = z.object({
  identifier: z.string().min(3),
});

export async function OPTIONS(request: Request) {
  const pre = corsPreflightResponse(request);
  return pre || new Response(null, { status: 405 });
}

export async function POST(request: Request) {
  const pre = corsPreflightResponse(request);
  if (pre) {
    return pre;
  }

  const body = await readJson(request);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return withCors(request, fail(400, "Neispravan zahtev", parsed.error.flatten()));
  }

  const { type, value } = normalizeIdentifier(parsed.data.identifier);
  if (!type) {
    return withCors(request, fail(400, "Unesite ispravan email ili telefon."));
  }
  if (!hasOtpSalt()) {
    return withCors(
      request,
      fail(503, "OTP trenutno nije dostupan. Proverite AUTH_OTP_SALT.")
    );
  }

  const db = getDb();
  const now = new Date();
  const windowStart = new Date(now.getTime() - OTP_WINDOW_MIN * 60 * 1000);

  const recentRequests = await db
    .select({ createdAt: schema.otpCodes.createdAt })
    .from(schema.otpCodes)
    .where(
      and(eq(schema.otpCodes.identifier, value), gte(schema.otpCodes.createdAt, windowStart))
    )
    .orderBy(desc(schema.otpCodes.createdAt))
    .limit(OTP_MAX_PER_WINDOW);

  const latestAt = recentRequests[0]?.createdAt
    ? new Date(recentRequests[0].createdAt).getTime()
    : 0;
  if (latestAt && now.getTime() - latestAt < OTP_COOLDOWN_SEC * 1000) {
    return withCors(request, fail(429, `Sačekajte ${OTP_COOLDOWN_SEC} sekundi pre novog koda.`));
  }

  if (recentRequests.length >= OTP_MAX_PER_WINDOW) {
    return withCors(request, fail(429, "Previše zahteva za kod. Pokušajte kasnije."));
  }

  let user: typeof schema.users.$inferSelect | undefined;
  let targetEmail: string | null = null;

  if (type === "email") {
    const [existing] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, value))
      .limit(1);

    if (!existing) {
      const [created] = await db
        .insert(schema.users)
        .values({ email: value, role: "client" })
        .returning();
      user = created;
    } else {
      user = existing;
    }
    targetEmail = user.email;
  } else {
    const [existing] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.phone, value))
      .limit(1);

    if (!existing?.email) {
      return withCors(
        request,
        fail(404, "Broj nije povezan sa nalogom. Prvo se prijavite emailom.")
      );
    }
    user = existing;
    targetEmail = existing.email;
  }

  const code = generateOtpCode();
  const codeHash = hashOtpCode(code);
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

  await db.insert(schema.otpCodes).values({
    identifier: value,
    userId: user.id,
    codeHash,
    expiresAt,
  });

  const emailResult = await sendOtpEmail({ to: targetEmail!, code });

  if (!emailResult.sent && env.NODE_ENV === "production") {
    return withCors(request, fail(503, "Slanje emaila nije uspelo."));
  }

  const res = ok({
    ok: true,
    channel: "email",
    identifierType: type,
    expiresAt: expiresAt.toISOString(),
    ...(env.NODE_ENV !== "production" && !emailResult.sent
      ? { devOtp: code, warning: emailResult.reason }
      : {}),
  });
  return withCors(request, res);
}
