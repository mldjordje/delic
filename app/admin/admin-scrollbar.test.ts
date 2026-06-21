import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("./admin-template.css", import.meta.url), "utf8");

test("admin koristi sopstveni vertikalni scroll kontejner sa rezervisanom trakom", () => {
  assert.match(css, /\.admin-template-root\s*\{[^}]*height:\s*100dvh;[^}]*overflow:\s*hidden;/s);
  assert.match(css, /\.admin-template-main\s*\{[^}]*height:\s*100dvh;[^}]*overflow-y:\s*scroll;[^}]*scrollbar-gutter:\s*stable;/s);
});

test("admin scrollbar ima uočljivu širinu i kontrastnu ručku", () => {
  assert.match(css, /\.admin-template-main::\-webkit-scrollbar\s*\{[^}]*width:\s*14px;/s);
  assert.match(css, /\.admin-template-main::\-webkit-scrollbar-thumb\s*\{[^}]*background:/s);
});
