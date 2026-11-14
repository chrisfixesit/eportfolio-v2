import { test } from "node:test";
import assert from "node:assert/strict";
import { FlagMachine, pageState, FLAG_SCENARIOS } from "../../src/lib/zdp/flag.ts";

test("a click while landing is ignored", () => {
  const m = new FlagMachine({ landSeconds: 60 });
  assert.equal(m.click(), "flipping");
  assert.equal(m.state, "landing-on");
  assert.equal(m.click(), "ignored");
  m.land();
  assert.equal(m.state, "on");
  assert.equal(m.clock, 60);
});

test("the page follows landed state only", () => {
  assert.equal(pageState("off"), "baseline");
  assert.equal(pageState("landing-on"), "baseline");
  assert.equal(pageState("on"), "flagged");
  assert.equal(pageState("landing-off"), "flagged");
});

test("misbehave scenario auto-offs; a hand flip afterwards lands cleanly", () => {
  const m = new FlagMachine({ landSeconds: 60 });
  m.startScenario("misbehave");
  m.flip();
  m.land();
  assert.equal(m.misbehaving, true);
  m.autoOff();
  m.land();
  assert.equal(m.state, "off");
  m.click();
  m.land();
  assert.equal(m.state, "on");
  assert.equal(m.misbehaving, false);
});

test("a direct click cancels a running scenario", () => {
  const m = new FlagMachine({ landSeconds: 60 });
  m.startScenario("misbehave");
  m.flip();
  m.land();
  m.cancel();
  assert.equal(m.misbehaving, false);
  assert.equal(m.state, "on");
});

test("flip preserves misbehaving, click clears it", () => {
  const a = new FlagMachine({ landSeconds: 60 });
  a.startScenario("misbehave");
  assert.equal(a.flip(), "flipping");
  assert.equal(a.misbehaving, true);
  assert.equal(a.flip(), "ignored");
  const b = new FlagMachine({ landSeconds: 60 });
  b.startScenario("misbehave");
  b.click();
  assert.equal(b.misbehaving, false);
});

test("cancel during a landing state resolves it via land", () => {
  const m = new FlagMachine({ landSeconds: 60 });
  m.startScenario("misbehave");
  m.flip();
  m.cancel();
  assert.equal(m.state, "on");
  assert.equal(m.clock, 60);
  assert.equal(m.misbehaving, false);
});

test("autoOff is a no-op unless on and misbehaving", () => {
  const m = new FlagMachine({ landSeconds: 60 });
  m.autoOff();
  assert.equal(m.state, "off");
  m.startScenario("onoff");
  m.flip();
  m.land();
  m.autoOff();
  assert.equal(m.state, "on");
});

test("startScenario resets state and clock", () => {
  const m = new FlagMachine({ landSeconds: 60 });
  m.click();
  m.land();
  m.startScenario("onoff");
  assert.equal(m.state, "off");
  assert.equal(m.clock, 0);
  assert.equal(m.misbehaving, false);
});

test("timeline copy matches the drill and never times 'errors rise'", () => {
  const t = new FlagMachine({ landSeconds: 60 }).timeline("misbehave");
  assert.deepEqual(t.map((e) => e.key), ["flipped", "live", "errors", "rolledback", "normal"]);
  assert.equal(t[2].at, undefined);
  assert.equal(t[2].illustrative, true);
  assert.equal(t[3].at, 294);
  assert.equal(t[3].label, "rolled back");
  assert.ok(!JSON.stringify(t).includes("58"));
});

test("onoff timeline and scenario labels", () => {
  const t = new FlagMachine({ landSeconds: 60 }).timeline("onoff");
  assert.deepEqual(t.map((e) => e.key), ["flipped", "live", "flippedoff", "baseline"]);
  assert.equal(t[2].at, 60);
  assert.equal(t[3].at, 120);
  assert.equal(t[3].detail, "the old button is back");
  assert.deepEqual(FLAG_SCENARIOS.map((s) => s.label), ["⇆ turn it on, then off", "⚠ turn it on and it misbehaves"]);
});
