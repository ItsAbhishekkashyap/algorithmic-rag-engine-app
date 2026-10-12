import { out3, segOf } from "../ease";
import { Eyebrow, type ChapterProps } from "../parts";

const WORD = "vacation";

export default function Ch01Problem({ p }: ChapterProps) {
  const seg = segOf(p);
  const h = out3(seg(0, 0.15));
  const ex = out3(seg(0.36, 0.5));
  const t = out3(seg(0.78, 0.92));
  const typed = WORD.slice(0, Math.round(seg(0.08, 0.26) * WORD.length));

  return (
    <section aria-labelledby="ch01-title" className="absolute inset-0 overflow-hidden bg-paper text-aub">
      <div
        className="absolute left-12 top-[128px] flex w-[640px] flex-col gap-[26px]"
        style={{ opacity: h, transform: `translateY(${(1 - h) * 50}px)` }}
      >
        <Eyebrow>The problem</Eyebrow>
        <h2 id="ch01-title" className="disp m-0 text-[92px]">Reading takes hours. Ctrl+F misses the point.</h2>
      </div>

      <div className="absolute left-12 top-[600px] grid w-[620px] grid-cols-2 gap-7">
        <div className="flex flex-col gap-2 border-t-2 border-aub pt-4" style={{ opacity: out3(seg(0.12, 0.24)) }}>
          <span className="disp text-[56px]">~6 hrs</span>
          <span className="text-[15px] leading-normal text-body">to read a 300‑page handbook, at 250 words a minute.</span>
        </div>
        <div className="flex flex-col gap-2 border-t-2 border-aub pt-4" style={{ opacity: out3(seg(0.3, 0.38)) }}>
          <span className="disp text-[56px]">0 results</span>
          <span className="text-[15px] leading-normal text-body">for “vacation”, because the handbook never uses that word.</span>
        </div>
      </div>

      <div className="absolute left-[760px] top-[140px] flex w-[632px] flex-col gap-5">
        <div className="flex h-16 items-center gap-3.5 rounded-2xl border border-rule bg-card px-5 shadow-[0_20px_40px_-28px_rgba(43,23,54,.3)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5F70" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <span className="flex-1 text-[20px]">
            {typed}
            <span className="caret">|</span>
          </span>
          <span className="mono text-muted" style={{ opacity: out3(seg(0.27, 0.33)) }}>0 of 0 results</span>
        </div>
        <div
          className="flex flex-col gap-3.5 rounded-[20px] border border-rule bg-card p-8"
          style={{ opacity: ex, transform: `translateY(${(1 - ex) * 40}px)` }}
        >
          <span className="mono text-[10px] text-muted">Employee Handbook · page 12</span>
          <span className="text-[17px] font-semibold">4.2 Paid time off</span>
          <p className="m-0 text-[24px] leading-normal">
            Full‑time employees earn 15 days of{" "}
            <span className="hl-sweep px-[3px]" style={{ backgroundSize: `${Math.round(seg(0.52, 0.68) * 100)}% 100%` }}>
              paid time off
            </span>{" "}
            in their first year, accrued at 1.25 days per month. Unused days carry over, up to five.
          </p>
        </div>
        <div className="flex items-start gap-3.5" style={{ opacity: out3(seg(0.66, 0.76)) }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#2B1736" strokeWidth="2" aria-hidden="true">
            <path d="M6 30C6 16 14 8 28 8M28 8l-6-5M28 8l-6 5" />
          </svg>
          <span className="text-[18px] leading-normal text-body">
            The answer was here all along. It just used <em>different words</em>.
          </span>
        </div>
      </div>

      <p
        className="disp absolute bottom-[84px] left-12 right-12 m-0 text-[44px] leading-[1.05]"
        style={{ opacity: t, transform: `translateY(${(1 - t) * 30}px)` }}
      >
        You need search that understands <span className="rounded-[0.12em] bg-lime px-[0.1em]">meaning</span>, not spelling.
      </p>
    </section>
  );
}
