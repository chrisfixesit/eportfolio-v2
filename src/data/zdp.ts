// Copy and facts only for the Zero-Downtime Pipeline demo. No logic here.
// Step ids, names and "what" lines follow the design spec; the "why" sentences
// are carried over from the earlier CanaryDemo component.
import type { StepId } from "../lib/zdp/deploy.ts";

export const STEPS: readonly { id: StepId; name: string; what: string; why: string }[] = [
  {
    id: "install",
    name: "Install",
    what: "new build starts beside the live one",
    why: "Users stay on the current version the whole time, and a build that can't even start never gets near them.",
  },
  {
    id: "test",
    name: "Test door",
    what: "a test port for checks, users stay on the normal port",
    why: "The new build can be tried for real before any customer is sent to it.",
  },
  {
    id: "smoke",
    name: "Smoke test",
    what: "must report the exact commit",
    why: "It catches a build that starts but is wrong. In a live drill it caught one reporting version \"dev\", and no user ever reached it.",
  },
  {
    id: "canary",
    name: "10% canary",
    what: "1 in 10 users, watched 5 min",
    why: "If something only breaks under real use, only a tenth of requests see it, and only briefly. An alarm counts server errors on both builds for the whole deploy and rolls back without anyone waking up.",
  },
  {
    id: "full",
    name: "100%",
    what: "everyone moves, old build kept 5 min",
    why: "If a late problem shows up, rolling back is quick because the old build is still there.",
  },
  {
    id: "record",
    name: "Record last-good",
    what: "only a recorded build can promote",
    why: "Only a recorded build can be promoted to prod, so a failed or rolled-back build can't move on by mistake.",
  },
];

export const GLOSSARY: readonly (readonly [string, string])[] = [
  ["Blue / green", "two copies side by side: blue is the version users are on, green is the new one."],
  ["Canary", "send a small share of traffic (here 10%) to the new version first, so a problem hits few people."],
  ["Rollback", "put everyone back on the previous version. Here it happens automatically."],
  ["5xx", "server errors, like 500. The alarm counts these."],
  ["Digest", "a fingerprint of the exact image bytes, so prod runs exactly what was tested."],
];

export const PROMOTION: readonly string[] = [
  "Each merge builds one container image. That same image, by digest, moves sandbox → staging → prod. Nothing is rebuilt on the way.",
  "Promoting is a pull request that changes one small file naming the commit and digest. A code owner must approve, and merging it deploys.",
  "A required check blocks the pull request unless that exact build has a last-good record in the stage before. In a live test, a PR with an edited digest was blocked.",
  "Rolling back is the same kind of pull request, pointing at an earlier build. Prod rolled back in 13 minutes from merge.",
  "An hourly drift check compares what the files ask for with what is actually running, in every environment.",
];

export const CAVEATS: string[] = [
  "The canary only protects when there is traffic; drill traffic was about 5 requests a second from a script.",
  "The broken-build drill ran in the sandbox environment, though every environment stops at the same check.",
  "The test port is public, a documented trade-off.",
  "The flag name (resume-pdf), the page change and the \"500 · PDF generation failed\" notice are illustrative: the repo's only flag is alarmDrill, which makes one test endpoint (/drill/alarm) return 500 while on, and the flag drill ran in sandbox.",
  "Commits shown are illustrative and timings are compressed, except where a line cites a drill.",
];

export const PROOFS = "9 of 9 proofs passed live · Nov 2026";

export const FOOTER_BADGES: { deploy: string[]; flag: string[] } = {
  deploy: ["drift check · green in all 3 envs", "OIDC · no stored AWS keys", "AWS infra in OpenTofu"],
  flag: ["AWS AppConfig", "same alarm as the deploy"],
};
