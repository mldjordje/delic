import assert from "node:assert/strict";
import test from "node:test";
import { buildBookingConfirmation } from "./booking-confirmation";

test("builds complete, escaped booking confirmation", () => {
  const result = buildBookingConfirmation({
    fullName: "Petar <Delić>",
    startsAtIso: "2026-06-20T08:30:00.000Z",
    vehicle: "Volkswagen Golf 7",
    plateNumber: "NI-123-AB",
    companyName: "Auto Delić",
    address: "Bulevar Svetog Cara Konstantina 67Nj, Niš",
    phone: "+381 65 220 0739",
    email: "info@autodelic.com",
  });

  assert.match(result.subject, /potvrda termina/i);
  assert.match(result.text, /Poštovani, Petar <Delić>/);
  assert.match(result.text, /Datum: 20\. 06\. 2026\./);
  assert.match(result.text, /Vreme: 10:30h/);
  assert.match(result.text, /Vozilo: Volkswagen Golf 7/);
  assert.match(result.text, /Registarska oznaka: NI-123-AB/);
  assert.match(result.text, /10 minuta pre zakazanog termina/);
  assert.match(result.text, /Bulevar Svetog Cara Konstantina 67Nj, Niš/);
  assert.match(result.html, /Petar &lt;Delić&gt;/);
  assert.doesNotMatch(result.html, /Petar <Delić>/);
});
