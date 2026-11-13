# Zero-Downtime Demo Redesign — Design

**Date:** 2026-11-13
**Author:** Christopher Corbin (with Claude)
**Status:** Builder-checked 2026-11-13; awaiting user approval
**Fact-checked:** 2026-11-13 by the zero-downtime-pipeline session against `main @ a2df65b` and the drill logs; its corrections are folded in below
**Replaces:** the current `src/components/CanaryDemo.astro` section (`#deploy`) on the home page
**Mockups:** `.superpowers/brainstorm/83621-1794593535/content/` (`layout-two-tabs.html`, `flag-tab-portfolio.html`). Wireframes, not pixel specs.

---

## 1. Intent

The home page has an interactive replay of a deploy from the
[zero-downtime-pipeline](https://github.com/chrisfixesit/zero-downtime-pipeline)
project. It works, but it reads as one dashboard with a lot going on, it
hides the promotion-by-digest story in a fold-out, and it has nothing
about feature flags, which the pipeline also proves.

The redesign turns the section into **two demos in one frame**, chosen by
two large tabs:

1. **Deploy a release** — how new code reaches users in steps, and backs
   out on its own if it misbehaves.
2. **Flip a feature flag** — how a feature is turned on or off for every
   visitor without deploying anything, and how it turns itself off when it
   causes errors.

The audience is mixed: recruiters and hiring managers who need the point
in one glance, and engineers who will poke at the details. The single
takeaway for everyone is: **a bad release never reaches users, and nobody
has to be awake for that.**

## 2. Goals, non-goals, anti-goals

### Goals
- A visitor with no DevOps background understands each tab in under a
  minute, from the screen alone.
- Every one of these is visible or one click away, ranked as the
  zero-downtime session ranked them:
  1. a bad release never reaches users, automatically
  2. canary (10% for 5 minutes) with alarm rollback
  3. smoke gate before any user traffic
  4. promotion by digest through pull requests, with the required check
  5. feature flags that roll back on the same alarm
  6. rollback is the same safe path as a release (13 minutes in prod)
  7. last-good records and the hourly drift check
  8. no long-lived AWS keys (OIDC), all infrastructure in OpenTofu
- Items 1 to 3 are on screen without interaction. 4 to 6 are visible on
  the deploy tab but can be smaller. 7 and 8 are footer badges.
- Every number quoted is one that was measured in the November 2026
  drills (§7). Nothing is invented.
- Keyboard and screen-reader usable, honours `prefers-reduced-motion`,
  colours pass AA on the dark surfaces. The current demo already does this
  and the redesign must not regress it.

### Non-goals
- Not a real connection to AWS. Everything is replayed in the browser from
  recorded drill facts.
- Not a general-purpose pipeline visualiser. It shows this one project.
- No new routes, no backend, no analytics.

### Anti-goals (would make this a failure even if it works)
- Three scenarios that look like three different pipelines. The lesson is
  *same path, different exit*. The six-step strip must be identical in
  every deploy scenario.
- "Zero downtime" stated as an absolute. The caveats in §7 stay.
- A flag demo that is explained in text but not seen. The visitor must
  watch the page change.
- Colour carrying meaning by itself. Every state is also labelled in text.

## 3. Constraints

- Stack as per `CLAUDE.md`: Astro 6, Tailwind v4 (`@theme` tokens in
  `src/styles/global.css`, no JS config), TypeScript strict. **No React.**
  The current demo is a plain `<script>` in an Astro component and that
  stays the pattern. The only React island on the site remains the contact
  form.
- Site palette only: `page/surface/band` surfaces, `line` hairlines,
  `accent` orange `#ff9900`, body/muted/faint text tokens. State colours
  as in the current demo: blue `#4493f8` (old version), green `#2ea043`
  (new version / OK), critical `#f85149` (errors), warn `#ff9900`
  (running / rolled back). These are the only colours that may carry state.
- Fonts: JetBrains Mono for labels, numbers, step names and anything
  "terminal"; IBM Plex Sans for sentences.
- Section id stays `#deploy` so the project card's "watch the demo ↓"
  link in `src/data/content.ts` keeps working.
- Must work at phone width (single column) and at the 1200px content
  width. The home page sits inside `BaseLayout.astro`; the demo keeps the
  same full-bleed `band` treatment and the `SectionPrompt` header the
  current component uses.
- No external requests at runtime (CSP in `customHttp.yml` is strict).
- The branch `content/zero-downtime-card` already has uncommitted edits to
  `CanaryDemo.astro` and `content.ts`. Build on the working-tree version,
  not `main`.

## 4. The frame (shared by both tabs)

```
┌ title bar: ● zero-downtime-pipeline · replayed from the 13 Nov 2026 drill, sped up   [clock +m:ss] ┐
├ big tabs:  ▶ Deploy a release                 │ ⇆ Flip a feature flag                              ┤
│            new code reaches users in steps…   │ turn a feature on or off without deploying anything │
├ scenario buttons for the active tab ……………………………………………………  [⏸ step through] [↺ reset]                 ┤
│                                                                                                     │
│ tab body (§5 or §6)                                                                                 │
│                                                                                                     │
├ footer badges ……………………………………………………………………………………………  9 of 9 proofs passed live · Nov 2026                 ┘
```

- **Title bar.** Orange dot, project name, the replay disclosure, and a
  monospace clock on the right showing elapsed drill time with its origin
  stated (`+4:31 since deploy start`). The clock is the honesty device:
  real time is too slow, fake time is suspicious, so the replay runs fast
  with the real timestamps visible. **The clock counts from the start of
  the CodeDeploy deployment in every scenario** (my call; see §5 "Clock
  origin"). Facts that were measured from the PR merge ("13m18s from merge
  to recorded", "failed 4 minutes after merge") are quoted as text with
  "from merge" in them and are never placed on the clock. Uncited clock
  values between drill facts are compressed and approximate, as today.
  Replay speed is the builder's call; roughly 20x, so the longest scenario
  finishes in about 20 to 30 seconds of wall time.
- **Big tabs.** Two equal-width tabs with a mono label and a one-line
  plain-English subtitle. Active tab: ink text, 2px orange underline,
  `page` background. Inactive: faint text, `band` background. Switching
  tabs resets any running scenario. Tabs are real tabs for assistive tech
  (`role=tablist`, arrow-key movement, `aria-selected`).
- **Scenario row.** Per tab, see below. Same button style as the current
  demo (mono, bordered, orange when `aria-pressed`). "Step through" and
  "reset" keep their current behaviour; step-through applies to both tabs.
- **Footer.** Badges in faint mono: `drift check · green in all 3 envs`,
  `OIDC · no stored AWS keys`, `AWS infra in OpenTofu` (the GitHub side is
  scripted, not Tofu, so never "all infra"), and on the right
  `9 of 9 proofs passed live · Nov 2026`. The flag tab swaps the first
  badge for `AWS AppConfig` and adds `same alarm as the deploy`. On the flag tab the clock counts from the flip and the origin label reads `since the flip`.

## 5. Tab 1: Deploy a release

### Scenarios
| Button | What it shows | Exit |
|---|---|---|
| ▶ a good build | the full happy path | recorded as last-good, promotable |
| ✕ one that starts wrong | smoke test reports version "dev" | failed at step 3, 0 users affected |
| ⚠ one that breaks under traffic | 500s on green during the canary | alarm 2m37s after traffic started (clock ≈ +4:31), rolled back 26 s later |
| ↩ roll prod back | the same six steps, on prod, pointing at the previous build | recorded, about 13 min (measured 13m18s) |

The first three are the current demo's scenarios. The fourth is new and
exists to make point 6 (rollback is a normal release) visible rather than
read. In it the ladder's active rung is **prod**, the PR diff shows the sha
and digest going *backwards*, the check line reads `already ran in prod`,
and the clock ends at about +12:30 (13m18s from merge is quoted as text).

**Clock origin.** The title-bar clock counts from the start of the
CodeDeploy deployment (my call). The drill's "2m37s" is measured from the
start of drill traffic, which began when the smoke check passed; from
deployment start the alarm was at about +4:31 and the stop at about +4:57.
So the clock reads ≈ +4:31 when the alarm fires, and the drill fact keeps
the wording "2m37s after traffic started". The two numbers must not be
mixed.

### Environments and per-scenario data (my calls)
- Scenarios 1 to 3 deploy to **staging**: active rung staging, alarm named
  `zdp-staging-target-5xx`, test/user ports `:9082`/`:8082` in the console.
  The smoke drill actually ran in sandbox; §7's caveat covers that, as it
  does today.
- Good build ends at about **+12:30** on the clock (about 12.5 minutes
  inside CodeDeploy), with the outcome text quoting "about 13 min from
  merge to recorded".
- Roll prod back: active rung **prod**, alarm `zdp-prod-target-5xx`, ports
  `:9083`/`:8083`, clock ends at about +12:30, outcome text "13m18s from
  merge to recorded". Staging and sandbox rungs are unchanged throughout
  and show their last-good shas.
- **Blue is always the version users are on, green always the incoming
  one.** In the rollback scenario that means blue is the newer, bad sha and
  green is the older, good sha. So the sha pair, the ladder rungs, the PR
  diff and the alarm name are per-scenario data, not component constants
  as in today's `data-blue`/`data-green` attributes.

### Layout
Top to bottom, inside the frame:

1. **Step strip.** Six equal chips in a row with `›` between them,
   identical in every scenario:

   | # | Name | One-line "what" (shown in the chip) |
   |---|---|---|
   | 1 | Install | new build starts beside the live one |
   | 2 | Test door | a test port for checks, users stay on the normal port |

   (Ports differ per environment: staging `:9082`/`:8082`, prod
   `:9083`/`:8083`. The console log may print the real port for the
   active rung; the chip must not hard-code one.)
   | 3 | Smoke test | must report the exact commit |
   | 4 | 10% canary | 1 in 10 users, watched 5 min |
   | 5 | 100% | everyone moves, old build kept 5 min |
   | 6 | Record last-good | only a recorded build can promote |

   Chip states: idle (hairline border, muted text), running (orange),
   passed (green), failed (critical), skipped (faint, labelled "skipped").
   The current demo's seven steps become six: the "5-minute watch" is
   folded into the canary chip because CodeDeploy has no separate step for
   it, and the alarm is shown as its own persistent element instead.

2. **Alarm gauge.** A full-width dashed box directly under the strip:
   `cloudwatch 5xx alarm · armed for the whole deploy · rolls back at 5 or
   more errors in a minute` on the left, live value on the right
   (`0 / min · OK`, or `7 / min · ALARM` in critical). It is under the
   whole strip, not attached to one step, because it is armed throughout.

3. **Two lanes** (grid `1fr / 1.2fr`, single column on phones):

   **Left, "the release · one image, promoted by digest".** A vertical
   ladder, prod at the top, sandbox at the bottom, each rung showing
   environment name, short sha, a small "last-good · N ago" line, and the
   first 12 hex characters of the image digest with a fingerprint glyph.
   Between rungs a small ▲ with a note (`PR #42 merged`,
   `next: PR, after staging records`; no clock value on the merge note,
   since the clock starts at deployment start). The active rung has an orange
   border and a ◐ marker. Under the ladder, a small box showing **the
   promotion PR as a two-line diff** (`- sha … digest …` / `+ sha …
   digest …`) with `✓ check: ran clean in <previous env> · code-owner
   review required`. The previous environment depends on the rung: sandbox
   for staging, staging for prod, and for a rollback the target itself
   (`already ran in prod`). Say "review required", never "approved": the
   drill PRs were merged by the maintainer via the documented admin bypass.
   The sandbox rung carries a small note `all at once, about 5 min` because
   sandbox has no canary, which explains the 5-versus-13-minute difference.
   In the "starts wrong" and "breaks under traffic" scenarios the ladder
   ends with the active rung reverting to the previous sha and the note
   `nothing recorded`.

   **Right, "the users · blue is the version they're on".** The current
   demo's 100%-stacked blue/green split bar, the 120-cell request grid
   (blue, green, red for 500s, dark for not yet), and the counters
   (`served · failed · on new build`). Below it the **"why this step
   exists" card**: step name in mono, the step's "why" sentence in Plex,
   and a one-line orange **drill fact** when one exists for that step
   (§7). It updates as each step starts. At the end it shows the outcome
   sentence (the current demo's `finish()` text).

4. **Console.** The current demo's scrolling mono log stays, below the two
   lanes, same height. It is the engineer's view; the card above is the
   everyone view.

### Step copy
Keep the current component's `why` sentences; they were written for this
audience and the zero-downtime session has reviewed them. The `what` lines
shorten to the table above so they fit a chip.

## 6. Tab 2: Flip a feature flag

The lesson is "a flag is a switch in front of new code". The visitor must
see the switch and see the page change.

### Scenarios
| Button | What it shows |
|---|---|
| ⇆ turn it on, then off | flip on: page changes in ~60 s of drill time, no deploy; flip off: page reverts |
| ⚠ turn it on and it misbehaves | flip on, errors start, alarm fires, the switch turns itself off, page reverts |

The switch itself is also clickable at any time (not only via the
scenario buttons): clicking it toggles the flag and the page follows after
the ~60 s drill delay (a second or two of wall time, with the clock
advancing). That direct manipulation is the point of this tab.

**Switch interaction rules (my calls):**
- A direct click **cancels any running flag scenario** (same token/cancel
  mechanism as reset) and performs a clean flip from the current state.
  The clock keeps running; the scenario buttons drop their pressed state.
- A clean flip never misbehaves. The feature is only "broken" inside the
  ⚠ scenario, so after AppConfig has switched it off, a visitor who flips
  it back on by hand sees it land cleanly. The lesson stays "the switch
  works both ways"; the misbehave story is opt-in via its button.
- On the flag tab a step-through "step" is **one timeline event**. A direct
  click while step-through is waiting counts as a cancel, as above.
- While a flip is landing (the ~1 minute of drill time), the switch shows
  an intermediate state (`landing…` in mono beside it) and a second click
  is ignored until it has landed. This mirrors AppConfig: a deployment in
  progress must finish or be stopped before another starts.

### Layout
Two columns (grid `1fr / 1.25fr`, single column on phones):

**Left.**
- A large toggle switch (about 84×42 px), green when on with a soft green
  halo, `line-2` grey when off, with `ON` / `OFF` in mono beside it and a
  small caption `resume-pdf · click the switch to flip it`. The switch is a
  real `<button role="switch" aria-checked>`.
- Heading in mono: **A flag is a switch in front of new code.**
- One paragraph: *The one-page PDF résumé is already shipped, but hidden
  behind this switch. Flip it on and the site on the right changes for
  every visitor in about a minute. Flip it off and, a minute later, it's
  back to how it was. Nothing is deployed either way.*
- One line in faint text: *A flag can only be switched on where the
  release that contains it is already running, one environment at a time.*
- Two bullets telling the visitor what to look for:
  `"↓ resume" button turns solid orange and downloads the PDF` and
  `an announcement bar appears at the top of the page`.
- Status row in mono: `environment: [staging] · live in about a minute ·
  deploys: 0`. One environment per flip: each environment has its own
  AppConfig application and the flag workflow takes one environment as
  input. The demo flips **staging** (my call, to match the deploy tab's
  story; the drill flipped sandbox, which §7 notes). Never show all three
  lighting up from one flip, and never quote "58 s"; the measurement was
  "within 60 s".
- Button `⚠ make it misbehave` (same as the second scenario) with the hint
  `then watch the switch turn itself off`.
- Card: **why flags, if deploys are already safe?** *A deploy moves code.
  A flag moves behaviour. Turning a flag off reaches the app in about a
  minute and needs no pull request or deploy, so it's the fastest way to
  stop a feature that's hurting users.* (Never "instant": a flip off is
  the same AppConfig deployment as a flip on, about a minute to land plus
  a 5-minute alarm watch.)

**Right, "what visitors see · christophercorbin.cloud".**
- A **miniature browser window**: light grey chrome with three traffic
  lights and a URL field reading `https://christophercorbin.cloud`, and
  inside it a dark miniature of this site's own hero: the terminal nav
  (`~/christopher-corbin — zsh`, links), the green typed prompt, the
  `// DevOps & Cloud Engineer` subtitle, `Christopher Corbin.` with the
  orange dot, and the three hero buttons.
- **Flag off (baseline):** the third button looks like the live hero's
  résumé button **as it is today**: the `outline` variant in
  `Hero.astro`, a grey `line-2` border with body text, labelled `resume`
  (commit `769d45e`). Not the ghost link in the mockup. The miniature must not
  misrepresent the real site. No bar.
- **Flag on:** two changes, animated in together: the third button becomes
  a solid orange `↓ resume.pdf` button with a soft orange halo, and an
  orange **announcement bar** appears above the nav reading
  `new · the résumé now downloads as a one-page PDF` with `flag: resume-pdf`
  on the right.
- **Misbehaving:** a small critical-coloured notice appears under the
  buttons, `500 · PDF generation failed`, and the request cells (a small
  row of them under the browser) start showing red. A brief shake of the
  browser is allowed; none under reduced motion.
- **Switched off by itself:** bar and orange button revert to baseline,
  the switch on the left flips to OFF with a label `off · by itself`, and
  the alarm gauge (same component as the deploy tab, placed under the
  browser) returns to OK.
- Caption under the browser in mono: `flag on → orange résumé button +
  announcement bar` on the left, `the page reads the flag on every request`
  on the right.

The miniature is a static illustration built from HTML and the site's own
tokens, not an iframe of the real page, and **not** driven by the hero's
entries in `content.ts` (my call: it is a picture of the hero, and a
one-off visual check at build time is enough; wiring it to hero data would
couple the demo to hero markup for no visitor-facing gain). The browser
caption ends with `· illustration` so nobody reads it as the live site
having this flag.

### Timeline
Below the two columns, a horizontal five-event timeline in mono, each
event a short top-bordered column (grey, orange for actions, green for
good, critical for errors):

`+0:00 flipped on · one setting changed in AppConfig` →
`≈ +1:00 live · in staging, no deploy` →
`errors rise · the feature misbehaves under traffic` (no timestamp: the
drill's error burst was sent by hand and its start was not recorded; label
it `illustrative timing` in faint text) →
`≈ +4:54 rolled back · AppConfig turns the flag off by itself` (the alarm
fired somewhat earlier; +4:54 is the rollback, so never label this event
"alarm") →
`≈ +5:24 back to normal · no deploy, no pull request`.

The last event must not say "users never saw errors": the test endpoint
did return 500s for a few minutes in the drill. "Never saw a deploy" is
true and is the point.

In the "on, then off" scenario only the first two events light up, then a
`flipped off` event followed by `≈ +1:00 later · back to baseline`
replaces the last three. The off flip takes the same ~1 minute of drill
time to land as the on flip.

## 7. What may be claimed (measured, Nov 12–13 2026, sandbox account, generated traffic)

Use these and only these as "drill facts". Each may be shown as an orange
one-liner on the relevant step or event.

| Where | Fact |
|---|---|
| Smoke test (starts wrong) | deployment failed 4 minutes after merge; hook log `/ reports version "dev", expected <commit>`; 0 user traffic reached it |
| 10% canary (breaks under traffic) | alarm fired 2m37s after traffic started (about +4:31 from deployment start); CodeDeploy stopped the deployment 26 s later (`ALARM_ACTIVE`, about +4:57); 90 of about 1,000 requests failed; old version kept serving |
| Good build, end | merge to sandbox live about 5 min; promotion PR merge to recorded in staging/prod about 13 min |
| Roll prod back | prod rollback 13m18s from merge to recorded, about 12.5 min of it inside CodeDeploy; say "about 13 min" |
| Promotion check | a PR with an edited digest was blocked: "never ran in staging or prod with these digests" |
| Flag (sandbox) | live within 60 s of the flip; AppConfig rolled it back about 4m54s after the flip; endpoint normal about 30 s later. The alarm fired before the rollback; its exact time was not recorded |
| Flag, footnote | the first flag drill found a real bug (no baseline, so the first rollback left the flag stuck on), fixed in PR #6 before the recorded run. Optional "for engineers" footnote; it is the most believable proof the flag path was exercised |
| Footer | drift check green in all three environments after the drills; 9 of 9 planned proofs passed live |

Reusable literal strings from the repo: step names, `ALARM_ACTIVE`,
`HOOK_EXECUTION_FAILURE`, `CodeDeployDefault.ECSCanary10Percent5Minutes`,
the deploy file shape `{ sha, digests: { app: "sha256:…" } }`, and the
last-good shape `{ sha, digests, deployedAt, runUrl }`.

**Caveats that must stay somewhere visible** (the small-print paragraph
under the frame is fine, as today):
- the canary only protects when there is traffic (drill traffic was about
  5 requests/s from a script);
- the broken-build drill ran in the sandbox environment, though every
  environment stops at the same check;
- the test port is public (a documented trade-off);
- the flag name (`resume-pdf`), the page change and the "500 · PDF
  generation failed" notice are illustrative: the repo's only flag is
  `alarmDrill`, which makes one test endpoint (`/drill/alarm`) return 500
  while on, and the flag drill ran in sandbox;
- commits shown are illustrative and timings are compressed, except where
  a line cites a drill.

## 8. Copy rules

- Plain words first, jargon in parentheses after: "the old version
  (blue)". The current glossary fold-out ("new to this? the terms in plain
  English") stays above the frame.
- Every step has a *what* (in the chip) and a *why* (in the card).
- Audience split: everything on screen at rest is for everyone; the
  console, the PR diff and the digests are for engineers and may be dense.
- Never say "zero downtime" as a bare claim; say what was measured.
- The three scenario buttons are phrased as what is wrong with the build,
  not as pipeline states.

## 9. Accessibility and motion (carry over from the current demo)

- Buttons are never disabled mid-run (it drops focus); `aria-pressed`
  shows state. The step-through "next" button is hidden rather than
  disabled when not in use, and focus is handed off first.
- Live regions: the "why this step" card is `aria-live="polite"`; the
  console is `role="log"`.
- The request grid and split bar carry `role="img"` with a text
  `aria-label` that is updated.
- No opacity dimming for skipped steps (it breaks contrast); use the
  explicit faint grey.
- `prefers-reduced-motion`: no sleeps between paints, no shake, no bar
  slide-in; everything still works.
- The switch is `role="switch"`; the big tabs are a proper tablist.

## 10. Left to the builder

- Exact replay speed and per-step pauses, as long as the clock shows real
  drill time and the longest run is under ~30 s.
- Whether the demo's copy moves into `src/data/content.ts` (the repo
  convention) or stays in the component as today. Either is acceptable;
  if it moves, keep the `what/why/fact` structure.
- Whether the two tabs are one component with two bodies or a parent plus
  two children. Shared state (clock, alarm gauge, step-through) suggests
  one script.
- Phone layout details: the step strip may become a vertical list, the
  ladder stacks above the users lane, the browser miniature shrinks. The
  mockups are desktop only.
- How the ▲ notes between ladder rungs are animated.
- Whether the request cells on the flag tab are a short row (as in the
  mockup) or reuse the full grid.
- Updating `docs/architecture.drawio.png` is **not** required; the
  architecture does not change.
- Add `.superpowers/` to `.gitignore` as part of this work.
