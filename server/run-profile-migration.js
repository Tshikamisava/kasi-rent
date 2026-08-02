import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kasi_rent',
  });

  try {
    console.log('Adding profile fields to users table...');

    const migrationStatements = [
      'ALTER TABLE users ADD COLUMN profile_photo VARCHAR(500)',
      'ALTER TABLE users ADD COLUMN bio TEXT',
      'ALTER TABLE users ADD COLUMN location VARCHAR(255)',
      'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    ];

    for (const statement of migrationStatements) {
      try {
        await connection.query(statement);
      } catch (error) {
        if (error?.code !== 'ER_DUP_FIELDNAME') {
          throw error;
        }
      }
    }
    
    console.log('✅ Profile fields added successfully!');
    
    const [results] = await connection.query('DESCRIBE users');
    console.log('\nUsers table structure:');
    console.table(results);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await connection.end();
    process.exit(1);
  }
}

runMigration();
