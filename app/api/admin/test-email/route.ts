import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { env } from "@/lib/env";
import { notifyAdminInbox } from "@/lib/auth/email";

export const runtime = "nodejs";

const bodySchema = z.object({
  to: z.string().email().optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const body = await readJson(request);
  const parsed = bodySchema.safeParse(body || {});
  if (!parsed.success) {
    return fail(400, "Neispravan zahtev", parsed.error.flatten());
  }

  const to = parsed.data.to || String(env.MAIL_ADMIN_TO || env.ADMIN_BOOKING_NOTIFY_EMAIL || "").trim();
  if (!to) {
    return fail(400, "Nije podešen admin email (MAIL_ADMIN_TO).");
  }

  const r = await notifyAdminInbox({
    to,
    subject: "SMTP test — Auto Delić",
    text: `Ovo je test email iz admin panela.\nVreme: ${new Date().toISOString()}`,
  });

  if (!r.sent) {
    return fail(500, `Slanje nije uspelo: ${"reason" in r ? r.reason : "unknown"}`);
  }

  return ok({ ok: true });
}

