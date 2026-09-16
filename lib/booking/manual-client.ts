/**
 * Pomoćne funkcije za ručni unos termina (npr. iz sveske) — klijenti bez emaila
 * dobijaju placeholder adresu koja se nikad ne koristi za slanje pošte.
 */

export const PLACEHOLDER_EMAIL_DOMAIN = "bez-emaila.autodelic.invalid";

export function isPlaceholderEmail(email: string | null | undefined) {
  return String(email || "").toLowerCase().endsWith(`@${PLACEHOLDER_EMAIL_DOMAIN}`);
}

export function makePlaceholderEmail(seed: string) {
  const slug = String(seed || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  const rand = Math.random().toString(36).slice(2, 8);
  return `rucno-${slug || "klijent"}-${rand}@${PLACEHOLDER_EMAIL_DOMAIN}`;
}

/** Normalizuje srpski broj telefona: "064 123-4567" → "0641234567", "+381 64..." → "+38164...". */
export function normalizePhone(raw: string | null | undefined) {
  const s = String(raw || "").trim();
  if (!s) return "";
  const plus = s.startsWith("+");
  const digits = s.replace(/\D+/g, "");
  if (!digits) return "";
  if (plus) return `+${digits}`;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  return digits;
}

/** Tablica: velika slova, bez suvišnih razmaka ("ni 123-ab" → "NI 123-AB"). */
export function normalizePlate(raw: string | null | undefined) {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .slice(0, 16);
}
