"""
Text Chunker Module (engine/chunker.py)
----------------------------------------
Implements a pure Python sliding-window text chunking algorithm from scratch.
Zero high-level orchestration frameworks (no LangChain / LlamaIndex TextSplitters).

Algorithmic Design & Guarantees:
1. Word-Boundary Safety: Splitting occurs strictly on whitespace word boundaries.
   Words are NEVER cut in half mid-character.
2. Sliding Window: Operates with a configurable window size (in words) and step size
   determined by (chunk_size - overlap).
3. Edge Case Robustness: Handles whitespace normalization, short texts, empty strings,
   and edge parameters gracefully.

Complexity Analysis:
- Time Complexity: O(N) where N is the total number of words in the raw input text.
  Splitting takes O(N), sliding across indices takes O(N / step) iterations, joining words takes O(chunk_size) per chunk.
  Overall linear time complexity O(N).
- Space Complexity: O(N) to store the resulting list of text chunk strings.
"""

from typing import List


class SlidingWindowChunker:
    """
    Stateful or configurable pure Python sliding-window text chunker.
    """

    def __init__(self, chunk_size: int = 200, overlap: int = 50):
        """
        Initialize chunker parameters.

        Args:
            chunk_size (int): Number of words per text chunk. Must be >= 1.
            overlap (int): Number of overlapping words between consecutive chunks. Must be < chunk_size.
        """
        if chunk_size < 1:
            raise ValueError("chunk_size must be at least 1 word.")
        if overlap < 0 or overlap >= chunk_size:
            raise ValueError("overlap must be >= 0 and strictly less than chunk_size.")

        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk(self, text: str) -> List[str]:
        """
        Executes sliding-window chunking on raw text input.

        Args:
            text (str): Input raw text string.

        Returns:
            List[str]: Array of extracted text chunk strings.
        """
        if not text or not text.strip():
            return []

        # Normalize whitespace (convert newlines/tabs into single space clean tokens)
        words = text.strip().split()
        total_words = len(words)

        if total_words == 0:
            return []

        # If text is shorter than or equal to requested chunk_size, return as single chunk
        if total_words <= self.chunk_size:
            return [" ".join(words)]

        chunks: List[str] = []
        step = self.chunk_size - self.overlap

        # Sliding window loop across word tokens
        for i in range(0, total_words - self.overlap, step):
            chunk_words = words[i : i + self.chunk_size]
            chunk_text = " ".join(chunk_words)
            chunks.append(chunk_text)

            # Break early if current chunk window reached end of text
            if i + self.chunk_size >= total_words:
                break

        return chunks


def sliding_window_chunking(text: str, chunk_size: int = 200, overlap: int = 50) -> List[str]:
    """
    Functional interface for sliding-window text chunking algorithm.

    Args:
        text (str): Input text string.
        chunk_size (int): Max number of words per chunk. Default 200.
        overlap (int): Number of overlapping words. Default 50.

    Returns:
        List[str]: Array of text chunks.
    """
    chunker = SlidingWindowChunker(chunk_size=chunk_size, overlap=overlap)
    return chunker.chunk(text)
