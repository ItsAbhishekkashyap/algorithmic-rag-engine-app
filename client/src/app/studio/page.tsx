import type { Metadata } from "next";
import Studio from "@/studio/Studio";

const description = "Ask questions about your own document and see the exact passages, match scores and timings behind every answer.";

export const metadata: Metadata = {
  title: "Studio — ask your document",
  description,
  alternates: { canonical: "/studio" },
  openGraph: { url: "/studio", title: "Studio — ask your document", description },
  twitter: { title: "Studio — ask your document", description },
};

export default function StudioPage() {
  return <Studio />;
}
