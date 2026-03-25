import { getTransactions } from "@/server/actions/transactions";
import { JournalView } from "@/components/journal-view";
import { getBusinessId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const businessId = await getBusinessId();
  const txs = await getTransactions(businessId);

  const formatted = txs.map((tx) => ({
    id: tx.id,
    date: tx.createdAt,
    description: tx.description,
    category: tx.category ?? "Autre",
    amount: tx.amount,
    type: tx.type as "sale" | "expense",
    source: tx.source as "whatsapp" | "ussd" | "web" | "ocr",
  }));

  return <JournalView transactions={formatted} />;
}
