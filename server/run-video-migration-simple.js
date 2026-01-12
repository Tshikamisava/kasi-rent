import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './config/mysql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runVideoMigration() {
  try {
    console.log('Reading video migration file...');
    const migrationPath = path.join(__dirname, 'migrations', 'add-video-url-to-properties.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...');
    await sequelize.query(sql);

    console.log('✅ Video URL column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runVideoMigration();
