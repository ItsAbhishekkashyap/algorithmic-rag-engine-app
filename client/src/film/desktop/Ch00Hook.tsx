import { ChapterLink, Eyebrow, type ChapterProps } from "../parts";

const LINE_WIDTHS = [92, 86, 95, 60, 0, 88, 94, 72, 90, 0, 84, 91, 66, 80];

export default function Ch00Hook({ p, introDelay = 0.2 }: ChapterProps & { introDelay?: number }) {
  const t = Math.max(0, Math.min(1, (p - 0.15) / 0.85));
  const e = t * t;

  return (
    <section aria-labelledby="ch00-title" className="absolute inset-0 overflow-hidden bg-paper text-aub">
      <div
        className="absolute left-12 top-[140px] flex w-[760px] flex-col gap-[30px]"
        style={{ transform: `translateY(${-e * 200}px)`, opacity: 1 - e }}
      >
        <Eyebrow>A RAG engine, explained in one scroll</Eyebrow>
        <h1 id="ch00-title" className="disp m-0 text-[124px]">
          <span className="line"><span style={{ animationDelay: `${introDelay}s` }}>Ask your</span></span>
          <span className="line"><span style={{ animationDelay: `${introDelay + 0.12}s` }}>documents</span></span>
          <span className="line">
            <span style={{ animationDelay: `${introDelay + 0.24}s` }}>
              <span className="rounded-[0.12em] bg-lime px-[0.1em]">anything.</span>
            </span>
          </span>
        </h1>
        <p className="m-0 max-w-[600px] text-[20px] leading-[1.55] text-body">
          This engine reads a long document, works out what each part means, and answers your questions using{" "}
          <strong>only</strong> what&rsquo;s written there, showing you exactly where every answer came from.
        </p>
        <div className="flex items-center gap-3">
          <ChapterLink
            to={1}
            className="mono flex h-[52px] items-center gap-2.5 rounded-full border-[1.5px] border-aub bg-lime px-6 text-aub no-underline"
          >
            See how it works <span aria-hidden="true">↓</span>
          </ChapterLink>
          <span className="mono text-muted">5 simple steps · 2 minutes</span>
        </div>
      </div>

      <div aria-hidden="true" className="absolute left-[880px] top-[150px] h-[640px] w-[500px]">
        <div
          className="absolute left-[60px] top-[60px] h-[470px] w-[360px] rounded-[14px] border border-rule bg-sand"
          style={{ transform: `rotate(${5 + e * 16}deg) translateX(${e * 90}px)` }}
        />
        <div
          className="absolute left-[50px] top-[50px] h-[470px] w-[360px] rounded-[14px] border border-rule bg-[#F8F7F3]"
          style={{ transform: `rotate(${2 + e * 8}deg) translateX(${e * 40}px)` }}
        />
        <div className="absolute left-10 top-10 box-border flex h-[470px] w-[360px] flex-col gap-3 rounded-[14px] border border-rule bg-card p-8 shadow-[0_30px_60px_-30px_rgba(43,23,54,.25)]">
          <span className="mono text-[10px] text-muted">Employee Handbook · page 12 of 300</span>
          <span className="text-[15px] font-semibold">4.2 Paid time off</span>
          {LINE_WIDTHS.map((w, i) => (
            <span
              key={i}
              className="block h-2 rounded"
              style={{ width: `${w || 2}%`, background: i === 5 ? "var(--color-lime)" : w ? "var(--color-line)" : "transparent" }}
            />
          ))}
        </div>
        <div
          className="float absolute -left-[60px] top-0 max-w-[300px] rounded-[20px_20px_20px_4px] bg-aub px-5 py-4 text-[17px] leading-[1.4] text-paper"
          style={{ translate: `${-e * 120}px 0` }}
        >
          How many vacation days do I get in my first year?
        </div>
        <div
          className="float absolute -right-2.5 bottom-10 max-w-[290px] rounded-[20px_20px_4px_20px] bg-lilac px-5 py-4 text-[17px] leading-[1.4]"
          style={{ animationDelay: "-2s", translate: `${e * 80}px 0` }}
        >
          15 days of paid time off.{" "}
          <span className="rounded bg-lime px-1.5 py-px font-mono text-xs">page 12</span>
        </div>
      </div>
    </section>
  );
}
