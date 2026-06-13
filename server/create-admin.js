import { sequelize } from './config/mysql.js';
import User from './models/User.js';
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
  try {
    console.log('📌 Connecting to database...');
    
    await sequelize.authenticate();
    console.log('✅ Connected successfully (PostgreSQL via Sequelize)');
    console.log('📌 Creating admin user...');

    const adminEmail = 'admin@kasirent.com';
    const adminPassword = '#kasirent'; // Specific password as requested
    const adminName = 'KasiRent Admin';
    
    // Check if admin already exists
    const existing = await User.findOne({
      where: { email: adminEmail }
    });

    if (existing) {
      console.log('\n⚠️  Admin user already exists!');
      console.log('📧 Email:', existing.email);
      console.log('👤 Role:', existing.role);
      
      // Update to admin role if not already
      if (existing.role !== 'admin') {
        await existing.update({ role: 'admin' });
        console.log('✅ Updated user role to admin');
      }
      
      // Update password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await existing.update({ password: hashedPassword });
      console.log('✅ Password updated to: #kasirent');
      
    } else {
      // Create new admin user
      await User.create({
        email: adminEmail,
        password: adminPassword, // Will be hashed by User model hook
        name: adminName,
        role: 'admin'
      });

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
    if (error.errors && error.errors.length > 0) {
      console.error('Details:', error.errors[0].message);
    }
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    console.log('👋 Database connection closed');
  }
}

console.log('🚀 Starting admin creation script...\n');
createAdmin();
