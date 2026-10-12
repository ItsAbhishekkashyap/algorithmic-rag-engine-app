# Algorithmic RAG Engine — Web frontend

Next.js 15 · Tailwind CSS v4 · GSAP · Lenis. Talks to the FastAPI backend in `../server`. Deploy on Vercel with **Root Directory = `client`** and `NEXT_PUBLIC_API_URL` pointing at the server.

## Pages

| Route | What it is |
|---|---|
| `/` | **The film**: a scroll-driven story that explains the engine in five plain steps (Slice → Understand → Ask → Find → Answer). One fixed stage, Lenis-smoothed scroll; each chapter plays, holds, fades out, a title card appears, then the next chapter fades in. A lime "highlighter" travels between chapters. Desktop/landscape uses 1440×900 compositions; phones and portrait tablets get dedicated 390×844 layouts. Honors `prefers-reduced-motion` (static stacked chapters). |
| `/studio` | The app: ask questions, read answers with citation chips, inspect the sources panel (match %, highlighted supporting sentence, full passage), tune sources-per-answer (`top_k`), optional Gemini key per request. |
| `/studio/new` | Add a document: paste text or drag-and-drop a `.txt`, tune passage size / overlap with a live passage-count preview (same algorithm as `engine/chunker.py`). |

## Run

```bash
# 1. backend
cd server && uvicorn api.main:app --port 8000

# 2. frontend
cd client
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm install
npm run dev                  # http://localhost:3000
```

On Windows, if uvicorn crashes at startup with `UnicodeEncodeError` (the startup log prints an emoji), run Python in UTF-8 mode: `python -X utf8 -m uvicorn api.main:app --port 8000`.

## Structure

```
src/
  app/                 routes, metadata, sitemap/robots, global tokens (globals.css)
  film/
    Film.tsx           engine: Lenis + GSAP ticker, stage scaling, HUD, title cards, preloader, Studio transition
    timeline.ts        pure timeline math: chapter windows, holds, title cards, highlighter path
    ease.ts            easing + deterministic RNG helpers
    desktop/           9 chapter compositions (1440×900), each a pure function of scroll progress `p`
    phone/             the same 9 chapters for 390×844
  studio/              Studio, Ingest, header, engine hook, answer rendering helpers
  api/engine.ts        typed client for /health, /status, /ingest, /ingest/file, /query
```

## Design

Palette "Aubergine, Lime & Lilac" (`#F4F1EA`, `#2B1736`, `#C8F169`, `#CBBEF7`), Bricolage Grotesque display, Geist and Geist Mono. Tokens live in `src/app/globals.css` under `@theme`.
