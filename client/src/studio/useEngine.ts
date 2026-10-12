"use client";

import { useCallback, useEffect, useState } from "react";
import { getHealth, getStatus, type StoreStatus } from "@/api/engine";

export type Health = "checking" | "online" | "offline";

/** Polls the backend's /health and /status (on mount and whenever the tab regains focus). */
export function useEngine() {
  const [health, setHealth] = useState<Health>("checking");
  const [status, setStatus] = useState<StoreStatus | null>(null);

  const refresh = useCallback(async () => {
    try {
      await getHealth();
      setHealth("online");
      setStatus(await getStatus());
    } catch {
      setHealth("offline");
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  // While the engine is unreachable (e.g. still loading its model), keep trying.
  useEffect(() => {
    if (health !== "offline") return;
    const id = window.setInterval(refresh, 4000);
    return () => window.clearInterval(id);
  }, [health, refresh]);

  const hasDocument = !!status && status.chunks_count > 0;
  return { health, status, hasDocument, refresh };
}
