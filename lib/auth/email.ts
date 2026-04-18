import { Resend } from "resend";
import { env } from "@/lib/env";

let resendClient: Resend | null = null;
const FALLBACK_FROM = "Auto Delić <onboarding@resend.dev>";

function getResend() {
  const key = String(env.RESEND_API_KEY || "").trim();
  if (!key) return null;
  if (!resendClient) {
    resendClient = new Resend(key);
  }
  return resendClient;
}

function resolveFrom() {
  const from = String(env.RESEND_FROM || "").trim();
  return from || FALLBACK_FROM;
}

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendOtpEmail({ to, code }: { to: string; code: string }) {
  const resend = getResend();
  if (!resend) {
    return { sent: false as const, reason: "RESEND_API_KEY missing" };
  }

  const subject = "Auto Delić — kod za prijavu";
  const text = `Vaš jednokratni kod: ${code}\nVaži 10 minuta.\nAko niste Vi tražili prijavu, ignorišite poruku.`;
  const html = `
    <div style="font-family:Arial,sans-serif;padding:24px;background:#f8fafc;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
        <h1 style="font-size:20px;color:#0f172a;">Prijava — Auto Delić</h1>
        <p style="color:#334155;font-size:15px;line-height:1.6;">Unesite kod ispod da biste završili prijavu (tehnički pregled vozila).</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:0.2em;color:#0f172a;">${escapeHtml(code)}</p>
        <p style="color:#64748b;font-size:13px;">Kod važi 10 minuta.</p>
      </div>
    </div>`;

  const replyTo = env.RESEND_REPLY_TO?.trim();
  const r = await resend.emails.send({
    from: resolveFrom(),
    to,
    replyTo: replyTo || undefined,
    subject,
    text,
    html,
  });

  if (r?.error) {
    return { sent: false as const, reason: r.error.message };
  }
  return { sent: true as const, id: r?.data?.id };
}

export async function notifyAdminInbox({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const resend = getResend();
  if (!resend) {
    return { sent: false as const, reason: "RESEND_API_KEY missing" };
  }
  await resend.emails.send({
    from: resolveFrom(),
    to,
    replyTo: env.RESEND_REPLY_TO || undefined,
    subject,
    text,
  });
  return { sent: true as const };
}

export async function sendBookingConfirmationEmail({
  to,
  startsAtIso,
}: {
  to: string;
  startsAtIso: string;
}) {
  const resend = getResend();
  if (!resend) {
    return { sent: false as const, reason: "RESEND_API_KEY missing" };
  }
  const when = new Date(startsAtIso).toLocaleString("sr-RS", {
    timeZone: "Europe/Belgrade",
  });
  const subject = "Auto Delić — zahtev za termin je primljen";
  const text = `Zdravo,\n\nVaš zahtev za termin tehničkog pregleda (${when}) je primljen. Uskoro ćete dobiti potvrdu.\n\nAuto Delić`;
  await resend.emails.send({
    from: resolveFrom(),
    to,
    replyTo: env.RESEND_REPLY_TO || undefined,
    subject,
    text,
  });
  return { sent: true as const };
}
