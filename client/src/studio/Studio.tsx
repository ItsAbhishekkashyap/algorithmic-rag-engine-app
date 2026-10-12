"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { API_URL, EngineError, askQuestion, type QueryResult, type StoreStatus } from "@/api/engine";
import StudioHeader, { DocPill, HealthPill } from "./StudioHeader";
import { RichAnswer, clipEnd, clipStart, supportingSentence } from "./text";
import { useEngine, type Health } from "./useEngine";

type Msg =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "engine"; pending: true }
  | { id: number; role: "engine"; result: QueryResult }
  | { id: number; role: "engine"; error: string; needsDocument: boolean };

const SUGGESTIONS = ["Summarise this document in three points", "What are the most important rules?", "What should a newcomer know first?"];

export const fmtMs = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms)} ms`);

export default function Studio() {
  const { health, status, hasDocument, refresh } = useEngine();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(3);
  const [apiKey, setApiKey] = useState("");
  const [focusId, setFocusId] = useState<number | null>(null);
  const [activeSource, setActiveSource] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  const busy = msgs.some((m) => "pending" in m);
  const results = msgs.filter((m): m is Extract<Msg, { result: QueryResult }> => "result" in m);
  const focused = results.find((m) => m.id === focusId) ?? results[results.length - 1] ?? null;

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const ask = useCallback(
    async (text: string) => {
      const query = text.trim();
      if (!query || busy) return;
      const userId = nextId.current++;
      const engineId = nextId.current++;
      setQuestion("");
      setMsgs((m) => [...m, { id: userId, role: "user", text: query }, { id: engineId, role: "engine", pending: true }]);
      try {
        const result = await askQuestion({ query, top_k: topK, api_key: apiKey.trim() || undefined });
        setMsgs((m) => m.map((x) => (x.id === engineId ? { id: engineId, role: "engine", result } : x)));
        setFocusId(engineId);
        setActiveSource(1);
      } catch (err) {
        const e = err instanceof EngineError ? err : new EngineError("Something went wrong.", 0);
        setMsgs((m) => m.map((x) => (x.id === engineId ? { id: engineId, role: "engine", error: e.message, needsDocument: e.status === 400 } : x)));
        if (e.status === 400) refresh();
      }
    },
    [apiKey, busy, refresh, topK],
  );

  const pickSource = (messageId: number, n: number) => {
    setFocusId(messageId);
    setActiveSource(n);
    setSheetOpen(true);
    requestAnimationFrame(() => document.getElementById(`source-${n}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  return (
    <div className="flex h-dvh flex-col bg-paper text-aub">
      <StudioHeader crumb="Studio">
        <DocPill status={status} />
        <HealthPill health={health} />
        <Link href="/studio/new" className="mono flex h-10 items-center rounded-full bg-aub px-4 text-[11px] text-paper no-underline">
          + New<span className="hidden sm:inline">&nbsp;document</span>
        </Link>
      </StudioHeader>

      <div className="flex min-h-0 flex-1">
        <aside aria-label="Document and settings" className="hidden w-[300px] shrink-0 overflow-y-auto border-r border-rule p-6 lg:block">
          <Settings status={status} hasDocument={hasDocument} topK={topK} setTopK={setTopK} apiKey={apiKey} setApiKey={setApiKey} />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[860px] flex-col gap-7 px-5 py-8 sm:px-10 lg:px-16">
              <details className="rounded-2xl border border-rule bg-card p-4 lg:hidden">
                <summary className="cursor-pointer text-sm font-semibold">Document &amp; settings</summary>
                <div className="mt-4">
                  <Settings status={status} hasDocument={hasDocument} topK={topK} setTopK={setTopK} apiKey={apiKey} setApiKey={setApiKey} />
                </div>
              </details>

              {msgs.length === 0 && <EmptyState health={health} status={status} hasDocument={hasDocument} />}

              {msgs.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="rise-in max-w-[520px] self-end rounded-[20px_20px_4px_20px] bg-lilac px-[18px] py-3.5 text-base leading-normal">
                    {m.text}
                  </div>
                ) : "pending" in m ? (
                  <div key={m.id} className="rise-in flex items-center gap-3 text-sm text-muted" role="status">
                    <span className="block h-2.5 w-2.5 rounded-[3px] border-[1.5px] border-aub bg-lime" />
                    Finding the closest passages and writing an answer
                    <span className="typing font-mono" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span>
                  </div>
                ) : "error" in m ? (
                  <div key={m.id} className="rise-in flex flex-col gap-3 rounded-2xl border border-[#B5476B] bg-[#F6E3E8] p-4 text-[15px] text-[#7A2442]" role="alert">
                    {m.error}
                    {m.needsDocument && (
                      <Link href="/studio/new" className="mono self-start rounded-full border-[1.5px] border-aub bg-lime px-4 py-2.5 text-[11px] text-aub no-underline">
                        + Add a document
                      </Link>
                    )}
                  </div>
                ) : (
                  <Answer key={m.id} result={m.result} selected={focused?.id === m.id} onCite={(n) => pickSource(m.id, n)} onShowSources={() => pickSource(m.id, 1)} />
                ),
              )}
            </div>
          </div>

          <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-[860px] flex-col gap-3 px-5 pb-6 pt-3 sm:px-10 lg:px-16">
            {msgs.length === 0 && hasDocument && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => ask(s)} className="h-9 rounded-full border border-rule bg-card px-3.5 text-[13px] text-aub hover:border-aub">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2.5 rounded-[22px] border-[1.5px] border-aub bg-card py-2.5 pl-[18px] pr-2.5 focus-within:shadow-[0_0_0_4px_rgba(200,241,105,.6)]">
              <label htmlFor="question" className="sr-only">Ask a question</label>
              <textarea
                id="question"
                rows={2}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ask(question);
                  }
                }}
                placeholder={hasDocument ? `Ask anything about ${status?.document_name}…` : "Add a document first, then ask anything…"}
                className="max-h-40 min-h-12 flex-1 resize-none border-0 bg-transparent py-1.5 text-base leading-normal text-aub outline-none placeholder:text-muted focus-visible:outline-none"
              />
              <span className="mono hidden pb-3 text-[11px] text-muted sm:inline">k = {topK}</span>
              <button
                type="submit"
                aria-label="Send question"
                disabled={!question.trim() || busy}
                className="h-11 w-11 shrink-0 rounded-full border-[1.5px] border-aub bg-lime text-lg text-aub transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↑
              </button>
            </div>
            {focused && (
              <button type="button" onClick={() => setSheetOpen(true)} className="mono self-start text-[11px] text-aub underline xl:hidden">
                Sources · {focused.result.retrieved_chunks.length}
              </button>
            )}
          </form>
        </main>

        <aside aria-label="Sources" className="hidden w-[380px] shrink-0 overflow-y-auto border-l border-rule p-6 xl:block">
          <Sources result={focused?.result ?? null} active={activeSource} onPick={setActiveSource} />
        </aside>
      </div>

      {sheetOpen && focused && (
        <div className="fixed inset-0 z-30 xl:hidden" role="dialog" aria-modal="true" aria-label="Sources">
          <button type="button" aria-label="Close sources" className="absolute inset-0 bg-aub/30" onClick={() => setSheetOpen(false)} />
          <div className="rise-in absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-[26px] border-t border-rule bg-card px-5 pb-8 pt-3 shadow-[0_-20px_40px_-30px_rgba(43,23,54,.4)]">
            <div className="mb-3 flex items-center justify-between">
              <span className="mx-auto block h-1 w-10 rounded bg-rule" />
            </div>
            <Sources result={focused.result} active={activeSource} onPick={setActiveSource} onClose={() => setSheetOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function Settings({
  status, hasDocument, topK, setTopK, apiKey, setApiKey,
}: { status: StoreStatus | null; hasDocument: boolean; topK: number; setTopK: (n: number) => void; apiKey: string; setApiKey: (s: string) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <span className="mono text-[11px] text-muted">Your document</span>
        {hasDocument && status ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-4">
            <span className="break-words text-[15px] font-semibold">{status.document_name}</span>
            <dl className="m-0 grid grid-cols-2 gap-3">
              {[
                ["Passages", status.chunks_count.toLocaleString()],
                ["Passage size", `${status.chunk_size} words`],
                ["Overlap", `${status.overlap} words`],
                ["Matrix", `${status.matrix_shape[0]} × ${status.matrix_shape[1]}`],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <dt className="mono text-[10px] text-muted">{k}</dt>
                  <dd className="m-0 text-sm">{v}</dd>
                </div>
              ))}
            </dl>
            {status.last_ingested_at && (
              <span className="text-xs text-muted">Added {new Date(status.last_ingested_at * 1000).toLocaleString()}</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-lilac-2 bg-card p-4">
            <span className="text-sm text-body">No document yet.</span>
            <Link href="/studio/new" className="mono self-start rounded-full border-[1.5px] border-aub bg-lime px-3.5 py-2 text-[11px] text-aub no-underline">
              + Add a document
            </Link>
          </div>
        )}
      </section>
      <section className="flex flex-col gap-2.5">
        <label htmlFor="topk" className="flex justify-between text-sm font-semibold">
          <span>Sources per answer</span>
          <span>{topK}</span>
        </label>
        <input id="topk" type="range" min={1} max={10} value={topK} onChange={(e) => setTopK(Number(e.target.value))} className="w-full" />
        <span className="text-xs leading-normal text-muted">
          More sources = more context, slower answers. <span className="mono text-[10px]">(top_k)</span>
        </span>
      </section>
      <section className="flex flex-col gap-2.5">
        <label htmlFor="key" className="text-sm font-semibold">
          Your Gemini key <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="key"
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Using the server's key"
          className="h-11 rounded-xl border border-rule bg-card px-3 text-sm text-aub outline-none focus:border-aub"
        />
        <span className="text-xs leading-normal text-muted">Sent with each question, never stored.</span>
      </section>
      <span className="mono break-all text-[10px] text-muted">Engine · {API_URL}</span>
    </div>
  );
}

function EmptyState({ health, status, hasDocument }: { health: Health; status: StoreStatus | null; hasDocument: boolean }) {
  if (health === "offline") {
    return (
      <div className="rise-in flex flex-col gap-4 rounded-3xl border border-rule bg-card p-7">
        <h1 className="disp m-0 text-[40px] sm:text-[52px]">The engine is offline.</h1>
        <p className="m-0 text-base leading-[1.6] text-body">
          The Studio couldn&rsquo;t reach the FastAPI backend at <span className="font-mono text-sm">{API_URL}</span>. Start it from the project root:
        </p>
        <code className="block overflow-x-auto rounded-xl bg-aub px-4 py-3 font-mono text-sm text-lime">uvicorn api.main:app --port 8000</code>
      </div>
    );
  }
  if (!hasDocument) {
    return (
      <div className="rise-in flex flex-col items-start gap-5 py-6">
        <h1 className="disp m-0 text-[48px] sm:text-[72px]">
          Give it something to <span className="rounded-[0.12em] bg-lime px-[0.1em]">read</span>.
        </h1>
        <p className="m-0 max-w-[520px] text-[17px] leading-[1.6] text-body">
          Paste text or drop a .txt file. The engine cuts it into passages, fingerprints each one on this machine, and then you can ask anything.
        </p>
        <Link href="/studio/new" className="flex h-[52px] items-center rounded-full border-[1.5px] border-aub bg-lime px-6 font-semibold text-aub no-underline">
          Add a document →
        </Link>
      </div>
    );
  }
  return (
    <div className="rise-in flex flex-col gap-3 py-6">
      <span className="mono text-[11px] text-muted">Ready</span>
      <h1 className="disp m-0 break-words text-[40px] leading-[1.08] sm:text-[60px]">
        Ask anything about <span className="rounded-[0.12em] bg-lime px-[0.1em]">{status?.document_name}</span>.
      </h1>
      <p className="m-0 max-w-[560px] text-base leading-[1.6] text-body">
        Answers come only from the document. Every answer lists the passages it used, with how closely each one matched.
      </p>
    </div>
  );
}

/** Reveals the answer word by word once, so it reads like it's being written. */
function useReveal(text: string) {
  const wordsTotal = useMemo(() => text.split(/(\s+)/), [text]);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(wordsTotal.length);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(wordsTotal.length, Math.floor((t - start) / 14));
      setN(k);
      if (k < wordsTotal.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [wordsTotal]);
  return { shown: wordsTotal.slice(0, n).join(""), done: n >= wordsTotal.length };
}

function Answer({ result, selected, onCite, onShowSources }: { result: QueryResult; selected: boolean; onCite: (n: number) => void; onShowSources: () => void }) {
  const notice = /^⚠️/.test(result.answer.trim());
  const { shown, done } = useReveal(result.answer.replace(/^⚠️\s*/, ""));
  const n = result.retrieved_chunks.length;

  return (
    <article className="rise-in flex flex-col gap-3.5" aria-live="polite">
      <div className="mono flex items-center gap-2.5 text-[11px] text-muted">
        <span className="block h-2.5 w-2.5 rounded-[3px] border-[1.5px] border-aub bg-lime" />
        {notice ? "The engine needs attention" : `Answered from ${n} source${n === 1 ? "" : "s"}`}
      </div>
      <div className={`text-[19px] leading-[1.6] sm:text-[21px] ${notice ? "rounded-2xl bg-lilac/50 p-4 text-base" : ""}`}>
        <RichAnswer text={shown} onCite={onCite} />
        {!done && <span className="caret">|</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!notice &&
          result.retrieved_chunks.map((c) => (
            <button key={c.rank} type="button" onClick={() => onCite(c.rank)} className="flex items-center gap-1.5 rounded-full border border-rule bg-card py-1 pl-1 pr-3 text-xs hover:border-aub">
              <span className="cite m-0">{c.rank}</span>
              {Math.round(c.similarity_score * 100)}% match
            </button>
          ))}
        <span className="mono rounded-full border border-rule px-3 py-[7px] text-[10px] text-body">Found in {fmtMs(result.retrieval_latency_ms)}</span>
        <span className="mono rounded-full border border-rule px-3 py-[7px] text-[10px] text-body">Written in {fmtMs(result.generation_latency_ms)}</span>
        <button type="button" onClick={() => navigator.clipboard?.writeText(result.answer)} className="mono px-2 text-[10px] text-aub underline">
          Copy
        </button>
        {!selected && (
          <button type="button" onClick={onShowSources} className="mono px-2 text-[10px] text-aub underline">
            Show sources
          </button>
        )}
      </div>
    </article>
  );
}

function Sources({ result, active, onPick, onClose }: { result: QueryResult | null; active: number | null; onPick: (n: number) => void; onClose?: () => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  if (!result) {
    return (
      <div className="flex flex-col gap-3">
        <span className="text-[17px] font-bold">Sources</span>
        <p className="m-0 text-sm leading-[1.6] text-body">
          After you ask, the passages the answer was built from appear here, with how closely each one matched your question.
        </p>
      </div>
    );
  }
  const reference = `${result.query} ${result.answer}`;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[17px] font-bold">Sources</span>
        {onClose ? (
          <button type="button" onClick={onClose} className="mono text-[11px] text-aub underline">Close</button>
        ) : (
          <span className="mono text-[11px] text-muted">Why you can trust it</span>
        )}
      </div>
      {result.retrieved_chunks.map((c) => {
        const pct = Math.max(0, Math.round(c.similarity_score * 100));
        const lit = (active ?? 1) === c.rank;
        const open = expanded === c.rank;
        const s = supportingSentence(c.chunk_text, reference);
        return (
          <article
            key={c.rank}
            id={`source-${c.rank}`}
            onClick={() => onPick(c.rank)}
            className="flex cursor-pointer flex-col gap-2.5 rounded-2xl bg-card p-4 transition-colors"
            style={{ border: lit ? "1.5px solid var(--color-aub)" : "1.5px solid var(--color-rule)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-semibold">
                <span className="cite ml-0">{c.rank}</span> Passage #{c.chunk_id}
              </span>
              <span className="mono text-[11px]">{pct}%</span>
            </div>
            <span className="block h-1.5 rounded-[3px] bg-sand">
              <span className="block h-1.5 rounded-[3px] bg-aub transition-[width] duration-700" style={{ width: `${pct}%` }} />
            </span>
            <p className="m-0 text-sm leading-[1.55] text-body">
              {open ? s.pre : clipStart(s.pre, 140)}
              <mark className="rounded-[3px] bg-lime px-0.5 text-aub">{s.hit}</mark>
              {open ? s.post : clipEnd(s.post, 160)}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(open ? null : c.rank);
              }}
              className="mono self-start text-[10px] text-aub underline"
            >
              {open ? "Show less" : "Read the full passage"}
            </button>
          </article>
        );
      })}
      <span className="mono text-[10px] text-muted">% = how close in meaning (cosine similarity)</span>
    </div>
  );
}
