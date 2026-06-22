import { db, causesTable } from "./src/index.ts";

try {
    console.log("Querying causesTable using Drizzle...");
    const causes = await db.select().from(causesTable);
    console.log("SUCCESS! Causes count:", causes.length);
    console.log("Causes:", causes);
    process.exit(0);
} catch (e) {
    console.error("DRIZZLE QUERY FAILED:", e);
    process.exit(1);
}
