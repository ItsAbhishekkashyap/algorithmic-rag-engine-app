"""
LLM Generator Module (engine/generator.py)
-------------------------------------------
Integrates Google Gemini API (`google.genai` official SDK) for context-grounded answer generation.
Enforces strict system prompts to eliminate hallucination and guarantee answer accuracy based ONLY on retrieved chunks.
Includes automatic model fallback handling for rate limits (429) and model deprecation (404).
"""

import os
import time
from typing import List, Dict, Any, Optional

try:
    from google import genai
    from google.genai import types
    USE_NEW_SDK = True
except ImportError:
    import google.generativeai as genai
    USE_NEW_SDK = False

# List of candidate models to try in order of performance and availability
FALLBACK_MODELS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash",
    "gemini-flash-latest"
]


class GeminiGenerator:
    """
    Wrapper around Google Gemini API for RAG Context-Grounded Answer Generation.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.0-flash"):
        """
        Initialize Gemini API client.

        Args:
            api_key (Optional[str]): Gemini API key. If None, reads from GEMINI_API_KEY env variable.
            model_name (str): Primary Gemini model identifier. Default: 'gemini-2.0-flash'.
        """
        self.model_name = model_name
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")

    def build_rag_prompt(self, query: str, context_chunks: List[Dict[str, Any]]) -> str:
        """
        Constructs a strict grounding prompt injecting top-K retrieved context chunks.

        Args:
            query (str): User question.
            context_chunks (List[Dict[str, Any]]): Retrieved top-K text chunks with similarity scores.

        Returns:
            str: Full formatted prompt string.
        """
        formatted_context_blocks = []
        for i, item in enumerate(context_chunks, start=1):
            score = item.get("similarity_score", 0.0)
            text = item.get("chunk_text", "").strip()
            formatted_context_blocks.append(
                f"--- CONTEXT CHUNK #{i} (Cosine Similarity Score: {score:.4f}) ---\n{text}"
            )

        context_str = "\n\n".join(formatted_context_blocks)

        prompt = f"""You are an advanced context-grounded AI assistant powered by a custom Framework-Free Algorithmic RAG Engine.

STRICT GROUNDING DIRECTIVES:
1. Answer the user's query using ONLY the factual information provided in the Context Chunks below.
2. Do NOT use outside knowledge, speculate, or make assumptions not directly supported by the context.
3. If the context chunks do NOT contain sufficient information to answer the query, state explicitly:
   "I am unable to answer this question based on the provided document context."
4. Maintain a clear, objective, and precise professional tone.

USER QUESTION:
{query}

RETRIEVED CONTEXT CHUNKS:
{context_str}

FAITHFUL ANSWER:"""
        return prompt

    def generate_answer(
        self,
        query: str,
        context_chunks: List[Dict[str, Any]],
        api_key: Optional[str] = None
    ) -> str:
        """
        Generates grounded response using Gemini API with automatic model fallback.

        Args:
            query (str): User query string.
            context_chunks (List[Dict[str, Any]]): Array of retrieved chunk dicts.
            api_key (Optional[str]): Runtime override API key.

        Returns:
            str: Generated LLM response text string.
        """
        active_key = api_key or self.api_key or os.getenv("GEMINI_API_KEY")

        if not active_key or active_key == "your_gemini_api_key_here":
            return (
                "⚠️ Gemini API Key missing or invalid. Please configure your GEMINI_API_KEY "
                "in the sidebar or in the .env environment file to enable LLM generation."
            )

        if not context_chunks:
            return "No relevant text context chunks were found in the document store for your query."

        full_prompt = self.build_rag_prompt(query, context_chunks)

        # Build candidate list starting with preferred model
        candidate_models = [self.model_name] + [m for m in FALLBACK_MODELS if m != self.model_name]
        last_error = ""

        for target_model in candidate_models:
            try:
                if USE_NEW_SDK:
                    client = genai.Client(api_key=active_key)
                    response = client.models.generate_content(
                        model=target_model,
                        contents=full_prompt,
                        config=types.GenerateContentConfig(
                            temperature=0.2,
                            max_output_tokens=1024,
                        )
                    )
                    if response.text:
                        return response.text.strip()
                else:
                    genai.configure(api_key=active_key)
                    model = genai.GenerativeModel(target_model)
                    response = model.generate_content(
                        full_prompt,
                        generation_config=genai.types.GenerationConfig(
                            temperature=0.2,
                            max_output_tokens=1024,
                        )
                    )
                    if response.text:
                        return response.text.strip()

            except Exception as e:
                last_error = str(e)
                # If 404 model not found, try next candidate model in list
                if "404" in last_error or "NOT_FOUND" in last_error:
                    continue
                # If 429 rate limit / quota, wait 2s and try fallback model
                elif "429" in last_error or "RESOURCE_EXHAUSTED" in last_error:
                    time.sleep(2)
                    continue
                else:
                    return f"⚠️ Error generating response from Gemini API: {last_error}"

        # If all candidates returned quota/rate limit error
        if "429" in last_error or "RESOURCE_EXHAUSTED" in last_error:
            return (
                "⚠️ Gemini API Free Tier Rate Limit reached (429 Quota Exceeded). "
                "Please wait 30-60 seconds before asking your next question, or ensure your Google AI Studio project has API requests enabled."
            )

        return f"⚠️ Could not generate answer using available Gemini models. Error details: {last_error}"
