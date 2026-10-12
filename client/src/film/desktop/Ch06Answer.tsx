import { out3, segOf } from "../ease";
import { Eyebrow, UnderHood, type ChapterProps } from "../parts";

export const ANSWER_PARTS = [
  "You get 15 days of paid time off in your first year, earned at 1.25 days per month.",
  " Up to 5 unused days carry over to the next year.",
  " Public holidays don’t count against them.",
];

/** Splits the streamed answer into its three cited parts and when each citation lands. */
export function streamAnswer(p: number, parts: string[], from: number, to: number) {
  const total = parts.reduce((s, t) => s + t.length, 0);
  const n = Math.round(Math.max(0, Math.min(1, (p - from) / (to - from))) * total);
  let at = 0;
  return parts.map((t) => {
    const k = Math.max(0, Math.min(t.length, n - at));
    const doneAt = from + ((at + t.length) / total) * (to - from);
    at += t.length;
    return { text: t.slice(0, k), cited: k >= t.length, doneAt };
  });
}

const SOURCES = [
  { n: 1, label: "Passage 12 · Paid time off · 82% match", pre: "Full‑time employees earn ", hit: "15 days of paid time off in their first year", post: ", accrued at 1.25 days per month." },
  { n: 2, label: "Passage 13 · Carry‑over rules · 74% match", pre: "", hit: "Unused paid time off carries over", post: " to the next year, up to five days." },
  { n: 3, label: "Passage 27 · Public holidays · 61% match", pre: "The company observes 10 public holidays, which ", hit: "don’t count against paid time off", post: "." },
];

export default function Ch06Answer({ p }: ChapterProps) {
  const seg = segOf(p);
  const h = out3(seg(0, 0.12));
  const g = out3(seg(0.8, 0.9));
  const parts = streamAnswer(p, ANSWER_PARTS, 0.25, 0.72);

  return (
    <section aria-labelledby="ch06-title" className="absolute inset-0 overflow-hidden bg-paper text-aub">
      <div
        className="absolute left-12 top-[122px] flex w-[900px] flex-col gap-5"
        style={{ opacity: h, transform: `translateY(${(1 - h) * 50}px)` }}
      >
        <Eyebrow>Step 5 of 5 — Answer</Eyebrow>
        <h2 id="ch06-title" className="disp m-0 text-[64px]">An AI writes the answer, using only those 3 passages.</h2>
      </div>

      <div className="absolute left-12 top-[330px] flex w-[560px] flex-col gap-3">
        <span className="mono text-muted">The 3 sources it was given</span>
        {SOURCES.map((s, i) => {
          const k = out3(seg(0.06 + i * 0.05, 0.16 + i * 0.05));
          return (
            <div
              key={s.n}
              className="flex flex-col gap-2 rounded-2xl bg-card px-[18px] py-4"
              style={{
                border: i === 0 ? "1.5px solid var(--color-aub)" : "1px solid var(--color-rule)",
                opacity: k,
                transform: `translateX(${(1 - k) * -40}px)`,
              }}
            >
              <span className="mono text-[10px] text-muted">
                <span className="cite ml-0">{s.n}</span> {s.label}
              </span>
              <span className="text-base leading-normal">
                {s.pre}
                <span className="hl-sweep" style={{ backgroundSize: `${Math.round(seg(parts[i].doneAt, parts[i].doneAt + 0.07) * 100)}% 100%` }}>
                  {s.hit}
                </span>
                {s.post}
              </span>
            </div>
          );
        })}
      </div>

      <div className="absolute left-[660px] top-[330px] flex w-[732px] flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-3xl border border-rule bg-card px-[30px] py-7 shadow-[0_30px_60px_-40px_rgba(43,23,54,.35)]">
          <span className="mono text-muted">Answer</span>
          <p className="m-0 min-h-[150px] text-[26px] leading-[1.45] tracking-[-0.01em]">
            {parts.map((part, i) => (
              <span key={i}>
                {part.text}
                {part.cited && <span className="cite">{i + 1}</span>}
              </span>
            ))}
            <span className="caret">|</span>
          </p>
          <span className="text-sm text-body">Every fact links back to the sentence it came from. Click a number to see it.</span>
        </div>
        <div
          className="flex flex-col gap-2.5 rounded-[20px] bg-aub px-6 py-5 text-paper"
          style={{ opacity: g, transform: `translateY(${(1 - g) * 30}px)` }}
        >
          <span className="mono text-mist">And when the answer isn’t there?</span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-[14px] bg-paper/10 px-3.5 py-2.5 text-base">“What’s the CEO’s salary?”</span>
            <span className="mono text-mist" aria-hidden="true">→</span>
            <span className="rounded-[14px] bg-lime px-3.5 py-2.5 text-base font-semibold text-aub">“The handbook doesn’t say, so I won’t guess.”</span>
          </div>
        </div>
      </div>

      <UnderHood className="absolute left-12 top-[722px] w-[560px]" style={{ opacity: out3(seg(0.88, 0.97)) }}>
        Gemini 2.0 Flash · temperature 0.2 · strict “context only” prompt · auto‑fallback to 3 other models
      </UnderHood>
    </section>
  );
}
