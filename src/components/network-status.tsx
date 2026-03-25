"use client";

import { useState, useEffect } from "react";
import { useNetworkStatus } from "@/lib/use-network-status";
import { usePendingCount } from "@/lib/use-pending-count";
import { WifiOff, RefreshCw } from "lucide-react";

export function NetworkStatus() {
  const isOnline = useNetworkStatus();
  const pendingCount = usePendingCount();
  const [showPending, setShowPending] = useState(false);

  // Only show pending banner if it persists for more than 800ms
  // This avoids a flash when sync completes quickly
  useEffect(() => {
    if (pendingCount > 0 && isOnline) {
      const timer = setTimeout(() => setShowPending(true), 800);
      return () => clearTimeout(timer);
    }
    setShowPending(pendingCount > 0);
  }, [pendingCount, isOnline]);

  if (isOnline && !showPending) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[70]">
      {!isOnline && (
        <div className="bg-amber-500 text-white text-center text-xs font-medium py-1.5 flex items-center justify-center gap-1.5">
          <WifiOff className="h-3.5 w-3.5" />
          Mode hors ligne
        </div>
      )}
      {showPending && (
        <div
          className={`${!isOnline ? "bg-amber-600" : "bg-blue-500"} text-white text-center text-xs py-1 flex items-center justify-center gap-1.5`}
        >
          <RefreshCw className="h-3 w-3 animate-spin" />
          {pendingCount} transaction{pendingCount > 1 ? "s" : ""} en attente
        </div>
      )}
    </div>
  );
}
