import { sequelize } from './config/mysql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully!');

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add-address-coordinates.sql'),
      'utf8'
    );

    console.log('Running migration...');
    console.log(migrationSQL);
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(s => s.trim().length > 0);
    
    for (const statement of statements) {
      console.log('Executing:', statement.trim().substring(0, 50) + '...');
      await sequelize.query(statement);
    }

    console.log('✅ Migration completed successfully!');
    console.log('Properties table now has address, latitude, and longitude columns');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

runMigration();
