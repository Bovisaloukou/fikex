"use server";

import { db } from "@/server/db";
import { businesses, transactions } from "@/server/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export async function generatePassportData(businessId: number) {
  // 1. Business info
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);

  if (!business) {
    throw new Error("Business not found");
  }

  // 2. Transactions from the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const cutoff = sixMonthsAgo.toISOString();

  // Monthly totals by type
  const monthlyRows = await db
    .select({
      month: sql<string>`substring(${transactions.createdAt} from 1 for 7)`.as(
        "month"
      ),
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
    .groupBy(
      sql`substring(${transactions.createdAt} from 1 for 7)`,
      transactions.type
    )
    .orderBy(sql`substring(${transactions.createdAt} from 1 for 7)`);

  // 3. Top categories
  const topCategories = await db
    .select({
      category: transactions.category,
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
    .groupBy(transactions.category)
    .orderBy(sql`sum(${transactions.amount}) desc`)
    .limit(5);

  // 4. Compute monthly revenue and expense arrays
  const monthlyData = new Map<
    string,
    { sales: number; expenses: number; count: number }
  >();

  for (const row of monthlyRows) {
    if (!monthlyData.has(row.month)) {
      monthlyData.set(row.month, { sales: 0, expenses: 0, count: 0 });
    }
    const entry = monthlyData.get(row.month)!;
    entry.count += row.count;
    if (row.type === "sale") {
      entry.sales = row.total;
    } else {
      entry.expenses = row.total;
    }
  }

  const months = Array.from(monthlyData.entries()).sort(
    ([a], [b]) => a.localeCompare(b)
  );

  const monthCount = months.length || 1;
  const totalRevenue = months.reduce((sum, [, m]) => sum + m.sales, 0);
  const totalExpenses = months.reduce((sum, [, m]) => sum + m.expenses, 0);
  const avgMonthlyRevenue = Math.round(totalRevenue / monthCount);
  const avgMonthlyExpenses = Math.round(totalExpenses / monthCount);

  // 5. Revenue trend: compare first half vs second half of the period
  const midpoint = Math.floor(months.length / 2);
  const firstHalf = months.slice(0, midpoint || 1);
  const secondHalf = months.slice(midpoint || 1);

  const firstHalfAvg =
    firstHalf.reduce((sum, [, m]) => sum + m.sales, 0) /
    (firstHalf.length || 1);
  const secondHalfAvg =
    secondHalf.reduce((sum, [, m]) => sum + m.sales, 0) /
    (secondHalf.length || 1);

  let revenueTrend: "growing" | "stable" | "declining";
  const changeRatio =
    firstHalfAvg > 0 ? (secondHalfAvg - firstHalfAvg) / firstHalfAvg : 0;

  if (changeRatio > 0.1) {
    revenueTrend = "growing";
  } else if (changeRatio < -0.1) {
    revenueTrend = "declining";
  } else {
    revenueTrend = "stable";
  }

  // 6. Regularity score: how many of the last 6 months have transactions?
  // Generate expected months
  const expectedMonths: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    expectedMonths.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }
  const activeMonths = expectedMonths.filter((m) => monthlyData.has(m)).length;
  const regularityScore = Math.round((activeMonths / 6) * 100);

  // 7. Credit readiness score (0-100)
  // Factors:
  // - Regularity (40%): how consistently they record
  // - Revenue level (30%): higher avg revenue = more ready
  // - Profitability (20%): positive net profit is good
  // - Transaction volume (10%): more transactions = more data
  const totalTransactions = months.reduce((sum, [, m]) => sum + m.count, 0);

  // Revenue score: 0-100 based on avg monthly revenue (100k FCFA = 50, 500k+ = 100)
  const revenueScore = Math.min(100, Math.round((avgMonthlyRevenue / 500000) * 100));

  // Profitability score
  const netProfit = totalRevenue - totalExpenses;
  const profitabilityScore =
    totalRevenue > 0
      ? Math.min(100, Math.max(0, Math.round((netProfit / totalRevenue) * 100 + 50)))
      : 0;

  // Volume score: 5 transactions/month = 50, 20+ = 100
  const avgTransactions = totalTransactions / monthCount;
  const volumeScore = Math.min(100, Math.round((avgTransactions / 20) * 100));

  const creditReadinessScore = Math.round(
    regularityScore * 0.4 +
      revenueScore * 0.3 +
      profitabilityScore * 0.2 +
      volumeScore * 0.1
  );

  return {
    business: {
      id: business.id,
      name: business.name,
      phone: business.phone,
      sector: business.sector,
      city: business.city,
    },
    period: {
      from: cutoff,
      to: new Date().toISOString(),
      monthsAnalyzed: monthCount,
    },
    financials: {
      avgMonthlyRevenue,
      avgMonthlyExpenses,
      avgMonthlyProfit: avgMonthlyRevenue - avgMonthlyExpenses,
      totalRevenue,
      totalExpenses,
      netProfit,
    },
    topCategories: topCategories.map((c) => ({
      category: c.category ?? "Non catégorisé",
      total: c.total,
      count: c.count,
    })),
    revenueTrend,
    regularityScore,
    creditReadinessScore: Math.min(100, Math.max(0, creditReadinessScore)),
    generatedAt: new Date().toISOString(),
  };
}
