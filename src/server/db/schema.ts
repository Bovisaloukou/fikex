import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const businesses = sqliteTable("businesses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone").notNull().unique(),
  name: text("name").notNull().default(""),
  sector: text("sector"),
  city: text("city"),
  language: text("language").notNull().default("fr"), // fr, fon, yo
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  type: text("type", { enum: ["sale", "expense"] }).notNull(),
  description: text("description").notNull(),
  amount: integer("amount").notNull(), // stored in FCFA (no decimals)
  category: text("category"),
  source: text("source", { enum: ["whatsapp", "ussd", "web", "ocr"] }).notNull(),
  rawInput: text("raw_input"), // original voice/text input
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
