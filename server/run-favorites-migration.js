import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './config/mysql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runFavoritesMigration() {
  try {
    console.log('Reading favorites migration file...');
    const migrationPath = path.join(__dirname, 'migrations', 'add-favorites-table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...');
    await sequelize.query(sql);

    console.log('✅ Favorites table created successfully!');
    process.exit(0);
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.log('✅ Favorites table already exists');
      process.exit(0);
    } else {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }
}

runFavoritesMigration();
