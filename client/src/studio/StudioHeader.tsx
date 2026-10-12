import Link from "next/link";
import type { ReactNode } from "react";
import type { StoreStatus } from "@/api/engine";
import type { Health } from "./useEngine";

export function BrandMark() {
  return <span className="block h-3 w-3 rounded-[3px] border-[1.5px] border-aub bg-lime" />;
}

export function HealthPill({ health }: { health: Health }) {
  const label = health === "online" ? "Engine ready" : health === "offline" ? "Engine offline" : "Connecting…";
  const color = health === "online" ? "#5FA82B" : health === "offline" ? "#B5476B" : "#A996F2";
  return (
    <span className="mono flex h-10 items-center gap-2 rounded-full border border-rule px-3.5 text-[11px] text-body" role="status" title={label}>
      <span className={`block h-2 w-2 rounded-full ${health === "online" ? "pulse-dot" : ""}`} style={{ background: color }} />
      <span className="sr-only sm:not-sr-only">{label}</span>
    </span>
  );
}

export function DocPill({ status }: { status: StoreStatus | null }) {
  if (!status || status.chunks_count === 0) return null;
  return (
    <span className="hidden max-w-[280px] items-center gap-2 rounded-full border border-rule bg-card px-3.5 py-2 text-[13px] sm:flex">
      <span className="truncate">{status.document_name}</span>
      <span className="mono shrink-0 text-[10px] text-muted">{status.chunks_count} passages</span>
    </span>
  );
}

export default function StudioHeader({ crumb, children }: { crumb: string; children?: ReactNode }) {
  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-rule px-4 py-2.5 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Link href="/" className="mono flex items-center gap-2.5 font-medium text-[11px] text-aub no-underline">
          <BrandMark />
          RAG Engine
        </Link>
        <span className="mono hidden text-[11px] text-muted sm:inline">/ {crumb}</span>
        <Link href="/" className="mono hidden text-[11px] text-muted no-underline hover:text-aub sm:inline">
          ← How it works
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">{children}</div>
    </header>
  );
}
