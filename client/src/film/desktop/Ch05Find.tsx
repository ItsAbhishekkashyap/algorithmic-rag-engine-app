import { io3, out3, segOf } from "../ease";
import { Eyebrow, UnderHood, type ChapterProps } from "../parts";

export const RANKED = [
  { id: "12", title: "Paid time off", pct: 82, excerpt: "Full‑time employees earn 15 days of paid time off in their first year…" },
  { id: "13", title: "Carry‑over rules", pct: 74, excerpt: "Unused paid time off carries over to the next year, up to five days…" },
  { id: "27", title: "Public holidays", pct: 61, excerpt: "The company observes 10 public holidays, which don’t count against…" },
  { id: "19", title: "Remote work", pct: 38, excerpt: "You may work remotely up to three days a week with your manager’s…" },
  { id: "08", title: "Health insurance", pct: 33, excerpt: "Health cover begins on your first day of employment…" },
  { id: "22", title: "Expense claims", pct: 21, excerpt: "Expense claims must be filed within 30 days of purchase…" },
];
const NEAR: [number, number, number][] = [[400, 160, 82], [230, 150, 74], [300, 320, 61]];
const FAR: [number, number][] = [[90, 80], [560, 90], [580, 300], [110, 330], [520, 200], [70, 210], [470, 350], [180, 60], [600, 170], [420, 60]];

export default function Ch05Find({ p }: ChapterProps) {
  const seg = segOf(p);
  const h = out3(seg(0, 0.12));
  const hl = io3(seg(0.68, 0.82));

  return (
    <section aria-labelledby="ch05-title" className="absolute inset-0 overflow-hidden bg-paper text-aub">
      <div
        className="absolute left-12 top-[122px] flex w-[640px] flex-col gap-5"
        style={{ opacity: h, transform: `translateY(${(1 - h) * 50}px)` }}
      >
        <Eyebrow>Step 4 of 5 — Find</Eyebrow>
        <h2 id="ch05-title" className="disp m-0 text-[66px]">It picks the passages closest in meaning.</h2>
      </div>

      <div aria-hidden="true" className="absolute left-12 top-[390px] h-[390px] w-[640px] overflow-hidden rounded-3xl border border-rule bg-card">
        <span className="mono absolute left-[22px] top-5 text-muted">Closer on the map = more similar</span>
        <svg width="640" height="390" viewBox="0 0 640 390" className="absolute left-0 top-0">
          {NEAR.map(([x, y], i) => (
            <line
              key={i}
              x1="320" y1="210" x2={x} y2={y}
              stroke="#2B1736" strokeWidth="2" strokeDasharray="400"
              strokeDashoffset={400 * (1 - io3(seg(0.15 + i * 0.07, 0.3 + i * 0.07)))}
            />
          ))}
        </svg>
        {FAR.map(([x, y], i) => (
          <span key={i} className="absolute -ml-1.5 -mt-1.5 block h-3 w-3 rounded-full bg-rule" style={{ left: x, top: y }} />
        ))}
        {NEAR.map(([x, y, pct], i) => {
          const k = out3(seg(0.22 + i * 0.07, 0.3 + i * 0.07));
          return (
            <span key={i}>
              <span className="absolute -ml-[7px] -mt-[7px] box-border block h-3.5 w-3.5 rounded-full border-2 border-aub bg-lilac-2" style={{ left: x, top: y }} />
              <span
                className="absolute rounded-full bg-lime px-2 py-0.5 font-mono text-xs font-medium"
                style={{ left: Math.round((320 + x) / 2) + 8, top: Math.round((210 + y) / 2) - 12, opacity: k }}
              >
                {Math.round(pct * k)}%
              </span>
            </span>
          );
        })}
        <span className="absolute left-[311px] top-[192px] box-border block h-[18px] w-[18px] -rotate-45 rounded-[50%_50%_50%_0] border-2 border-aub bg-lime" />
        <span className="absolute left-[300px] top-[226px] text-xs font-semibold">Your question</span>
      </div>

      <div className="absolute left-[740px] top-[122px] flex w-[652px] flex-col gap-2">
        <span className="mono mb-1.5 text-muted">Every passage, scored against your question</span>
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {RANKED.map((r, i) => {
            const f = out3(seg(0.38 + i * 0.04, 0.5 + i * 0.04));
            const top = i < 3;
            const lit = top && hl > 0.5;
            return (
              <li
                key={r.id}
                className="grid h-[72px] grid-cols-[minmax(0,1fr)_140px_54px] items-center gap-4 rounded-[14px] px-[18px]"
                style={{
                  background: lit ? "var(--color-card)" : "transparent",
                  border: `1.5px solid ${lit ? "var(--color-aub)" : "var(--color-rule)"}`,
                  opacity: top ? 1 : 1 - 0.55 * hl,
                  transform: `translateX(${top ? -10 * hl : 14 * hl}px)`,
                }}
              >
                <div className="flex min-w-0 flex-col gap-[3px]">
                  <span className="text-[15px] font-semibold">Passage {r.id} · {r.title}</span>
                  <span className="truncate text-[13px] text-body">{r.excerpt}</span>
                </div>
                <span className="block h-2 overflow-hidden rounded bg-sand">
                  <span className="block h-2 rounded" style={{ width: `${r.pct * f}%`, background: top ? "var(--color-aub)" : "var(--color-lilac-2)" }} />
                </span>
                <span className="text-right font-mono text-[15px]">{Math.round(r.pct * f)}%</span>
              </li>
            );
          })}
        </ol>
        <p className="disp mb-0 mt-2.5 text-[30px]" style={{ opacity: out3(seg(0.8, 0.9)) }}>
          The top 3 win. <span className="text-muted">Everything else is ignored.</span>
        </p>
      </div>

      <UnderHood className="absolute left-[740px] top-[740px] w-[652px]" style={{ opacity: out3(seg(0.86, 0.96)) }}>
        Cosine similarity · cos θ = (A·B) / (‖A‖‖B‖) · all passages scored in one NumPy matrix multiply · no vector database
      </UnderHood>
    </section>
  );
}
