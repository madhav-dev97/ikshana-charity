import { pgTable, text, serial, timestamp, integer, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const donationsTable = pgTable("donations", {
  id: serial("id").primaryKey(),
  receiptNumber: text("receipt_number").notNull().unique(),
  donorName: text("donor_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  causeId: integer("cause_id").notNull(),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  donatedAt: timestamp("donated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDonationSchema = createInsertSchema(donationsTable).omit({ id: true, donatedAt: true });
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donationsTable.$inferSelect;
