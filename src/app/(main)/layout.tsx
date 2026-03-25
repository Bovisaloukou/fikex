import { BottomNav } from "@/components/bottom-nav";
import { NetworkStatusWrapper } from "@/components/network-status-wrapper";
import { SyncProvider } from "@/components/sync-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SyncProvider>
      <NetworkStatusWrapper />
      <div className="min-h-screen pb-20">
        {children}
      </div>
      <BottomNav />
    </SyncProvider>
  );
}
