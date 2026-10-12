"use client";

import gsap from "gsap";
import Lenis from "lenis";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type MouseEvent } from "react";
import Ch00Hook from "./desktop/Ch00Hook";
import Ch01Problem from "./desktop/Ch01Problem";
import Ch02Slice from "./desktop/Ch02Slice";
import Ch03Understand from "./desktop/Ch03Understand";
import Ch04Ask from "./desktop/Ch04Ask";
import Ch05Find from "./desktop/Ch05Find";
import Ch06Answer from "./desktop/Ch06Answer";
import Ch07Hood from "./desktop/Ch07Hood";
import Ch08Try from "./desktop/Ch08Try";
import { FilmNavContext, type ChapterProps } from "./parts";
import { Ph00Hook, Ph01Problem, Ph02Slice, Ph03Understand, Ph04Ask, Ph05Find, Ph06Answer, Ph07Hood, Ph08Try } from "./phone/PhoneChapters";
import { CHAPTERS, STARTS, TOTAL, frameAt, type Frame } from "./timeline";

type Chapter = ComponentType<ChapterProps & { introDelay?: number }>;
const DESKTOP: Chapter[] = [Ch00Hook, Ch01Problem, Ch02Slice, Ch03Understand, Ch04Ask, Ch05Find, Ch06Answer, Ch07Hood, Ch08Try];
const PHONE: Chapter[] = [Ph00Hook, Ph01Problem, Ph02Slice, Ph03Understand, Ph04Ask, Ph05Find, Ph06Answer, Ph07Hood, Ph08Try];

const INTRO_MS = 2500;
const PAPER: [number, number, number] = [244, 241, 234];
const AUBERGINE: [number, number, number] = [43, 23, 54];
const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
const isPhone = (w: number, h: number) => w < 760 || w / h < 0.75;

export default function Film() {
  const router = useRouter();
  const [u, setU] = useState(0);
  const [vp, setVp] = useState({ w: 1440, h: 900 });
  const [reduced, setReduced] = useState(false);
  const [intro, setIntro] = useState(false);
  const [leaving, setLeaving] = useState<{ x: number; y: number } | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  // Viewport, motion preference and first-visit intro.
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    try {
      if (!mq.matches && !sessionStorage.getItem("rag-intro-seen")) {
        setIntro(true);
        sessionStorage.setItem("rag-intro-seen", "1");
      }
    } catch {
      /* storage unavailable: skip the intro */
    }
    router.prefetch("/studio");
    return () => window.removeEventListener("resize", onResize);
  }, [router]);

  // Lenis smooth scroll, driven by GSAP's ticker.
  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
    lenisRef.current = lenis;
    lenis.on("scroll", (l: Lenis) => setU((l.scroll / window.innerHeight) * 100));
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const hash = window.location.hash.match(/^#ch0(\d)$/);
    if (hash) lenis.scrollTo((STARTS[Number(hash[1])] / 100) * window.innerHeight, { immediate: true });

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  // Hold the page still while the intro plays.
  useEffect(() => {
    if (!intro) return;
    const lenis = lenisRef.current;
    lenis?.stop();
    const id = window.setTimeout(() => {
      lenis?.start();
      setIntro(false);
    }, INTRO_MS + 400);
    return () => window.clearTimeout(id);
  }, [intro]);

  const goTo = useCallback((chapter: number) => {
    const lenis = lenisRef.current;
    const target = (STARTS[chapter] / 100) * window.innerHeight;
    if (!lenis) {
      window.scrollTo({ top: target });
      return;
    }
    const distance = Math.abs(lenis.scroll - target) / window.innerHeight;
    lenis.scrollTo(target, { duration: Math.min(4, Math.max(1.2, distance * 0.35)), easing: (t) => 1 - Math.pow(1 - t, 4) });
  }, []);

  const openStudio = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      setLeaving({ x: e.clientX || window.innerWidth / 2, y: e.clientY || window.innerHeight / 2 });
    },
    [],
  );

  // Expanding-disc transition into the Studio.
  useEffect(() => {
    if (!leaving || !curtainRef.current) return;
    lenisRef.current?.stop();
    const { x, y } = leaving;
    const tween = gsap.fromTo(
      curtainRef.current,
      { clipPath: `circle(0px at ${x}px ${y}px)` },
      {
        clipPath: `circle(${Math.hypot(window.innerWidth, window.innerHeight)}px at ${x}px ${y}px)`,
        duration: 0.9,
        ease: "expo.inOut",
        onComplete: () => router.push("/studio"),
      },
    );
    return () => {
      tween.kill();
    };
  }, [leaving, router]);

  const nav = useMemo(() => ({ goTo, openStudio }), [goTo, openStudio]);

  const phone = isPhone(vp.w, vp.h);
  const W = phone ? 390 : 1440;
  const H = phone ? 844 : 900;
  const sc = Math.min(vp.w / W, vp.h / H);
  const set = phone ? PHONE : DESKTOP;
  const introDelay = intro ? INTRO_MS / 1000 : 0.2;

  if (reduced) {
    return (
      <FilmNavContext.Provider value={nav}>
        <main className="bg-paper">
          {set.map((Chapter, i) => (
            <div key={i} id={`ch0${i}`} className="relative overflow-hidden" style={{ height: H * sc, background: CHAPTERS[i].dark ? "var(--color-aub)" : "var(--color-paper)" }}>
              <div className="absolute" style={{ left: (vp.w - W * sc) / 2, top: 0, width: W, height: H, transform: `scale(${sc})`, transformOrigin: "0 0" }}>
                <Chapter p={i === 0 ? 0 : 1} />
              </div>
            </div>
          ))}
        </main>
      </FilmNavContext.Provider>
    );
  }

  const f = frameAt(u, phone);
  const dark = f.darkness > 0.5;
  const fg = dark ? "var(--color-paper)" : "var(--color-aub)";
  const bg = mix(PAPER, AUBERGINE, f.darkness);

  return (
    <FilmNavContext.Provider value={nav}>
      <main>
        <StoryTranscript />
        <div aria-hidden="true" style={{ height: ((TOTAL + 100) / 100) * vp.h }} />

        <div className="fixed inset-0 overflow-hidden" style={{ background: bg }}>
          <div className="absolute" style={{ left: (vp.w - W * sc) / 2, top: (vp.h - H * sc) / 2, width: W, height: H, transform: `scale(${sc})`, transformOrigin: "0 0" }}>
            {f.layers.map((layer, i) => {
              if (!layer.mounted) return null;
              const Chapter = set[i];
              return (
                <div key={`${phone ? "p" : "d"}${i}`} className="absolute inset-0" style={{ opacity: layer.opacity, transform: `translateY(${layer.y}px) scale(${layer.scale})` }}>
                  <Chapter p={layer.p} introDelay={introDelay} />
                </div>
              );
            })}

            <TitleCard frame={f} phone={phone} fg={fg} />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute box-border border-2 border-aub bg-lime shadow-[0_10px_40px_rgba(200,241,105,.5)]"
              style={{ left: f.mark.x, top: f.mark.y, width: f.mark.w, height: f.mark.h, borderRadius: f.mark.r, opacity: f.mark.opacity }}
            />

            {phone ? <PhoneHud frame={f} fg={fg} dark={dark} goTo={goTo} openStudio={openStudio} /> : <DesktopHud frame={f} fg={fg} dark={dark} u={u} goTo={goTo} openStudio={openStudio} />}
          </div>
        </div>

        {intro && <Preloader />}
        {leaving && <div ref={curtainRef} aria-hidden="true" className="fixed inset-0 z-50 bg-lime" style={{ clipPath: "circle(0px at 50% 50%)" }} />}
      </main>
    </FilmNavContext.Provider>
  );
}

type HudProps = { frame: Frame; fg: string; dark: boolean; goTo: (i: number) => void; openStudio: (e: MouseEvent<HTMLElement>) => void };

function Brand({ fg, small = false }: { fg: string; small?: boolean }) {
  return (
    <span className={`mono flex items-center gap-2.5 whitespace-nowrap font-medium ${small ? "text-[11px]" : ""}`} style={{ color: fg }}>
      <span className="block h-3 w-3 rounded-[3px] border-[1.5px] border-aub bg-lime" />
      {small ? "RAG Engine" : "Algorithmic RAG Engine"}
    </span>
  );
}

function Progress({ frame, dark, goTo, height }: { frame: Frame; dark: boolean; goTo: (i: number) => void; height: number }) {
  return (
    <nav aria-label="Chapters" className="flex flex-1 gap-1.5">
      {CHAPTERS.map((c, i) => (
        <a
          key={c.name}
          href={`#ch0${i}`}
          aria-label={`Go to ${c.name}`}
          aria-current={frame.scene === i ? "step" : undefined}
          className="flex h-6 flex-1 items-center"
          onClick={(e) => {
            e.preventDefault();
            goTo(i);
          }}
        >
          <span className="relative block w-full overflow-hidden rounded-sm" style={{ height, background: dark ? "rgba(244,241,234,.2)" : "var(--color-rule)" }}>
            <span className="absolute inset-y-0 left-0 block" style={{ width: `${frame.segments[i] * 100}%`, background: dark ? "var(--color-lime)" : "var(--color-aub)" }} />
          </span>
        </a>
      ))}
    </nav>
  );
}

function DesktopHud({ frame, fg, dark, u, goTo, openStudio }: HudProps & { u: number }) {
  return (
    <>
      <header className="absolute inset-x-0 top-0 flex h-[72px] items-center justify-between gap-6 px-12" style={{ color: fg }}>
        <a href="#ch00" onClick={(e) => { e.preventDefault(); goTo(0); }} className="no-underline">
          <Brand fg={fg} />
        </a>
        <span className="mono whitespace-nowrap opacity-70">{CHAPTERS[frame.scene].step}</span>
        <Link href="/studio" onClick={openStudio} className="mono flex h-11 items-center whitespace-nowrap rounded-full border-[1.5px] border-aub bg-lime px-5 text-aub no-underline">
          Try it →
        </Link>
      </header>
      <footer className="absolute bottom-[26px] left-12 right-12 flex items-center gap-5" style={{ color: fg }}>
        <span className="mono w-[140px] truncate">{CHAPTERS[frame.scene].name}</span>
        <Progress frame={frame} dark={dark} goTo={goTo} height={4} />
        <span className="mono w-20 whitespace-nowrap text-right" style={{ opacity: 1 - Math.min(1, u / 25) }}>
          Scroll <span className="hint inline-block">↓</span>
        </span>
      </footer>
    </>
  );
}

function PhoneHud({ frame, fg, dark, goTo, openStudio }: HudProps) {
  return (
    <>
      <header className="absolute inset-x-0 top-0 flex h-16 items-center justify-between px-4" style={{ color: fg }}>
        <a href="#ch00" onClick={(e) => { e.preventDefault(); goTo(0); }} className="no-underline">
          <Brand fg={fg} small />
        </a>
        <Link href="/studio" onClick={openStudio} className="mono flex h-10 items-center rounded-full border-[1.5px] border-aub bg-lime px-3.5 text-[11px] text-aub no-underline">
          Try it →
        </Link>
      </header>
      <footer className="absolute bottom-5 left-4 right-4 flex flex-col gap-2" style={{ color: fg }}>
        <span className="mono text-[10px] opacity-75">{CHAPTERS[frame.scene].step}</span>
        <Progress frame={frame} dark={dark} goTo={goTo} height={3} />
      </footer>
    </>
  );
}

function TitleCard({ frame, phone, fg }: { frame: Frame; phone: boolean; fg: string }) {
  const card = frame.card;
  if (!card) return null;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 flex flex-col items-center text-center"
      style={{ top: phone ? 286 : 290, gap: phone ? 10 : 18, opacity: card.opacity, transform: `translateY(${card.y}px)`, color: fg }}
    >
      <span className="mono opacity-70" style={{ fontSize: phone ? 11 : 13 }}>{card.eyebrow}</span>
      <span className="disp" style={{ fontSize: phone ? 64 : 140 }}>{card.title}</span>
      <span className="block" style={{ height: phone ? 22 : 34 }} />
      <span className="leading-[1.4] opacity-80" style={{ fontSize: phone ? 17 : 24, maxWidth: phone ? 300 : 640 }}>{card.sub}</span>
    </div>
  );
}

function Preloader() {
  return (
    <div aria-hidden="true" className="pre fixed inset-0 z-40 flex flex-col items-center justify-center gap-7 overflow-hidden bg-paper">
      <div className="plcard box-border flex aspect-[3/4] w-[min(300px,68vw)] flex-col gap-3.5 rounded-2xl border border-rule bg-card px-[26px] py-7 shadow-[0_30px_60px_-30px_rgba(43,23,54,.35)]">
        <span className="pl" style={{ width: "45%", height: 12, background: "var(--color-aub)", animationDelay: ".1s" }} />
        {[100, 92, 97, 70].map((w, i) => (
          <span key={i} className="pl" style={{ width: `${w}%`, animationDelay: `${0.25 + i * 0.1}s` }} />
        ))}
        <span className="relative mt-2.5 block">
          <span className="plh" />
          <span className="pl relative" style={{ width: "88%", background: "var(--color-aub)", opacity: 0.85, animationDelay: ".7s" }} />
        </span>
        {[95, 84, 60].map((w, i) => (
          <span key={i} className={`pl ${i === 0 ? "mt-2.5" : ""}`} style={{ width: `${w}%`, animationDelay: `${0.8 + i * 0.1}s` }} />
        ))}
      </div>
      <span className="mono plcap text-muted">Finding the answer…</span>
    </div>
  );
}

/** The whole story as plain text for search engines and screen readers. */
function StoryTranscript() {
  return (
    <div className="sr-only">
      <h1>Algorithmic RAG Engine: ask your documents anything</h1>
      <p>It reads a long document, works out what each part means, and answers your questions using only what is written there, with sources.</p>
      <h2>The problem</h2>
      <p>Reading a 300-page handbook takes hours, and keyword search misses answers written in different words.</p>
      <h2>Step 1: Slice</h2>
      <p>The document is cut into overlapping passages of about 200 words, sharing 50 words with the previous passage.</p>
      <h2>Step 2: Understand</h2>
      <p>A small local model (all-MiniLM-L6-v2) turns each passage into a 384-number meaning fingerprint.</p>
      <h2>Step 3: Ask</h2>
      <p>Your question gets a fingerprint too, so it lands near passages with the same meaning.</p>
      <h2>Step 4: Find</h2>
      <p>Cosine similarity in NumPy scores every passage and the closest three are kept.</p>
      <h2>Step 5: Answer</h2>
      <p>Gemini writes the answer using only those passages and says so when the document does not contain the answer.</p>
      <h2>Try it</h2>
      <p>Open the Studio, add a .txt file or paste text, and ask anything.</p>
    </div>
  );
}
