"""
Vector Mathematics Retriever Module (engine/retriever.py)
---------------------------------------------------------
Implements vector similarity retrieval from scratch using pure NumPy linear algebra.
No commercial vector databases (no Pinecone, ChromaDB, Weaviate, or Qdrant).

Mathematical Foundation:
Cosine Similarity calculates the cosine of the angle between two multi-dimensional vectors A and B:

                   A · B             sum(A_i * B_i)
    Cosine(A, B) = ------- = -------------------------------
                   ||A|| ||B||   sqrt(sum(A_i^2)) * sqrt(sum(B_i^2))

For a single query vector q (1D, shape: (D,)) and a document matrix D (2D, shape: (M, D)):
1. Matrix Dot Product: dot_products = D · q^T  (shape: (M,))
2. L2 Norm Computation:
   - norm_q = sqrt(sum(q_i^2))                     (scalar)
   - norm_D = sqrt(sum(D_ij^2 over axis=1))        (shape: (M,))
3. Cosine Scores: scores = dot_products / (norm_D * norm_q + epsilon)

Complexity Analysis:
- Time Complexity:
  - Dot Product: O(M * D) multiplications & additions.
  - L2 Norms: O(M * D) operations.
  - Top-K Sorting: O(M log K) using partial argsort / np.argpartition.
  - Overall Time Complexity: O(M * D + M log K) - blazing fast vectorized execution.
- Space Complexity: O(M) for storing intermediate similarity score arrays.
"""

from typing import List, Dict, Any, Tuple
import numpy as np


def batch_cosine_similarity(query_vector: np.ndarray, doc_matrix: np.ndarray) -> np.ndarray:
    """
    Computes pairwise Cosine Similarity between a 1D query vector and a 2D document matrix using pure NumPy.

    Args:
        query_vector (np.ndarray): 1D float array of shape (D,) representing query embedding.
        doc_matrix (np.ndarray): 2D float array of shape (M, D) representing M chunk embeddings.

    Returns:
        np.ndarray: 1D float array of shape (M,) containing similarity scores in range [-1.0, 1.0].
    """
    if doc_matrix.ndim != 2:
        raise ValueError(f"doc_matrix must be a 2D array of shape (M, D). Got ndim={doc_matrix.ndim}")

    if query_vector.ndim == 2:
        query_vector = query_vector.flatten()

    M, D = doc_matrix.shape
    if query_vector.shape[0] != D:
        raise ValueError(
            f"Dimensionality mismatch! doc_matrix dim D={D}, but query_vector length={query_vector.shape[0]}"
        )

    if M == 0:
        return np.array([], dtype=np.float32)

    # 1. Numerator: Vector Dot Product D · q (broadcasting across all M documents)
    dot_products = np.dot(doc_matrix, query_vector)  # Shape: (M,)

    # 2. Denominator: L2 Euclidean Norms ||D||_2 and ||q||_2
    norm_q = np.linalg.norm(query_vector)  # Scalar L2 norm of query
    norm_docs = np.linalg.norm(doc_matrix, axis=1)  # Shape: (M,) L2 norms of documents

    # 3. Division with EpsilonGuard against zero division
    epsilon = 1e-9
    denominator = norm_docs * norm_q + epsilon

    # 4. Cosine Similarity Array
    cosine_scores = dot_products / denominator

    # Clip numerical floating point errors into strict [-1.0, 1.0] interval
    return np.clip(cosine_scores, -1.0, 1.0)


def cosine_similarity_search(
    query_vector: np.ndarray,
    doc_matrix: np.ndarray,
    chunks: List[str],
    top_k: int = 3
) -> List[Dict[str, Any]]:
    """
    Ranks document chunks by NumPy Cosine Similarity and returns Top-K matched contexts.

    Args:
        query_vector (np.ndarray): Query embedding vector (384,).
        doc_matrix (np.ndarray): Matrix of chunk vectors (M, 384).
        chunks (List[str]): Original raw text strings corresponding to matrix rows.
        top_k (int): Number of top context chunks to retrieve.

    Returns:
        List[Dict[str, Any]]: Array of dictionary records containing:
            - "chunk_id": Original index of chunk (int)
            - "chunk_text": String content of chunk (str)
            - "similarity_score": Exact Cosine Similarity score float (e.g. 0.8432)
            - "rank": 1-indexed rank order (int)
    """
    if len(chunks) == 0 or doc_matrix.shape[0] == 0:
        return []

    # Compute cosine similarity for all M document chunks vectorized
    scores = batch_cosine_similarity(query_vector, doc_matrix)

    # Cap top_k to total available chunks
    k = min(top_k, len(chunks))

    # Fast Top-K index selection using argsort descending
    # (For massive datasets M > 100k, np.argpartition provides O(M) partial selection)
    top_indices = np.argsort(scores)[::-1][:k]

    results: List[Dict[str, Any]] = []
    for rank, idx in enumerate(top_indices, start=1):
        results.append({
            "chunk_id": int(idx),
            "chunk_text": chunks[idx],
            "similarity_score": float(scores[idx]),
            "rank": rank
        })

    return results
