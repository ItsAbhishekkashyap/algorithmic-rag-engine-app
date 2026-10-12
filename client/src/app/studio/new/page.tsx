import type { Metadata } from "next";
import Ingest from "@/studio/Ingest";

export const metadata: Metadata = {
  title: "Add a document",
  description: "Paste text or upload a .txt file. The engine slices it into passages and fingerprints each one locally.",
  alternates: { canonical: "/studio/new" },
  robots: { index: false, follow: true },
};

export default function NewDocumentPage() {
  return <Ingest />;
}
