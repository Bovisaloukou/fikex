import { localDb, type LocalTransaction } from "./db-local";

/**
 * Fetch server data and populate/update local IndexedDB.
 * Preserves unsynced local items.
 */
export async function hydrateLocalDb(businessId: number): Promise<void> {
  try {
    const res = await fetch(`/api/transactions?businessId=${businessId}`);
    if (!res.ok) return;

    const { transactions: serverTxs } = await res.json();

    await localDb.transaction("rw", localDb.transactions, async () => {
      // Delete all synced transactions (will be replaced by fresh server data)
      const syncedKeys = await localDb.transactions
        .filter((tx) => tx.synced === true)
        .primaryKeys();
      if (syncedKeys.length > 0) {
        await localDb.transactions.bulkDelete(syncedKeys);
      }

      // Insert server transactions as synced
      const localTxs: LocalTransaction[] = serverTxs.map(
        (tx: Record<string, unknown>) => ({
          serverId: tx.id as number,
          businessId: tx.businessId as number,
          type: tx.type as "sale" | "expense",
          description: tx.description as string,
          amount: tx.amount as number,
          category: (tx.category as string) || null,
          source: (tx.source as string) || "web",
          rawInput: (tx.rawInput as string) || null,
          createdAt: tx.createdAt as string,
          synced: true,
          deleted: false,
        })
      );

      if (localTxs.length > 0) {
        await localDb.transactions.bulkAdd(localTxs);
      }
    });
  } catch {
    // Offline or error — keep existing local data
  }
}
