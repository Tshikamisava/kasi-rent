import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: './.env' });

(async function test() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      connectTimeout: 10000
    });
    await conn.query('SELECT 1');
    console.log('DB CONNECT OK');
    await conn.end();
  } catch (err) {
    console.error('DB CONNECT ERROR:', err.code || err.message);
    console.error(err);
    process.exit(1);
  }
})();
