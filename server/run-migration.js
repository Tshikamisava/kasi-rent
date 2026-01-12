import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './config/mysql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, 'migrations', 'add-address-coordinates.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      await sequelize.query(statement);
      console.log('✓ Executed statement');
    }

    console.log('✅ Migration completed successfully!');
    console.log('Properties table now has: address, latitude, longitude columns');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
