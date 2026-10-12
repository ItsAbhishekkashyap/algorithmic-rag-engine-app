# Algorithmic RAG Engine

**Ask your documents anything, and see exactly where every answer came from.**

A retrieval-augmented generation engine built from first principles: no LangChain, no vector database. Text is cut into overlapping passages, each passage gets a 384-number "meaning fingerprint" from a local MiniLM model, your question is matched against every passage with NumPy cosine similarity, and Gemini writes the answer using only the closest passages, with the sources shown.

The web app tells this story as a scroll film, then lets you try it on your own document in the Studio.

```
algorithmic-rag-engine-app/
├── client/   Next.js 15 · Tailwind v4 · GSAP · Lenis   → deploy on Vercel
├── server/   FastAPI · NumPy · sentence-transformers · Gemini → deploy on Hugging Face Spaces (free)
├── .github/workflows/deploy-server-hf.yml   auto-deploys server/ to the Space
└── render.yaml   optional Render Blueprint for the server
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

### Server → Hugging Face Spaces (free, recommended)
The free CPU Space (2 vCPU, 16 GB RAM) comfortably runs PyTorch + MiniLM. A GitHub Action publishes `server/` to a Docker Space on every push.

1. Create a Hugging Face **write** token: https://huggingface.co/settings/tokens → *Create new token* → type **Write**.
2. In this GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**, add:
   - `HF_TOKEN`: the token from step 1
   - `GEMINI_API_KEY`: your Gemini key (the Action copies it into the Space's secrets)
3. **Actions → Deploy server to Hugging Face Spaces → Run workflow.** The first run creates the Space `abhi47025/algorithmic-rag-engine-api` (change it with a repo variable `HF_SPACE_ID`).
4. Wait for the Space to build (first build ~5–10 min), then open `https://abhi47025-algorithmic-rag-engine-api.hf.space/health`.

Notes: free Spaces sleep after ~48 h without traffic and wake on the next request. The vector store is in memory, so it resets on restart and is shared by all visitors.

### Server → Render (alternative)
`render.yaml` deploys `server/` as a Python web service (New → Blueprint; set `GEMINI_API_KEY`). The free plan has 512 MB RAM and 0.1 CPU. PyTorch + MiniLM measured ~380 MB peak (≈430–480 MB with the Gemini SDKs), so it fits only just and ingestion is slow. Use a 2 GB plan for reliability.

### Client → Vercel
1. Vercel → **Add New → Project** → import this repository.
2. Set **Root Directory** to `client` (framework: Next.js is detected automatically).
3. Environment variables:
   - `NEXT_PUBLIC_API_URL` = your backend URL, e.g. `https://abhi47025-algorithmic-rag-engine-api.hf.space`
   - `NEXT_PUBLIC_SITE_URL` = your Vercel domain (optional; falls back to the Vercel production URL)
4. Deploy.

## SEO

Per-page titles, descriptions and canonical URLs, Open Graph and Twitter cards with a generated 1200×630 image, JSON-LD (`WebSite` + `SoftwareApplication`), `sitemap.xml`, `robots.txt`, web manifest, icons, a branded 404 page, and a plain-text transcript of the scroll story for crawlers and screen readers.
