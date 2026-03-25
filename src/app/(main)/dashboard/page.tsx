import Link from "next/link";
import { getDashboardStats, getCaisseDisponible } from "@/server/actions/dashboard";
import { getRecentTransactions } from "@/server/actions/transactions";
import { getBusiness } from "@/server/actions/businesses";
import { formatShortAmount, formatRelativeTime } from "@/lib/format";
import { TransactionItem } from "@/components/transaction-item";
import { TrendingUp, User, Plus } from "lucide-react";
import { getBusinessId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const businessId = await getBusinessId();
  const [stats, recentTxs, business, caisseDisponible] = await Promise.all([
    getDashboardStats(businessId),
    getRecentTransactions(businessId, 5),
    getBusiness(businessId),
    getCaisseDisponible(businessId),
  ]);

  const soldeJournal = stats.totalSales - stats.totalExpenses;

  // Compute today's net (sales - expenses for today only)
  const todayStr = new Date().toISOString().slice(0, 10);
  let todayNet = 0;
  for (const tx of recentTxs) {
    if (tx.createdAt.slice(0, 10) === todayStr) {
      todayNet += tx.type === "sale" ? tx.amount : -tx.amount;
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Bonjour{business?.name ? `, ${business.name}` : ""}</p>
            <h1 className="text-lg font-bold text-gray-900 mt-0.5">
              {business?.name ?? "Mon entreprise"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-400">Secteur</p>
              <p className="text-sm font-medium text-gray-700">
                {business?.sector ?? "Non renseign\u00e9"}
              </p>
            </div>
            <Link
              href="/profil"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
            >
              <User className="h-5 w-5 text-gray-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* Green balance card */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#2D5A27] p-5 lg:p-6">
          <div className="lg:flex lg:items-start lg:justify-between lg:gap-6">
            {/* Left: Solde */}
            <div className="lg:flex-1">
              <p className="text-sm text-green-200">Solde du journal</p>
              <p className="text-3xl lg:text-4xl font-bold text-white mt-1">
                {formatShortAmount(soldeJournal).replace(" F", " FCFA")}
              </p>

              {/* Today pill */}
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-800/60 px-3 py-1 text-xs font-medium text-green-200">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {todayNet >= 0 ? "+" : ""}
                  {formatShortAmount(todayNet).replace(" F", " FCFA aujourd'hui")}
                </span>
              </div>
            </div>

            {/* Right: Caisse disponible */}
            <div className="mt-4 lg:mt-0 lg:w-80 xl:w-96 rounded-xl bg-white/10 px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-green-100">
                Caisse disponible :{" "}
                <span className="font-semibold text-white">
                  {formatShortAmount(caisseDisponible)}
                </span>
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#2D5A27] shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Recharger
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Derni\u00e8res transactions */}
      <div className="px-4 sm:px-6 lg:px-8 mt-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">
            Derni&egrave;res transactions
          </h2>
          <Link
            href="/transactions"
            className="text-sm font-medium text-[#2D5A27]"
          >
            Voir tout
          </Link>
        </div>

        <div className="divide-y divide-gray-100 lg:bg-gray-50 lg:rounded-xl lg:border lg:border-gray-100 lg:px-4">
          {recentTxs.length === 0 && (
            <p className="text-sm text-gray-400 py-6 text-center">
              Aucune transaction pour le moment
            </p>
          )}
          {recentTxs.map((tx) => (
            <TransactionItem
              key={tx.id}
              description={tx.description}
              amount={tx.amount}
              type={tx.type as "sale" | "expense"}
              source={tx.source}
              time={formatRelativeTime(tx.createdAt)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
