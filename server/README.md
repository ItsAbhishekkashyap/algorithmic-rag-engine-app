---
title: Algorithmic RAG Engine API
emoji: 📚
colorFrom: purple
colorTo: green
sdk: docker
app_port: 7860
pinned: false
short_description: RAG API - MiniLM embeddings, NumPy cosine, Gemini
---

# Server — FastAPI RAG engine

| Endpoint | Body | Returns |
|---|---|---|
| `GET /health` | | `{ status, service }` |
| `GET /status` | | `{ chunks_count, matrix_shape, document_name, chunk_size, overlap, last_ingested_at }` |
| `POST /ingest` | `{ text, document_name?, chunk_size?, overlap? }` | ingestion summary |
| `POST /ingest/file` | multipart: `file` (.txt), `chunk_size`, `overlap` | ingestion summary |
| `POST /query` | `{ query, top_k?, api_key? }` | `{ answer, retrieved_chunks[], retrieval_latency_ms, generation_latency_ms, … }` |

```bash
pip install -r requirements.txt
cp .env.example .env        # GEMINI_API_KEY=...
uvicorn api.main:app --port 8000
```

Deploy for free on **Hugging Face Spaces** (Docker SDK). The front matter above is the Space config, and `.github/workflows/deploy-server-hf.yml` publishes this folder automatically. Alternatives: the repo-root `render.yaml`, or any Docker host (`Dockerfile` listens on `$PORT`, default 7860).
