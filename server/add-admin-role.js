import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addAdminRole() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔄 Updating user role enum to include admin...');

    // Modify the role column to include admin
    await connection.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('landlord', 'tenant', 'agent', 'admin') DEFAULT 'tenant'
    `);

    console.log('✅ Successfully added admin role to users table!');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update role enum:', error.message);
    process.exit(1);
  }
}

addAdminRole();
