// tests/zdp/smoke.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
test("test runner strips types", () => {
  const n: number = 1 + 1;
  assert.equal(n, 2);
});
