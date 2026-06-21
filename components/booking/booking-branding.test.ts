import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("mesečna navigacija koristi svetlu primarnu pozadinu i taman tekst", () => {
  const source = readFileSync(new URL("./BookingDateGrid.tsx", import.meta.url), "utf8");
  assert.match(source, /bg-primary text-primary-foreground/);
});

test("favicon i obe PWA aplikacije koriste crni kvadratni logo", () => {
  const layout = readFileSync(new URL("../../app/layout.tsx", import.meta.url), "utf8");
  const clientManifest = readFileSync(new URL("../../public/manifest-client.webmanifest", import.meta.url), "utf8");
  const adminManifest = readFileSync(new URL("../../public/manifest-admin.webmanifest", import.meta.url), "utf8");
  for (const source of [layout, clientManifest, adminManifest]) {
    assert.match(source, /auto-delic-icon-black\.png/);
  }
});
