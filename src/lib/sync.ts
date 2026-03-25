import { localDb } from "./db-local";

let isSyncing = false;

/**
 * Push unsynced local transactions to the server.
 * Returns the number of successfully synced items.
 */
export async function syncPendingTransactions(): Promise<number> {
  if (isSyncing) return 0;
  if (typeof navigator !== "undefined" && !navigator.onLine) return 0;

  isSyncing = true;
  let synced = 0;

  try {
    // 1. Push pending creates (synced=false, deleted=false)
    const pendingCreates = await localDb.transactions
      .filter((tx) => tx.synced === false && tx.deleted === false)
      .toArray();

    for (const tx of pendingCreates) {
      try {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: tx.businessId,
            type: tx.type,
            description: tx.description,
            amount: tx.amount,
            category: tx.category || "autre",
            source: tx.source,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          // Drizzle .returning() returns an array
          const created = Array.isArray(data.transaction)
            ? data.transaction[0]
            : data.transaction;
          await localDb.transactions.update(tx.localId!, {
            serverId: created.id,
            synced: true,
          });
          synced++;
        } else {
          const errText = await res.text().catch(() => "");
          console.error(
            `[FiKex Sync] POST failed ${res.status}:`,
            errText,
            tx
          );
          if (res.status >= 400 && res.status < 500) {
            // Client error — mark synced to avoid infinite retry
            await localDb.transactions.update(tx.localId!, { synced: true });
          }
        }
        // 5xx: leave unsynced for retry
      } catch {
        break; // Network error mid-sync — stop
      }
    }

    // 2. Push pending deletes (deleted=true, serverId != null)
    const pendingDeletes = await localDb.transactions
      .filter((tx) => tx.deleted === true && tx.serverId !== null)
      .toArray();

    for (const tx of pendingDeletes) {
      try {
        const res = await fetch(`/api/transactions?id=${tx.serverId}`, {
          method: "DELETE",
        });
        if (res.ok || res.status === 404) {
          await localDb.transactions.delete(tx.localId!);
          synced++;
        }
      } catch {
        break;
      }
    }

    // 3. Clean up local-only deletes (deleted=true, serverId=null)
    const localOnlyDeletes = await localDb.transactions
      .filter((tx) => tx.deleted === true && tx.serverId === null)
      .primaryKeys();
    if (localOnlyDeletes.length > 0) {
      await localDb.transactions.bulkDelete(localOnlyDeletes);
    }
  } finally {
    isSyncing = false;
  }

  return synced;
}

/**
 * Pull latest data from server and merge into local DB.
 * Preserves unsynced local items.
 */
export async function pullFromServer(businessId: number): Promise<void> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  try {
    const res = await fetch(`/api/transactions?businessId=${businessId}`);
    if (!res.ok) return;

    const { transactions: serverTxs } = await res.json();

    await localDb.transaction("rw", localDb.transactions, async () => {
      // Delete all synced transactions
      const syncedKeys = await localDb.transactions
        .filter((tx) => tx.synced === true)
        .primaryKeys();
      if (syncedKeys.length > 0) {
        await localDb.transactions.bulkDelete(syncedKeys);
      }

      // Re-insert server transactions as synced
      const toInsert = serverTxs.map((tx: Record<string, unknown>) => ({
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
      }));

      if (toInsert.length > 0) {
        await localDb.transactions.bulkAdd(toInsert);
      }
    });
  } catch {
    // Offline — skip pull
  }
}
