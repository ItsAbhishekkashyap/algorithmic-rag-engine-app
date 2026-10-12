import { bounceOut, out3, segOf } from "../ease";
import { Eyebrow, type ChapterProps } from "../parts";

export const QUESTION = "How many vacation days do I get in my first year?";
const MAP_DOTS: [number, number][] = [[260, 90], [340, 150], [230, 140], [380, 100], [290, 70], [210, 100], [350, 190], [420, 150], [80, 60], [520, 200]];

export default function Ch04Ask({ p }: ChapterProps) {
  const seg = segOf(p);
  const n = Math.round(seg(0.05, 0.5) * QUESTION.length);
  const b = out3(seg(0.52, 0.64));
  const pin = seg(0.66, 0.84);

  return (
    <section aria-labelledby="ch04-title" className="absolute inset-0 overflow-hidden bg-aub text-paper">
      <div className="absolute left-12 top-[122px] flex flex-col gap-4" style={{ opacity: out3(seg(0, 0.1)) }}>
        <Eyebrow dark>Step 3 of 5 — Ask</Eyebrow>
        <h2 id="ch04-title" className="disp m-0 text-[52px] text-mist">Now you ask, in your own words.</h2>
      </div>

      <p className="disp absolute left-11 right-[120px] top-[262px] m-0 text-[96px] leading-none" aria-label={QUESTION}>
        <span aria-hidden="true">
          “{QUESTION.slice(0, n)}
          <span className="caret text-lime">|</span>
          <span className="text-paper/15">{QUESTION.slice(n)}</span>”
        </span>
      </p>

      <div
        className="absolute left-12 top-[600px] flex w-[640px] flex-col gap-5"
        style={{ opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}
      >
        <p className="m-0 text-[19px] leading-[1.6] text-mist-2">
          Your question gets a meaning fingerprint too, so it lands on the <strong className="text-paper">same map</strong>, right in
          the time‑off neighbourhood.
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-xl border border-paper/25 px-3.5 py-2.5 text-[15px]">You said “vacation”</span>
          <span className="mono text-mist">≈</span>
          <span className="rounded-xl border border-paper/25 px-3.5 py-2.5 text-[15px]">Handbook says “paid time off”</span>
          <span className="rounded-xl bg-lime px-3.5 py-2.5 text-[15px] font-semibold text-aub">Same meaning, same place</span>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute left-[800px] top-[570px] h-[240px] w-[592px] overflow-hidden rounded-[22px] bg-plum"
        style={{ opacity: out3(seg(0.56, 0.66)) }}
      >
        <span className="mono absolute left-5 top-[18px] text-[10px] text-mist">The map of meaning · zoomed in</span>
        <span className="absolute left-[150px] top-[180px] rounded-full bg-paper/10 px-2.5 py-1 text-xs font-semibold">Time off &amp; holidays</span>
        {MAP_DOTS.map(([x, y], i) => (
          <span key={i} className="absolute block h-3 w-3 rounded-full" style={{ left: x, top: y, background: i > 7 ? "rgba(244,241,234,.18)" : "var(--color-lilac-2)" }} />
        ))}
        <div className="absolute left-[300px] top-[120px]" style={{ transform: `translateY(${(1 - bounceOut(pin)) * -140}px)`, opacity: pin > 0 ? 1 : 0 }}>
          <span className="block h-[18px] w-[18px] -rotate-45 rounded-[50%_50%_50%_0] bg-lime shadow-[0_0_0_6px_rgba(200,241,105,.2)]" />
          <span className="absolute -top-0.5 left-7 whitespace-nowrap text-[13px] font-semibold text-lime">Your question</span>
        </div>
      </div>
    </section>
  );
}
