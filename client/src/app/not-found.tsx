import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-start justify-center gap-6 bg-paper px-6 text-aub sm:px-16">
      <span className="mono text-muted">404 · 0 passages matched</span>
      <h1 className="disp m-0 text-[clamp(48px,9vw,120px)]">
        That page isn&rsquo;t in <span className="rounded-[0.12em] bg-lime px-[0.1em]">the document</span>.
      </h1>
      <p className="m-0 max-w-[520px] text-lg leading-[1.6] text-body">Rather than guess, here are two places that do exist.</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="mono flex h-12 items-center rounded-full border-[1.5px] border-aub bg-lime px-6 text-aub no-underline">
          See how it works
        </Link>
        <Link href="/studio" className="mono flex h-12 items-center rounded-full border border-aub px-6 text-aub no-underline">
          Open the Studio
        </Link>
      </div>
    </main>
  );
}
