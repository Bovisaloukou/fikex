"use client";

import { useState } from "react";
import { formatCFA, formatDate, getSourceLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BadgeVariant } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownLeft,
  MessageCircle,
  Phone,
  Globe,
  Camera,
  Search,
  Plus,
  X,
  Filter,
} from "lucide-react";

interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "vente" | "depense";
  source: "whatsapp" | "ussd" | "web" | "ocr";
}

const sourceConfig: Record<string, { variant: BadgeVariant; icon: typeof MessageCircle }> = {
  whatsapp: { variant: "whatsapp", icon: MessageCircle },
  ussd: { variant: "ussd", icon: Phone },
  web: { variant: "web", icon: Globe },
  ocr: { variant: "ocr", icon: Camera },
};

type FilterTab = "all" | "vente" | "depense";

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filtered = transactions.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalVentes = filtered
    .filter((tx) => tx.type === "vente")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalDepenses = filtered
    .filter((tx) => tx.type === "depense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-zinc-900 p-1 border border-border">
          {(
            [
              { key: "all", label: "Tout" },
              { key: "vente", label: "Ventes" },
              { key: "depense", label: "Dépenses" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                filter === tab.key
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </Button>
        </div>
      </div>

      {/* Quick add form */}
      {showForm && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-emerald-400">
              Nouvelle transaction
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              placeholder="Description"
              className="rounded-lg border border-border bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 sm:col-span-2"
            />
            <input
              type="number"
              placeholder="Montant (FCFA)"
              className="rounded-lg border border-border bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                Vente
              </Button>
              <Button size="sm" variant="destructive" className="flex-1">
                Dépense
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          {filtered.length} transaction{filtered.length > 1 ? "s" : ""}
        </span>
        <span className="text-zinc-700">|</span>
        <span className="text-emerald-400 font-medium">
          +{formatCFA(totalVentes)}
        </span>
        <span className="text-zinc-700">|</span>
        <span className="text-red-400 font-medium">
          -{formatCFA(totalDepenses)}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Header (desktop) */}
        <div className="hidden sm:grid grid-cols-12 gap-4 bg-zinc-900/80 px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500 border-b border-border">
          <div className="col-span-1">Date</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-2">Catégorie</div>
          <div className="col-span-2">Source</div>
          <div className="col-span-3 text-right">Montant</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {filtered.map((tx) => {
            const source = sourceConfig[tx.source] ?? sourceConfig.web;
            const sourceLabel = getSourceLabel(tx.source).label;
            const SourceIcon = source.icon;

            return (
              <div
                key={tx.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-3 hover:bg-zinc-800/30 transition-colors items-center"
              >
                <div className="hidden sm:block col-span-1 text-xs text-zinc-500">
                  {formatDate(tx.date)}
                </div>

                <div className="col-span-4 flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      tx.type === "vente" ? "bg-emerald-500/15" : "bg-red-500/15"
                    )}
                  >
                    {tx.type === "vente" ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-zinc-500 sm:hidden">
                      {formatDate(tx.date)} · {tx.category}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block col-span-2">
                  <span className="text-sm text-zinc-400">{tx.category}</span>
                </div>

                <div className="hidden sm:block col-span-2">
                  <Badge variant={source.variant} className="gap-1">
                    <SourceIcon className="h-3 w-3" />
                    {sourceLabel}
                  </Badge>
                </div>

                <div className="col-span-3 sm:text-right flex sm:block items-center justify-between">
                  <Badge variant={source.variant} className="gap-1 sm:hidden">
                    <SourceIcon className="h-3 w-3" />
                    {sourceLabel}
                  </Badge>
                  <p
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      tx.type === "vente" ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {tx.type === "vente" ? "+" : "-"}
                    {formatCFA(tx.amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center">
            <Filter className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">
              Aucune transaction trouvée
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
