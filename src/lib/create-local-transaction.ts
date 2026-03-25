import { localDb, type LocalTransaction } from "./db-local";
import { syncPendingTransactions } from "./sync";

export interface CreateTransactionInput {
  businessId: number;
  type: "sale" | "expense";
  description: string;
  amount: number;
  category: string;
  source: string;
  rawInput?: string;
}

/**
 * Offline-first transaction creation:
 * 1. Write to IndexedDB immediately (always succeeds)
 * 2. Try to sync to server in background
 */
export async function createLocalTransaction(
  input: CreateTransactionInput
): Promise<LocalTransaction> {
  const now = new Date().toISOString();

  const localTx: Omit<LocalTransaction, "localId"> = {
    serverId: null,
    businessId: input.businessId,
    type: input.type,
    description: input.description,
    amount: input.amount,
    category: input.category,
    source: input.source,
    rawInput: input.rawInput ?? null,
    createdAt: now,
    synced: false,
    deleted: false,
  };

  // 1. Write to IndexedDB (instant, works offline)
  const localId = await localDb.transactions.add(localTx as LocalTransaction);

  // 2. Try server sync — await when online so dashboard refresh sees the data
  if (typeof navigator !== "undefined" && navigator.onLine) {
    try {
      await syncPendingTransactions();
    } catch {
      // Sync failed — background sync will retry
    }
  }

  return { ...localTx, localId } as LocalTransaction;
}
