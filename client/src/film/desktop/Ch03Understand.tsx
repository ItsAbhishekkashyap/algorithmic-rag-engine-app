import { backOut, out3, rng, segOf } from "../ease";
import { Eyebrow, UnderHood, type ChapterProps } from "../parts";

const rand = rng(31);
const BARS = Array.from({ length: 96 }, () => rand());
const CLUSTERS = [
  { label: "Time off & holidays", cx: 200, cy: 210, lx: 120, ly: 110 },
  { label: "Pay & benefits", cx: 520, cy: 190, lx: 470, ly: 90 },
  { label: "Rules & security", cx: 500, cy: 390, lx: 450, ly: 478 },
  { label: "Working remotely", cx: 190, cy: 400, lx: 110, ly: 488 },
].map((c) => ({
  ...c,
  dots: Array.from({ length: 9 }, () => {
    const ang = rand() * Math.PI * 2;
    const rad = 18 + rand() * 62;
    return { x: Math.round(c.cx + Math.cos(ang) * rad), y: Math.round(c.cy + Math.sin(ang) * rad) };
  }),
}));

export default function Ch03Understand({ p }: ChapterProps) {
  const seg = segOf(p);
  const h = out3(seg(0, 0.14));
  const grow = backOut(seg(0.14, 0.34), 1.8);
  const k12 = backOut(seg(0.38, 0.46), 1.8);
  const pin = out3(seg(0.75, 0.85));

  return (
    <section aria-labelledby="ch03-title" className="absolute inset-0 overflow-hidden bg-paper text-aub">
      <div
        className="absolute left-12 top-[122px] flex w-[580px] flex-col gap-[22px]"
        style={{ opacity: h, transform: `translateY(${(1 - h) * 50}px)` }}
      >
        <Eyebrow>Step 2 of 5 — Understand</Eyebrow>
        <h2 id="ch03-title" className="disp m-0 text-[68px]">Then it gives every passage a meaning fingerprint.</h2>
        <p className="m-0 text-[17px] leading-[1.6] text-body">
          A small AI model reads each card and writes down 384 numbers that describe what it&rsquo;s about. Cards about similar
          things get similar numbers.
        </p>
      </div>

      <div className="absolute left-12 top-[580px] flex w-[580px] flex-col gap-3">
        <div className="flex items-center gap-3" style={{ opacity: out3(seg(0.06, 0.16)) }}>
          <span className="rounded-xl border-[1.5px] border-aub bg-card px-4 py-3 text-sm font-semibold">
            Passage 12 · <span className="rounded-[3px] bg-lime px-1">Paid time off</span>
          </span>
          <span className="mono text-muted" aria-hidden="true">→</span>
          <span className="rounded-full bg-lilac px-4 py-3 text-sm">Small AI model, on this computer</span>
        </div>
        <div className="flex flex-col gap-2" style={{ opacity: out3(seg(0.14, 0.22)) }}>
          <div className="flex h-[84px] items-center gap-0.5 rounded-xl border border-rule bg-card px-1" aria-hidden="true">
            {BARS.map((r, i) => (
              <span
                key={i}
                className="block w-[3px] rounded-sm"
                style={{
                  height: Math.max(2, (8 + r * 62) * grow),
                  background: r > 0.72 ? "var(--color-aub)" : r > 0.4 ? "var(--color-lilac-2)" : "var(--color-rule)",
                }}
              />
            ))}
          </div>
          <span className="text-sm text-body">
            Its fingerprint: <strong className="text-aub">384 numbers</strong> describing what it means (96 shown).
          </span>
        </div>
      </div>

      <figure className="absolute left-[680px] top-[122px] m-0 h-[604px] w-[712px] overflow-hidden rounded-3xl border border-rule bg-card">
        <span className="mono absolute left-6 top-[22px] text-muted">A map of meaning</span>
        {CLUSTERS.map((c, ci) => {
          const a = 0.38 + ci * 0.1;
          return (
            <div key={c.label}>
              <span
                className="absolute rounded-full border border-rule bg-paper px-3 py-1.5 text-[13px] font-semibold"
                style={{ left: c.lx, top: c.ly, opacity: out3(seg(a + 0.06, a + 0.14)) }}
              >
                {c.label}
              </span>
              {c.dots.map((d, j) => {
                const k = backOut(seg(a + j * 0.008, a + 0.08 + j * 0.008), 1.8);
                return (
                  <span
                    key={j}
                    aria-hidden="true"
                    className="absolute block h-3 w-3 rounded-full bg-lilac-2"
                    style={{ left: d.x, top: d.y, opacity: Math.min(1, Math.max(0, k)), transform: `scale(${Math.max(0, k)})` }}
                  />
                );
              })}
            </div>
          );
        })}
        <span
          aria-hidden="true"
          className="absolute left-[203px] top-[221px] box-border block h-3.5 w-3.5 rounded-full border-2 border-aub bg-lime"
          style={{ opacity: Math.min(1, Math.max(0, k12)), transform: `scale(${Math.max(0, k12)})` }}
        />
        <span aria-hidden="true" className="ping absolute left-[203px] top-[221px] box-border block h-3.5 w-3.5 rounded-full border-2 border-aub" style={{ opacity: pin }} />
        <span className="absolute left-[226px] top-[214px] text-xs font-semibold" style={{ opacity: pin }}>Passage 12</span>
        <figcaption className="absolute bottom-[18px] left-6 right-6 m-0 text-sm text-body">
          Similar meaning → similar fingerprint → close together on the map.{" "}
          <span className="text-muted">(A flat sketch of a 384‑dimension space.)</span>
        </figcaption>
      </figure>

      <UnderHood className="absolute left-[680px] top-[742px] w-[712px]" style={{ opacity: out3(seg(0.85, 0.95)) }}>
        sentence‑transformers all‑MiniLM‑L6‑v2 · 384‑dim float32 vectors · runs on CPU (~90 MB) · your text never leaves the machine
      </UnderHood>
    </section>
  );
}
