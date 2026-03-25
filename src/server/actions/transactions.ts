"use server";

import { db } from "@/server/db";
import { transactions, type NewTransaction } from "@/server/db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export async function getTransactions(businessId: number) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.businessId, businessId))
    .orderBy(desc(transactions.createdAt));
}

export async function getRecentTransactions(
  businessId: number,
  limit: number = 10
) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.businessId, businessId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function createTransaction(data: NewTransaction) {
  const result = db.insert(transactions).values(data).returning();
  return result;
}

export async function createManyTransactions(data: NewTransaction[]) {
  if (data.length === 0) return [];
  const result = db.insert(transactions).values(data).returning();
  return result;
}

export async function deleteTransaction(id: number) {
  return db.delete(transactions).where(eq(transactions.id, id)).returning();
}

export async function getTransactionsByCategory(businessId: number) {
  return db
    .select({
      category: transactions.category,
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`.as("total"),
      count: sql<number>`count(*)`.as("count"),
    })
    .from(transactions)
    .where(eq(transactions.businessId, businessId))
    .groupBy(transactions.category, transactions.type)
    .orderBy(sql`sum(${transactions.amount}) desc`);
}

export async function getMonthlyTotals(businessId: number) {
  // Get the date 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const cutoff = sixMonthsAgo.toISOString();

  const rows = await db
    .select({
      month: sql<string>`substring(${transactions.createdAt} from 1 for 7)`.as(
        "month"
      ),
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
    .groupBy(sql`substring(${transactions.createdAt} from 1 for 7)`, transactions.type)
    .orderBy(sql`substring(${transactions.createdAt} from 1 for 7)`);

  // Pivot into { month, sales, expenses } format
  const monthMap = new Map<
    string,
    { month: string; sales: number; expenses: number }
  >();

  for (const row of rows) {
    if (!monthMap.has(row.month)) {
      monthMap.set(row.month, { month: row.month, sales: 0, expenses: 0 });
    }
    const entry = monthMap.get(row.month)!;
    if (row.type === "sale") {
      entry.sales = row.total;
    } else {
      entry.expenses = row.total;
    }
  }

  return Array.from(monthMap.values());
}
