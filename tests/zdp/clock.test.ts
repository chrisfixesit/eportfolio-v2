import { test } from "node:test";
import assert from "node:assert/strict";
import { formatClock, toWallMs, makeRng, REPLAY_SPEED } from "../../src/lib/zdp/clock.ts";

test("formatClock pads seconds only", () => {
  assert.equal(formatClock(0), "+0:00");
  assert.equal(formatClock(271), "+4:31");
  assert.equal(formatClock(798), "+13:18");
});

test("toWallMs compresses by speed and is 0 under reduced motion", () => {
  assert.equal(toWallMs(60, { speed: 20, reduce: false }), 3000);
  assert.equal(toWallMs(60, { speed: 20, reduce: true }), 0);
});

test("makeRng is deterministic", () => {
  const a = makeRng(1), b = makeRng(1);
  assert.equal(a(), b());
  assert.ok(a() >= 0 && a() < 1);
});

test("REPLAY_SPEED is 20", () => {
  assert.equal(REPLAY_SPEED, 20);
});
