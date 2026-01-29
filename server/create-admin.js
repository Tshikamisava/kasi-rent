import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Creates an admin user with the password: #kasirent
 * Email: admin@kasirent.com
 * 
 * Run this script to create the admin account:
 * node create-admin.js
 */

async function createAdmin() {
  let connection;
  
  try {
    console.log('📌 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected successfully');
    console.log('📌 Creating admin user...');

    const adminEmail = 'admin@kasirent.com';
    const adminPassword = '#kasirent'; // Specific password as requested
    const adminName = 'KasiRent Admin';
    
    // Check if admin already exists
    const [existing] = await connection.query(
      'SELECT id, email, role FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existing.length > 0) {
      console.log('\n⚠️  Admin user already exists!');
      console.log('📧 Email:', adminEmail);
      console.log('👤 Role:', existing[0].role);
      
      // Update to admin role if not already
      if (existing[0].role !== 'admin') {
        await connection.query(
          'UPDATE users SET role = ? WHERE email = ?',
          ['admin', adminEmail]
        );
        console.log('✅ Updated user role to admin');
      }
      
      // Update password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await connection.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, adminEmail]
      );
      console.log('✅ Password updated to: #kasirent');
      
    } else {
      // Create new admin user
      // Generate a simple admin ID (timestamp-based)
      const userId = 'admin-' + Date.now();
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await connection.query(
        `INSERT INTO users (id, email, password, name, role, created_at, updated_at) 
         VALUES (?, ?, ?, ?, 'admin', NOW(), NOW())`,
        [userId, adminEmail, hashedPassword, adminName]
      );

      console.log('\n✅ Admin user created successfully!');
    }

    console.log('\n═══════════════════════════════════════');
    console.log('📋 ADMIN LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:    admin@kasirent.com');
    console.log('🔑 Password: #kasirent');
    console.log('👤 Role:     admin');
    console.log('═══════════════════════════════════════');
    console.log('\n🎯 Admin can access:');
    console.log('   • /admin - Admin Dashboard');
    console.log('   • Review tenant verifications');
    console.log('   • View all verification documents');
    console.log('   • Approve/reject verifications');
    console.log('\n⚠️  IMPORTANT: Keep these credentials secure!');
    console.log('   Change the password after first login if needed.\n');

  } catch (error) {
    console.error('\n❌ Error creating admin:');
    console.error('Message:', error.message);
    if (error.sqlMessage) {
      console.error('SQL:', error.sqlMessage);
    }
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('👋 Connection closed');
    }
  }
}

console.log('🚀 Starting admin creation script...\n');
createAdmin();
