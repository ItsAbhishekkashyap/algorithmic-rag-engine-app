"""
Local Embedder Module (engine/embedder.py)
-------------------------------------------
Instantiates local sentence-transformers (all-MiniLM-L6-v2) for CPU execution.
Converts text chunks and user queries into dense 384-dimensional floating-point vectors.

Technical Specifications:
- Model Architecture: BERT-Mini fine-tuned on 1B+ sentence pairs (all-MiniLM-L6-v2).
- Vector Dimensions: D = 384 float32 dimensions per embedding vector.
- Execution Target: Local CPU (device='cpu') - completely off-grid, privacy-preserving.

Complexity Analysis:
- Time Complexity: O(M * L * D) for M text chunks of average word length L.
- Memory Complexity: ~90 MB RAM for model weights in 32-bit floating point precision.
"""

from typing import List, Union
import numpy as np
from sentence_transformers import SentenceTransformer


class LocalEmbedder:
    """
    Singleton wrapper around sentence-transformers model for local CPU vector embeddings.
    """

    _instance = None
    _model = None

    def __new__(cls, model_name: str = "all-MiniLM-L6-v2"):
        """
        Singleton pattern ensuring the ~90MB Transformer model is loaded into CPU memory exactly once.
        """
        if cls._instance is None:
            cls._instance = super(LocalEmbedder, cls).__new__(cls)
            print(f"[LocalEmbedder] Loading SentenceTransformer model '{model_name}' on CPU...")
            cls._model = SentenceTransformer(model_name, device="cpu")
            print(f"[LocalEmbedder] Model successfully loaded. Dimensionality: 384")
        return cls._instance

    @property
    def vector_dimension(self) -> int:
        """Returns the dimensionality of the embedding vectors (384 for all-MiniLM-L6-v2)."""
        return 384

    def encode_chunks(self, chunks: List[str]) -> np.ndarray:
        """
        Encodes a list of text chunk strings into a 2D NumPy array of dimension (M, 384).

        Args:
            chunks (List[str]): List of M text chunk strings.

        Returns:
            np.ndarray: 2D NumPy matrix of shape (M, 384), dtype=float32.
        """
        if not chunks:
            return np.empty((0, self.vector_dimension), dtype=np.float32)

        # encode returns numpy array float32 by default
        embeddings = self._model.encode(
            chunks,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=False  # We do normalization explicitly in retriever math to demonstrate raw vector math!
        )
        return embeddings.astype(np.float32)

    def encode_query(self, query: str) -> np.ndarray:
        """
        Encodes a single query text string into a 1D NumPy vector of dimension (384,).

        Args:
            query (str): User question or prompt text.

        Returns:
            np.ndarray: 1D NumPy vector of shape (384,), dtype=float32.
        """
        if not query or not query.strip():
            raise ValueError("Query string cannot be empty.")

        embedding = self._model.encode(
            query,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=False
        )
        return embedding.flatten().astype(np.float32)
