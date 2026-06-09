import { pgTable, text, serial, timestamp, integer, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { causesTable } from "./causes";

export const donationsTable = pgTable("donations", {
  id: serial("id").primaryKey(),

  donorName: text("donor_name").notNull(),

  email: text("email"),
  phone: text("phone"),

  receiptNumber: text("receipt_number"),

  amount: numeric("amount", {
    precision: 12,
    scale: 2,
  }).notNull(),

  causeId: integer("cause_id")
    .notNull()
    .references(() => causesTable.id),

  status: text("status").default("completed"),

  source: text("source").default("website"),

  message: text("message"),

  isAnonymous: boolean("is_anonymous")
    .notNull()
    .default(false),

  donatedAt: timestamp("donated_at", {
    withTimezone: true,
  }).notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).notNull()
    .defaultNow(),
});

export const insertDonationSchema = createInsertSchema(donationsTable).omit({ id: true, createdAt: true });
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donationsTable.$inferSelect;