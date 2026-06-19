import assert from "node:assert/strict";
import test from "node:test";
import { loginDestinationForRole } from "./login-destination";

test("routes every authenticated role to its own application area", () => {
  assert.equal(loginDestinationForRole("client"), "/dashboard");
  assert.equal(loginDestinationForRole("staff"), "/admin/kalendar");
  assert.equal(loginDestinationForRole("admin"), "/admin/kalendar");
  assert.equal(loginDestinationForRole(null), null);
});
