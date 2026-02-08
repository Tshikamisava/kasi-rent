import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const addMissingColumns = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kasi_rent',
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log('Adding missing columns to users table...');

    // Check if oauth_provider exists
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'",
      [process.env.DB_NAME || 'kasi_rent']
    );
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    
    if (!columnNames.includes('oauth_provider')) {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN oauth_provider VARCHAR(50) DEFAULT NULL AFTER avatar_url
      `);
      console.log('✅ Added oauth_provider column');
    } else {
      console.log('✓ oauth_provider column already exists');
    }

    if (!columnNames.includes('oauth_id')) {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN oauth_id VARCHAR(255) DEFAULT NULL AFTER oauth_provider
      `);
      console.log('✅ Added oauth_id column');
    } else {
      console.log('✓ oauth_id column already exists');
    }

    if (!columnNames.includes('reset_password_token')) {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN reset_password_token VARCHAR(255) DEFAULT NULL AFTER oauth_id
      `);
      console.log('✅ Added reset_password_token column');
    } else {
      console.log('✓ reset_password_token column already exists');
    }

    if (!columnNames.includes('reset_password_expires')) {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN reset_password_expires DATETIME DEFAULT NULL AFTER reset_password_token
      `);
      console.log('✅ Added reset_password_expires column');
    } else {
      console.log('✓ reset_password_expires column already exists');
    }

    console.log('\n✅ All columns added successfully!');
    
    // Show updated schema
    const [schema] = await connection.query('DESCRIBE users');
    console.log('\n=== UPDATED USERS TABLE SCHEMA ===');
    console.table(schema);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
};

addMissingColumns();
