export type AppUserRole = "client" | "staff" | "admin";

/** Email adrese koje uvek dobijaju ulogu admin pri prijavi (Google / OTP). */
const RAW_ADMIN_EMAILS = [
  "web.wise018@gmail.com",
  "predragdelic03@gmail.com",
  "adtehnickipregled@gmail.com",
  "delicivan79@gmail.com",
];

/** Radnik — dodaj mejl ovde ili postavi STAFF_LOGIN_EMAILS na Vercelu (zarezom odvojeno). */
const RAW_STAFF_EMAILS: string[] = [];

/**
 * Adrese koje UVEK dobijaju obaveštenje o novom terminu — nezavisno od env
 * konfiguracije. Dodatni primaoci preko MAIL_ADMIN_TO / ADMIN_BOOKING_NOTIFY_EMAIL.
 */
const RAW_BOOKING_NOTIFY_EMAILS = ["adtehnickipregled@gmail.com", "delicivan79@gmail.com"];

/** Zarezom odvojena lista primalaca obaveštenja o terminu (fiksni + env). */
export function getBookingNotifyRecipients(): string {
  const out = new Set<string>();
  for (const e of RAW_BOOKING_NOTIFY_EMAILS) {
    const t = String(e || "").trim();
    if (t.includes("@")) out.add(t);
  }
  for (const raw of [process.env.MAIL_ADMIN_TO, process.env.ADMIN_BOOKING_NOTIFY_EMAIL]) {
    for (const part of String(raw || "").split(",")) {
      const t = part.trim();
      if (t.includes("@")) out.add(t);
    }
  }
  return Array.from(out).join(",");
}

function normalizeEmail(value: string) {
  const trimmed = String(value || "").trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0) return trimmed;
  let local = trimmed.slice(0, at);
  let domain = trimmed.slice(at + 1);

  // Gmail quirks: dots ignored, googlemail == gmail, plus addressing.
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") {
    local = local.split("+")[0] || local;
    local = local.replaceAll(".", "");
  }

  return `${local}@${domain}`;
}

export const ADMIN_EMAILS = new Set(RAW_ADMIN_EMAILS.map(normalizeEmail));

function staffEmails(): Set<string> {
  const out = new Set<string>();
  for (const raw of RAW_STAFF_EMAILS) {
    const e = normalizeEmail(raw);
    if (e.includes("@")) out.add(e);
  }
  const fromEnv = String(process.env.STAFF_LOGIN_EMAILS || "");
  for (const part of fromEnv.split(",")) {
    const e = normalizeEmail(part);
    if (e.includes("@")) out.add(e);
  }
  return out;
}

export function mergeRoleForLogin(email: string | null | undefined, current: AppUserRole): AppUserRole {
  const e = normalizeEmail(String(email || ""));
  if (ADMIN_EMAILS.has(e)) return "admin";
  if (staffEmails().has(e)) {
    if (current === "admin") return "admin";
    return "staff";
  }
  return current;
}
