# Algorithmic RAG Engine

**Ask your documents anything, and see exactly where every answer came from.**

A retrieval-augmented generation engine built from first principles: no LangChain, no vector database. Text is cut into overlapping passages, each passage gets a 384-number "meaning fingerprint" from a local MiniLM model, your question is matched against every passage with NumPy cosine similarity, and Gemini writes the answer using only the closest passages, with the sources shown.

The web app tells this story as a scroll film, then lets you try it on your own document in the Studio.

```
algorithmic-rag-engine-app/
├── client/   Next.js 15 · Tailwind v4 · GSAP · Lenis   → deploy on Vercel
├── server/   FastAPI · NumPy · sentence-transformers · Gemini → deploy on Render
└── render.yaml   Render Blueprint for the server
```

## How it works

| Step | What happens | Where |
|---|---|---|
| 1. Slice | Sliding-window chunker: 200-word passages, 50-word overlap, never splits a word. O(N). | `server/engine/chunker.py` |
| 2. Understand | `all-MiniLM-L6-v2` turns each passage into a 384-dim float32 vector on the CPU. | `server/engine/embedder.py` |
| 3. Ask | The question is embedded with the same model. | `server/api/main.py` |
| 4. Find | `cos θ = (D·q) / (‖D‖‖q‖ + ε)` over the whole matrix in one NumPy call; top-k kept. | `server/engine/retriever.py` |
| 5. Answer | Gemini answers from the retrieved passages only, with automatic model fallback. | `server/engine/generator.py` |

API: `GET /health`, `GET /status`, `POST /ingest`, `POST /ingest/file` (.txt), `POST /query`.

## Run locally

```bash
# server
cd server
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                # add your GEMINI_API_KEY
uvicorn api.main:app --port 8000
```

```bash
# client (in another terminal)
cd client
cp .env.example .env.local                          # NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm install
npm run dev                                         # http://localhost:3000
```

> Windows: if uvicorn exits with `UnicodeEncodeError` at startup, run `python -X utf8 -m uvicorn api.main:app --port 8000`.

## Deploy

### Server → Render
1. Render dashboard → **New → Blueprint** → select this repository. `render.yaml` creates the `algorithmic-rag-engine-api` web service from `server/`.
2. When prompted, set **`GEMINI_API_KEY`**.
3. After the first deploy, copy the service URL (e.g. `https://algorithmic-rag-engine-api.onrender.com`) and check `…/health`.

Manual alternative: New → Web Service → Root Directory `server`, Build `pip install -r requirements.txt`, Start `uvicorn api.main:app --host 0.0.0.0 --port $PORT`. A `server/Dockerfile` is included if you prefer a Docker service.

Notes: the free plan sleeps when idle, so the first request after a pause is slow while the model loads. The vector store lives in memory, so it resets on restart and is shared by everyone using the same server.

### Client → Vercel
1. Vercel → **Add New → Project** → import this repository.
2. Set **Root Directory** to `client` (framework: Next.js is detected automatically).
3. Environment variables:
   - `NEXT_PUBLIC_API_URL` = your Render URL
   - `NEXT_PUBLIC_SITE_URL` = your Vercel domain (optional; falls back to the Vercel production URL)
4. Deploy.

## SEO

Per-page titles, descriptions and canonical URLs, Open Graph and Twitter cards with a generated 1200×630 image, JSON-LD (`WebSite` + `SoftwareApplication`), `sitemap.xml`, `robots.txt`, web manifest, icons, a branded 404 page, and a plain-text transcript of the scroll story for crawlers and screen readers.
