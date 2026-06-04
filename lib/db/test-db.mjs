import "dotenv/config";
import pg from "pg";

const { Client } = pg;

console.log("URL loaded:", !!process.env.DATABASE_URL);

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

try {
    await client.connect();
    console.log("CONNECTED");
    await client.end();
} catch (e) {
    console.error(e);
}