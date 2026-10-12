export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export const out3 = (t: number) => 1 - Math.pow(1 - t, 3);

export const io3 = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const backOut = (t: number, c = 1.7) => 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);

export function bounceOut(t: number) {
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
}

/** Progress of `p` through the window [a, b], clamped to 0..1. */
export const segOf = (p: number) => (a: number, b: number) => clamp01((p - a) / (b - a));

/** Deterministic pseudo-random sequence so decorative data is stable across renders. */
export function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
