import nodemailer from "nodemailer";
import { env } from "@/lib/env";

type SendArgs = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

let transporter: nodemailer.Transporter | null = null;

export function smtpConfigured() {
  const host = String(env.SMTP_HOST || "").trim();
  const user = String(env.SMTP_USER || "").trim();
  const pass = String(env.SMTP_PASS || "").trim();
  return Boolean(host && user && pass);
}

function getTransporter() {
  if (transporter) return transporter;

  const host = String(env.SMTP_HOST || "").trim();
  const port = Number(env.SMTP_PORT || 465);
  const secure = env.SMTP_SECURE ?? port === 465;
  const user = String(env.SMTP_USER || "").trim();
  const pass = String(env.SMTP_PASS || "").trim();

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}

export function resolveMailFrom() {
  const from = String(env.MAIL_FROM || "").trim();
  if (from) return from;
  return String(env.RESEND_FROM || "Auto Delić <info@autodelic.com>");
}

export async function sendMailViaSmtp(args: SendArgs) {
  if (!smtpConfigured()) {
    return { sent: false as const, reason: "SMTP not configured" };
  }

  const tx = getTransporter();
  await tx.sendMail({
    from: resolveMailFrom(),
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
    replyTo: args.replyTo,
  });

  return { sent: true as const };
}

