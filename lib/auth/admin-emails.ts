export type AppUserRole = "client" | "staff" | "admin";

/** Email adrese koje uvek dobijaju ulogu admin pri prijavi (Google / OTP). */
const RAW_ADMIN_EMAILS = ["web.wise018@gmail.com", "predragdelic03@gmail.com"];

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

export function mergeRoleForLogin(email: string | null | undefined, current: AppUserRole): AppUserRole {
  const e = normalizeEmail(String(email || ""));
  if (ADMIN_EMAILS.has(e)) return "admin";
  return current;
}
