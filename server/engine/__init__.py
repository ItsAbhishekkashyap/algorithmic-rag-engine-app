"""
Core Algorithmic RAG Engine Package.
Contains pure Python and NumPy implementations for text chunking, local vector embedding,
vector mathematics cosine similarity retrieval, and LLM answer generation.
"""

from .chunker import sliding_window_chunking, SlidingWindowChunker
from .retriever import cosine_similarity_search, batch_cosine_similarity

try:
    from .embedder import LocalEmbedder
except ImportError:
    LocalEmbedder = None

try:
    from .generator import GeminiGenerator
except ImportError:
    GeminiGenerator = None

__all__ = [
    "sliding_window_chunking",
    "SlidingWindowChunker",
    "LocalEmbedder",
    "cosine_similarity_search",
    "batch_cosine_similarity",
    "GeminiGenerator",
]

