import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { sequelize } from './config/mysql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('Adding profile fields to users table...');
    
    const sqlPath = join(__dirname, './migrations/add-user-profile-fields.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    await sequelize.query(sql);
    
    console.log('✅ Profile fields added successfully!');
    
    const [results] = await sequelize.query('DESCRIBE users');
    console.log('\nUsers table structure:');
    console.table(results);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
