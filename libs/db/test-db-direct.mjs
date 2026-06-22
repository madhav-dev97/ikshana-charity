import pg from "pg";
const { Client } = pg;

const url = "postgresql://postgres.saaljsggkqvxflnrmffo:CharityConnect2023DB@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";
console.log("Testing connection to pooler port 5432:", url);

const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
});

try {
    await client.connect();
    console.log("PORT 5432 CONNECTED SUCCESS!");
    await client.end();
} catch (e) {
    console.error("PORT 5432 CONNECTION FAILED:", e);
}
