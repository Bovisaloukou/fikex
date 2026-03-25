"use client";

import { useNetworkStatus } from "@/lib/use-network-status";
import { usePendingCount } from "@/lib/use-pending-count";
import { WifiOff, RefreshCw } from "lucide-react";

export function NetworkStatus() {
  const isOnline = useNetworkStatus();
  const pendingCount = usePendingCount();

  // Only show pending count when offline (online sync is fast, no need to flash)
  const showPending = !isOnline && pendingCount > 0;

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[70]">
      <div className="bg-amber-500 text-white text-center text-xs font-medium py-1.5 flex items-center justify-center gap-1.5">
        <WifiOff className="h-3.5 w-3.5" />
        Mode hors ligne
      </div>
      {showPending && (
        <div className="bg-amber-600 text-white text-center text-xs py-1 flex items-center justify-center gap-1.5">
          <RefreshCw className="h-3 w-3 animate-spin" />
          {pendingCount} transaction{pendingCount > 1 ? "s" : ""} en attente
        </div>
      )}
    </div>
  );
}
