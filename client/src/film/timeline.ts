import { clamp01, io3 } from "./ease";

/**
 * The film is one continuous timeline measured in "vh" (100 = one viewport of scroll).
 * Every chapter plays its animation (C), holds so it can be read (HOLD), fades out
 * completely, then a title card shows on its own before the next chapter fades in (X).
 * Nothing is ever layered on top of something else.
 */

export const CHAPTERS = [
  { name: "Hook", step: "Ask your documents anything", dark: false },
  { name: "The problem", step: "The problem", dark: false },
  { name: "Slice", step: "Step 1 of 5 · Slice", dark: false },
  { name: "Understand", step: "Step 2 of 5 · Understand", dark: false },
  { name: "Ask", step: "Step 3 of 5 · Ask", dark: true },
  { name: "Find", step: "Step 4 of 5 · Find", dark: false },
  { name: "Answer", step: "Step 5 of 5 · Answer", dark: false },
  { name: "Under the hood", step: "Under the hood", dark: false },
  { name: "Try it", step: "Your turn", dark: true },
] as const;

export const TITLE_CARDS = [
  ["The problem", "Why is this hard?", "Finding one answer in 300 pages"],
  ["Step 1 of 5", "Slice", "Cut the document into small cards"],
  ["Step 2 of 5", "Understand", "Give every card a meaning"],
  ["Step 3 of 5", "Ask", "Ask in your own words"],
  ["Step 4 of 5", "Find", "Pick the cards closest in meaning"],
  ["Step 5 of 5", "Answer", "Answer with receipts"],
  ["Why it’s different", "Under the hood", "How it’s built"],
  ["Your turn", "Try it", "Use it on your own document"],
] as const;

const C = [0, 150, 160, 160, 130, 160, 190, 130, 110];
const HOLD = [70, 45, 45, 45, 45, 45, 45, 45, 60];
const X = 120;
const FADE = 35;
const FIN = 30;

export const STARTS: number[] = [];
export const ENDS: number[] = [];
{
  let t = 0;
  for (let i = 0; i < CHAPTERS.length; i++) {
    STARTS.push(t);
    ENDS.push(t + C[i] + HOLD[i]);
    t = ENDS[i] + X;
  }
}
export const TOTAL = ENDS[ENDS.length - 1];

export type Rect = [x: number, y: number, w: number, h: number, r: number];

/** Where the lime highlighter rests in each chapter (composition pixels). */
const ANCHORS_DESKTOP: Rect[] = [
  [952, 380, 260, 10, 5], [792, 326, 568, 60, 8], [384, 530, 156, 200, 12], [883, 343, 14, 14, 7],
  [1100, 690, 18, 18, 9], [730, 152, 652, 72, 14], [48, 362, 560, 104, 16], [48, 736, 1344, 68, 18], [960, 230, 360, 360, 180],
];
const ANCHORS_PHONE: Rect[] = [
  [90, 583, 185, 6, 3], [40, 452, 130, 24, 4], [201, 446, 80, 110, 10], [115, 519, 12, 12, 6],
  [196, 630, 18, 18, 9], [16, 312, 358, 62, 14], [16, 476, 358, 88, 16], [16, 664, 358, 80, 16], [95, 540, 200, 200, 100],
];
/** The underline beneath each title card. */
const MID_DESKTOP: Rect = [560, 476, 320, 12, 6];
const MID_PHONE: Rect = [95, 387, 200, 8, 4];

export type Layer = { mounted: boolean; opacity: number; y: number; scale: number; p: number };
export type TitleCard = { opacity: number; y: number; eyebrow: string; title: string; sub: string } | null;
export type Mark = { x: number; y: number; w: number; h: number; r: number; opacity: number };

export type Frame = {
  layers: Layer[];
  scene: number;
  /** 0 = paper background, 1 = aubergine; blends only while the stage is empty between chapters. */
  darkness: number;
  card: TitleCard;
  mark: Mark;
  segments: number[];
};

export function frameAt(u: number, phone: boolean): Frame {
  const n = CHAPTERS.length;
  const layers: Layer[] = [];
  for (let i = 0; i < n; i++) {
    const inK = i === 0 ? 1 : io3(clamp01((u - (STARTS[i] - FIN)) / FIN));
    const outK = i === n - 1 ? 1 : 1 - io3(clamp01((u - ENDS[i]) / FADE));
    const opacity = inK * outK;
    layers.push({
      mounted: opacity > 0.002,
      opacity,
      y: (1 - inK) * 40 - (1 - outK) * 40,
      scale: 1 - (1 - outK) * 0.03,
      p: i === 0 ? clamp01((u - (ENDS[0] - 25)) / 60) : clamp01((u - STARTS[i]) / C[i]),
    });
  }

  let scene = 0;
  for (let i = 0; i < n - 1; i++) if (u >= ENDS[i] + 30) scene = i + 1;

  let darkness = CHAPTERS[0].dark ? 1 : 0;
  for (let i = 0; i < n - 1; i++) {
    const from = CHAPTERS[i].dark ? 1 : 0;
    const to = CHAPTERS[i + 1].dark ? 1 : 0;
    if (u >= ENDS[i] + 18) darkness = from + (to - from) * io3(clamp01((u - (ENDS[i] + 18)) / 22));
  }

  let card: TitleCard = null;
  for (let i = 0; i < n - 1; i++) {
    const tin = io3(clamp01((u - (ENDS[i] + 34)) / 20));
    const tout = io3(clamp01((u - (ENDS[i] + 70)) / 18));
    const k = tin * (1 - tout);
    if (k > 0.002) {
      const [eyebrow, title, sub] = TITLE_CARDS[i];
      card = { opacity: k, y: (1 - tin) * 30 - tout * 30, eyebrow, title, sub };
    }
  }

  const anchors = phone ? ANCHORS_PHONE : ANCHORS_DESKTOP;
  const mid = phone ? MID_PHONE : MID_DESKTOP;
  let mark: Mark = { x: 0, y: 0, w: 0, h: 0, r: 0, opacity: 0 };
  for (let i = 0; i < n - 1; i++) {
    const e = ENDS[i];
    if (u > e - 4 && u < e + X + 4) {
      const t = clamp01((u - e) / X);
      let from: Rect, to: Rect, k: number;
      if (t < 0.38) [from, to, k] = [anchors[i], mid, io3(t / 0.38)];
      else if (t < 0.62) [from, to, k] = [mid, mid, 1];
      else [from, to, k] = [mid, anchors[i + 1], io3((t - 0.62) / 0.38)];
      const lerp = (j: number) => from[j] + (to[j] - from[j]) * k;
      mark = {
        x: lerp(0), y: lerp(1), w: lerp(2), h: lerp(3), r: lerp(4),
        opacity: Math.min(1, (u - (e - 4)) / 8, (e + X + 4 - u) / 8),
      };
    }
  }

  const segments = CHAPTERS.map((_, i) => {
    const span = (i === n - 1 ? TOTAL : ENDS[i]) - STARTS[i];
    return clamp01((u - STARTS[i]) / Math.max(1, span));
  });

  return { layers, scene, darkness, card, mark, segments };
}
