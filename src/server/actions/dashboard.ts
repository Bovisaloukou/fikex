"use server";

import { db } from "@/server/db";
import { transactions } from "@/server/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export async function getDashboardStats(businessId: number) {
  // Start of current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const cutoff = startOfMonth.toISOString();

  const rows = await db
    .select({
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`.as("total"),
      count: sql<number>`count(*)`.as("count"),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.businessId, businessId),
        gte(transactions.createdAt, cutoff)
      )
    )
    .groupBy(transactions.type);

  let totalSales = 0;
  let totalExpenses = 0;
  let transactionCount = 0;

  for (const row of rows) {
    transactionCount += row.count;
    if (row.type === "sale") {
      totalSales = row.total;
    } else {
      totalExpenses = row.total;
    }
  }

  return {
    totalSales,
    totalExpenses,
    netProfit: totalSales - totalExpenses,
    transactionCount,
  };
}

export async function getCaisseDisponible(businessId: number) {
  const rows = await db
    .select({
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`.as("total"),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.businessId, businessId),
        eq(transactions.source, "web")
      )
    )
    .groupBy(transactions.type);

  let sales = 0;
  let expenses = 0;
  for (const row of rows) {
    if (row.type === "sale") {
      sales = row.total;
    } else {
      expenses = row.total;
    }
  }

  return Math.max(0, sales - expenses);
}

export async function getDailySummary(
  businessId: number,
  days: number = 30
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoff = cutoffDate.toISOString();

  const rows = await db
    .select({
      date: sql<string>`date(${transactions.createdAt})`.as("date"),
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`.as("total"),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.businessId, businessId),
        gte(transactions.createdAt, cutoff)
      )
    )
    .groupBy(sql`date(${transactions.createdAt})`, transactions.type)
    .orderBy(sql`date(${transactions.createdAt})`);

  // Pivot into { date, sales, expenses } format
  const dayMap = new Map<
    string,
    { date: string; sales: number; expenses: number }
  >();

  for (const row of rows) {
    if (!dayMap.has(row.date)) {
      dayMap.set(row.date, { date: row.date, sales: 0, expenses: 0 });
    }
    const entry = dayMap.get(row.date)!;
    if (row.type === "sale") {
      entry.sales = row.total;
    } else {
      entry.expenses = row.total;
    }
  }

  return Array.from(dayMap.values());
}
