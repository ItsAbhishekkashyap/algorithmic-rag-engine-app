import { backOut, out3, segOf } from "../ease";
import { Eyebrow, type ChapterProps } from "../parts";

const BLOCKS = [
  { n: "01", title: "Slice", text: "Cuts any text into overlapping passages, never mid‑word.", tech: "Pure Python sliding window · O(N)", instead: "LangChain splitters" },
  { n: "02", title: "Understand", text: "Gives each passage a meaning fingerprint, on your own computer.", tech: "all‑MiniLM‑L6‑v2 · 384‑dim · CPU", instead: "paid embedding APIs" },
  { n: "03", title: "Find", text: "Measures closeness in meaning with one line of math.", tech: "NumPy cosine similarity · top‑k", instead: "Pinecone / Chroma" },
  { n: "04", title: "Answer", text: "Writes only from the passages it found, and cites each one.", tech: "Gemini · grounded prompt · fallbacks", instead: "free‑form chatbots" },
];

export default function Ch07Hood({ p }: ChapterProps) {
  const seg = segOf(p);
  const h = out3(seg(0, 0.12));
  const r = out3(seg(0.66, 0.86));

  return (
    <section aria-labelledby="ch07-title" className="absolute inset-0 overflow-hidden bg-paper text-aub">
      <div
        className="absolute left-12 right-12 top-[122px] flex items-end justify-between gap-12"
        style={{ opacity: h, transform: `translateY(${(1 - h) * 50}px)` }}
      >
        <div className="flex flex-col gap-5">
          <Eyebrow>Why it&rsquo;s different</Eyebrow>
          <h2 id="ch07-title" className="disp m-0 text-[76px]">
            No black boxes.
            <br />
            Every step built by hand.
          </h2>
        </div>
        <p className="m-0 mb-2 w-[420px] text-[17px] leading-[1.6] text-body">
          Most AI apps glue big frameworks together. This one builds each of its four engine parts from scratch, so you can see, and
          explain, exactly how an answer is made.
        </p>
      </div>

      <div className="absolute left-12 right-12 top-[390px] grid grid-cols-4 gap-5">
        {BLOCKS.map((b, i) => {
          const k = backOut(seg(0.15 + i * 0.1, 0.32 + i * 0.1), 1.4);
          return (
            <article
              key={b.n}
              className={`box-border flex h-[310px] flex-col gap-3 rounded-[22px] border border-rule p-6 ${i % 2 ? "bg-card" : "bg-card-2"}`}
              style={{ opacity: Math.min(1, Math.max(0, k)), transform: `translateY(${(1 - k) * 80}px)` }}
            >
              <span className="disp text-[44px] text-lilac-2">{b.n}</span>
              <h3 className="m-0 text-[22px] font-bold tracking-[-0.02em]">{b.title}</h3>
              <span className="flex-1 text-[15px] leading-normal text-body">{b.text}</span>
              <span className="block h-px bg-rule" />
              <span className="font-mono text-xs leading-normal">{b.tech}</span>
              <span className="self-start rounded-full bg-lime px-2.5 py-[5px] text-xs font-semibold">Instead of {b.instead}</span>
            </article>
          );
        })}
      </div>

      <div
        className="absolute left-12 right-12 top-[736px] flex h-[68px] items-center gap-3.5 rounded-[18px] bg-aub px-6 text-paper"
        style={{ opacity: r > 0 ? 1 : 0, clipPath: `inset(0 ${(1 - r) * 100}% 0 0 round 18px)` }}
      >
        <span className="whitespace-nowrap text-[17px] font-semibold">Every answer shows its work →</span>
        <span className="mono rounded-full bg-paper/10 px-3 py-2">Found in 18 ms</span>
        <span className="mono rounded-full bg-paper/10 px-3 py-2">Written in 1.1 s</span>
        <span className="mono rounded-full bg-paper/10 px-3 py-2">3 sources</span>
        <span className="mono rounded-full bg-lime px-3 py-2 text-aub">82 · 74 · 61% match</span>
        <span className="mono ml-auto text-mist">sample run</span>
      </div>
    </section>
  );
}
