import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'kasi_rent'
  });

  try {
    console.log('🔄 Running OAuth migration...');
    
    // Add oauth_provider column
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN oauth_provider VARCHAR(50) NULL
    `);
    console.log('✅ Added oauth_provider column');
    
    // Add oauth_id column
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN oauth_id VARCHAR(255) NULL
    `);
    console.log('✅ Added oauth_id column');
    
    // Add index
    await connection.execute(`
      ALTER TABLE users
      ADD INDEX idx_oauth (oauth_provider, oauth_id)
    `);
    console.log('✅ Added OAuth index');
    
    // Make password nullable
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN password VARCHAR(255) NULL
    `);
    console.log('✅ Made password nullable');
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  Columns already exist, skipping...');
    } else {
      console.error('❌ Migration failed:', error.message);
    }
  } finally {
    await connection.end();
  }
}

runMigration();
