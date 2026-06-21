import assert from "node:assert/strict";
import test from "node:test";
import { bookingCalendarColor } from "./calendar-presentation";

test("završen tehnički je zelen kada je položen", () => {
  assert.equal(bookingCalendarColor("completed", "passed"), "#16a34a");
});

test("završen tehnički je crven kada nije položen", () => {
  assert.equal(bookingCalendarColor("completed", "failed"), "#dc2626");
});

test("otkazan termin koristi neutralnu žutu boju", () => {
  assert.equal(bookingCalendarColor("cancelled", null), "#d97706");
});
