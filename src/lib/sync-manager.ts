import { syncPendingTransactions, pullFromServer } from "./sync";

let registered = false;

/**
 * Register all sync triggers. Call once from the app shell.
 */
export function registerSyncListeners(businessId: number): void {
  if (registered) return;
  if (typeof window === "undefined") return;
  registered = true;

  // 1. Online event — sync when connectivity returns
  window.addEventListener("online", async () => {
    await syncPendingTransactions();
    await pullFromServer(businessId);
  });

  // 2. Visibility change — sync when user returns to app
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible" && navigator.onLine) {
      await syncPendingTransactions();
      await pullFromServer(businessId);
    }
  });

  // 3. Background Sync API (progressive enhancement for Chrome/Edge)
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready
      .then((registration) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (registration as any).sync?.register?.("sync-transactions");
      })
      .catch(() => {
        // Background Sync not supported — no-op
      });
  }

  // 4. Listen for SW Background Sync messages
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "SYNC_TRANSACTIONS") {
        syncPendingTransactions();
      }
    });
  }

  // 5. Initial sync on registration
  if (navigator.onLine) {
    syncPendingTransactions().then(() => pullFromServer(businessId));
  }
}
