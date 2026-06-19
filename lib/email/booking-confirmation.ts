export type BookingConfirmationInput = {
  fullName?: string | null;
  startsAtIso: string;
  vehicle: string;
  plateNumber?: string | null;
  companyName: string;
  address: string;
  phone: string;
  email: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatBelgradeDateTime(startsAtIso: string) {
  const date = new Date(startsAtIso);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid booking start date");
  }

  const parts = new Intl.DateTimeFormat("sr-RS", {
    timeZone: "Europe/Belgrade",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    date: `${get("day")}. ${get("month")}. ${get("year")}.`,
    time: `${get("hour")}:${get("minute")}h`,
  };
}

export function buildBookingConfirmation(input: BookingConfirmationInput) {
  const { date, time } = formatBelgradeDateTime(input.startsAtIso);
  const name = String(input.fullName || "").trim();
  const greeting = name ? `Poštovani, ${name},` : "Poštovani,";
  const plateNumber = String(input.plateNumber || "Nije navedena").trim();
  const subject = `${input.companyName} — potvrda termina`;

  const text = `${greeting}

Potvrđujemo da je Vaš termin za tehnički pregled uspešno zakazan.

Detalji termina:
Datum: ${date}
Vreme: ${time}
Vozilo: ${input.vehicle}
Registarska oznaka: ${plateNumber}
Adresa: ${input.address}
Kontakt: ${input.phone}
Email: ${input.email}

Molimo Vas da dođete 10 minuta pre zakazanog termina.

Ukoliko želite da promenite termin ili imate bilo kakvu važnu informaciju u vezi sa dolaskom, slobodno nas kontaktirajte. Rado ćemo Vam pomoći.

Srdačan pozdrav,
${input.companyName}`;

  const rows = [
    ["Datum", date],
    ["Vreme", time],
    ["Vozilo", input.vehicle],
    ["Registarska oznaka", plateNumber],
    ["Adresa", input.address],
    ["Kontakt", input.phone],
    ["Email", input.email],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#5b6572;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0;color:#111827;font-weight:600">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html = `<div style="font-family:Arial,sans-serif;max-width:620px;color:#111827;line-height:1.6">
  <p>${escapeHtml(greeting)}</p>
  <p>Potvrđujemo da je Vaš termin za <strong>tehnički pregled uspešno zakazan</strong>.</p>
  <table style="width:100%;border-collapse:collapse;margin:20px 0">${rows}</table>
  <p><strong>Molimo Vas da dođete 10 minuta pre zakazanog termina.</strong></p>
  <p>Ukoliko želite da promenite termin ili imate bilo kakvu važnu informaciju u vezi sa dolaskom, slobodno nas kontaktirajte. Rado ćemo Vam pomoći.</p>
  <p>Srdačan pozdrav,<br><strong>${escapeHtml(input.companyName)}</strong></p>
</div>`;

  return { subject, text, html };
}
