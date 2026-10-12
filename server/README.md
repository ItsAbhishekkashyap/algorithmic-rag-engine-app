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

Deploy on Render with the repo-root `render.yaml`, or build `Dockerfile` (listens on `$PORT`, defaults to 8000).
