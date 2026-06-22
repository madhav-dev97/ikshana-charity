import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Drizzle Kit requires a session-mode connection (port 5432) rather than transaction-mode (port 6543)
const connectionString = process.env.DATABASE_URL.replace(":6543", ":5432");

export default defineConfig({
  schema: "./src/schema/*.ts",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    url: connectionString,
    ssl: true,
  },
});