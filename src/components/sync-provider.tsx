"use client";

import { useEffect, useRef } from "react";
import { getClientBusinessId } from "@/lib/client-auth";
import { registerSyncListeners } from "@/lib/sync-manager";
import { hydrateLocalDb } from "@/lib/hydrate-local";

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const businessId = getClientBusinessId();
    registerSyncListeners(businessId);
    hydrateLocalDb(businessId);
  }, []);

  return <>{children}</>;
}
