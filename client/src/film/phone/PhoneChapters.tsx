import { backOut, bounceOut, io3, out3, rng, segOf } from "../ease";
import { ChapterLink, Eyebrow, StudioLink, UnderHood, type ChapterProps } from "../parts";
import { QUESTION } from "../desktop/Ch04Ask";
import { streamAnswer } from "../desktop/Ch06Answer";
import { TRY_STEPS } from "../desktop/Ch08Try";

const wrap = "absolute inset-0 overflow-hidden";
const head = "absolute left-4 right-4 top-[92px] flex flex-col";
const rise = (k: number, d = 40) => ({ opacity: k, transform: `translateY(${(1 - k) * d}px)` });

export function Ph00Hook({ p, introDelay = 0.2 }: ChapterProps & { introDelay?: number }) {
  const e = Math.pow(Math.max(0, Math.min(1, p)), 2);
  const widths = [92, 80, 95, 0, 88, 70, 84];
  return (
    <section aria-labelledby="ph00-title" className={`${wrap} bg-paper text-aub`}>
      <div className={`${head} gap-[18px]`} style={{ transform: `translateY(${-e * 120}px)`, opacity: 1 - e }}>
        <Eyebrow className="text-[11px]">A RAG engine, explained</Eyebrow>
        <h1 id="ph00-title" className="disp m-0 text-[58px]">
          <span className="line"><span style={{ animationDelay: `${introDelay}s` }}>Ask your</span></span>
          <span className="line"><span style={{ animationDelay: `${introDelay + 0.12}s` }}>documents</span></span>
          <span className="line"><span style={{ animationDelay: `${introDelay + 0.24}s` }}><span className="rounded-[0.1em] bg-lime px-[0.08em]">anything.</span></span></span>
        </h1>
        <p className="m-0 text-base leading-[1.55] text-body">
          It reads a long document and answers your questions using only what&rsquo;s written there, showing exactly where each answer came from.
        </p>
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 top-[440px] h-[260px]">
        <div className="absolute left-[78px] top-[18px] h-[220px] w-[250px] rounded-xl border border-rule bg-sand" style={{ transform: `rotate(${4 + e * 10}deg)` }} />
        <div className="absolute left-[70px] top-2.5 box-border flex h-[220px] w-[250px] flex-col gap-2.5 rounded-xl border border-rule bg-card p-5">
          <span className="mono text-[9px] text-muted">Handbook · page 12</span>
          <span className="text-[13px] font-semibold">4.2 Paid time off</span>
          {widths.map((w, i) => (
            <span key={i} className="block h-1.5 rounded-[3px]" style={{ width: `${w || 2}%`, background: i === 4 ? "var(--color-lime)" : w ? "var(--color-line)" : "transparent" }} />
          ))}
        </div>
        <div className="float absolute -top-3.5 left-4 max-w-[230px] rounded-[16px_16px_16px_4px] bg-aub px-3.5 py-2.5 text-sm leading-[1.35] text-paper" style={{ translate: `${-e * 60}px 0` }}>
          How many vacation days do I get?
        </div>
        <div className="float absolute bottom-0 right-4 max-w-[220px] rounded-[16px_16px_4px_16px] bg-lilac px-3.5 py-2.5 text-sm leading-[1.35]" style={{ animationDelay: "-2s", translate: `${e * 60}px 0` }}>
          15 days of paid time off. <span className="mono rounded-[3px] bg-lime px-[5px] py-px text-[10px]">page 12</span>
        </div>
      </div>
      <ChapterLink to={1} className="mono absolute left-4 right-4 top-[712px] flex h-12 items-center justify-center rounded-full border-[1.5px] border-aub bg-lime text-[11px] text-aub no-underline" style={{ opacity: 1 - e }}>
        See how it works ↓
      </ChapterLink>
    </section>
  );
}

export function Ph01Problem({ p }: ChapterProps) {
  const seg = segOf(p);
  const word = "vacation";
  const h = out3(seg(0, 0.15)), ex = out3(seg(0.36, 0.5)), t = out3(seg(0.78, 0.92));
  return (
    <section aria-labelledby="ph01-title" className={`${wrap} bg-paper text-aub`}>
      <div className={`${head} gap-4`} style={rise(h)}>
        <Eyebrow className="text-[11px]">The problem</Eyebrow>
        <h2 id="ph01-title" className="disp m-0 text-[44px]">Reading takes hours. Ctrl+F misses the point.</h2>
      </div>
      <div className="absolute left-4 right-4 top-[318px] box-border flex h-[52px] items-center gap-2.5 rounded-[14px] border border-rule bg-card px-3.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B5F70" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
        <span className="flex-1 text-[17px]">{word.slice(0, Math.round(seg(0.08, 0.26) * word.length))}<span className="caret">|</span></span>
        <span className="mono text-[11px] text-muted" style={{ opacity: out3(seg(0.27, 0.33)) }}>0 results</span>
      </div>
      <div className="absolute left-4 right-4 top-[388px] flex flex-col gap-2 rounded-2xl border border-rule bg-card p-[18px]" style={rise(ex, 30)}>
        <span className="mono text-[9px] text-muted">Handbook · page 12 · 4.2 Paid time off</span>
        <p className="m-0 text-[17px] leading-normal">
          Full‑time employees earn 15 days of <span className="hl-sweep px-0.5" style={{ backgroundSize: `${Math.round(seg(0.52, 0.68) * 100)}% 100%` }}>paid time off</span> in their first year.
        </p>
      </div>
      <p className="absolute left-4 right-4 top-[530px] m-0 text-[15px] leading-normal text-body" style={{ opacity: out3(seg(0.66, 0.76)) }}>
        ↳ The answer was there all along. It just used <em>different words</em>.
      </p>
      <p className="disp absolute left-4 right-4 top-[612px] m-0 text-[32px] leading-[1.02]" style={rise(t, 24)}>
        You need search that understands <span className="rounded-[0.1em] bg-lime px-[0.08em]">meaning</span>, not spelling.
      </p>
    </section>
  );
}

export function Ph02Slice({ p }: ChapterProps) {
  const seg = segOf(p);
  const titles = ["Welcome", "Hours", "Paid time off", "Carry‑over", "Sick leave", "Parental", "Holidays", "Remote"];
  const h = out3(seg(0, 0.14));
  return (
    <section aria-labelledby="ph02-title" className={`${wrap} bg-paper text-aub`}>
      <div className={`${head} gap-3.5`} style={rise(h)}>
        <Eyebrow className="text-[11px]">Step 1 of 5 — Slice</Eyebrow>
        <h2 id="ph02-title" className="disp m-0 text-[40px]">First, it cuts the document into small passages.</h2>
        <p className="m-0 text-[15px] leading-[1.55] text-body">Like cutting a book into index cards: about 200 words each, and each repeats the last 50 words of the one before, so no sentence is lost.</p>
      </div>
      <div className="absolute left-4 right-4 top-[388px] h-10 overflow-hidden rounded-[10px] border border-rule bg-card" aria-hidden="true">
        <span className="absolute left-3 right-3 top-3 block h-1.5 rounded-[3px] bg-line" />
        <span className="absolute left-3 top-6 block h-1.5 w-[70%] rounded-[3px] bg-line" />
        {[1, 2, 3].map((i) => (
          <span key={i} className="absolute top-0 block h-10 w-0.5 origin-top bg-aub" style={{ left: i * 89, transform: `scaleY(${out3(seg(0.12 + i * 0.04, 0.22 + i * 0.04))})` }} />
        ))}
      </div>
      <div className="absolute left-4 top-[446px] grid w-[358px] grid-cols-4 gap-3">
        {titles.map((t, i) => {
          const k = backOut(seg(0.36 + i * 0.05, 0.48 + i * 0.05), 1.4);
          const first = i % 4 === 0;
          return (
            <div key={t} className="relative box-border flex h-[110px] flex-col gap-1.5 overflow-hidden rounded-[10px] bg-card pb-2 pr-2 pt-2.5"
              style={{ border: `1.5px solid ${i === 2 ? "var(--color-aub)" : "var(--color-rule)"}`, paddingLeft: first ? 8 : 18, opacity: Math.min(1, Math.max(0, k * 1.4)), transform: `translateY(${(1 - k) * -60}px)` }}>
              {!first && <span className="absolute inset-y-0 left-0 block w-3 bg-lilac-3" />}
              <span className="mono relative text-[9px] text-muted">#{10 + i}</span>
              <span className={`relative rounded-[3px] px-[3px] py-px text-[11px] font-semibold leading-tight ${i === 2 ? "bg-lime" : ""}`}>{t}</span>
              <span className="relative block h-1 rounded-sm bg-line" />
              <span className="relative block h-1 w-[80%] rounded-sm bg-line" />
            </div>
          );
        })}
      </div>
      <UnderHood small className="absolute left-4 right-4 top-[694px]" style={{ opacity: out3(seg(0.85, 0.95)) }}>
        Sliding‑window chunker · 200 / 50 words · pure Python, O(N)
      </UnderHood>
    </section>
  );
}

const pr = rng(31);
const PH_BARS = Array.from({ length: 52 }, () => pr());
const PH_CLUSTERS = [
  { label: "Time off", cx: 100, cy: 115, lx: 40, ly: 44 },
  { label: "Pay & benefits", cx: 262, cy: 105, lx: 210, ly: 44 },
  { label: "Rules", cx: 256, cy: 220, lx: 240, ly: 272 },
  { label: "Remote work", cx: 96, cy: 222, lx: 30, ly: 272 },
].map((c) => ({
  ...c,
  dots: Array.from({ length: 8 }, () => {
    const ang = pr() * Math.PI * 2, rad = 10 + pr() * 36;
    return { x: Math.round(c.cx + Math.cos(ang) * rad), y: Math.round(c.cy + Math.sin(ang) * rad) };
  }),
}));

export function Ph03Understand({ p }: ChapterProps) {
  const seg = segOf(p);
  const grow = backOut(seg(0.14, 0.34), 1.8), k12 = backOut(seg(0.38, 0.46), 1.8), pin = out3(seg(0.75, 0.85));
  return (
    <section aria-labelledby="ph03-title" className={`${wrap} bg-paper text-aub`}>
      <div className={`${head} gap-3.5`} style={rise(out3(seg(0, 0.14)))}>
        <Eyebrow className="text-[11px]">Step 2 of 5 — Understand</Eyebrow>
        <h2 id="ph03-title" className="disp m-0 text-[38px]">Then it gives every passage a meaning fingerprint.</h2>
      </div>
      <div className="absolute left-4 right-4 top-[262px] flex flex-col gap-2" style={{ opacity: out3(seg(0.08, 0.18)) }}>
        <div aria-hidden="true" className="flex h-16 items-center gap-[3px] rounded-xl border border-rule bg-card px-2">
          {PH_BARS.map((r, i) => (
            <span key={i} className="block w-[3px] rounded-sm" style={{ height: Math.max(2, (6 + r * 46) * grow), background: r > 0.72 ? "var(--color-aub)" : r > 0.4 ? "var(--color-lilac-2)" : "var(--color-rule)" }} />
          ))}
        </div>
        <span className="text-sm leading-[1.45] text-body">A small AI model writes <strong className="text-aub">384 numbers</strong> describing what each passage means. Similar meaning, similar numbers.</span>
      </div>
      <figure aria-hidden="true" className="absolute left-4 top-[410px] m-0 h-[310px] w-[358px] overflow-hidden rounded-[20px] border border-rule bg-card">
        <span className="mono absolute left-4 top-3.5 text-[10px] text-muted">A map of meaning</span>
        {PH_CLUSTERS.map((c, ci) => {
          const a = 0.38 + ci * 0.1;
          return (
            <div key={c.label}>
              <span className="absolute rounded-full border border-rule bg-paper px-2 py-1 text-[11px] font-semibold" style={{ left: c.lx, top: c.ly, opacity: out3(seg(a + 0.06, a + 0.14)) }}>{c.label}</span>
              {c.dots.map((d, j) => {
                const k = backOut(seg(a + j * 0.008, a + 0.08 + j * 0.008), 1.8);
                return <span key={j} className="absolute block h-2.5 w-2.5 rounded-full bg-lilac-2" style={{ left: d.x, top: d.y, opacity: Math.min(1, Math.max(0, k)), transform: `scale(${Math.max(0, k)})` }} />;
              })}
            </div>
          );
        })}
        <span className="absolute left-[99px] top-[109px] box-border block h-3 w-3 rounded-full border-2 border-aub bg-lime" style={{ opacity: Math.min(1, Math.max(0, k12)), transform: `scale(${Math.max(0, k12)})` }} />
        <span className="ping absolute left-[99px] top-[109px] box-border block h-3 w-3 rounded-full border-2 border-aub" style={{ opacity: pin }} />
        <span className="absolute left-[118px] top-[104px] text-[11px] font-semibold" style={{ opacity: pin }}>Passage 12</span>
      </figure>
      <span className="mono absolute left-4 right-4 top-[732px] text-[10px] text-muted" style={{ opacity: out3(seg(0.85, 0.95)) }}>Under the hood · MiniLM‑L6‑v2 · 384‑dim · on CPU</span>
    </section>
  );
}

export function Ph04Ask({ p }: ChapterProps) {
  const seg = segOf(p);
  const n = Math.round(seg(0.05, 0.5) * QUESTION.length);
  const b = out3(seg(0.52, 0.64)), pin = seg(0.66, 0.84);
  const pts: [number, number][] = [[150, 70], [220, 120], [130, 120], [250, 80], [190, 50], [110, 85], [230, 160], [30, 150], [320, 40]];
  return (
    <section aria-labelledby="ph04-title" className={`${wrap} bg-aub text-paper`}>
      <div className={`${head} gap-3`} style={{ opacity: out3(seg(0, 0.1)) }}>
        <Eyebrow dark className="text-[11px]">Step 3 of 5 — Ask</Eyebrow>
        <h2 id="ph04-title" className="disp m-0 text-[30px] text-mist">Now you ask, in your own words.</h2>
      </div>
      <p className="disp absolute left-4 right-4 top-[190px] m-0 text-[40px] leading-none" aria-label={QUESTION}>
        <span aria-hidden="true">“{QUESTION.slice(0, n)}<span className="caret text-lime">|</span><span className="text-paper/15">{QUESTION.slice(n)}</span>”</span>
      </p>
      <div className="absolute left-4 right-4 top-[410px] flex flex-col gap-2" style={rise(b, 24)}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-xl border border-paper/25 px-3 py-2 text-sm">You: “vacation”</span>
          <span className="mono text-mist">≈</span>
          <span className="rounded-xl border border-paper/25 px-3 py-2 text-sm">Handbook: “paid time off”</span>
        </div>
        <span className="self-start rounded-xl bg-lime px-3 py-2 text-sm font-semibold text-aub">Same meaning, same place on the map</span>
      </div>
      <div aria-hidden="true" className="absolute left-4 top-[540px] h-[200px] w-[358px] overflow-hidden rounded-[20px] bg-plum" style={{ opacity: out3(seg(0.56, 0.66)) }}>
        <span className="mono absolute left-4 top-3.5 text-[10px] text-mist">The map · time‑off area</span>
        {pts.map(([x, y], i) => <span key={i} className="absolute block h-2.5 w-2.5 rounded-full" style={{ left: x, top: y, background: i > 6 ? "rgba(244,241,234,.18)" : "var(--color-lilac-2)" }} />)}
        <div className="absolute left-[180px] top-[90px]" style={{ transform: `translateY(${(1 - bounceOut(pin)) * -110}px)`, opacity: pin > 0 ? 1 : 0 }}>
          <span className="block h-[18px] w-[18px] -rotate-45 rounded-[50%_50%_50%_0] bg-lime shadow-[0_0_0_6px_rgba(200,241,105,.2)]" />
          <span className="absolute -top-px left-[26px] whitespace-nowrap text-xs font-semibold text-lime">Your question</span>
        </div>
      </div>
    </section>
  );
}

export function Ph05Find({ p }: ChapterProps) {
  const seg = segOf(p);
  const data: [string, string, number][] = [["12", "Paid time off", 82], ["13", "Carry‑over rules", 74], ["27", "Public holidays", 61], ["19", "Remote work", 38], ["08", "Health insurance", 33]];
  const hl = io3(seg(0.62, 0.78));
  return (
    <section aria-labelledby="ph05-title" className={`${wrap} bg-paper text-aub`}>
      <div className={`${head} gap-3.5`} style={rise(out3(seg(0, 0.12)))}>
        <Eyebrow className="text-[11px]">Step 4 of 5 — Find</Eyebrow>
        <h2 id="ph05-title" className="disp m-0 text-[40px]">It picks the passages closest in meaning.</h2>
      </div>
      <div className="absolute left-4 right-4 top-[290px] flex flex-col gap-2">
        <span className="mono text-[10px] text-muted">Every passage, scored against your question</span>
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {data.map(([id, t, pct], i) => {
            const f = out3(seg(0.15 + i * 0.07, 0.3 + i * 0.07)), top = i < 3, lit = top && hl > 0.5;
            return (
              <li key={id} className="box-border grid h-[62px] grid-cols-[minmax(0,1fr)_46px] items-center gap-2.5 rounded-[14px] px-3.5"
                style={{ background: lit ? "var(--color-card)" : "transparent", border: `1.5px solid ${lit ? "var(--color-aub)" : "var(--color-rule)"}`, opacity: top ? 1 : 1 - 0.55 * hl, transform: `translateX(${top ? 0 : 10 * hl}px)` }}>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="truncate text-sm font-semibold">#{id} · {t}</span>
                  <span className="block h-1.5 overflow-hidden rounded-[3px] bg-sand"><span className="block h-1.5 rounded-[3px]" style={{ width: `${pct * f}%`, background: top ? "var(--color-aub)" : "var(--color-lilac-2)" }} /></span>
                </div>
                <span className="text-right font-mono text-sm">{Math.round(pct * f)}%</span>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="disp absolute left-4 right-4 top-[676px] m-0 text-[26px]" style={{ opacity: out3(seg(0.78, 0.88)) }}>
        The top 3 win. <span className="text-muted">The rest is ignored.</span>
      </p>
      <span className="mono absolute left-4 right-4 top-[728px] text-[10px] leading-normal text-muted" style={{ opacity: out3(seg(0.86, 0.96)) }}>Under the hood · cosine similarity in NumPy · no vector database</span>
    </section>
  );
}

export function Ph06Answer({ p }: ChapterProps) {
  const seg = segOf(p);
  const parts = streamAnswer(p, ["You get 15 days of paid time off in your first year, earned at 1.25 days per month.", " Up to 5 unused days carry over."], 0.2, 0.68);
  const s = out3(seg(0.08, 0.2)), g = out3(seg(0.78, 0.88));
  return (
    <section aria-labelledby="ph06-title" className={`${wrap} bg-paper text-aub`}>
      <div className={`${head} gap-3`} style={rise(out3(seg(0, 0.12)))}>
        <Eyebrow className="text-[11px]">Step 5 of 5 — Answer</Eyebrow>
        <h2 id="ph06-title" className="disp m-0 text-[34px]">An AI writes the answer, using only those 3 passages.</h2>
      </div>
      <div className="absolute left-4 right-4 top-[252px] flex flex-col gap-2.5 rounded-[18px] border border-rule bg-card p-[18px]">
        <span className="mono text-[10px] text-muted">Answer</span>
        <p className="m-0 min-h-[135px] text-[18px] leading-normal">
          {parts.map((part, i) => <span key={i}>{part.text}{part.cited && <span className="cite">{i + 1}</span>}</span>)}
          <span className="caret">|</span>
        </p>
      </div>
      <div className="absolute left-4 right-4 top-[476px] flex flex-col gap-1.5 rounded-2xl border-[1.5px] border-aub bg-card p-3.5" style={{ opacity: s, transform: `translateX(${(1 - s) * -30}px)` }}>
        <span className="mono text-[9px] text-muted"><span className="cite ml-0">1</span> Passage 12 · 82% match</span>
        <span className="text-sm leading-normal">Full‑time employees earn <span className="hl-sweep" style={{ backgroundSize: `${Math.round(seg(parts[0].doneAt, parts[0].doneAt + 0.08) * 100)}% 100%` }}>15 days of paid time off in their first year</span>.</span>
      </div>
      <div className="absolute left-4 right-4 top-[600px] flex flex-col gap-2 rounded-2xl bg-aub p-3.5 text-paper" style={rise(g, 24)}>
        <span className="mono text-[10px] text-mist">If the answer isn’t there</span>
        <span className="text-sm">“What’s the CEO’s salary?”</span>
        <span className="self-start rounded-[10px] bg-lime px-2.5 py-1.5 text-sm font-semibold text-aub">“The handbook doesn’t say.”</span>
      </div>
      <span className="mono absolute left-4 right-4 top-[736px] text-[10px] leading-normal text-muted" style={{ opacity: out3(seg(0.88, 0.97)) }}>Under the hood · Gemini 2.0 Flash · grounded prompt</span>
    </section>
  );
}

export function Ph07Hood({ p }: ChapterProps) {
  const seg = segOf(p);
  const rows = [["01", "Slice", "Cuts text into overlapping passages.", "LangChain"], ["02", "Understand", "Meaning fingerprints, on your computer.", "paid APIs"], ["03", "Find", "Closeness with one line of NumPy math.", "Pinecone"], ["04", "Answer", "Only from what it found, with sources.", "guessing"]];
  const r = out3(seg(0.66, 0.86));
  return (
    <section aria-labelledby="ph07-title" className={`${wrap} bg-paper text-aub`}>
      <div className={`${head} gap-3`} style={rise(out3(seg(0, 0.12)))}>
        <Eyebrow className="text-[11px]">Why it&rsquo;s different</Eyebrow>
        <h2 id="ph07-title" className="disp m-0 text-[40px]">No black boxes. Every step built by hand.</h2>
      </div>
      <div className="absolute left-4 right-4 top-[262px] flex flex-col gap-2.5">
        {rows.map(([n, t, d, i], idx) => (
          <article key={n} className="grid grid-cols-[34px_minmax(0,1fr)] items-start gap-2.5 rounded-2xl border border-rule bg-card px-3.5 py-3" style={rise(out3(seg(0.15 + idx * 0.1, 0.3 + idx * 0.1)))}>
            <span className="disp text-[24px] text-lilac-2">{n}</span>
            <div className="flex flex-col gap-1">
              <h3 className="m-0 text-base font-bold">{t}</h3>
              <span className="text-[13px] leading-[1.45] text-body">{d}</span>
              <span className="self-start rounded-full bg-lime px-2 py-[3px] text-[11px] font-semibold">Instead of {i}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="absolute left-4 right-4 top-[664px] flex flex-wrap items-center gap-1.5 rounded-2xl bg-aub p-3.5 text-paper" style={{ opacity: r > 0 ? 1 : 0, clipPath: `inset(0 ${(1 - r) * 100}% 0 0 round 16px)` }}>
        <span className="w-full text-sm font-semibold">Every answer shows its work</span>
        <span className="mono rounded-full bg-paper/10 px-[9px] py-1.5 text-[10px]">Found 18 ms</span>
        <span className="mono rounded-full bg-paper/10 px-[9px] py-1.5 text-[10px]">Written 1.1 s</span>
        <span className="mono rounded-full bg-lime px-[9px] py-1.5 text-[10px] text-aub">3 sources</span>
      </div>
    </section>
  );
}

export function Ph08Try({ p }: ChapterProps) {
  const seg = segOf(p);
  const disc = Math.max(0.15, 0.15 + 0.85 * backOut(seg(0.5, 0.75), 1.8));
  return (
    <section aria-labelledby="ph08-title" className={`${wrap} bg-aub text-paper`}>
      <div className={`${head} gap-3.5`} style={rise(out3(seg(0.02, 0.22)), 50)}>
        <Eyebrow dark className="text-[11px]">Your turn</Eyebrow>
        <h2 id="ph08-title" className="disp m-0 text-[52px]">Try it with your <span className="rounded-[0.1em] bg-lime px-[0.08em] text-aub">own</span> document.</h2>
      </div>
      <ol className="absolute left-4 right-4 top-[330px] m-0 flex list-none flex-col gap-3 p-0">
        {TRY_STEPS.map((t, i) => (
          <li key={t} className="flex items-center gap-3" style={rise(out3(seg(0.25 + i * 0.08, 0.37 + i * 0.08)), 24)}>
            <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-lime font-bold text-aub">{i + 1}</span>
            <span className="text-base leading-[1.4]">{t}</span>
          </li>
        ))}
      </ol>
      <StudioLink label="Open the Studio" className="absolute left-[95px] top-[540px] flex h-[200px] w-[200px] items-center justify-center rounded-full bg-lime text-aub no-underline" style={{ transform: `scale(${disc})` }}>
        <svg className="spin absolute left-2.5 top-2.5" width="180" height="180" viewBox="0 0 180 180" aria-hidden="true">
          <defs><path id="ring-p" d="M90,90 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" /></defs>
          <text fontFamily="var(--font-mono)" fontSize="11" letterSpacing="3" fill="#2B1736"><textPath href="#ring-p">OPEN THE STUDIO · ASK YOUR DOCUMENT ·</textPath></text>
        </svg>
        <span className="disp relative text-[52px]" aria-hidden="true">→</span>
      </StudioLink>
    </section>
  );
}
