import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const businesses = pgTable("businesses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  phone: text("phone").notNull().unique(),
  name: text("name").notNull().default(""),
  sector: text("sector"),
  city: text("city"),
  language: text("language").notNull().default("fr"), // fr, fon, yo
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  type: text("type").notNull(), // "sale" | "expense"
  description: text("description").notNull(),
  amount: integer("amount").notNull(), // stored in FCFA (no decimals)
  category: text("category"),
  source: text("source").notNull(), // "whatsapp" | "ussd" | "web" | "ocr"
  rawInput: text("raw_input"), // original voice/text input
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
