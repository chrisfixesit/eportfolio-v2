/** Replay runs this many times faster than the drill clock. */
export const REPLAY_SPEED = 20;

/** Formats elapsed drill seconds as "+m:ss" (minutes unpadded, seconds padded). */
export function formatClock(seconds: number): string {
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `+${minutes}:${String(secs).padStart(2, "0")}`;
}

/** Converts drill time to wall-clock milliseconds; instant under reduced motion. */
export function toWallMs(
  drillSeconds: number,
  opts: { speed: number; reduce: boolean },
): number {
  return opts.reduce ? 0 : Math.round((drillSeconds * 1000) / opts.speed);
}

/** Deterministic LCG (a small LCG so replays are deterministic) returning values in [0, 1]. */
export function makeRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}
