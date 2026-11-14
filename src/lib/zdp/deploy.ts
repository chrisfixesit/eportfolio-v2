// Deploy scenarios and the scripted event list a DOM player executes.
// Pure data: `at` values are plain drill seconds counted from the start of the
// CodeDeploy deployment.
import { STEPS } from "../../data/zdp.ts";

export type StepId = "install" | "test" | "smoke" | "canary" | "full" | "record";
export type StepState = "idle" | "run" | "ok" | "fail" | "skip";
export type Env = "sandbox" | "staging" | "prod";
export type DeployScenarioId = "good" | "wrong" | "breaks" | "rollback";

export interface Rung {
  env: Env;
  sha: string;
  note: string;
  digest12: string;
  active: boolean;
}

export interface DeployScenario {
  id: DeployScenarioId;
  label: string;
  hint: string;
  env: Env;
  blueSha: string;
  greenSha: string;
  alarmName: string;
  testPort: number;
  userPort: number;
  ladder: Rung[];
  /** notes shown between ladder rungs, top to bottom: [prod↔staging, staging↔sandbox] */
  upNotes: string[];
  prDiff: { minus: string; plus: string; check: string };
}

export type DeployEvent =
  | { t: "step"; id: StepId; state: StepState }
  | {
      t: "say";
      text: string;
      tone?: "ok" | "warn" | "crit";
      /** exact clock time in drill seconds, for lines that cite a drill */
      at?: number;
      /** clock time relative to when the canary step started: canaryStart + this many seconds */
      atFromCanary?: number;
    }
  | { t: "split"; green: number }
  | { t: "stream"; n: number; greenPct: number; errRate?: number }
  | { t: "metrics"; count: string; state: string; breach?: boolean }
  | { t: "beat" }
  | { t: "sleep"; drillSeconds: number }
  | { t: "now"; title: string; why: string; fact?: string }
  /**
   * `text` may contain the tokens `{served}`, `{failed}` and `{total}` (served + failed); the player
   * substitutes them with its live request counters when it shows the outcome.
   */
  | { t: "finish"; glyph: string; text: string; tone: "ok" | "warn"; note: string }
  | { t: "ladder"; env: Env; sha: string; note: string }
  | { t: "blast"; text: string };

const OLD_SHA = "4f1c2ab";
const NEW_SHA = "9e07d3b";
const DIGEST12: Record<string, string> = {
  [OLD_SHA]: "7a1c9f02d3e4",
  [NEW_SHA]: "e9b24c8a1f07",
};

const SANDBOX_NOTE = "all at once, about 5 min";

interface Spec {
  id: DeployScenarioId;
  label: string;
  hint: string;
  env: Env;
  blueSha: string;
  greenSha: string;
}

const SPECS: Spec[] = [
  { id: "good", label: "▶ a good build", hint: "the happy path", env: "prod", blueSha: OLD_SHA, greenSha: NEW_SHA },
  { id: "wrong", label: "✕ one that starts wrong", hint: "caught by the smoke test", env: "prod", blueSha: OLD_SHA, greenSha: NEW_SHA },
  { id: "breaks", label: "⚠ one that breaks under traffic", hint: "caught by the alarm", env: "prod", blueSha: OLD_SHA, greenSha: NEW_SHA },
  { id: "rollback", label: "↩ roll prod back", hint: "the same six steps, pointed at the previous build", env: "prod", blueSha: NEW_SHA, greenSha: OLD_SHA },
];

const rung = (env: Env, sha: string, note: string, active = false): Rung => ({
  env,
  sha,
  note,
  digest12: DIGEST12[sha] ?? "",
  active,
});

function buildScenario(s: Spec): DeployScenario {
  const rollback = s.id === "rollback";
  const staging = s.env === "staging";
  // Every scenario promotes staging → prod: the incoming sha already ran
  // clean in sandbox and staging, so those two rungs match. Prod keeps
  // showing the sha users are on (blue) until the run records the new one.
  // In a rollback the "incoming" sha is the older one, and staging still
  // holds the newer build that is being undone.
  const ladder: Rung[] = [
    rung("prod", s.blueSha, rollback ? "live · deployed 41 min ago" : "live · last-good · 2 days ago", true),
    rung("staging", rollback ? s.blueSha : s.greenSha, "last-good · 41 min ago"),
    rung("sandbox", rollback ? s.blueSha : s.greenSha, SANDBOX_NOTE),
  ];
  return {
    id: s.id,
    label: s.label,
    hint: s.hint,
    env: s.env,
    blueSha: s.blueSha,
    greenSha: s.greenSha,
    alarmName: `zdp-${s.env}-target-5xx`,
    testPort: staging ? 9082 : 9083,
    userPort: staging ? 8082 : 8083,
    ladder,
    upNotes: [
      rollback ? "rollback PR merged · points prod at the previous build" : "PR #42 merged · promotes staging → prod",
      "promoted by PR after sandbox ran clean",
    ],
    prDiff: {
      minus: `- sha ${s.blueSha} digest sha256:${DIGEST12[s.blueSha]}…`,
      plus: `+ sha ${s.greenSha} digest sha256:${DIGEST12[s.greenSha]}…`,
      check: rollback
        ? "✓ check: already ran in prod · code-owner review required"
        : "✓ check: ran clean in staging · code-owner review required",
    },
  };
}

export const SCENARIOS: Record<DeployScenarioId, DeployScenario> = {
  good: buildScenario(SPECS[0]),
  wrong: buildScenario(SPECS[1]),
  breaks: buildScenario(SPECS[2]),
  rollback: buildScenario(SPECS[3]),
};

const why = (id: StepId): { title: string; why: string } => {
  const s = STEPS.find((x) => x.id === id);
  return { title: s?.name ?? id, why: s?.why ?? "" };
};

const now = (id: StepId, fact?: string): DeployEvent => {
  const { title, why: w } = why(id);
  return fact ? { t: "now", title, why: w, fact } : { t: "now", title, why: w };
};

export function buildDeployScript(id: DeployScenarioId): DeployEvent[] {
  const sc = SCENARIOS[id];
  const { env, blueSha, greenSha, alarmName, testPort, userPort } = sc;
  const rollback = id === "rollback";
  const e: DeployEvent[] = [];

  // the rung that is being deployed to, for revert/record updates
  const active = sc.ladder.find((r) => r.active);
  const prevNote = (): string => "live · nothing recorded";

  e.push({
    t: "say",
    text: rollback
      ? `rollback PR merged: deploy ${greenSha} to ${env}, pinned by image digest`
      : `promotion PR merged: deploy ${greenSha} to ${env}, pinned by image digest`,
  });
  e.push({ t: "say", text: `OIDC: assumed the ${env} deploy role, no stored AWS keys in CI` });
  e.push({ t: "sleep", drillSeconds: 4 });

  // 1 install
  e.push({ t: "step", id: "install", state: "run" }, now("install"));
  e.push({ t: "ladder", env, sha: blueSha, note: `live · deploying ${greenSha} beside it` });
  e.push({ t: "say", text: `starting green ${greenSha} on ECS Fargate · waiting for /healthz` });
  e.push({ t: "sleep", drillSeconds: 12 });
  e.push({ t: "step", id: "install", state: "ok" }, { t: "beat" });

  // 2 test door
  e.push({ t: "step", id: "test", state: "run" }, now("test"));
  e.push({ t: "say", text: `test listener :${testPort} → green · user traffic stays on blue (:${userPort})` });
  e.push({ t: "stream", n: 10, greenPct: 0 });
  e.push({ t: "step", id: "test", state: "ok" }, { t: "beat" });

  // 3 smoke test
  e.push(
    { t: "step", id: "smoke", state: "run" },
    now("smoke", id === "wrong" ? "drill: failed 4 min after merge · / reported version \"dev\" · 0 users affected" : undefined),
  );
  e.push({ t: "say", text: "smoke hook: GET /healthz, GET / on the test listener" });
  e.push({ t: "sleep", drillSeconds: 10 });

  if (id === "wrong") {
    e.push({ t: "say", text: `smoke hook: / reports version "dev", expected "${greenSha}"`, tone: "crit" });
    e.push({ t: "step", id: "smoke", state: "fail" });
    for (const s of ["canary", "full"] as const) e.push({ t: "step", id: s, state: "skip" });
    e.push({ t: "beat" });
    e.push({ t: "say", text: "CodeDeploy failed the deployment before any user traffic shifted", tone: "warn" });
    e.push({ t: "metrics", count: "0", state: "OK" });
    e.push({ t: "stream", n: 14, greenPct: 0 });
    e.push({ t: "say", text: `blue ${blueSha} still serving · nothing recorded` });
    e.push({ t: "ladder", env, sha: blueSha, note: prevNote() });
    e.push({ t: "step", id: "record", state: "skip" });
    e.push({
      t: "finish",
      glyph: "↺",
      text: "Stopped at the smoke test · 0 user requests reached the broken build",
      tone: "warn",
      note: "Green only answers the test door until the smoke test passes, so a build that reports the wrong commit never meets a user, and nothing is recorded, so it can't be promoted. The live drill ran in sandbox; every environment stops at this same check.",
    });
    e.push({ t: "now", title: "Done", why: "Users never left the old build, so nobody saw the broken one.", fact: "drill: failed 4 min after merge · / reported version \"dev\" · 0 users affected" });
    return e;
  }

  e.push({ t: "say", text: `smoke hook passed: /healthz 200, / reports ${greenSha}`, tone: "ok" });
  e.push({ t: "step", id: "smoke", state: "ok" }, { t: "beat" });

  // 4 canary (includes the 5-minute watch)
  e.push(
    { t: "step", id: "canary", state: "run" },
    now("canary", id === "breaks" ? "drill: alarm 2m37s after traffic started · rolled back 26 s later · 90 of ~1,000 requests failed" : undefined),
  );
  e.push({ t: "say", text: "shifting 10% of user traffic to green" });
  e.push({ t: "split", green: 10 });
  e.push({ t: "sleep", drillSeconds: 10 });
  e.push({ t: "say", text: `watching ${alarmName} (blue + green) for 5 minutes` });
  e.push({ t: "metrics", count: "0", state: "OK" });

  if (id === "breaks") {
    e.push({ t: "say", text: "green returns 500 on the requests it gets; blue is fine", tone: "warn" });
    e.push({ t: "stream", n: 70, greenPct: 10, errRate: 1 });
    e.push({ t: "metrics", count: "5+", state: "ALARM", breach: true });
    e.push({ t: "say", text: `ALARM: ${alarmName}, 5 or more errors in a minute`, tone: "crit", at: 271 });
    e.push({ t: "say", text: "CodeDeploy stopped the deployment: ALARM_ACTIVE", tone: "crit", at: 297 });
    e.push({ t: "step", id: "canary", state: "fail" });
    e.push({ t: "step", id: "full", state: "skip" });
    e.push({ t: "split", green: 0 });
    e.push({ t: "beat" });
    e.push({ t: "say", text: `all traffic back on blue ${blueSha} · nothing recorded` });
    e.push({ t: "stream", n: 16, greenPct: 0 });
    e.push({ t: "ladder", env, sha: blueSha, note: prevNote() });
    e.push({ t: "step", id: "record", state: "skip" });
    e.push({ t: "blast", text: "blast radius 10%" });
    e.push({
      t: "finish",
      glyph: "↺",
      text: "Rolled back on the alarm · {failed} of {total} requests failed, all on the 10% canary share",
      tone: "warn",
      note: "This is what the canary is for: a build can pass the smoke test and still break under traffic. Only the 10% on green sees it, and only until the alarm fires. In the live drill (Nov 2026, generated traffic at about 5 requests a second) the alarm fired 2m37s into the canary and CodeDeploy rolled back 26 seconds later; 90 of about 1,000 requests failed.",
    });
    e.push({ t: "now", title: "Done", why: "The alarm caught what the smoke test couldn't, and nobody had to step in.", fact: "drill: alarm 2m37s after traffic started · rolled back 26 s later · 90 of ~1,000 requests failed" });
    return e;
  }

  // good build and rollback share the happy path
  e.push({ t: "stream", n: 34, greenPct: 10 });
  e.push({ t: "say", text: "5 minutes, 0 errors · alarm stayed OK", tone: "ok", atFromCanary: 300 });
  e.push({ t: "step", id: "canary", state: "ok" }, { t: "beat" });

  // 5 full
  e.push({ t: "step", id: "full", state: "run" }, now("full"));
  e.push({ t: "say", text: "shifting the remaining 90% to green" });
  e.push({ t: "split", green: 100 });
  e.push({ t: "sleep", drillSeconds: 10 });
  e.push({ t: "say", text: "deployment succeeded · blue kept 5 more minutes, then shut down", tone: "ok" });
  e.push({ t: "step", id: "full", state: "ok" }, { t: "beat" });

  // 6 record
  e.push(
    { t: "step", id: "record", state: "run" },
    now(
      "record",
      rollback ? "drill: 13m18s from merge to recorded" : "drill: about 13 min from merge to recorded",
    ),
  );
  e.push({ t: "stream", n: 18, greenPct: 100 });
  e.push({
    t: "say",
    text: rollback
      ? `recorded ${greenSha} as prod's last-good`
      : `recorded ${greenSha} as prod's last-good · live for everyone`,
    tone: "ok",
    at: 750,
  });
  e.push({ t: "step", id: "record", state: "ok" });
  e.push({ t: "ladder", env: active?.env ?? env, sha: greenSha, note: "live · last-good · just now" });
  e.push({
    t: "finish",
    glyph: "✓",
    text: rollback
      ? "Rolled back · {served} requests served, {failed} failed"
      : "Deployed · {served} requests served, {failed} failed",
    tone: "ok",
    note: rollback
      ? "A rollback is a normal release: the same six steps, pointed at the previous build. Prod took 13m18s from merge to recorded, about 12.5 minutes of it inside CodeDeploy."
      : "No maintenance window and no dropped requests: blue kept serving until green passed the smoke test and five minutes of traffic. In the real pipeline this takes about 13 minutes from merge to recorded.",
  });
  e.push({
    t: "now",
    title: "Done",
    why: rollback
      ? "Prod is back on the previous build, recorded as last-good."
      : "This build is now prod's last-good, so a rollback or the next release can point at it.",
    fact: rollback ? "drill: 13m18s from merge to recorded" : "drill: about 13 min from merge to recorded",
  });
  return e;
}
