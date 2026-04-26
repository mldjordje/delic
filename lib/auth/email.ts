import { Resend } from "resend";
import { env } from "@/lib/env";
import { sendMailViaSmtp, smtpConfigured } from "@/lib/email/smtp";

let resendClient: Resend | null = null;
const FALLBACK_FROM = "Auto Delić <onboarding@resend.dev>";

/** Resend ima prednost nad SMTP — SMTP je fallback samo ako nema RESEND_API_KEY */
function preferResend() {
  return Boolean(String(env.RESEND_API_KEY || "").trim());
}

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

  if (!preferResend() && smtpConfigured()) {
    return await sendMailViaSmtp({ to, subject, text, html, replyTo: replyTo || undefined });
  }

  const resend = getResend();
  if (!resend) {
    return { sent: false as const, reason: "SMTP/RESEND not configured" };
  }

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
  if (!preferResend() && smtpConfigured()) {
    return await sendMailViaSmtp({
      to,
      subject,
      text,
      replyTo: env.RESEND_REPLY_TO || undefined,
    });
  }

  const resend = getResend();
  if (!resend) {
    return { sent: false as const, reason: "SMTP/RESEND not configured" };
  }
  const r = await resend.emails.send({
    from: resolveFrom(),
    to,
    replyTo: env.RESEND_REPLY_TO || undefined,
    subject,
    text,
  });
  if (r?.error) {
    return { sent: false as const, reason: r.error.message };
  }
  return { sent: true as const };
}

export async function sendBookingConfirmationEmail({
  to,
  startsAtIso,
}: {
  to: string;
  startsAtIso: string;
}) {
  const when = new Date(startsAtIso).toLocaleString("sr-RS", {
    timeZone: "Europe/Belgrade",
  });
  const subject = "Auto Delić — zahtev za termin je primljen";
  const text = `Zdravo,\n\nVaš zahtev za termin tehničkog pregleda (${when}) je primljen. Uskoro ćete dobiti potvrdu.\n\nAuto Delić`;
  const html = `<p>Zdravo,</p><p>Vaš <strong>zahtev za termin tehničkog pregleda</strong> za <strong>${escapeHtml(
    when
  )}</strong> je primljen. Uskoro možete očekivati potvrdu.</p><p>— Auto Delić</p>`;

  if (!preferResend() && smtpConfigured()) {
    return await sendMailViaSmtp({
      to,
      subject,
      text,
      html,
      replyTo: env.RESEND_REPLY_TO || undefined,
    });
  }

  const resend = getResend();
  if (!resend) {
    return { sent: false as const, reason: "SMTP/RESEND not configured" };
  }
  const r = await resend.emails.send({
    from: resolveFrom(),
    to,
    replyTo: env.RESEND_REPLY_TO || undefined,
    subject,
    text,
    html,
  });
  if (r?.error) {
    return { sent: false as const, reason: r.error.message };
  }
  return { sent: true as const };
}

export async function sendBookingUpdateEmail({
  to,
  startsAtIso,
  status,
  workerNotes,
  inspectionResult,
  inspectionNote,
}: {
  to: string;
  startsAtIso: string;
  status: string;
  workerNotes?: string | null;
  inspectionResult?: "passed" | "failed" | null;
  inspectionNote?: string | null;
}) {
  const when = new Date(startsAtIso).toLocaleString("sr-RS", {
    timeZone: "Europe/Belgrade",
  });
  const resultSr =
    inspectionResult === "passed" ? "Položio" : inspectionResult === "failed" ? "Nije položio" : null;
  const subject = `Auto Delić — ažuriranje termina (${when})`;
  const lines = [
    "Zdravo,",
    "",
    `Termin: ${when}`,
    `Status: ${status}`,
    resultSr ? `Rezultat pregleda: ${resultSr}` : null,
    inspectionNote ? `Napomena: ${inspectionNote}` : null,
    workerNotes ? `Napomena servisera: ${workerNotes}` : null,
    "",
    "Auto Delić",
  ].filter(Boolean);
  const text = lines.join("\n");
  const html = `<p>Zdravo,</p>
<p>Termin: <strong>${escapeHtml(when)}</strong><br/>Status: <strong>${escapeHtml(status)}</strong></p>
${resultSr ? `<p>Rezultat tehničkog: <strong>${escapeHtml(resultSr)}</strong></p>` : ""}
${inspectionNote ? `<p>Napomena: ${escapeHtml(String(inspectionNote))}</p>` : ""}
${workerNotes ? `<p>Napomena servisera: ${escapeHtml(String(workerNotes))}</p>` : ""}
<p>— Auto Delić</p>`;

  if (!preferResend() && smtpConfigured()) {
    return await sendMailViaSmtp({
      to,
      subject,
      text,
      html,
      replyTo: env.RESEND_REPLY_TO || undefined,
    });
  }

  const resend = getResend();
  if (!resend) {
    return { sent: false as const, reason: "SMTP/RESEND not configured" };
  }
  const r = await resend.emails.send({
    from: resolveFrom(),
    to,
    replyTo: env.RESEND_REPLY_TO || undefined,
    subject,
    text,
    html,
  });
  if (r?.error) {
    return { sent: false as const, reason: r.error.message };
  }
  return { sent: true as const };
}
