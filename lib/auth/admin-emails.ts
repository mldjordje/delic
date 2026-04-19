export type AppUserRole = "client" | "staff" | "admin";

/** Email adrese koje uvek dobijaju ulogu admin pri prijavi (Google / OTP). */
export const ADMIN_EMAILS = new Set(["web.wise018@gmail.com"]);

export function mergeRoleForLogin(email: string | null | undefined, current: AppUserRole): AppUserRole {
  const e = String(email || "").trim().toLowerCase();
  if (ADMIN_EMAILS.has(e)) return "admin";
  return current;
}
