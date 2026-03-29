import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('📁 Reading migration file...');
    const sql = readFileSync('./migrations/add-document-columns.sql', 'utf8');

    console.log('🔄 Running migration...');

    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        const preview = statement.substring(0, 70).replace(/\n/g, ' ');
        console.log(`Running: ${preview}...`);
        await connection.query(statement);
      } catch (err) {
        // 1060 duplicate column
        if (err?.errno === 1060) {
          console.log('   ⚠️ Column already exists, skipping.');
        } else {
          console.error(`   ❌ Error: ${err.message}`);
          throw err;
        }
      }
    }

    console.log('✅ Document columns migration completed successfully.');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
