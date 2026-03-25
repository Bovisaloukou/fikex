"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Download,
} from "lucide-react";
import {
  MONTH_NAMES,
  getSourceLabel,
  formatShortAmount,
} from "@/lib/format";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "sale" | "expense";
  source: "whatsapp" | "ussd" | "web" | "ocr";
}

interface JournalViewProps {
  transactions: Transaction[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAY_NAMES_SHORT = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Return a date-only string YYYY-MM-DD from an ISO string, using local time. */
function toLocalDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatGroupHeader(dateKey: string): string {
  const today = new Date();
  const todayKey = toLocalDateKey(today.toISOString());

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toLocalDateKey(yesterday.toISOString());

  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  const dayNum = d;
  const monthName = MONTH_NAMES[m - 1];

  if (dateKey === todayKey) {
    return `AUJOURD'HUI, ${dayNum} ${monthName.toUpperCase()}`;
  }
  if (dateKey === yesterdayKey) {
    return `HIER, ${dayNum} ${monthName.toUpperCase()}`;
  }

  const dayOfWeek = DAY_NAMES_SHORT[date.getDay()];
  return `${dayOfWeek}. ${dayNum} ${monthName.toUpperCase()}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function JournalView({ transactions }: JournalViewProps) {
  // Derive available months from data
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    for (const tx of transactions) {
      const d = new Date(tx.date);
      set.add(`${d.getFullYear()}-${d.getMonth()}`);
    }
    // Sort descending
    return Array.from(set)
      .map((key) => {
        const [year, month] = key.split("-").map(Number);
        return { year, month, key };
      })
      .sort((a, b) => b.year - a.year || b.month - a.month);
  }, [transactions]);

  // Default to the current month
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const defaultMonth =
    availableMonths.find((m) => m.key === currentMonthKey) ??
    availableMonths[0];

  const [selectedMonthKey, setSelectedMonthKey] = useState<string | undefined>(
    defaultMonth?.key
  );
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // dateKey or null = "Tous"
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);

  // Filtered transactions by month
  const monthFiltered = useMemo(() => {
    if (!selectedMonthKey) return transactions;
    const [year, month] = selectedMonthKey.split("-").map(Number);
    return transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [transactions, selectedMonthKey]);

  // Available days within selected month
  const availableDays = useMemo(() => {
    const set = new Set<string>();
    for (const tx of monthFiltered) {
      set.add(toLocalDateKey(tx.date));
    }
    return Array.from(set).sort().reverse();
  }, [monthFiltered]);

  // Filtered transactions by day
  const filtered = useMemo(() => {
    if (!selectedDay) return monthFiltered;
    return monthFiltered.filter(
      (tx) => toLocalDateKey(tx.date) === selectedDay
    );
  }, [monthFiltered, selectedDay]);

  // Summary
  const totalIncome = useMemo(
    () =>
      filtered
        .filter((tx) => tx.type === "sale")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [filtered]
  );
  const totalExpense = useMemo(
    () =>
      filtered
        .filter((tx) => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [filtered]
  );

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const key = toLocalDateKey(tx.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    }
    // Sort groups descending (newest first)
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  // Current month label
  const selectedMonth = availableMonths.find(
    (m) => m.key === selectedMonthKey
  );
  const monthLabel = selectedMonth
    ? MONTH_NAMES[selectedMonth.month]
    : "Tous";

  // Selected day label
  const dayLabel = selectedDay
    ? (() => {
        const [, , d] = selectedDay.split("-").map(Number);
        return String(d);
      })()
    : "Tous";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <PageHeader
        title="Journal"
        rightAction={
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Rechercher"
          >
            <Search className="h-5 w-5" />
          </button>
        }
      />

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Filters row + Summary cards: on desktop, all in one row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Filters */}
          <div className="flex gap-2">
            {/* Month filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMonthPicker(!showMonthPicker);
                  setShowDayPicker(false);
                }}
                className="flex items-center gap-1.5 rounded-full bg-[#2D5A27] px-4 py-2 text-sm font-medium text-white cursor-pointer"
              >
                Mois : {monthLabel}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showMonthPicker && (
                <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                  {availableMonths.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => {
                        setSelectedMonthKey(m.key);
                        setSelectedDay(null);
                        setShowMonthPicker(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer ${
                        m.key === selectedMonthKey
                          ? "font-semibold text-[#2D5A27]"
                          : "text-gray-700"
                      }`}
                    >
                      {MONTH_NAMES[m.month]} {m.year}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Day filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDayPicker(!showDayPicker);
                  setShowMonthPicker(false);
                }}
                className="flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 cursor-pointer"
              >
                Jour : {dayLabel}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showDayPicker && (
                <div className="absolute left-0 top-full z-20 mt-1 w-40 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={() => {
                      setSelectedDay(null);
                      setShowDayPicker(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer ${
                      selectedDay === null
                        ? "font-semibold text-[#2D5A27]"
                        : "text-gray-700"
                    }`}
                  >
                    Tous
                  </button>
                  {availableDays.map((dayKey) => {
                    const [, , d] = dayKey.split("-").map(Number);
                    return (
                      <button
                        key={dayKey}
                        onClick={() => {
                          setSelectedDay(dayKey);
                          setShowDayPicker(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer ${
                          dayKey === selectedDay
                            ? "font-semibold text-[#2D5A27]"
                            : "text-gray-700"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Summary cards: inline on desktop, grid on mobile */}
          <div className="grid grid-cols-2 gap-3 lg:flex lg:gap-4">
            {/* Income */}
            <div className="rounded-xl border border-gray-100 bg-white p-3 lg:px-5 lg:py-3 lg:flex lg:items-center lg:gap-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <ArrowDownLeft className="h-3.5 w-3.5 text-[#2D5A27]" />
                Entr\u00e9es
              </div>
              <p className="mt-1 lg:mt-0 text-lg font-semibold text-[#2D5A27]">
                {formatShortAmount(totalIncome)}
              </p>
            </div>

            {/* Expenses */}
            <div className="rounded-xl border border-gray-100 bg-white p-3 lg:px-5 lg:py-3 lg:flex lg:items-center lg:gap-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <ArrowUpRight className="h-3.5 w-3.5 text-gray-500" />
                Sorties
              </div>
              <p className="mt-1 lg:mt-0 text-lg font-semibold text-gray-900">
                {formatShortAmount(totalExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop table view */}
        <div className="hidden lg:block">
          <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Source
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {grouped.map(([dateKey, txs]) => (
                  <>
                    {/* Date group row */}
                    <tr key={`header-${dateKey}`}>
                      <td
                        colSpan={4}
                        className="bg-gray-50/80 px-4 py-2 text-xs font-medium tracking-wide text-gray-400 uppercase"
                      >
                        {formatGroupHeader(dateKey)}
                      </td>
                    </tr>
                    {txs.map((tx) => {
                      const isIncome = tx.type === "sale";
                      const src = getSourceLabel(tx.source);
                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                            {formatTime(tx.date)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                  isIncome ? "bg-green-100" : "bg-red-50"
                                }`}
                              >
                                {isIncome ? (
                                  <ArrowDownLeft className="h-4 w-4 text-[#2D5A27]" />
                                ) : (
                                  <ArrowUpRight className="h-4 w-4 text-red-400" />
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {tx.description}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${src.className}`}
                            >
                              {src.label}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-3 text-right text-sm font-semibold whitespace-nowrap ${
                              isIncome ? "text-[#2D5A27]" : "text-red-500"
                            }`}
                          >
                            {isIncome ? "+ " : "- "}
                            {formatShortAmount(tx.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </>
                ))}
              </tbody>
            </table>

            {grouped.length === 0 && (
              <div className="py-12 text-center text-sm text-gray-400">
                Aucune transaction pour cette p\u00e9riode.
              </div>
            )}
          </div>
        </div>

        {/* Mobile card view */}
        <div className="lg:hidden space-y-5">
          {grouped.map(([dateKey, txs]) => (
            <div key={dateKey} className="space-y-2">
              {/* Date header */}
              <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
                {formatGroupHeader(dateKey)}
              </p>

              {/* Transaction cards */}
              <div className="space-y-2">
                {txs.map((tx) => {
                  const isIncome = tx.type === "sale";
                  const src = getSourceLabel(tx.source);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 p-3"
                    >
                      {/* Icon */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isIncome ? "bg-green-100" : "bg-red-50"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="h-5 w-5 text-[#2D5A27]" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-red-400" />
                        )}
                      </div>

                      {/* Description + source & time */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">
                          {tx.description}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs">
                          <span
                            className={`rounded px-1.5 py-0.5 font-medium ${src.className}`}
                          >
                            {src.label}
                          </span>
                          <span className="text-gray-400">
                            {formatTime(tx.date)}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <p
                        className={`shrink-0 text-sm font-semibold ${
                          isIncome ? "text-[#2D5A27]" : "text-red-500"
                        }`}
                      >
                        {isIncome ? "+ " : "- "}
                        {formatShortAmount(tx.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {grouped.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">
              Aucune transaction pour cette p\u00e9riode.
            </div>
          )}
        </div>

        {/* Download button */}
        <div className="pt-2 pb-6 lg:flex lg:justify-end">
          <button className="flex w-full lg:w-auto items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] px-6 py-3.5 text-sm font-medium text-white cursor-pointer hover:bg-[#2a2a2a] transition-colors">
            <Download className="h-4 w-4" />
            T\u00e9l\u00e9charger en PDF
          </button>
        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(showMonthPicker || showDayPicker) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowMonthPicker(false);
            setShowDayPicker(false);
          }}
        />
      )}
    </div>
  );
}
