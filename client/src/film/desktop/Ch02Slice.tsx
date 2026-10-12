import { backOut, out3, segOf } from "../ease";
import { Eyebrow, UnderHood, type ChapterProps } from "../parts";

const TITLES = ["Welcome & values", "Working hours", "Paid time off", "Carry‑over rules", "Sick leave", "Parental leave", "Public holidays", "Remote work"];

export default function Ch02Slice({ p }: ChapterProps) {
  const seg = segOf(p);
  const h = out3(seg(0, 0.14));
  const notes = out3(seg(0.82, 0.94));

  return (
    <section aria-labelledby="ch02-title" className="absolute inset-0 overflow-hidden bg-paper text-aub">
      <div
        className="absolute left-12 top-[122px] flex w-[800px] flex-col gap-[22px]"
        style={{ opacity: h, transform: `translateY(${(1 - h) * 50}px)` }}
      >
        <Eyebrow>Step 1 of 5 — Slice</Eyebrow>
        <h2 id="ch02-title" className="disp m-0 text-[80px]">First, it cuts the document into small passages.</h2>
      </div>

      <p className="absolute left-[900px] top-[178px] m-0 w-[492px] text-[19px] leading-[1.6] text-body" style={{ opacity: h }}>
        Think of cutting a long book into <strong className="text-aub">index cards</strong>. Each card holds about 200 words, and
        each one repeats the last 50 words of the card before it. So a sentence sitting on the edge is never lost.
      </p>

      <div className="absolute left-12 right-12 top-[420px] flex flex-col gap-2">
        <span className="mono text-muted">The whole handbook · 300 pages · ≈ 90,000 words</span>
        <div className="relative h-14 overflow-hidden rounded-xl border border-rule bg-card">
          <div className="absolute left-4 right-4 top-3.5 flex flex-col gap-2">
            <span className="block h-[7px] rounded bg-line" />
            <span className="block h-[7px] w-[92%] rounded bg-line" />
            <span className="block h-[7px] w-[70%] rounded bg-line" />
          </div>
          {Array.from({ length: 7 }, (_, j) => {
            const i = j + 1;
            return (
              <span
                key={i}
                className="absolute top-0 block h-14 w-0.5 origin-top bg-aub"
                style={{ left: i * 168 - 6, transform: `scaleY(${out3(seg(0.12 + i * 0.03, 0.2 + i * 0.03))})` }}
              />
            );
          })}
        </div>
      </div>

      <div className="absolute left-12 top-[530px] flex gap-3">
        {TITLES.map((title, i) => {
          const k = backOut(seg(0.38 + i * 0.045, 0.5 + i * 0.045), 1.4);
          const special = i === 2;
          return (
            <div
              key={title}
              className="relative box-border flex h-[200px] w-[156px] flex-col gap-[9px] overflow-hidden rounded-xl bg-card py-3.5 pr-3.5 shadow-[0_16px_30px_-22px_rgba(43,23,54,.4)]"
              style={{
                border: `1.5px solid ${special ? "var(--color-aub)" : "var(--color-rule)"}`,
                paddingLeft: i === 0 ? 14 : 34,
                opacity: Math.min(1, Math.max(0, k * 1.4)),
                transform: `translateY(${(1 - k) * -90}px) rotate(${(1 - k) * (i % 2 ? 4 : -4)}deg)`,
              }}
            >
              {i > 0 && <span className="absolute inset-y-0 left-0 block w-[26px] bg-lilac-3" />}
              <span className="mono relative text-[10px] text-muted">Passage {10 + i}</span>
              <span className={`relative self-start rounded px-1 py-px text-[13px] font-semibold leading-tight ${special ? "bg-lime" : ""}`}>{title}</span>
              <span className="relative block h-1.5 rounded-sm bg-line" />
              <span className="relative block h-1.5 w-[88%] rounded-sm bg-line" />
              <span className="relative block h-1.5 w-[94%] rounded-sm bg-line" />
              <span className="relative block h-1.5 w-[70%] rounded-sm bg-line" />
            </div>
          );
        })}
      </div>

      <div className="absolute left-12 top-[760px] flex items-center gap-6" style={{ opacity: notes }}>
        <span className="flex items-center gap-2.5">
          <span className="block h-3.5 w-[26px] rounded-[3px] border border-lilac bg-lilac-3" />
          <span className="text-sm text-body">= the 50 words repeated from the card before</span>
        </span>
        <span className="mono text-muted">Showing 10–17 of ≈ 600 passages</span>
      </div>

      <UnderHood className="absolute right-12 top-[744px] w-[430px]" style={{ opacity: notes }}>
        Sliding‑window chunker · 200‑word window, 50 overlap · pure Python, O(N) · never splits a word
      </UnderHood>
    </section>
  );
}
