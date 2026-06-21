import { Resend } from "resend";
import { env } from "@/lib/env";
import { sendMailViaSmtp, smtpConfigured } from "@/lib/email/smtp";
import {
  buildBookingConfirmation,
  type BookingConfirmationInput,
} from "@/lib/email/booking-confirmation";
import { PUBLIC_CONTACT_EMAIL, PUBLIC_CONTACT_PHONE } from "@/lib/site-contact";

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
  to: string | string[];
  subject: string;
  text: string;
}) {
  // Podrška za više primatelja zarezom odvojenih: "a@x.com,b@x.com"
  const recipients = Array.isArray(to)
    ? to.flatMap((t) => t.split(",").map((e) => e.trim())).filter(Boolean)
    : to.split(",").map((e) => e.trim()).filter(Boolean);

  if (!preferResend() && smtpConfigured()) {
    // SMTP šalje jednom pozivu sa svim adresama (Nodemailer prihvata niz)
    return await sendMailViaSmtp({
      to: recipients.join(", "),
      subject,
      text,
      replyTo: PUBLIC_CONTACT_EMAIL,
    });
  }

  const resend = getResend();
  if (!resend) {
    return { sent: false as const, reason: "SMTP/RESEND not configured" };
  }
  const r = await resend.emails.send({
    from: resolveFrom(),
    to: recipients,
    replyTo: PUBLIC_CONTACT_EMAIL,
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
  ...booking
}: BookingConfirmationInput & { to: string }) {
  const { subject, text, html } = buildBookingConfirmation(booking);

  if (!preferResend() && smtpConfigured()) {
    return await sendMailViaSmtp({
      to,
      subject,
      text,
      html,
      replyTo: PUBLIC_CONTACT_EMAIL,
    });
  }

  const resend = getResend();
  if (!resend) {
    return { sent: false as const, reason: "SMTP/RESEND not configured" };
  }
  const r = await resend.emails.send({
    from: resolveFrom(),
    to,
    replyTo: PUBLIC_CONTACT_EMAIL,
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
    `Kontakt: ${PUBLIC_CONTACT_PHONE}`,
    `Email: ${PUBLIC_CONTACT_EMAIL}`,
    "",
    "Auto Delić",
  ].filter(Boolean);
  const text = lines.join("\n");
  const html = `<p>Zdravo,</p>
<p>Termin: <strong>${escapeHtml(when)}</strong><br/>Status: <strong>${escapeHtml(status)}</strong></p>
${resultSr ? `<p>Rezultat tehničkog: <strong>${escapeHtml(resultSr)}</strong></p>` : ""}
${inspectionNote ? `<p>Napomena: ${escapeHtml(String(inspectionNote))}</p>` : ""}
${workerNotes ? `<p>Napomena servisera: ${escapeHtml(String(workerNotes))}</p>` : ""}
<p>Kontakt: <strong>${escapeHtml(PUBLIC_CONTACT_PHONE)}</strong><br/>Email: <strong>${escapeHtml(PUBLIC_CONTACT_EMAIL)}</strong></p>
<p>— Auto Delić</p>`;

  if (!preferResend() && smtpConfigured()) {
    return await sendMailViaSmtp({
      to,
      subject,
      text,
      html,
      replyTo: PUBLIC_CONTACT_EMAIL,
    });
  }

  const resend = getResend();
  if (!resend) {
    return { sent: false as const, reason: "SMTP/RESEND not configured" };
  }
  const r = await resend.emails.send({
    from: resolveFrom(),
    to,
    replyTo: PUBLIC_CONTACT_EMAIL,
    subject,
    text,
    html,
  });
  if (r?.error) {
    return { sent: false as const, reason: r.error.message };
  }
  return { sent: true as const };
}
