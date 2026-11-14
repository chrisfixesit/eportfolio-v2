# Zero-Downtime Demo Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `#deploy` section's single-dashboard demo with a two-tab frame: "Deploy a release" (six-step strip, alarm gauge, release ladder, users lane, why-card, console) and "Flip a feature flag" (big switch, miniature of this site's hero that visibly changes, drill timeline).

**Architecture:** All scenario data and the replay logic live in pure TypeScript modules under `src/lib/zdp/` (tested with Node's built-in test runner) and a data module `src/data/zdp.ts` (copy and drill facts). Astro components under `src/components/zdp/` render static markup; one `<script>` in the frame component imports the pure modules and drives the DOM. No React, no runtime network.

**Tech Stack:** Astro 6, Tailwind CSS v4 (`@theme` tokens in `src/styles/global.css`), TypeScript strict, `node --test` (Node 22, type stripping) for unit tests, `astro check` + `astro build` in CI.

**Spec:** `docs/superpowers/specs/2026-11-13-zero-downtime-demo-redesign-design.md`

## Global Constraints

- No React; the demo is Astro markup plus one `<script>` (spec §3).
- Only these colours may carry state: blue `#4493f8` (version users are on), green `#2ea043` (incoming / OK), critical `#f85149` (errors), warn `#ff9900` (running / rolled back). Everything else uses theme tokens (`page`, `surface`, `band`, `line`, `line-2`, `accent`, `ink`, `body`, `muted`, `muted-2`, `faint`, `ghost`) (spec §3).
- JetBrains Mono (`font-mono`) for labels, numbers, step names, console; IBM Plex Sans (`font-body`, the default) for sentences (spec §3).
- Section id stays `deploy` (spec §3). Keep the `SectionPrompt` header with `path="~/zero-downtime-pipeline"`.
- Clock counts from CodeDeploy deployment start in every scenario and is labelled `since deploy start`; merge-relative facts stay in text (spec §4, §5).
- Six steps, identical in every deploy scenario (spec §5 table). Never seven.
- Quote only §7 facts. Never "all infra in OpenTofu" (say `AWS infra in OpenTofu`), never "approved" (say `code-owner review required`), never "58 s" (say `within 60 s`), never "instant" for a flag flip, never a clock value on "errors rise" (spec §7, team-1 corrections).
- Flag tab flips one environment, `staging` (spec §6).
- Blue is always the version users are on; in the rollback scenario blue is the newer bad sha (spec §5 "Environments").
- Accessibility: buttons never disabled mid-run; `aria-pressed` for state; tabs are a `role="tablist"` with arrow keys; switch is `role="switch"`; `role="log"` console; `aria-live="polite"` why-card; `prefers-reduced-motion` makes every sleep 0 (spec §9).
- Phone width (375px) single column, no horizontal scroll.
- Commit after each task; conventional commit messages; end each commit message with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Review Focus

1. Switching big tabs, pressing reset, or clicking another scenario while a run is mid-sleep: no orphaned timers keep painting cells or advancing the clock (token/cancel). Test: Task 4 `cancel()` tests and Task 6 browser check.
2. `prefers-reduced-motion: reduce`: every scenario still completes and the clock still ends at the right value with zero sleeps; step-through still waits for "next". Test: Task 2 `toWallMs` reduce test; Task 6 browser check with emulated media.
3. Direct switch clicks: ignored while `landing`, cancel a running flag scenario otherwise, and a hand flip after auto-off lands cleanly. Test: Task 4 state-machine tests.
4. Phone width: the step strip wraps to a vertical list, the ladder stacks above the users lane, the miniature shrinks, no horizontal scroll at 375px. Test: Task 8 browser check at 375×800.
5. Keyboard: arrow keys move between big tabs, Space/Enter flips the switch, hiding the "next" button never drops focus to `<body>`. Test: Task 5 and Task 7 browser checks.

---

### Task 1: Test runner, CI step, gitignore

**Files:**
- Modify: `package.json` (scripts)
- Modify: `.github/workflows/pr.yml` (add a step after "Type check")
- Modify: `.gitignore` (append `.superpowers/`)
- Create: `tests/zdp/smoke.test.ts`

**Interfaces:**
- Produces: `npm test` runs `node --experimental-strip-types --test "tests/**/*.test.ts"`. All later tests are `*.test.ts` files under `tests/zdp/` using `node:test` and `node:assert/strict`, importing from `../../src/lib/zdp/*.ts` with explicit `.ts` extensions (type stripping needs them).

- [ ] **Step 1: Write the smoke test**

```ts
// tests/zdp/smoke.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
test("test runner strips types", () => {
  const n: number = 1 + 1;
  assert.equal(n, 2);
});
```

- [ ] **Step 2: Run it to verify it fails for lack of a script**

Run: `npm test`
Expected: `Missing script: "test"`

- [ ] **Step 3: Add the script, CI step and gitignore line**

`package.json` scripts: `"test": "node --experimental-strip-types --test \"tests/**/*.test.ts\""`.
`pr.yml`: a step `- name: Unit tests` / `run: npm test` between type check and build.
`.gitignore`: append a line `.superpowers/` under a comment `# brainstorm mockups`.

- [ ] **Step 4: Run and verify it passes**

Run: `npm test`
Expected: `# pass 1`, `# fail 0`. `git status --short` no longer lists `.superpowers/`.

- [ ] **Step 5: Commit**

```bash
git add package.json .github/workflows/pr.yml .gitignore tests/zdp/smoke.test.ts docs/superpowers/specs/2026-11-13-zero-downtime-demo-redesign-design.md docs/superpowers/plans/2026-11-13-zero-downtime-demo-redesign.md
git commit -m "chore: add node test runner, ignore brainstorm mockups, add demo redesign spec and plan"
```

---

### Task 2: Clock and timing module

**Files:**
- Create: `src/lib/zdp/clock.ts`
- Test: `tests/zdp/clock.test.ts`

**Interfaces:**
- Produces:
  - `formatClock(seconds: number): string` → `"+m:ss"`, e.g. `271 → "+4:31"`, `0 → "+0:00"`, `798 → "+13:18"`. Minutes are not zero-padded; seconds are.
  - `toWallMs(drillSeconds: number, opts: { speed: number; reduce: boolean }): number` → `reduce ? 0 : Math.round(drillSeconds * 1000 / speed)`.
  - `export const REPLAY_SPEED = 20;`
  - `makeRng(seed: number): () => number` — the current demo's LCG (`seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff`), so replays are deterministic.

- [ ] **Step 1: Write the failing tests**

```ts
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
```

- [ ] **Step 2: Run to verify failure** — `npm test` → fails with "Cannot find module … clock.ts".
- [ ] **Step 3: Implement `src/lib/zdp/clock.ts`** with the four exports above.
- [ ] **Step 4: Run to verify pass** — `npm test` → `# fail 0`.
- [ ] **Step 5: Commit** — `git commit -m "feat(zdp): clock formatting and replay timing"`.

---

### Task 3: Deploy data and scripted events

**Files:**
- Create: `src/data/zdp.ts` (copy and facts only)
- Create: `src/lib/zdp/deploy.ts` (types, scenario data, event script builder)
- Test: `tests/zdp/deploy.test.ts`

**Interfaces:**
- Produces, in `src/data/zdp.ts`:
  - `STEPS: readonly { id: StepId; name: string; what: string; why: string }[]` — six entries, ids `"install" | "test" | "smoke" | "canary" | "full" | "record"`, names and `what` lines exactly from spec §5 table; `why` sentences copied from the current `CanaryDemo.astro` `steps` array (merge the old `bake` why into `canary`).
  - `GLOSSARY`, `PROMOTION` (the two fold-outs, copied from `CanaryDemo.astro`), `CAVEATS: string[]` (spec §7 caveat bullets, including the flag-illustration bullet).
  - `FOOTER_BADGES: { deploy: string[]; flag: string[] }` — deploy: `"drift check · green in all 3 envs"`, `"OIDC · no stored AWS keys"`, `"AWS infra in OpenTofu"`; flag: `"AWS AppConfig"`, `"same alarm as the deploy"`, plus right-aligned `PROOFS = "9 of 9 proofs passed live · Nov 2026"`.
- Produces, in `src/lib/zdp/deploy.ts`:
  - `type StepId`, `type StepState = "idle" | "run" | "ok" | "fail" | "skip"`.
  - `type Env = "sandbox" | "staging" | "prod"`.
  - `type DeployScenarioId = "good" | "wrong" | "breaks" | "rollback"`.
  - `interface Rung { env: Env; sha: string; note: string; digest12: string; active: boolean }`.
  - `interface DeployScenario { id; label; hint; env: Env; blueSha; greenSha; alarmName; testPort; userPort; ladder: Rung[]; prDiff: { minus: string; plus: string; check: string } }` with labels: `"▶ a good build"`, `"✕ one that starts wrong"`, `"⚠ one that breaks under traffic"`, `"↩ roll prod back"`; env staging for the first three, prod for rollback; `alarmName` = `` `zdp-${env}-target-5xx` ``; ports `9082/8082` for staging, `9083/8083` for prod; rollback `blueSha = "9e07d3b"`, `greenSha = "4f1c2ab"`, others the reverse; `prDiff.check` = `"✓ check: ran clean in sandbox · code-owner review required"` for staging, `"✓ check: already ran in prod · code-owner review required"` for rollback. Sandbox rung note `"all at once, about 5 min"`.
  - `type DeployEvent =` union of `{ t: "step"; id: StepId; state: StepState }`, `{ t: "say"; text: string; tone?: "ok"|"warn"|"crit"; at?: number }`, `{ t: "split"; green: number }`, `{ t: "stream"; n: number; greenPct: number; errRate?: number }`, `{ t: "metrics"; count: string; state: string; breach?: boolean }`, `{ t: "beat" }`, `{ t: "sleep"; drillSeconds: number }`, `{ t: "now"; title: string; why: string; fact?: string }`, `{ t: "finish"; glyph: string; text: string; tone: "ok"|"warn"; note: string }`, `{ t: "ladder"; env: Env; sha: string; note: string }`, `{ t: "blast"; text: string }`.
  - `buildDeployScript(id: DeployScenarioId): DeployEvent[]` — the ordered event list the player executes. Timings (drill seconds, via `at` on `say` events): wrong → smoke fail; breaks → `metrics "5+","ALARM",true` and `say … at: 271` (alarm) then `say … at: 297` (stopped), then `split 0`; good → alarm OK line `at: 300 + canaryStart`, final `at: 750`; rollback → same as good on prod, final `at: 750`, finish note quoting `"13m18s from merge to recorded"`. Facts in `now` events: smoke → `"drill: failed 4 min after merge · / reported version \"dev\" · 0 users affected"`; canary (breaks) → `"drill: alarm 2m37s after traffic started · rolled back 26 s later · 90 of ~1,000 requests failed"`; record (good) → `"drill: about 13 min from merge to recorded"`.
  - `SCENARIOS: Record<DeployScenarioId, DeployScenario>`.

- [ ] **Step 1: Write the failing tests**

```ts
test("six steps, same order in every scenario", () => {
  assert.equal(STEPS.length, 6);
  for (const id of ["good","wrong","breaks","rollback"] as const) {
    const runs = buildDeployScript(id).filter(e => e.t === "step" && e.state === "run").map(e => e.id);
    assert.deepEqual(runs.slice(0,3), ["install","test","smoke"]); // every scenario reaches the smoke test
  }
});
test("a build that starts wrong never shifts user traffic", () => {
  const s = buildDeployScript("wrong");
  assert.ok(!s.some(e => e.t === "split" && e.green > 0));
  assert.ok(s.some(e => e.t === "step" && e.id === "smoke" && e.state === "fail"));
  assert.ok(["canary","full","record"].every(id => s.some(e => e.t==="step" && e.id===id && e.state==="skip")));
});
test("a build that breaks under traffic alarms at +4:31 and returns to blue", () => {
  const s = buildDeployScript("breaks");
  const alarm = s.find(e => e.t === "say" && /ALARM/.test(e.text));
  assert.equal(alarm?.at, 271);
  const i = s.findIndex(e => e.t === "metrics" && e.breach);
  assert.ok(s.slice(i).some(e => e.t === "split" && e.green === 0));
  assert.ok(!s.some(e => e.t === "step" && e.id === "record" && e.state === "ok"));
});
test("rollback runs on prod with blue as the newer sha", () => {
  const sc = SCENARIOS.rollback;
  assert.equal(sc.env, "prod");
  assert.equal(sc.blueSha, "9e07d3b"); assert.equal(sc.greenSha, "4f1c2ab");
  assert.equal(sc.alarmName, "zdp-prod-target-5xx");
  assert.equal(sc.testPort, 9083);
  assert.match(sc.prDiff.check, /already ran in prod/);
  assert.ok(!/approved/.test(sc.prDiff.check));
});
test("copy never makes banned claims", () => {
  const all = JSON.stringify({ STEPS, SCENARIOS, CAVEATS, FOOTER_BADGES, scripts: (["good","wrong","breaks","rollback"] as const).map(buildDeployScript) });
  for (const banned of ["all infra in OpenTofu", "code owner approved", "58 s", "instant"]) assert.ok(!all.includes(banned), banned);
});
```

- [ ] **Step 2: Run to verify failure** — `npm test` → module not found.
- [ ] **Step 3: Implement `src/data/zdp.ts` and `src/lib/zdp/deploy.ts`** per the Interfaces block. Port the current `play()` sequence from `CanaryDemo.astro` into `buildDeployScript` as data; reuse its console lines. Add the rollback branch by parameterising env, ports, shas and the finish note.
- [ ] **Step 4: Run to verify pass** — `npm test` → `# fail 0`; `npx astro check` → 0 errors.
- [ ] **Step 5: Commit** — `git commit -m "feat(zdp): deploy scenarios as data with scripted events"`.

---

### Task 4: Flag state machine and script

**Files:**
- Create: `src/lib/zdp/flag.ts`
- Test: `tests/zdp/flag.test.ts`

**Interfaces:**
- Produces:
  - `type FlagState = "off" | "landing-on" | "on" | "landing-off"`.
  - `type FlagScenarioId = "onoff" | "misbehave"`; labels `"⇆ turn it on, then off"`, `"⚠ turn it on and it misbehaves"`.
  - `interface FlagTimelineEvent { key: "flipped" | "live" | "errors" | "rolledback" | "normal" | "flippedoff" | "baseline"; at?: number; label: string; detail: string; tone: "go"|"ok"|"crit"|"idle"; illustrative?: boolean }` — labels/details exactly from spec §6 Timeline: `flipped` (`at: 0`, "flipped on", "one setting changed in AppConfig"), `live` (`at: 60`, "live", "in staging, no deploy"), `errors` (no `at`, `illustrative: true`, "errors rise", "the feature misbehaves under traffic"), `rolledback` (`at: 294`, "rolled back", "AppConfig turns the flag off by itself"), `normal` (`at: 324`, "back to normal", "no deploy, no pull request"); for onoff: `flipped`, `live`, `flippedoff` ("flipped off", "one setting changed"), `baseline` (`at` = flip-off time + 60, "back to baseline", "the old button is back").
  - `class FlagMachine` with constructor `(opts: { landSeconds: number })` (60), fields `state: FlagState`, `misbehaving: boolean`, `clock: number`; methods:
    - `click(): "ignored" | "flipping"` — ignored while `landing-*`; otherwise moves `off→landing-on`, `on→landing-off`, sets `misbehaving = false`, and returns `"flipping"`.
    - `land(): void` — `landing-on→on`, `landing-off→off`; advances `clock` by `landSeconds`.
    - `autoOff(): void` — only valid from `on` with `misbehaving`; sets `landing-off`, then the player calls `land()`.
    - `startScenario(id: FlagScenarioId): void` — resets to `off`, `clock = 0`, `misbehaving = id === "misbehave"`.
    - `cancel(): void` — clears `misbehaving`; a `landing-*` state resolves immediately via `land()`.
    - `timeline(id: FlagScenarioId): FlagTimelineEvent[]`.
  - `pageState(state: FlagState): "baseline" | "flagged"` — `on` and `landing-off` are `flagged`, `off` and `landing-on` are `baseline` (the page changes only when a flip has landed).

- [ ] **Step 1: Write the failing tests**

```ts
test("a click while landing is ignored", () => {
  const m = new FlagMachine({ landSeconds: 60 });
  assert.equal(m.click(), "flipping"); assert.equal(m.state, "landing-on");
  assert.equal(m.click(), "ignored");
  m.land(); assert.equal(m.state, "on"); assert.equal(m.clock, 60);
});
test("the page follows landed state only", () => {
  assert.equal(pageState("landing-on"), "baseline");
  assert.equal(pageState("on"), "flagged");
  assert.equal(pageState("landing-off"), "flagged");
});
test("misbehave scenario auto-offs; a hand flip afterwards lands cleanly", () => {
  const m = new FlagMachine({ landSeconds: 60 });
  m.startScenario("misbehave"); m.click(); m.land();
  assert.equal(m.misbehaving, true);
  m.autoOff(); m.land(); assert.equal(m.state, "off");
  m.click(); m.land(); assert.equal(m.state, "on"); assert.equal(m.misbehaving, false);
});
test("a direct click cancels a running scenario", () => {
  const m = new FlagMachine({ landSeconds: 60 });
  m.startScenario("misbehave"); m.click(); m.land();
  m.cancel(); assert.equal(m.misbehaving, false); assert.equal(m.state, "on");
});
test("timeline copy matches the drill and never times 'errors rise'", () => {
  const t = new FlagMachine({ landSeconds: 60 }).timeline("misbehave");
  assert.deepEqual(t.map(e => e.key), ["flipped","live","errors","rolledback","normal"]);
  assert.equal(t[2].at, undefined); assert.equal(t[2].illustrative, true);
  assert.equal(t[3].at, 294); assert.equal(t[3].label, "rolled back");
  assert.ok(!JSON.stringify(t).includes("58"));
});
```

- [ ] **Step 2: Run to verify failure.** `npm test` → module not found.
- [ ] **Step 3: Implement `src/lib/zdp/flag.ts`.**
- [ ] **Step 4: Run to verify pass.** `npm test` → `# fail 0`.
- [ ] **Step 5: Commit** — `git commit -m "feat(zdp): feature-flag state machine and drill timeline"`.

---

### Task 5: Frame, big tabs, scenario row, footer; wire into the page

**Files:**
- Create: `src/components/zdp/ZeroDowntimeDemo.astro` (section `#deploy`, title bar, tablist, scenario rows, two tab panels as slots, footer, small print, `<script>`)
- Create: `src/components/zdp/DeployTab.astro` and `src/components/zdp/FlagTab.astro` as placeholders containing only `<div data-tabpanel="deploy">` / `"flag"` with a one-line placeholder paragraph (filled in Tasks 6 and 7)
- Modify: `src/pages/index.astro:11,61` — import and render `ZeroDowntimeDemo` instead of `CanaryDemo`
- Keep `src/components/CanaryDemo.astro` until Task 8.

**Interfaces:**
- Produces, DOM contract the script relies on (all `data-*` within `#deploy`):
  - `[data-clock]` span; `[data-clock-origin]` text `since deploy start`.
  - `[role=tablist] > button[role=tab][data-tab="deploy"|"flag"][aria-selected][aria-controls]`; panels `[role=tabpanel][data-tabpanel][hidden]`.
  - `[data-scenarios="deploy"]` and `[data-scenarios="flag"]` rows with `button[data-run=<id>][aria-pressed]`, built from `Object.values(SCENARIOS)` and the two flag scenarios; shared `button[data-stepmode]`, `button[data-run="reset"]`.
  - `[data-footer="deploy"]`, `[data-footer="flag"]` from `FOOTER_BADGES`, each with `PROOFS` right-aligned.
  - Script exports nothing; it creates a `Player` object in closure with `token`, `sleep(drillSeconds)`, `beat()`, `setClock(seconds)`, `setBusy(on, kind)`, `activateTab(id)` — Tasks 6 and 7 add `playDeploy(id)` and `playFlag(id)` inside the same script.
- Title bar text: `zero-downtime-pipeline · replayed from the 13 Nov 2026 drill, sped up`. Tab labels and subtitles exactly as spec §4.

- [ ] **Step 1: Write the markup and the tab/script skeleton.** Big tabs: `aria-selected` tab gets `text-ink border-b-2 border-accent bg-page`, others `text-faint bg-band`. Arrow Left/Right and Home/End move focus and selection (roving tabindex). `activateTab` bumps `token`, calls `reset()` on both tabs, swaps `hidden` on panels, scenario rows and footers.
- [ ] **Step 2: Verify types and build.** Run: `npx astro check && npm run build`. Expected: 0 errors, build succeeds.
- [ ] **Step 3: Browser check (keyboard).** Run `npm run dev`; with the Playwright or Chrome DevTools MCP open `http://localhost:4321/#deploy`. Tab to the tablist, press Right: the flag tab becomes `aria-selected="true"`, its panel is visible, the deploy panel is `hidden`. Press Left to return. Confirm `#deploy` still scrolls into view from the project card's "watch the demo ↓" link.
- [ ] **Step 4: Commit** — `git commit -m "feat(zdp): two-tab demo frame wired into the home page"`.

---

### Task 6: Deploy tab markup and player

**Files:**
- Modify: `src/components/zdp/DeployTab.astro` (full markup)
- Modify: `src/components/zdp/ZeroDowntimeDemo.astro` (`playDeploy`)
- Modify: `src/data/zdp.ts` only if copy is missing

**Interfaces:**
- Consumes: `STEPS`, `SCENARIOS`, `buildDeployScript`, `formatClock`, `toWallMs`, `makeRng`, Player from Task 5.
- Produces DOM (inside `[data-tabpanel="deploy"]`):
  - Strip: `ol[data-strip] > li[data-step=<id>][data-state]` each with `[data-marker]`, `[data-step-name]`, `[data-step-what]`; chips `flex-1` in a row, `›` separators `aria-hidden`; at `max-[920px]` the `ol` becomes a vertical list.
  - Gauge: `[data-gauge]` with left text from spec §5.2 and `[data-metric="err"]`, `[data-metric="state"]`.
  - Ladder: `ol[data-ladder] > li[data-rung=<env>]` with `[data-rung-sha]`, `[data-rung-note]`, `[data-rung-digest]`, `[data-rung-active]`; between rungs `[data-up-note]`. PR box `[data-pr]` with `[data-pr-minus]`, `[data-pr-plus]`, `[data-pr-check]`.
  - Users lane: reuse the current demo's split bar (`[data-split]`, `[data-seg]`, `[data-pct]`), 120 `[data-cell]`s, counters `[data-count="served"|"failed"|"green"]`, `[data-blast]`.
  - Why-card `[data-now][aria-live=polite]` with `[data-now-title]`, `[data-now-why]`, `[data-now-fact]`; `button[data-next]`.
  - Console `[data-log][role=log]`; outcome `[data-outcome]`.
  - Legend labels: `blue (users are on) · <sha>` / `green (incoming) · <sha>` with `[data-legend="blue"|"green"]` so the rollback scenario can swap shas.
- `playDeploy(id)`: `reset()`, apply `SCENARIOS[id]` to legend, ladder, PR box, gauge name; then iterate `buildDeployScript(id)` executing each `DeployEvent` (port the handlers from `CanaryDemo.astro`: `step`, `say`, `setSplit`, `stream`, `setMetrics`, `finish`, `showNow`), checking `alive()` after every await. `say` with `at` sets the clock to `at`; otherwise the clock advances `7 + floor(rnd()*11)` seconds as today. `setClock` writes `formatClock` to `[data-clock]`.

- [ ] **Step 1: Write the markup** from the Interfaces block, server-rendering `STEPS` and the default (good) scenario's ladder/PR so the tab is meaningful before any click.
- [ ] **Step 2: Implement `playDeploy`.** Keep the current demo's `title` tooltips on cells, `aria-label` updates on `[data-cells]` and `[data-split]`, and the no-opacity rule for skipped steps.
- [ ] **Step 3: Verify types and tests.** Run: `npx astro check && npm test`. Expected: 0 errors, `# fail 0`.
- [ ] **Step 4: Browser check, each scenario.** On `http://localhost:4321/#deploy` click each of the four buttons and confirm:
  - good: strip ends all green, clock ends `+12:30`, outcome `✓ Deployed · N requests served, 0 failed`, ladder staging rung turns `● 9e07d3b` with note `last-good · just now`.
  - wrong: smoke chip red, canary/100%/record `skipped`, split stays 100% blue, outcome starts `↺ Stopped at the smoke test`, why-card fact contains `0 users affected`.
  - breaks: gauge turns `5+ / min · ALARM` in critical, console has `ALARM` line stamped `+4:31` and `stopped` at `+4:57`, split returns to 100% blue, `[data-blast]` reads `blast radius 10%`.
  - rollback: legend reads `blue (users are on) · 9e07d3b`, `green (incoming) · 4f1c2ab`, prod rung active, PR check `already ran in prod`, gauge name `zdp-prod-target-5xx`, outcome note contains `13m18s from merge to recorded`.
  - Click "⚠" then immediately "▶": only one run continues; cells never paint red afterwards (Review Focus 1).
  - Emulate `prefers-reduced-motion: reduce`, run "▶": completes within a second, clock still `+12:30` (Review Focus 2).
- [ ] **Step 5: Commit** — `git commit -m "feat(zdp): deploy tab with step strip, alarm gauge, release ladder and player"`.

---

### Task 7: Flag tab markup, hero miniature and player

**Files:**
- Create: `src/components/zdp/HeroMini.astro` (the miniature browser)
- Modify: `src/components/zdp/FlagTab.astro` (full markup)
- Modify: `src/components/zdp/ZeroDowntimeDemo.astro` (`playFlag`, switch handling)

**Interfaces:**
- Consumes: `FlagMachine`, `pageState`, flag labels and timeline from Task 4; `toWallMs`, `formatClock`; Player.
- Produces DOM (inside `[data-tabpanel="flag"]`):
  - `button[role=switch][aria-checked][data-switch]` 84×42, with `[data-switch-state]` text `ON` / `OFF` / `landing…` / `off · by itself`, caption `resume-pdf · click the switch to flip it`.
  - Heading `A flag is a switch in front of new code.`, paragraph and the two "what to look for" bullets, the faint one-environment line, status row `[data-flag-env]` chip (`staging`, green when landed), `[data-flag-status]` text `live in about a minute` / `landing…`, `deploys: 0`; `button[data-run="misbehave"]` duplicate of the scenario button with hint; why-flags card, all copy verbatim from spec §6.
  - `HeroMini`: `[data-mini][data-page="baseline"|"flagged"]`; chrome with three traffic lights and URL `https://christophercorbin.cloud`; `[data-mini-bar]` announcement bar (hidden at baseline) `new · the résumé now downloads as a one-page PDF` + `flag: resume-pdf`; miniature nav `~/christopher-corbin — zsh`; prompt line, subtitle, name with orange dot; three CTAs where the third is `[data-mini-resume]`: baseline = `Hero.astro` outline look (`border-line-2 text-body`, label `resume`), flagged = `bg-accent text-page shadow-[0_0_0_3px_rgba(255,153,0,.25)]`, label `↓ resume.pdf`; `[data-mini-err]` notice `500 · PDF generation failed` hidden unless misbehaving. Caption `flag on → orange résumé button + announcement bar · illustration` / `the page reads the flag on every request`.
  - Gauge: same markup as the deploy gauge with `[data-metric]`s, left text `same 5xx alarm as the deploy`.
  - Timeline `ol[data-timeline] > li[data-ev=<key>][data-state="idle"|"lit"]` rendered from `timeline("misbehave")`, with `illustrative timing` faint label on `errors`.
  - A short row of 40 `[data-cell]`s under the browser for the misbehave run.
- `playFlag(id)`: `machine.startScenario(id)`; `flip()` = `machine.click()` → set `landing…`, `sleep(60)`, `machine.land()`, `setPage(pageState(machine.state))`, light `live`; onoff: after a `beat`, flip again, light `flippedoff`, `baseline`; misbehave: light `errors` (no clock change), stream 40 cells at ~30% red, `setMetrics("5+","ALARM",true)`, `machine.autoOff()`, state text `off · by itself`, clock to 294, `land()`, page baseline, light `rolledback`, clock 324, `normal`, metrics OK. The switch's click handler: if `machine.click() === "ignored"` return; else `token++` (cancels a running scenario), `machine.cancel()`, then run `flip()`.

- [ ] **Step 1: Write `HeroMini.astro` and the flag tab markup.**
- [ ] **Step 2: Implement `playFlag` and the switch handler.**
- [ ] **Step 3: Verify.** `npx astro check && npm test && npm run build` → clean.
- [ ] **Step 4: Browser check.** On the flag tab:
  - Click the switch: state shows `landing…`, then `ON`; the bar appears and the résumé button goes solid orange with `↓ resume.pdf`; `[data-flag-env]` turns green; clock reads `+1:00`. Click again during `landing…`: nothing changes (Review Focus 3).
  - "⚠ turn it on and it misbehaves": red cells appear, gauge `ALARM`, switch flips itself to `off · by itself`, bar and orange button disappear, timeline lights `flipped → live → errors (illustrative) → rolled back → back to normal`, clock ends `+5:24`. Then click the switch by hand: lands `ON` cleanly, no red cells.
  - Keyboard: focus the switch, press Space: flips (Review Focus 5).
  - Switch to the deploy tab mid-run: flag run stops, deploy tab is at rest.
- [ ] **Step 5: Commit** — `git commit -m "feat(zdp): feature-flag tab with hero miniature, switch and drill timeline"`.

---

### Task 8: Small print, glossary, phone layout, remove the old component

**Files:**
- Modify: `src/components/zdp/ZeroDowntimeDemo.astro` (glossary and promotion fold-outs above the frame from `GLOSSARY`/`PROMOTION`; small-print paragraph under the frame from `CAVEATS`)
- Delete: `src/components/CanaryDemo.astro`
- Modify: `CLAUDE.md` repository-structure block: add `components/zdp/` and `lib/zdp/` lines; mention `npm test`
- Modify: `README.md` if it names `CanaryDemo`

- [ ] **Step 1: Add the fold-outs and the small print.** Small print must contain every `CAVEATS` bullet joined as sentences, in `font-mono text-[11.5px] text-ghost` as today.
- [ ] **Step 2: Delete `CanaryDemo.astro`; grep for stragglers.** Run: `grep -rn "CanaryDemo" src README.md CLAUDE.md docs/architecture* || echo clean`. Expected: `clean`.
- [ ] **Step 3: Phone check.** Browser at 375×800 on `#deploy`: no horizontal scroll (`document.documentElement.scrollWidth <= 375`), strip is a vertical list, ladder above users lane, miniature fits. Repeat on the flag tab (Review Focus 4).
- [ ] **Step 4: Full verification.** Run: `npx astro check && npm test && npm run build`. Expected: 0 errors, `# fail 0`, build OK. Check `dist/index.html` contains `since deploy start` and does not contain `all infra in OpenTofu`, `code owner approved`, `58 s`.
- [ ] **Step 5: Update docs and commit.**

```bash
git add -A src CLAUDE.md README.md
git commit -m "feat(zdp): caveats and glossary, phone layout, remove CanaryDemo"
```

---

## Self-review notes

- Spec coverage: §4 frame → Task 5; §5 strip/gauge/ladder/users/card/console and all four scenarios → Tasks 3, 6; §6 switch, miniature, timeline, interaction rules → Tasks 4, 7; §7 facts and caveats → Tasks 3, 8; §8 copy rules → data module and banned-claims test; §9 accessibility → Tasks 5–7 browser checks; §10 builder calls: copy in `src/data/zdp.ts`, one script, phone layout in Task 8, `.gitignore` in Task 1.
- Names used across tasks: `STEPS`, `SCENARIOS`, `buildDeployScript`, `DeployEvent`, `FlagMachine`, `pageState`, `formatClock`, `toWallMs`, `makeRng`, `REPLAY_SPEED`, `FOOTER_BADGES`, `PROOFS`, `CAVEATS`, `GLOSSARY`, `PROMOTION`; DOM hooks are all `data-*` listed in the task that creates them.
