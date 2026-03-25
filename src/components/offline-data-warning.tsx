"use client";

import { useNetworkStatus } from "@/lib/use-network-status";
import { WifiOff } from "lucide-react";

export function OfflineDataWarning() {
  const isOnline = useNetworkStatus();
  if (isOnline) return null;

  return (
    <div className="mx-4 mt-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 flex items-center gap-2 text-xs text-amber-700">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>
        Donn&eacute;es peut-&ecirc;tre obsolètes. Connexion requise pour
        actualiser.
      </span>
    </div>
  );
}
