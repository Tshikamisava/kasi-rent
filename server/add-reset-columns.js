import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addResetColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Adding reset_password_token column...');
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN reset_password_token VARCHAR(255) NULL
    `);
    console.log('✓ Added reset_password_token');
  } catch (error) {
    if (error.errno === 1060) {
      console.log('✓ reset_password_token already exists');
    } else {
      throw error;
    }
  }

  try {
    console.log('Adding reset_password_expires column...');
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN reset_password_expires DATETIME NULL
    `);
    console.log('✓ Added reset_password_expires');
  } catch (error) {
    if (error.errno === 1060) {
      console.log('✓ reset_password_expires already exists');
    } else {
      throw error;
    }
  }

  try {
    console.log('Adding index...');
    await connection.execute(`
      ALTER TABLE users 
      ADD INDEX idx_reset_password_token (reset_password_token)
    `);
    console.log('✓ Added index on reset_password_token');
  } catch (error) {
    if (error.errno === 1061) {
      console.log('✓ Index already exists');
    } else {
      throw error;
    }
  }

  await connection.end();
  console.log('\n✓ Database schema updated successfully!');
}

addResetColumns().catch(console.error);
