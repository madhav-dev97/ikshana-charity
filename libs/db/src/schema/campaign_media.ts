import { bigint, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const campaignMediaTable = pgTable("campaign_media", {
    id: bigint("id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),

    causeId: bigint("cause_id", { mode: "number" }).notNull(),

    mediaType: text("media_type").notNull(),

    filePath: text("file_path").notNull(),

    caption: text("caption"),

    sortOrder: integer("sort_order").default(0),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).defaultNow(),
});