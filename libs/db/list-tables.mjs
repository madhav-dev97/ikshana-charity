import pg from "pg";
const { Client } = pg;

const url = "postgresql://postgres.saaljsggkqvxflnrmffo:CharityConnect2023DB@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
});

try {
    await client.connect();
    const res = await client.query(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name;
    `);
    console.log("Tables in database:", res.rows);
    await client.end();
} catch (e) {
    console.error("FAILED TO QUERY TABLES:", e);
}
