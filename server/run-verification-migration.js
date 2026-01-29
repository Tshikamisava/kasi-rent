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
    const sql = readFileSync('./migrations/add-verification-tables.sql', 'utf8');

    console.log('🔄 Running migration...');
    
    // Split and run statements individually, ignore duplicate column errors
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const preview = statement.trim().substring(0, 60).replace(/\n/g, ' ');
          console.log(`Running: ${preview}...`);
          await connection.query(statement);
        } catch (err) {
          // Ignore duplicate column errors (code 1060)
          if (err.errno === 1060) {
            console.log(`   ⚠️  Column already exists, skipping...`);
          } else {
            console.error(`   ❌ Error: ${err.message}`);
            throw err;
          }
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('   ✓ tenant_verifications table created');
    console.log('   ✓ saved_searches table created');
    console.log('   ✓ properties table updated with new columns');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
