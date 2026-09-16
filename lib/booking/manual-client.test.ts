import assert from "node:assert/strict";
import test from "node:test";
import { buildVehicleMake, isPlaceholderEmail, makePlaceholderEmail, normalizePhone, normalizePlate } from "./manual-client";

test("placeholder email je prepoznat i ne liči na pravu adresu", () => {
  const e = makePlaceholderEmail("Petar Petrović");
  assert.ok(isPlaceholderEmail(e));
  assert.ok(!isPlaceholderEmail("petar@gmail.com"));
  assert.ok(!isPlaceholderEmail(null));
});

test("normalizePhone čisti razmake i crtice", () => {
  assert.equal(normalizePhone("064 123-4567"), "0641234567");
  assert.equal(normalizePhone("+381 64 123 4567"), "+381641234567");
  assert.equal(normalizePhone("00381641234567"), "+381641234567");
  assert.equal(normalizePhone("   "), "");
});

test("buildVehicleMake označava motor i nepoznato vozilo", () => {
  assert.equal(buildVehicleMake("car", "Opel"), "Opel");
  assert.equal(buildVehicleMake("car", null), "Nepoznato vozilo");
  assert.equal(buildVehicleMake(undefined, "  "), "Nepoznato vozilo");
  assert.equal(buildVehicleMake("motorcycle", "Yamaha"), "Motor · Yamaha");
  assert.equal(buildVehicleMake("motorcycle", null), "Motor · nepoznat");
});

test("normalizePlate pretvara u velika slova", () => {
  assert.equal(normalizePlate("  ni  123-ab "), "NI 123-AB");
});
