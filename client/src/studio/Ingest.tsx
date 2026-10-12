"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { EngineError, countPassages, countWords, ingestFile, ingestText, type IngestResult } from "@/api/engine";
import StudioHeader, { HealthPill } from "./StudioHeader";
import { fmtMs } from "./Studio";
import { useEngine } from "./useEngine";

type Phase = { kind: "idle" } | { kind: "working"; step: number } | { kind: "done"; result: IngestResult } | { kind: "error"; message: string };

const STEPS = ["Slice into passages", "Fingerprint each one, on this computer", "Ready for questions"];

export default function Ingest() {
  const router = useRouter();
  const { health } = useEngine();
  const [tab, setTab] = useState<"paste" | "file">("paste");
  const [text, setText] = useState("");
  const [name, setName] = useState("Pasted Document");
  const [file, setFile] = useState<File | null>(null);
  const [fileWords, setFileWords] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [chunkSize, setChunkSize] = useState(200);
  const [overlap, setOverlap] = useState(50);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const fileInput = useRef<HTMLInputElement>(null);

  const words = tab === "paste" ? countWords(text) : fileWords;
  const bad = overlap >= chunkSize;
  const passages = bad ? 0 : countPassages(words, chunkSize, overlap);
  const ready = !bad && words > 0 && phase.kind !== "working";

  useEffect(() => {
    if (!file) {
      setFileWords(0);
      return;
    }
    let alive = true;
    file.text().then((t) => alive && setFileWords(countWords(t)));
    return () => {
      alive = false;
    };
  }, [file]);

  useEffect(() => {
    if (phase.kind !== "working" || phase.step > 0) return;
    const id = window.setTimeout(() => setPhase((p) => (p.kind === "working" ? { kind: "working", step: 1 } : p)), 700);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase.kind !== "done") return;
    const id = window.setTimeout(() => router.push("/studio"), 1600);
    return () => window.clearTimeout(id);
  }, [phase, router]);

  const pickFile = (f: File | undefined | null) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".txt")) {
      setPhase({ kind: "error", message: "Only plain text (.txt) files are supported right now." });
      return;
    }
    setPhase({ kind: "idle" });
    setFile(f);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const submit = async () => {
    if (!ready) return;
    setPhase({ kind: "working", step: 0 });
    try {
      const result =
        tab === "file" && file
          ? await ingestFile(file, chunkSize, overlap)
          : await ingestText({ text, document_name: name.trim() || "Pasted Document", chunk_size: chunkSize, overlap });
      setPhase({ kind: "done", result });
    } catch (err) {
      setPhase({ kind: "error", message: err instanceof EngineError ? err.message : "Something went wrong while reading the document." });
    }
  };

  const tabClass = (on: boolean) => `mono h-10 rounded-full px-5 text-[11px] transition-colors ${on ? "bg-aub text-paper" : "bg-transparent text-muted hover:text-aub"}`;

  return (
    <div className="min-h-dvh bg-paper text-aub">
      <StudioHeader crumb="Studio / New document">
        <HealthPill health={health} />
        <Link href="/studio" className="mono flex h-10 items-center rounded-full border border-aub px-4 text-[11px] text-aub no-underline">
          Back<span className="hidden sm:inline">&nbsp;to questions</span>
        </Link>
      </StudioHeader>

      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-9 px-4 py-10 sm:px-6 sm:py-12">
        <div className="rise-in flex flex-wrap items-end justify-between gap-6">
          <h1 className="disp m-0 text-[clamp(44px,7vw,96px)]">
            Give it something
            <br />
            to <span className="rounded-[0.12em] bg-lime px-[0.1em]">read</span>.
          </h1>
          <p className="m-0 max-w-[420px] text-[17px] leading-[1.55] text-body">
            Paste text or drop a .txt file. Choose how big each passage should be, and see how many you&rsquo;ll get before you start.
          </p>
        </div>

        <div className="flex flex-wrap items-stretch gap-6">
          <section aria-label="Source" className="rise-in flex min-w-0 flex-[999_1_520px] flex-col gap-3.5" style={{ animationDelay: ".08s" }}>
            <div role="tablist" aria-label="Source type" className="flex gap-1 self-start rounded-full border border-rule bg-card p-1">
              <button type="button" role="tab" aria-selected={tab === "paste"} className={tabClass(tab === "paste")} onClick={() => setTab("paste")}>
                Paste text
              </button>
              <button type="button" role="tab" aria-selected={tab === "file"} className={tabClass(tab === "file")} onClick={() => setTab("file")}>
                Upload .txt
              </button>
            </div>

            {tab === "paste" ? (
              <>
                <label htmlFor="doc-name" className="sr-only">Document name</label>
                <input
                  id="doc-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Document name"
                  className="h-12 rounded-2xl border border-rule bg-card px-4 text-[15px] text-aub outline-none focus:border-aub"
                />
                <label htmlFor="doc" className="sr-only">Document text</label>
                <textarea
                  id="doc"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste any text: a handbook, notes, an article…"
                  className="min-h-[300px] w-full resize-y rounded-[20px] border border-rule bg-card p-5 text-base leading-[1.6] text-aub outline-none focus:border-aub"
                />
              </>
            ) : (
              <div
                role="button"
                tabIndex={0}
                aria-label="Choose a .txt file"
                onClick={() => fileInput.current?.click()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInput.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`flex min-h-[300px] cursor-pointer flex-col items-center justify-center gap-3.5 rounded-[20px] border-2 border-dashed p-6 text-center transition-colors ${dragging ? "border-aub bg-lilac-3" : "border-lilac-2 bg-card"}`}
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-aub bg-lime">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2B1736" strokeWidth="2" aria-hidden="true">
                    <path d="M12 16V4M6 10l6-6 6 6M4 20h16" />
                  </svg>
                </span>
                {file ? (
                  <>
                    <span className="break-all text-[20px] font-semibold">{file.name}</span>
                    <span className="mono text-[11px] text-muted">{(file.size / 1024).toFixed(1)} KB · click to choose another</span>
                  </>
                ) : (
                  <>
                    <span className="text-[20px] font-semibold">Drop a .txt file here</span>
                    <span className="mono text-[11px] text-muted">or click to browse · plain text only</span>
                  </>
                )}
                <input ref={fileInput} type="file" accept=".txt,text/plain" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
              </div>
            )}
            <div className="mono flex flex-wrap gap-4 text-[11px] text-muted">
              <span>{words.toLocaleString()} words</span>
              <span>{tab === "file" ? file?.name ?? "No file yet" : name || "Pasted Document"}</span>
            </div>
          </section>

          <section aria-label="Passage settings" className="rise-in box-border flex flex-[1_1_320px] flex-col gap-[22px] rounded-[22px] border border-rule bg-card p-6" style={{ animationDelay: ".16s" }}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cs" className="flex justify-between text-sm font-semibold">
                <span>Passage size</span>
                <span>{chunkSize} words</span>
              </label>
              <input id="cs" type="range" min={50} max={500} step={10} value={chunkSize} onChange={(e) => setChunkSize(Number(e.target.value))} />
              <span className="text-xs text-muted">Bigger passages hold more context per source.</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ov" className="flex justify-between text-sm font-semibold">
                <span>Overlap</span>
                <span>{overlap} words</span>
              </label>
              <input id="ov" type="range" min={0} max={100} step={5} value={overlap} onChange={(e) => setOverlap(Number(e.target.value))} />
              <span className="text-xs text-muted">Words each passage repeats from the one before.</span>
            </div>

            <div className="flex flex-col gap-3 border-t border-rule pt-[18px]">
              <span className="mono text-[11px] text-muted">You&rsquo;ll get</span>
              <div className="flex gap-7">
                <div className="flex flex-col gap-1">
                  <span className="disp text-[48px]">{bad ? "—" : passages.toLocaleString()}</span>
                  <span className="text-[13px] text-muted">passages</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="disp text-[48px]">{bad ? "—" : chunkSize - overlap}</span>
                  <span className="text-[13px] text-muted">new words each</span>
                </div>
              </div>
              <div className="flex h-4 gap-[3px]" aria-hidden="true">
                {Array.from({ length: Math.min(passages, 40) }, (_, i) => (
                  <span key={i} className="block flex-1 rounded-[3px] border-l-4 border-lilac-2 bg-lilac" />
                ))}
              </div>
            </div>

            {bad && (
              <p role="alert" className="m-0 rounded-xl border border-[#B5476B] bg-[#F6E3E8] px-3.5 py-3 text-sm text-[#7A2442]">
                Overlap has to be smaller than the passage size.
              </p>
            )}
            {phase.kind === "error" && (
              <p role="alert" className="m-0 rounded-xl border border-[#B5476B] bg-[#F6E3E8] px-3.5 py-3 text-sm text-[#7A2442]">
                {phase.message}
              </p>
            )}

            <button
              type="button"
              disabled={!ready}
              onClick={submit}
              className="h-[54px] rounded-full border-[1.5px] border-aub bg-lime text-base font-semibold text-aub transition-transform active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {phase.kind === "working" ? "Reading…" : "Read this document →"}
            </button>

            <ol className="m-0 flex list-none flex-col gap-2 p-0 text-[13px] text-body" aria-live="polite">
              {STEPS.map((s, i) => {
                const state =
                  phase.kind === "done" ? "done" : phase.kind === "working" ? (i < phase.step ? "done" : i === phase.step ? "active" : "todo") : "todo";
                return (
                  <li key={s} className="flex items-center gap-2.5">
                    <span
                      className={`mono flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition-colors ${state === "done" ? "bg-aub text-lime" : state === "active" ? "border-[1.5px] border-aub bg-lime" : "border border-rule"}`}
                    >
                      {state === "done" ? "✓" : `0${i + 1}`}
                    </span>
                    <span className={state === "active" ? "font-semibold text-aub" : ""}>
                      {s}
                      {state === "active" && <span className="typing font-mono" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span>}
                    </span>
                  </li>
                );
              })}
            </ol>

            {phase.kind === "working" && (
              <span className="text-xs leading-normal text-muted">The first document can take longer while the model warms up.</span>
            )}
            {phase.kind === "done" && (
              <div className="rise-in flex flex-col gap-1 rounded-2xl bg-aub p-4 text-paper" role="status">
                <span className="text-[15px] font-semibold">
                  Ready: {phase.result.total_chunks.toLocaleString()} passages in {fmtMs(phase.result.ingestion_latency_ms)}
                </span>
                <span className="mono text-[10px] text-mist">
                  Matrix {phase.result.matrix_shape.join(" × ")} · taking you to the questions…
                </span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
