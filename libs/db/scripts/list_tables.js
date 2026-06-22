import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;
(async () => {
  try {
    const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await c.connect();
    const res = await c.query("select table_schema,table_name from information_schema.tables where table_schema='public' order by table_name");
    console.log('tables count:', res.rows.length);
    console.log(res.rows);
    await c.end();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
