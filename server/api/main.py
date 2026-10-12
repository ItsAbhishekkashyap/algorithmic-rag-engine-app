"""
FastAPI Backend Application (api/main.py)
-----------------------------------------
High-performance REST API for Framework-Free Algorithmic RAG Engine.

Endpoints:
- POST /ingest : Chunks text, computes embeddings via SentenceTransformers, stores vector matrix.
- POST /query  : Embeds query, runs NumPy Cosine Similarity search, generates Gemini answer.
- GET  /status : Returns vector store memory status and document statistics.
- GET  /health : Basic health check.
"""

import sys
import os
import time
from typing import List, Optional, Dict, Any
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Automatically load .env environment variables
load_dotenv()

# Ensure project root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from engine.chunker import sliding_window_chunking
from engine.embedder import LocalEmbedder
from engine.retriever import cosine_similarity_search
from engine.generator import GeminiGenerator


# -----------------------------------------------------------------------------
# Vector Store Session (In-Memory Algorithmic Vector Store)
# -----------------------------------------------------------------------------
class VectorStoreSession:
    """
    In-memory algorithmic vector storage session.
    Maintains document text chunks and matrix of 384-dim NumPy float32 vectors.
    """

    def __init__(self):
        self.chunks: List[str] = []
        self.doc_matrix: np.ndarray = np.empty((0, 384), dtype=np.float32)
        self.document_name: str = "Untitled Document"
        self.chunk_size: int = 200
        self.overlap: int = 50
        self.last_ingested_at: Optional[float] = None

    def clear(self):
        self.chunks = []
        self.doc_matrix = np.empty((0, 384), dtype=np.float32)
        self.document_name = "Untitled Document"
        self.last_ingested_at = None

    def ingest(self, text: str, document_name: str = "Uploaded Document", chunk_size: int = 200, overlap: int = 50) -> Dict[str, Any]:
        """Ingests text, chunks it, embeds it, and replaces vector matrix."""
        start_time = time.perf_counter()

        # 1. Algorithmic Sliding-Window Text Chunking
        extracted_chunks = sliding_window_chunking(text, chunk_size=chunk_size, overlap=overlap)
        if not extracted_chunks:
            raise HTTPException(status_code=400, detail="Document text is empty or could not be chunked.")

        # 2. Local SentenceTransformer CPU Embedding
        embedder = LocalEmbedder()
        vectors = embedder.encode_chunks(extracted_chunks)

        # 3. Store in session
        self.chunks = extracted_chunks
        self.doc_matrix = vectors
        self.document_name = document_name
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.last_ingested_at = time.time()

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        return {
            "status": "success",
            "document_name": document_name,
            "total_chunks": len(extracted_chunks),
            "vector_dim": int(vectors.shape[1]),
            "matrix_shape": list(vectors.shape),
            "chunk_size": chunk_size,
            "overlap": overlap,
            "ingestion_latency_ms": round(elapsed_ms, 2)
        }


# Global store instance
store = VectorStoreSession()
generator = GeminiGenerator()

# -----------------------------------------------------------------------------
# FastAPI App & Pydantic Schemas
# -----------------------------------------------------------------------------
app = FastAPI(
    title="Algorithmic RAG Engine API",
    description="Framework-Free RAG Engine using Pure NumPy Vector Math, SentenceTransformers, and Gemini API",
    version="1.0.0"
)

# Enable CORS for Streamlit UI interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_prewarm_models():
    """Pre-warm LocalEmbedder and load SentenceTransformers weights into RAM on server start."""
    print("----------------------------------------------------------------------")
    print("🚀 [FastAPI Startup] Pre-loading LocalEmbedder model on CPU...")
    try:
        embedder = LocalEmbedder()
        print("✅ [FastAPI Startup] Embedding model pre-warmed & ready for instant ingestion!")
    except Exception as e:
        print(f"⚠️ [FastAPI Startup] Warning during model pre-warm: {e}")
    print("----------------------------------------------------------------------")


class IngestTextRequest(BaseModel):
    text: str = Field(..., description="Raw text document content to ingest")
    document_name: Optional[str] = Field("Pasted Document", description="Optional label for document")
    chunk_size: Optional[int] = Field(200, ge=10, le=1000, description="Word chunk window size")
    overlap: Optional[int] = Field(50, ge=0, le=500, description="Word overlap between windows")


class QueryRequest(BaseModel):
    query: str = Field(..., description="User query question")
    top_k: Optional[int] = Field(3, ge=1, le=20, description="Number of top context chunks to retrieve")
    api_key: Optional[str] = Field(None, description="Optional runtime Gemini API Key override")


class ChunkResultSchema(BaseModel):
    chunk_id: int
    rank: int
    chunk_text: str
    similarity_score: float


class QueryResponseSchema(BaseModel):
    query: str
    answer: str
    retrieved_chunks: List[ChunkResultSchema]
    retrieval_latency_ms: float
    generation_latency_ms: float
    total_latency_ms: float
    document_name: str


# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------
@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Algorithmic RAG Engine Backend"}


@app.get("/status")
def store_status():
    """Returns vector store inventory and document metadata."""
    return {
        "chunks_count": len(store.chunks),
        "matrix_shape": list(store.doc_matrix.shape),
        "document_name": store.document_name,
        "chunk_size": store.chunk_size,
        "overlap": store.overlap,
        "last_ingested_at": store.last_ingested_at
    }


@app.post("/ingest")
def ingest_text(request: IngestTextRequest):
    """
    Ingests text document into vector matrix store.
    Runs sliding window chunker and SentenceTransformers CPU embedder.
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty.")

    if request.overlap >= request.chunk_size:
        raise HTTPException(status_code=400, detail="Overlap must be strictly less than chunk_size.")

    result = store.ingest(
        text=request.text,
        document_name=request.document_name,
        chunk_size=request.chunk_size,
        overlap=request.overlap
    )
    return result


@app.post("/ingest/file")
async def ingest_file(
    file: UploadFile = File(...),
    chunk_size: int = Form(200),
    overlap: int = Form(50)
):
    """
    Ingests uploaded .txt file into vector store.
    """
    if not file.filename.endswith(".txt"):
        raise HTTPException(status_code=400, detail="Only plain text (.txt) files are currently supported.")

    content_bytes = await file.read()
    try:
        text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        text = content_bytes.decode("latin-1")

    result = store.ingest(
        text=text,
        document_name=file.filename,
        chunk_size=chunk_size,
        overlap=overlap
    )
    return result


@app.post("/query", response_model=QueryResponseSchema)
def query_engine(request: QueryRequest):
    """
    Executes RAG query against stored document vectors.
    1. Embeds query string.
    2. Runs pure NumPy Cosine Similarity search.
    3. Passes retrieved context chunks to Gemini API.
    4. Returns answer and vector similarity metadata.
    """
    if len(store.chunks) == 0 or store.doc_matrix.shape[0] == 0:
        raise HTTPException(
            status_code=400,
            detail="No document ingested yet! Please ingest a document via /ingest first."
        )

    t_total_start = time.perf_counter()

    # 1 & 2. Retrieval Stage (Query Embedding + NumPy Cosine Similarity Math)
    t_ret_start = time.perf_counter()
    embedder = LocalEmbedder()
    query_vec = embedder.encode_query(request.query)

    retrieved_chunks = cosine_similarity_search(
        query_vector=query_vec,
        doc_matrix=store.doc_matrix,
        chunks=store.chunks,
        top_k=request.top_k
    )
    retrieval_latency_ms = (time.perf_counter() - t_ret_start) * 1000.0

    # 3. Generation Stage (Gemini Grounded Prompting)
    t_gen_start = time.perf_counter()
    answer_text = generator.generate_answer(
        query=request.query,
        context_chunks=retrieved_chunks,
        api_key=request.api_key
    )
    generation_latency_ms = (time.perf_counter() - t_gen_start) * 1000.0

    total_latency_ms = (time.perf_counter() - t_total_start) * 1000.0

    return QueryResponseSchema(
        query=request.query,
        answer=answer_text,
        retrieved_chunks=[ChunkResultSchema(**item) for item in retrieved_chunks],
        retrieval_latency_ms=round(retrieval_latency_ms, 2),
        generation_latency_ms=round(generation_latency_ms, 2),
        total_latency_ms=round(total_latency_ms, 2),
        document_name=store.document_name
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True)
