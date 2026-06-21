import assert from "node:assert/strict";
import test from "node:test";
import { PUBLIC_CONTACT_EMAIL, PUBLIC_CONTACT_PHONE } from "./site-contact";

test("korisnički emailovi koriste javne kontakte tehničkog pregleda", () => {
  assert.equal(PUBLIC_CONTACT_EMAIL, "adtehnickipregled@gmail.com");
  assert.equal(PUBLIC_CONTACT_PHONE, "062 443 050 / 066 282 383");
});
