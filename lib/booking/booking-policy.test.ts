import assert from "node:assert/strict";
import test from "node:test";
import { initialBookingStatus } from "./booking-policy";

test("automatska potvrda odmah potvrđuje online termin", () => {
  assert.equal(initialBookingStatus(true), "confirmed");
});

test("ručna potvrda ostavlja online termin na čekanju", () => {
  assert.equal(initialBookingStatus(false), "pending");
});
