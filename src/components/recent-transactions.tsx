"use client";

import { formatCFA, getSourceLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownLeft,
  MessageCircle,
  Phone,
  Globe,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BadgeVariant } from "@/components/ui/badge";

interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "vente" | "depense";
  source: "whatsapp" | "ussd" | "web" | "ocr";
}

const sourceConfig: Record<
  string,
  { variant: BadgeVariant; icon: typeof MessageCircle }
> = {
  whatsapp: { variant: "whatsapp", icon: MessageCircle },
  ussd: { variant: "ussd", icon: Phone },
  web: { variant: "web", icon: Globe },
  ocr: { variant: "ocr", icon: Camera },
};

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Transactions récentes
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {transactions.length} dernières
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {transactions.map((tx) => {
            const source = sourceConfig[tx.source] ?? sourceConfig.web;
            const sourceLabel = getSourceLabel(tx.source).label;
            const SourceIcon = source.icon;
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-zinc-800/50 transition-colors"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    tx.type === "vente"
                      ? "bg-emerald-500/15"
                      : "bg-red-500/15"
                  )}
                >
                  {tx.type === "vente" ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4 text-red-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {tx.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-zinc-500">
                      {formatShortDate(tx.date)}
                    </span>
                    <span className="text-zinc-700">&middot;</span>
                    <span className="text-xs text-zinc-500">{tx.category}</span>
                  </div>
                </div>

                <Badge variant={source.variant} className="hidden sm:inline-flex gap-1">
                  <SourceIcon className="h-3 w-3" />
                  {sourceLabel}
                </Badge>

                <p
                  className={cn(
                    "text-sm font-semibold tabular-nums whitespace-nowrap",
                    tx.type === "vente" ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {tx.type === "vente" ? "+" : "-"}
                  {formatCFA(tx.amount)}
                </p>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-8">
              Aucune transaction enregistrée
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
