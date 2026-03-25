"use server";

import { db } from "@/server/db";
import { businesses, type NewBusiness } from "@/server/db/schema";
import { eq } from "drizzle-orm";

/** Strip spaces, dashes, dots and leading +/+229 to keep only local digits */
function normalizePhone(phone: string): string {
  // Remove all spaces, dashes, dots, parentheses
  let cleaned = phone.replace(/[\s\-\.\(\)]/g, "");
  // Remove leading +
  cleaned = cleaned.replace(/^\+/, "");
  // Remove Benin country code (229) if present at start
  cleaned = cleaned.replace(/^229/, "");
  return cleaned;
}

export async function getOrCreateBusiness(data: {
  phone: string;
  name?: string;
  sector?: string;
  city?: string;
}) {
  const normalized = normalizePhone(data.phone);
  // Try to find existing business (compare normalized phones)
  const all = await db.select().from(businesses);
  const existing = all.filter((b) => normalizePhone(b.phone) === normalized);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create with provided data
  const [created] = await db
    .insert(businesses)
    .values({
      phone: data.phone,
      name: data.name || "Mon entreprise",
      sector: data.sector,
      city: data.city,
    })
    .returning();

  return created;
}

export async function getBusiness(id: number) {
  const result = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function getBusinessByPhone(phone: string) {
  const normalized = normalizePhone(phone);
  const all = await db.select().from(businesses);
  return all.find((b) => normalizePhone(b.phone) === normalized) ?? null;
}

export async function updateBusiness(
  id: number,
  data: Partial<NewBusiness>
) {
  const result = await db
    .update(businesses)
    .set(data)
    .where(eq(businesses.id, id))
    .returning();

  return result[0] ?? null;
}

export async function getAllBusinesses() {
  return db.select().from(businesses);
}
