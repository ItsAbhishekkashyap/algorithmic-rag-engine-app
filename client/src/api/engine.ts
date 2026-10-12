/**
 * Typed client for the existing FastAPI backend (api/main.py). The backend is unchanged;
 * these shapes mirror its Pydantic schemas and JSON responses.
 */

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");

export type StoreStatus = {
  chunks_count: number;
  matrix_shape: number[];
  document_name: string;
  chunk_size: number;
  overlap: number;
  last_ingested_at: number | null;
};

export type IngestResult = {
  status: string;
  document_name: string;
  total_chunks: number;
  vector_dim: number;
  matrix_shape: number[];
  chunk_size: number;
  overlap: number;
  ingestion_latency_ms: number;
};

export type RetrievedChunk = {
  chunk_id: number;
  rank: number;
  chunk_text: string;
  similarity_score: number;
};

export type QueryResult = {
  query: string;
  answer: string;
  retrieved_chunks: RetrievedChunk[];
  retrieval_latency_ms: number;
  generation_latency_ms: number;
  total_latency_ms: number;
  document_name: string;
};

export class EngineError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new EngineError(`Can’t reach the engine at ${API_URL}. Is the FastAPI server running?`, 0);
  }
  if (!res.ok) {
    let message = `The engine returned an error (${res.status}).`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") message = body.detail;
      else if (Array.isArray(body?.detail)) message = body.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(" ");
    } catch {
      /* non-JSON error body */
    }
    throw new EngineError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export const getHealth = () => request<{ status: string; service: string }>("/health", { cache: "no-store" });

export const getStatus = () => request<StoreStatus>("/status", { cache: "no-store" });

export const askQuestion = (body: { query: string; top_k: number; api_key?: string }) =>
  request<QueryResult>("/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, api_key: body.api_key || undefined }),
  });

export const ingestText = (body: { text: string; document_name: string; chunk_size: number; overlap: number }) =>
  request<IngestResult>("/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export function ingestFile(file: File, chunkSize: number, overlap: number) {
  const form = new FormData();
  form.append("file", file);
  form.append("chunk_size", String(chunkSize));
  form.append("overlap", String(overlap));
  return request<IngestResult>("/ingest/file", { method: "POST", body: form });
}

/** Same sliding-window count as engine/chunker.py, so the preview matches the server. */
export function countPassages(words: number, chunkSize: number, overlap: number) {
  if (words <= 0 || overlap >= chunkSize) return 0;
  if (words <= chunkSize) return 1;
  const step = chunkSize - overlap;
  let n = 0;
  for (let i = 0; i < words - overlap; i += step) {
    n++;
    if (i + chunkSize >= words) break;
  }
  return n;
}

export const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);
