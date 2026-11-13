import { test } from "node:test";
import assert from "node:assert/strict";
import { STEPS, CAVEATS, FOOTER_BADGES } from "../../src/data/zdp.ts";
import { SCENARIOS, buildDeployScript } from "../../src/lib/zdp/deploy.ts";

test("six steps, same order in every scenario", () => {
  assert.equal(STEPS.length, 6);
  for (const id of ["good", "wrong", "breaks", "rollback"] as const) {
    const runs = buildDeployScript(id)
      .filter((e) => e.t === "step" && e.state === "run")
      .map((e) => (e.t === "step" ? e.id : ""));
    assert.deepEqual(runs.slice(0, 3), ["install", "test", "smoke"]);
  }
});

test("a build that starts wrong never shifts user traffic", () => {
  const s = buildDeployScript("wrong");
  assert.ok(!s.some((e) => e.t === "split" && e.green > 0));
  assert.ok(s.some((e) => e.t === "step" && e.id === "smoke" && e.state === "fail"));
  assert.ok(
    ["canary", "full", "record"].every((id) =>
      s.some((e) => e.t === "step" && e.id === id && e.state === "skip"),
    ),
  );
});

test("a build that breaks under traffic alarms at +4:31 and returns to blue", () => {
  const s = buildDeployScript("breaks");
  const alarm = s.find((e) => e.t === "say" && /ALARM/.test(e.text));
  assert.equal(alarm?.t === "say" ? alarm.at : undefined, 271);
  const i = s.findIndex((e) => e.t === "metrics" && e.breach);
  assert.ok(s.slice(i).some((e) => e.t === "split" && e.green === 0));
  assert.ok(!s.some((e) => e.t === "step" && e.id === "record" && e.state === "ok"));
});

test("rollback runs on prod with blue as the newer sha", () => {
  const sc = SCENARIOS.rollback;
  assert.equal(sc.env, "prod");
  assert.equal(sc.blueSha, "9e07d3b");
  assert.equal(sc.greenSha, "4f1c2ab");
  assert.equal(sc.alarmName, "zdp-prod-target-5xx");
  assert.equal(sc.testPort, 9083);
  assert.match(sc.prDiff.check, /already ran in prod/);
  assert.ok(!/approved/.test(sc.prDiff.check));
});

test("copy never makes banned claims", () => {
  const all = JSON.stringify({
    STEPS,
    SCENARIOS,
    CAVEATS,
    FOOTER_BADGES,
    scripts: (["good", "wrong", "breaks", "rollback"] as const).map(buildDeployScript),
  });
  for (const banned of ["all infra in OpenTofu", "code owner approved", "code owner must approve", "58 s", "instant"]) {
    assert.ok(!all.includes(banned), banned);
  }
});

test("good build outcome text carries live-count placeholders", () => {
  const fin = buildDeployScript("good").find((e) => e.t === "finish");
  assert.ok(fin?.t === "finish" && fin.text.includes("{served}"));
});

test("the last now event of every script carries the headline fact", () => {
  for (const id of ["good", "wrong", "breaks", "rollback"] as const) {
    const nows = buildDeployScript(id).filter((e) => e.t === "now");
    const last = nows[nows.length - 1];
    assert.ok(last?.t === "now" && last.fact, `${id} final now has a fact`);
  }
});
