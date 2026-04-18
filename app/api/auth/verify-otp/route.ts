import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api/http";
import { withCors, corsPreflightResponse } from "@/lib/api/cors";
import { getDb, schema } from "@/lib/db/client";
import { hashOtpCode, hasOtpSalt, normalizeIdentifier } from "@/lib/auth/otp";
import {
  hasSessionSecret,
  setSessionCookie,
  signSessionToken,
} from "@/lib/auth/session";

export const runtime = "nodejs";

const payloadSchema = z.object({
  identifier: z.string().min(3),
  code: z.string().min(4).max(8),
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
  if (!hasOtpSalt() || !hasSessionSecret()) {
    return withCors(request, fail(503, "Prijava trenutno nije dostupna."));
  }

  const db = getDb();
  const now = new Date();

  const [otpRow] = await db
    .select()
    .from(schema.otpCodes)
    .where(
      and(
        eq(schema.otpCodes.identifier, value),
        isNull(schema.otpCodes.usedAt),
        gt(schema.otpCodes.expiresAt, now)
      )
    )
    .orderBy(desc(schema.otpCodes.createdAt))
    .limit(1);

  if (!otpRow) {
    return withCors(request, fail(401, "Kod je neispravan ili je istekao."));
  }

  const incomingHash = hashOtpCode(parsed.data.code);
  if (incomingHash !== otpRow.codeHash) {
    await db
      .update(schema.otpCodes)
      .set({ usedAt: now })
      .where(eq(schema.otpCodes.id, otpRow.id));
    return withCors(request, fail(401, "Kod nije ispravan."));
  }

  await db
    .update(schema.otpCodes)
    .set({ usedAt: now })
    .where(eq(schema.otpCodes.id, otpRow.id));

  let user: typeof schema.users.$inferSelect | undefined;

  if (otpRow.userId) {
    const [u] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, otpRow.userId))
      .limit(1);
    user = u;
  }

  if (!user && type === "email") {
    const [created] = await db
      .insert(schema.users)
      .values({ email: value, role: "client" })
      .returning();
    user = created;
  }

  if (!user) {
    return withCors(request, fail(404, "Korisnik nije pronađen."));
  }

  await db
    .update(schema.users)
    .set({ lastLoginAt: now, updatedAt: now })
    .where(eq(schema.users.id, user.id));

  const token = await signSessionToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    phone: user.phone,
  });

  const response = ok({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
  setSessionCookie(response, token);
  return withCors(request, response);
}
