/** Site-wide constants for metadata, structured data, sitemap and social images. */

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000")
).replace(/\/+$/, "");

export const SITE = {
  name: "Algorithmic RAG Engine",
  title: "Algorithmic RAG Engine — Ask your documents anything",
  shortDescription: "Ask your documents anything, and see exactly where every answer came from.",
  description:
    "A retrieval-augmented generation (RAG) engine built from scratch. It slices your document into passages, fingerprints their meaning with a local MiniLM model, finds the closest passages with NumPy cosine similarity, and answers with Gemini using only those sources.",
  keywords: [
    "RAG",
    "retrieval augmented generation",
    "RAG from scratch",
    "semantic search",
    "vector search without a database",
    "cosine similarity",
    "NumPy",
    "sentence-transformers",
    "all-MiniLM-L6-v2",
    "Gemini",
    "FastAPI",
    "Next.js",
    "document question answering",
    "chat with your documents",
  ],
  author: "Abhishek Kashyap",
  repo: "https://github.com/ItsAbhishekkashyap/algorithmic-rag-engine-app",
  colors: { paper: "#F4F1EA", aubergine: "#2B1736", lime: "#C8F169", lilac: "#CBBEF7" },
} as const;
