import assert from "node:assert/strict";
import test from "node:test";
import { fuelLabelSr } from "./fuel-label";

test("prikazuje lokalizovane nazive goriva", () => {
  assert.equal(fuelLabelSr("petrol"), "Benzin");
  assert.equal(fuelLabelSr("diesel"), "Dizel");
  assert.equal(fuelLabelSr("electric"), "Električni pogon");
});

test("čuva nepoznatu vrednost umesto praznog prikaza", () => {
  assert.equal(fuelLabelSr("hibrid"), "hibrid");
  assert.equal(fuelLabelSr(null), null);
});
