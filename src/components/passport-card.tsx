"use client";

import { formatCFA, formatDate } from "@/lib/format";
import { CreditScoreGauge } from "@/components/credit-score-gauge";
import {
  BarChart3,
  TrendingUp,
  Minus,
  Building2,
  MapPin,
  Calendar,
  Printer,
  Download,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PassportData {
  business: {
    id: number;
    name: string;
    phone: string;
    sector: string | null;
    city: string | null;
  };
  period: {
    from: string;
    to: string;
    monthsAnalyzed: number;
  };
  financials: {
    avgMonthlyRevenue: number;
    avgMonthlyExpenses: number;
    avgMonthlyProfit: number;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  };
  topCategories: Array<{ category: string; total: number; count: number }>;
  revenueTrend: "growing" | "stable" | "declining";
  regularityScore: number;
  creditReadinessScore: number;
  generatedAt: string;
}

const trendConfig = {
  growing: { label: "Croissance", icon: ArrowUpRight, color: "text-emerald-600" },
  stable: { label: "Stable", icon: Minus, color: "text-blue-600" },
  declining: { label: "En baisse", icon: ArrowDownRight, color: "text-red-600" },
};

export function PassportCard({ data }: { data: PassportData }) {
  const { business, financials, revenueTrend, regularityScore, creditReadinessScore, generatedAt } = data;
  const trend = trendConfig[revenueTrend];
  const TrendIcon = trend.icon;
  const margin = financials.totalRevenue > 0
    ? Math.round((financials.netProfit / financials.totalRevenue) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Main passport document */}
      <div className="relative rounded-2xl border-2 border-emerald-500/30 bg-white overflow-hidden shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600" />

        {/* Watermark */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <BarChart3 className="h-96 w-96 text-gray-900" />
          </div>
        </div>

        <div className="relative p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-wide">
                  PASSEPORT FINANCIER
                </h2>
                <p className="text-xs text-emerald-600 font-medium tracking-widest uppercase">
                  FiKex &middot; R&eacute;publique du B&eacute;nin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600">V&eacute;rifi&eacute;</span>
            </div>
          </div>

          {/* Business info */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200">
                <Building2 className="h-7 w-7 text-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{business.name}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
                  {business.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {business.city}
                    </span>
                  )}
                  {business.sector && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {business.sector}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  ID: KT-BJ-{String(business.id).padStart(5, "0")}
                </p>
              </div>
            </div>
          </div>

          {/* Score + Metrics grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Credit score */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-gray-200 p-6">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Score de cr&eacute;dibilit&eacute;
              </h4>
              <CreditScoreGauge score={creditReadinessScore} size={180} />
            </div>

            {/* Key metrics */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Indicateurs financiers
              </h4>

              <div className="space-y-3">
                <MetricRow
                  label="Chiffre d'affaires mensuel moyen"
                  value={formatCFA(financials.avgMonthlyRevenue)}
                  subtext={`${data.period.monthsAnalyzed} derniers mois`}
                  color="text-emerald-600"
                />
                <MetricRow
                  label="Charges mensuelles moyennes"
                  value={formatCFA(financials.avgMonthlyExpenses)}
                  subtext={`${data.period.monthsAnalyzed} derniers mois`}
                  color="text-red-600"
                />
                <MetricRow
                  label="Marge nette moyenne"
                  value={`${margin}%`}
                  subtext={margin > 0 ? "Positive" : "N\u00e9gative"}
                  color="text-blue-600"
                />
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Tendance
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendIcon className={`h-4 w-4 ${trend.color}`} />
                      <span className={`text-sm font-semibold ${trend.color}`}>
                        {trend.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity regularity */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 mb-8">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              R&eacute;gularit&eacute; de l&apos;activit&eacute;
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <ActivityStat
                label="Score r\u00e9gularit\u00e9"
                value={`${regularityScore}%`}
                total=""
                percentage={regularityScore}
              />
              <ActivityStat
                label="Mois analys\u00e9s"
                value={String(data.period.monthsAnalyzed)}
                total="6"
                percentage={Math.round((data.period.monthsAnalyzed / 6) * 100)}
              />
              <ActivityStat
                label="Cat\u00e9gories actives"
                value={String(data.topCategories.length)}
                total=""
                percentage={Math.min(100, data.topCategories.length * 20)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 sm:mb-0">
              <Clock className="h-3.5 w-3.5" />
              <span>
                G&eacute;n&eacute;r&eacute; le {formatDate(generatedAt)} par FiKex
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Donn&eacute;es v&eacute;rifi&eacute;es
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Imprimer
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4" />
                T&eacute;l&eacute;charger PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Qu&apos;est-ce que le Passeport Financier ?
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Le Passeport Financier FiKex est un document num&eacute;rique qui
          r&eacute;sume la sant&eacute; financi&egrave;re de votre entreprise.
          Il est g&eacute;n&eacute;r&eacute; automatiquement &agrave; partir de vos transactions
          enregistr&eacute;es via WhatsApp, USSD ou le tableau de bord web.
          Ce document peut &ecirc;tre partag&eacute; avec des institutions financi&egrave;res
          pour faciliter l&apos;acc&egrave;s au cr&eacute;dit, m&ecirc;me sans comptabilit&eacute; formelle.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <ScoreRangeCard
            range="0 - 30"
            label="Non &eacute;ligible"
            color="bg-red-500"
            bgColor="bg-red-50"
            textColor="text-red-600"
            description="Historique insuffisant ou irr&eacute;gulier"
          />
          <ScoreRangeCard
            range="31 - 60"
            label="En progression"
            color="bg-amber-500"
            bgColor="bg-amber-50"
            textColor="text-amber-600"
            description="Activit&eacute; r&eacute;guli&egrave;re mais volume faible"
          />
          <ScoreRangeCard
            range="61 - 100"
            label="&Eacute;ligible / Excellent"
            color="bg-emerald-500"
            bgColor="bg-emerald-50"
            textColor="text-emerald-600"
            description="Profil fiable pour le cr&eacute;dit"
          />
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: string;
  subtext: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>
      </div>
      <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function ActivityStat({
  label,
  value,
  total,
  percentage,
}: {
  label: string;
  value: string;
  total: string;
  percentage: number;
}) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-gray-900 tabular-nums">
        {value}
        {total && <span className="text-sm font-normal text-gray-400">/{total}</span>}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ScoreRangeCard({
  range,
  label,
  color,
  bgColor,
  textColor,
  description,
}: {
  range: string;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
}) {
  return (
    <div className={`rounded-lg ${bgColor} border border-gray-200 p-3`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`h-2 w-2 rounded-full ${color}`} />
        <span className={`text-sm font-semibold ${textColor}`}>{label}</span>
      </div>
      <p className="text-xs text-gray-500 font-mono">{range}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
}
