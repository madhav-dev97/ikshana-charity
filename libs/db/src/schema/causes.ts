import { pgTable, text, serial, timestamp, integer, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const causesTable = pgTable("causes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  ngoName: text("ngo_name"),
  slug: text("slug").unique(),
  description: text("description").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  goalAmount: numeric("goal_amount", { precision: 12, scale: 2 }).notNull(),
  raisedAmount: numeric("raised_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  isCurrent: boolean("is_current").notNull().default(false),
  impact: text("impact"),
  beneficiaries: text("beneficiaries"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCauseSchema = createInsertSchema(causesTable).omit({ id: true, createdAt: true });
export type InsertCause = z.infer<typeof insertCauseSchema>;
export type Cause = typeof causesTable.$inferSelect;
