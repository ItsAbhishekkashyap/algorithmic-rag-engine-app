import { backOut, out3, segOf } from "../ease";
import { Eyebrow, StudioLink, type ChapterProps } from "../parts";

export const TRY_STEPS = ["Drop in a .txt file, or paste any text.", "Ask anything about it, in your own words.", "Check the sources behind every answer."];
const WORDS = ["Slice", "Understand", "Ask", "Find", "Answer", "Verify"];

export default function Ch08Try({ p }: ChapterProps) {
  const seg = segOf(p);
  const h = out3(seg(0.02, 0.22));
  const disc = Math.max(0.15, 0.15 + 0.85 * backOut(seg(0.35, 0.6), 1.8));

  return (
    <section aria-labelledby="ch08-title" className="absolute inset-0 overflow-hidden bg-aub text-paper">
      <div
        className="absolute left-12 top-[140px] flex w-[860px] flex-col gap-[22px]"
        style={{ opacity: h, transform: `translateY(${(1 - h) * 70}px)` }}
      >
        <Eyebrow dark>Your turn</Eyebrow>
        <h2 id="ch08-title" className="disp m-0 text-[116px]">
          Try it with your <span className="rounded-[0.12em] bg-lime px-[0.1em] text-aub">own</span> document.
        </h2>
      </div>

      <ol className="absolute left-12 top-[560px] m-0 grid w-[860px] list-none grid-cols-3 gap-5 p-0">
        {TRY_STEPS.map((t, i) => {
          const k = out3(seg(0.25 + i * 0.08, 0.37 + i * 0.08));
          return (
            <li key={t} className="flex flex-col gap-2.5 border-t border-paper/25 pt-4" style={{ opacity: k, transform: `translateY(${(1 - k) * 30}px)` }}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime font-bold text-aub">{i + 1}</span>
              <span className="text-[18px] leading-[1.45]">{t}</span>
            </li>
          );
        })}
      </ol>

      <StudioLink
        label="Open the Studio"
        className="absolute left-[960px] top-[230px] flex h-[360px] w-[360px] items-center justify-center rounded-full bg-lime text-aub no-underline"
        style={{ transform: `scale(${disc})` }}
      >
        <svg className="spin absolute left-5 top-5" width="320" height="320" viewBox="0 0 320 320" aria-hidden="true">
          <defs>
            <path id="ring-d" d="M160,160 m-130,0 a130,130 0 1,1 260,0 a130,130 0 1,1 -260,0" />
          </defs>
          <text fontFamily="var(--font-mono)" fontSize="15" letterSpacing="5" fill="#2B1736">
            <textPath href="#ring-d">OPEN THE STUDIO · ASK YOUR DOCUMENT · OPEN THE STUDIO · ASK ·</textPath>
          </text>
        </svg>
        <span className="disp relative text-[84px]" aria-hidden="true">→</span>
      </StudioLink>

      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-[722px] overflow-hidden border-y border-paper/10 py-3.5"
        style={{ opacity: out3(seg(0.55, 0.7)) }}
      >
        <div className="marquee disp flex w-max gap-10 whitespace-nowrap text-[44px] text-paper/50">
          {[...WORDS, ...WORDS].map((w, i) => (
            <span key={i} className="flex gap-10">
              <span>{w}</span>
              <span className="text-lime">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
