"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { localDb } from "./db-local";

export function usePendingCount(): number {
  const count = useLiveQuery(
    () =>
      localDb.transactions
        .filter((tx) => tx.synced === false && tx.deleted === false)
        .count(),
    [],
    0
  );
  return count ?? 0;
}
