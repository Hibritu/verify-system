const { Pool } = require('pg');

const DEFAULT_URL = 'postgresql://neondb_owner:npg_03MQZufsUxrK@ep-winter-mud-abln4pqe-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const connectionString = process.env.DATABASE_URL || DEFAULT_URL;

const pool = new Pool({ connectionString });

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'production') {
    console.log('executed query', { text, duration, rows: res.rowCount });
  }
  return res;
}

module.exports = { pool, query };


