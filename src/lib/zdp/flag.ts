export type FlagState = "off" | "landing-on" | "on" | "landing-off";
export type FlagScenarioId = "onoff" | "misbehave";

export const FLAG_SCENARIOS: readonly { id: FlagScenarioId; label: string; hint: string }[] = [
  { id: "onoff", label: "⇆ turn it on, then off", hint: "watch the page change, then change back" },
  { id: "misbehave", label: "⚠ turn it on and it misbehaves", hint: "the switch turns itself off" },
];

export interface FlagTimelineEvent {
  key: "flipped" | "live" | "errors" | "rolledback" | "normal" | "flippedoff" | "baseline";
  at?: number;
  label: string;
  detail: string;
  tone: "go" | "ok" | "crit" | "idle";
  illustrative?: boolean;
}

const FLIPPED: FlagTimelineEvent = {
  key: "flipped", at: 0, label: "flipped on", detail: "one setting changed in AppConfig", tone: "go",
};
const LIVE: FlagTimelineEvent = {
  key: "live", at: 60, label: "live", detail: "in staging, no deploy", tone: "ok",
};

const TIMELINES: Readonly<Record<FlagScenarioId, readonly FlagTimelineEvent[]>> = {
  onoff: [
    FLIPPED,
    LIVE,
    { key: "flippedoff", at: 60, label: "flipped off", detail: "one setting changed", tone: "go" },
    { key: "baseline", at: 120, label: "back to baseline", detail: "the old button is back", tone: "ok" },
  ],
  misbehave: [
    FLIPPED,
    LIVE,
    {
      key: "errors", label: "errors rise", detail: "the feature misbehaves under traffic",
      tone: "crit", illustrative: true,
    },
    {
      key: "rolledback", at: 294, label: "rolled back",
      detail: "AppConfig turns the flag off by itself", tone: "crit",
    },
    { key: "normal", at: 324, label: "back to normal", detail: "no deploy, no pull request", tone: "ok" },
  ],
};

/** The page changes only when a flip has landed. */
export function pageState(state: FlagState): "baseline" | "flagged" {
  return state === "on" || state === "landing-off" ? "flagged" : "baseline";
}

export class FlagMachine {
  state: FlagState = "off";
  misbehaving = false;
  clock = 0;
  private readonly landSeconds: number;

  constructor(opts: { landSeconds: number }) {
    this.landSeconds = opts.landSeconds;
  }

  /** Scenario-driven flip; leaves `misbehaving` untouched. */
  flip(): "ignored" | "flipping" {
    if (this.state === "off") {
      this.state = "landing-on";
      return "flipping";
    }
    if (this.state === "on") {
      this.state = "landing-off";
      return "flipping";
    }
    return "ignored";
  }

  /** Direct user flip; clears `misbehaving`. */
  click(): "ignored" | "flipping" {
    const result = this.flip();
    if (result === "flipping") this.misbehaving = false;
    return result;
  }

  land(): void {
    if (this.state === "landing-on") this.state = "on";
    else if (this.state === "landing-off") this.state = "off";
    else return;
    this.clock += this.landSeconds;
  }

  /** Rollback; only valid from `on` while misbehaving. The player then calls `land()`. */
  autoOff(): void {
    if (this.state === "on" && this.misbehaving) this.state = "landing-off";
  }

  startScenario(id: FlagScenarioId): void {
    this.state = "off";
    this.clock = 0;
    this.misbehaving = id === "misbehave";
  }

  cancel(): void {
    this.misbehaving = false;
    if (this.state === "landing-on" || this.state === "landing-off") this.land();
  }

  timeline(id: FlagScenarioId): FlagTimelineEvent[] {
    return TIMELINES[id].map((e) => ({ ...e }));
  }
}
